use anchor_lang::prelude::*;

use crate::state::{BountyPool, Scoreboard};
use prog_common::{now_ts};
use prog_common::{errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_bounty_pool_auth: u8, bump_scoreboard: u8, bump_token_account: u8)]
pub struct ExtendBounty<'info> {

    // BountyPool and Bounty Pool Manager
    #[account(mut, has_one = bounty_pool_authority)]
    pub bounty_pool: Box<Account<'info, BountyPool>>,

    pub bounty_pool_manager: Signer<'info>,

    /// CHECK:
    #[account(seeds = [bounty_pool.key().as_ref()], bump = bump_bounty_pool_auth)]
    pub bounty_pool_authority: AccountInfo<'info>,

    // The scoreboard account
    #[account(seeds = [b"scoreboard".as_ref(), bounty_pool.key().as_ref()],
              bump = bump_scoreboard, has_one = bounty_pool)]
    pub scoreboard: Box<Account<'info, Scoreboard>>,

    // misc
    pub system_program: Program<'info, System>,

}

pub fn handler(ctx: Context<ExtendBounty>, new_bounty_pool_ends_ts: u64) -> Result<()> {

    // Ensure bounty period HAS expired
    let now_ts = now_ts()?;
    let bounty_pool_ends_ts: u64 = ctx.accounts.bounty_pool.bounty_pool_ends_ts;

    if now_ts < bounty_pool_ends_ts {
        return Err(error!(ErrorCode::BountyPoolHasNotEnded));
    }

    // Ensure new end_ts is greater than now_ts
    if new_bounty_pool_ends_ts < now_ts {
        return Err(error!(ErrorCode::InvalidNewBountyPoolEndsTs));
    }

    // Ensure scoreboard is non-empty and bounty vote total was tied
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

    // If there is NOT more than one index which is tied for largest vote total, throw error
    if !(index_array.len() > 1) {
        return Err(error!(ErrorCode::NotTiedAtopScoreboard))
    }

    // Set new bounty pool ends_ts
    let bounty_pool = &mut ctx.accounts.bounty_pool;
    bounty_pool.bounty_pool_ends_ts = new_bounty_pool_ends_ts;

    msg!("Bounty pool with pubkey {}, now extended to end at timestamp {}", ctx.accounts.bounty_pool.key(), new_bounty_pool_ends_ts);
    Ok(())
}
