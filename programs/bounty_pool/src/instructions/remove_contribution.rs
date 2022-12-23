use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::state::{BountyPool, Contribution, Scoreboard};
use prog_common::{close_account, now_ts, TrySub};
use prog_common::{errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_contribution: u8, bump_bounty_pool_auth: u8, bump_scoreboard: u8, bump_token_account: u8)]
pub struct RemoveContribution<'info> {

    // PDA Contribution account
    #[account(mut, seeds = [b"contribution".as_ref(), bounty_pool.key().as_ref(), bounty_contributor.key().as_ref()],
              bump = bump_contribution, has_one = bounty_pool, has_one = bounty_contributor)]
    pub contribution: Box<Account<'info, Contribution>>,
    pub bounty_contributor: Signer<'info>,

    // BountyPool
    #[account(mut, has_one = bounty_pool_authority, has_one = bounty_pool_token_mint, has_one = bounty_pool_token_account)]
    pub bounty_pool: Box<Account<'info, BountyPool>>,

    /// CHECK:
    #[account(seeds = [bounty_pool.key().as_ref()], bump = bump_bounty_pool_auth)]
    pub bounty_pool_authority: AccountInfo<'info>,

    // The scoreboard account
    #[account(mut, seeds = [b"scoreboard".as_ref(), bounty_pool.key().as_ref()],
              bump = bump_scoreboard, has_one = bounty_pool)]
    pub scoreboard: Box<Account<'info, Scoreboard>>,

    // Destination token account, owned by receiver
    #[account(mut, token::mint = bounty_pool_token_mint, token::authority = receiver)]
    pub destination_token_account: Box<Account<'info, TokenAccount>>,

    // The bounty_pool's pda token account and token mint
    #[account(mut, seeds = [b"token_account".as_ref(), bounty_pool.key().as_ref(), bounty_pool_token_mint.key().as_ref()],
              bump = bump_token_account, token::mint = bounty_pool_token_mint, token::authority = bounty_pool_authority)]
    pub bounty_pool_token_account: Box<Account<'info, TokenAccount>>,
    pub bounty_pool_token_mint: Box<Account<'info, Mint>>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> RemoveContribution<'info> {
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

pub fn handler(ctx: Context<RemoveContribution>) -> Result<()> {

    // Ensure bounty period has not expired
    let now_ts = now_ts()?;
    let bounty_pool_ends_ts: u64 = ctx.accounts.bounty_pool.bounty_pool_ends_ts;

    if now_ts > bounty_pool_ends_ts {
        return Err(error!(ErrorCode::BountyPoolHasEnded));
    }

    let bounty_award_nominee = &ctx.accounts.contribution.bounty_award_nominee;
    let amount: u64 = ctx.accounts.contribution.contribution_amount;

    // Do the transfer
    token::transfer(ctx.accounts.transfer_ctx().with_signer(&[&ctx.accounts.bounty_pool.bounty_pool_seeds()]), amount)?;

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the contribution state account
    let contribution_account_info = &mut (*ctx.accounts.contribution).to_account_info();
    close_account(contribution_account_info, receiver)?;

    // Decrement contributor count in bounty pool's state
    ctx.accounts.bounty_pool.bounty_pool_contributors.try_sub_assign(1)?;

    // Update Scoreboard Account
    if bounty_award_nominee.is_some() {

        let index: usize = ctx.accounts.scoreboard.nominee_vote_array.iter().position(|&x| x.nominee == bounty_award_nominee.unwrap()).unwrap();
        ctx.accounts.scoreboard.nominee_vote_array[index].vote_total.try_sub_assign(amount)?;

    }

    msg!("Contribution associated to {} now closed", ctx.accounts.bounty_contributor.key());
    msg!("Bounty pool {} now has {} contributors remaining", ctx.accounts.bounty_pool.key(), ctx.accounts.bounty_pool.bounty_pool_contributors);
    Ok(())
}
