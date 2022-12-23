use anchor_lang::prelude::*;

use crate::state::{BountyPool, Scoreboard};
use prog_common::errors::ErrorCode;
use prog_common::{close_account, now_ts};

#[derive(Accounts)]
#[instruction(bump_scoreboard: u8)]
pub struct CloseBountyPool<'info> {

    // Bounty Pool and Bounty Pool Manager
    #[account(mut, has_one = bounty_pool_manager)]
    pub bounty_pool: Box<Account<'info, BountyPool>>,
    pub bounty_pool_manager: Signer<'info>,

    #[account(mut, seeds = [b"scoreboard".as_ref(), bounty_pool.key().as_ref()],
              bump = bump_scoreboard, has_one = bounty_pool)]
    pub scoreboard: Box<Account<'info, Scoreboard>>,

    /// CHECK:
    #[account(mut)]
    pub receiver: AccountInfo<'info>,

    // misc
    pub system_program: Program<'info, System>,

}

pub fn handler(ctx: Context<CloseBountyPool>) -> Result<()> {

    let bounty_pool = &mut ctx.accounts.bounty_pool;

    // Ensure all Contribution PDAs associated to bounty pool have already been closed
    if bounty_pool.bounty_pool_contributors > 0 {
        return Err(error!(ErrorCode::NotAllBountyPoolPDAsClosed))
    }

    // Ensure bounty period HAS expired
    let now_ts = now_ts()?;
    let bounty_pool_ends_ts: u64 = ctx.accounts.bounty_pool.bounty_pool_ends_ts;

    if now_ts < bounty_pool_ends_ts {
        return Err(error!(ErrorCode::BountyPoolHasNotEnded));
    }

    // Ensure Bounty has been awarded
    let bounty_awarded = ctx.accounts.bounty_pool.bounty_awarded;

    if !bounty_awarded {
        return Err(error!(ErrorCode::BountyNotYetAwarded));
    }

    // Set the receiver of the lamports to be reclaimed from the rent of the accounts to be closed
    let receiver = &mut ctx.accounts.receiver;

    // Close the scoreboard state account
    let scoreboard_account_info = &mut (*ctx.accounts.scoreboard).to_account_info();
    close_account(scoreboard_account_info, receiver)?;

    // Close the bounty pool state account
    let bounty_pool_account_info = &mut (*ctx.accounts.bounty_pool).to_account_info();
    close_account(bounty_pool_account_info, receiver)?;

    msg!("Scoreboard account with pubkey {} now closed", ctx.accounts.scoreboard.key());
    msg!("Bounty Pool account with pubkey {} now closed", ctx.accounts.bounty_pool.key());

    Ok(())
}
