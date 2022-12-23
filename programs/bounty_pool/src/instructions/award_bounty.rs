use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::{BountyPool, Scoreboard};
use prog_common::{now_ts};
use prog_common::{errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_bounty_pool_auth: u8, bump_scoreboard: u8, bump_token_account: u8)]
pub struct AwardBounty<'info> {

    // BountyPool and Bounty Pool Authority
    #[account(mut, has_one = bounty_pool_authority)]
    pub bounty_pool: Box<Account<'info, BountyPool>>,

    /// CHECK:
    #[account(seeds = [bounty_pool.key().as_ref()], bump = bump_bounty_pool_auth)]
    pub bounty_pool_authority: AccountInfo<'info>,

    // The scoreboard account
    #[account(mut, seeds = [b"scoreboard".as_ref(), bounty_pool.key().as_ref()],
              bump = bump_scoreboard, has_one = bounty_pool)]
    pub scoreboard: Box<Account<'info, Scoreboard>>,

    #[account(mut)]
    pub permissionless_authorizer: Signer<'info>,

    /// CHECK:
    pub bounty_winner: AccountInfo<'info>,

    // Destination token account, owned by receiver
    #[account(mut, token::mint = bounty_pool_token_mint, token::authority = bounty_winner)]
    pub destination_token_account: Box<Account<'info, TokenAccount>>,

    // The bounty_pool's pda token account and token mint
    #[account(mut, seeds = [b"token_account".as_ref(), bounty_pool.key().as_ref(), bounty_pool_token_mint.key().as_ref()],
              bump = bump_token_account, token::mint = bounty_pool_token_mint, token::authority = bounty_pool_authority)]
    pub bounty_pool_token_account: Box<Account<'info, TokenAccount>>,
    pub bounty_pool_token_mint: Box<Account<'info, Mint>>,

    // misc
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

}

impl<'info> AwardBounty<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.bounty_pool_token_account.to_account_info(),
                to: self.destination_token_account.to_account_info(),
                authority: self.bounty_pool_authority.to_account_info(),
            },
        )
    }
}

pub fn handler(ctx: Context<AwardBounty>) -> Result<()> {

    // Ensure bounty period HAS expired
    let now_ts = now_ts()?;
    let bounty_pool_ends_ts: u64 = ctx.accounts.bounty_pool.bounty_pool_ends_ts;

    if now_ts < bounty_pool_ends_ts {
        return Err(error!(ErrorCode::BountyPoolHasNotEnded));
    }

    // Ensure bounty not yet been awarded
    if ctx.accounts.bounty_pool.bounty_awarded {
        return Err(error!(ErrorCode::BountyAlreadyAwarded));
    }

    // Collect the vote totals and ensure there is at least one nominee with votes
    let vote_total_array: Vec<u64> = ctx.accounts.scoreboard.nominee_vote_array.iter().map(|x| x.vote_total).collect();
    if !(vote_total_array.len() > 0) {
        return Err(error!(ErrorCode::NoVotesCast));
    }

    // Calculate the largest vote total
    let largest_vote_total: &u64 = vote_total_array.iter().max().unwrap();

    // Find all indices whose vote total is equal to the largest vote total
    let mut index_array: Vec<usize> = vec!();

    for i in 0..vote_total_array.len() {
        if vote_total_array[i] == *largest_vote_total {
            index_array.push(i);
        }
    }

    // If there is more than one index which is tied for largest vote total, throw error
    if index_array.len() > 1 {
        return Err(error!(ErrorCode::TiedAtopScoreboard))
    }

    let winner_pubkey: Pubkey = ctx.accounts.scoreboard.nominee_vote_array[index_array[0]].nominee;
    assert_eq!(ctx.accounts.bounty_winner.key(), winner_pubkey);

    let amount: u64 = ctx.accounts.bounty_pool_token_account.amount;

    // Do the transfer
    token::transfer(ctx.accounts.transfer_ctx().with_signer(&[&ctx.accounts.bounty_pool.bounty_pool_seeds()]), amount)?;

    // Flip bounty pool awarded boolean
    let bounty_pool = &mut ctx.accounts.bounty_pool;
    bounty_pool.bounty_awarded = true;

    msg!("{} tokens transferred from bounty pool to {}", amount, ctx.accounts.bounty_winner.key());
    Ok(())
}
