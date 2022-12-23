use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use anchor_lang::solana_program::{program::invoke, system_instruction};

use crate::state::{BountyPool, Contribution, Scoreboard, NomineeVoteTotal};
use prog_common::{now_ts, TryAdd, TrySub};
use prog_common::{errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_bounty_pool_auth: u8, bump_scoreboard: u8, bump_token_account: u8)]
pub struct Contribute<'info> {

    // PDA Contribution account
    #[account(init, seeds = [b"contribution".as_ref(), bounty_pool.key().as_ref(), bounty_contributor.key().as_ref()],
              bump, payer = bounty_contributor, space = 8 + std::mem::size_of::<Contribution>())]
    pub contribution: Box<Account<'info, Contribution>>,

    #[account(mut)]
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

    // Source token account, owned by bounty contributor
    #[account(mut, token::mint = bounty_pool_token_mint, token::authority = bounty_contributor)]
    pub source_token_account: Box<Account<'info, TokenAccount>>,

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

impl<'info> Contribute<'info> {
    fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.source_token_account.to_account_info(),
                to: self.bounty_pool_token_account.to_account_info(),
                authority: self.bounty_contributor.to_account_info(),
            },
        )
    }

    fn pay_lamports_difference(&self, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.bounty_contributor.key, &self.scoreboard.key(), lamports),
            &[
                self.bounty_contributor.to_account_info(),
                self.scoreboard.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )
            .map_err(Into::into)
    }
}

pub fn handler(ctx: Context<Contribute>, amount: u64, bounty_award_nominee: Option<Pubkey>) -> Result<()> {

    // Ensure bounty period has not expired
    let now_ts = now_ts()?;
    let bounty_pool_ends_ts: u64 = ctx.accounts.bounty_pool.bounty_pool_ends_ts;

    if now_ts > bounty_pool_ends_ts {
        return Err(error!(ErrorCode::BountyPoolHasEnded));
    }

    // Do the transfer
    token::transfer(ctx.accounts.transfer_ctx().with_signer(&[&ctx.accounts.bounty_pool.bounty_pool_seeds()]), amount)?;

    // Record Contribution's State Account
    let contribution = &mut ctx.accounts.contribution;

    contribution.bounty_pool = ctx.accounts.bounty_pool.key();
    contribution.bounty_contributor = ctx.accounts.bounty_contributor.key();
    contribution.contribution_amount = amount;
    contribution.bounty_award_nominee = bounty_award_nominee;

    // Increment contributor count in bounty pool's state
    ctx.accounts.bounty_pool.bounty_pool_contributors.try_add_assign(1)?;

    // Update Scoreboard Account
    if bounty_award_nominee.is_some() {

        if ctx.accounts.scoreboard.nominee_vote_array.iter().find(|&&x| x.nominee == bounty_award_nominee.unwrap()).is_none() {

            // Calculate total space required for the addition of the new nominee and their vote total via the space required by the struct NomineeVoteTotal
            let new_data_bytes_amount: usize = ctx.accounts.scoreboard.to_account_info().data.borrow().len() + std::mem::size_of::<NomineeVoteTotal>();
            let minimum_balance_for_rent_exemption: u64 = Rent::get()?.minimum_balance(new_data_bytes_amount);
            let lamports_difference: u64 = minimum_balance_for_rent_exemption.try_sub(ctx.accounts.scoreboard.to_account_info().lamports())?;

            // Transfer the required difference in Lamports to accommodate this increase in space
            ctx.accounts.pay_lamports_difference(lamports_difference)?;

            // Reallocate the scoreboard account with the proper byte data size
            ctx.accounts.scoreboard.to_account_info().realloc(new_data_bytes_amount, false)?;

            // Construct the new nominee vote total struct
            let new_nominee_vote_total = NomineeVoteTotal {
                nominee: bounty_award_nominee.unwrap(),
                vote_total: amount
            };

            ctx.accounts.scoreboard.nominee_vote_array.push(new_nominee_vote_total);
        }

        else {
            let index: usize = ctx.accounts.scoreboard.nominee_vote_array.iter().position(|&x| x.nominee == bounty_award_nominee.unwrap()).unwrap();
            ctx.accounts.scoreboard.nominee_vote_array[index].vote_total.try_add_assign(amount)?;
        }

    }

    msg!("Contributed {} to bounty pool with address {}", amount, ctx.accounts.bounty_pool.key());
    Ok(())
}
