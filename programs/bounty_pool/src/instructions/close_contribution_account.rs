use anchor_lang::prelude::*;

use crate::state::{BountyPool, Contribution};
use prog_common::{close_account, now_ts, TrySub};
use prog_common::{errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_contribution: u8, bump_bounty_pool_auth: u8, bump_token_account: u8)]
pub struct CloseContribution<'info> {

    // PDA Contribution account
    #[account(mut, seeds = [b"contribution".as_ref(), bounty_pool.key().as_ref(), bounty_contributor.key().as_ref()],
              bump = bump_contribution, has_one = bounty_pool, has_one = bounty_contributor)]
    pub contribution: Box<Account<'info, Contribution>>,
    pub bounty_contributor: Signer<'info>,

    // BountyPool
    #[account(mut, has_one = bounty_pool_authority)]
    pub bounty_pool: Box<Account<'info, BountyPool>>,

    /// CHECK:
    #[account(seeds = [bounty_pool.key().as_ref()], bump = bump_bounty_pool_auth)]
    pub bounty_pool_authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseContribution>) -> Result<()> {

    // Ensure bounty period HAS expired
    let now_ts = now_ts()?;
    let bounty_pool_ends_ts: u64 = ctx.accounts.bounty_pool.bounty_pool_ends_ts;

    if now_ts < bounty_pool_ends_ts {
        return Err(error!(ErrorCode::BountyPoolHasNotEnded));
    }

    // Ensure bounty has been awarded
    let bounty_awarded = ctx.accounts.bounty_pool.bounty_awarded;

    if !bounty_awarded {
        return Err(error!(ErrorCode::BountyNotYetAwarded));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the contribution state account
    let contribution_account_info = &mut (*ctx.accounts.contribution).to_account_info();
    close_account(contribution_account_info, receiver)?;

    // Decrement contributor count in bounty pool's state
    ctx.accounts.bounty_pool.bounty_pool_contributors.try_sub_assign(1)?;

    msg!("Contribution associated to {} now closed", ctx.accounts.bounty_contributor.key());
    msg!("Bounty pool {} now has {} contributors remaining", ctx.accounts.bounty_pool.key(), ctx.accounts.bounty_pool.bounty_pool_contributors);
    Ok(())
}
