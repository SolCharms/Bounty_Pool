use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};

use crate::state::{BountyPool, Contribution, NomineeVoteTotal, Scoreboard};
use prog_common::{now_ts, TryAdd, TrySub};
use prog_common::{errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_contribution: u8, bump_bounty_pool_auth: u8, bump_scoreboard: u8)]
pub struct ChangeNominee<'info> {

    // PDA Contribution account
    #[account(mut, seeds = [b"contribution".as_ref(), bounty_pool.key().as_ref(), bounty_contributor.key().as_ref()],
              bump = bump_contribution, has_one = bounty_pool, has_one = bounty_contributor)]
    pub contribution: Box<Account<'info, Contribution>>,
    pub bounty_contributor: Signer<'info>,

    // BountyPool
    #[account(has_one = bounty_pool_authority)]
    pub bounty_pool: Box<Account<'info, BountyPool>>,

    /// CHECK:
    #[account(seeds = [bounty_pool.key().as_ref()], bump = bump_bounty_pool_auth)]
    pub bounty_pool_authority: AccountInfo<'info>,

    // The scoreboard account
    #[account(mut, seeds = [b"scoreboard".as_ref(), bounty_pool.key().as_ref()],
              bump = bump_scoreboard, has_one = bounty_pool)]
    pub scoreboard: Box<Account<'info, Scoreboard>>,

    // misc
    pub system_program: Program<'info, System>,
}

impl<'info> ChangeNominee<'info> {
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

pub fn handler(ctx: Context<ChangeNominee>, new_bounty_award_nominee: Option<Pubkey>) -> Result<()> {

    // Ensure bounty period has not expired
    let now_ts = now_ts()?;
    let bounty_pool_ends_ts: u64 = ctx.accounts.bounty_pool.bounty_pool_ends_ts;

    if now_ts > bounty_pool_ends_ts {
        return Err(error!(ErrorCode::BountyPoolHasEnded));
    }

    // Update Scoreboard Account
    let bounty_award_nominee = &ctx.accounts.contribution.bounty_award_nominee;
    let amount: u64 = ctx.accounts.contribution.contribution_amount;

    if bounty_award_nominee.is_some() {

        let index: usize = ctx.accounts.scoreboard.nominee_vote_array.iter().position(|&x| x.nominee == bounty_award_nominee.unwrap()).unwrap();
        ctx.accounts.scoreboard.nominee_vote_array[index].vote_total.try_sub_assign(amount)?;
    }

    if new_bounty_award_nominee.is_some() {

        if ctx.accounts.scoreboard.nominee_vote_array.iter().find(|&&x| x.nominee == new_bounty_award_nominee.unwrap()).is_none() {

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
                nominee: new_bounty_award_nominee.unwrap(),
                vote_total: amount
            };

            ctx.accounts.scoreboard.nominee_vote_array.push(new_nominee_vote_total);
        }

        else {
            let index: usize = ctx.accounts.scoreboard.nominee_vote_array.iter().position(|&x| x.nominee == new_bounty_award_nominee.unwrap()).unwrap();
            ctx.accounts.scoreboard.nominee_vote_array[index].vote_total.try_add_assign(amount)?;
        }

    }

    // Record New Bounty Award Nominee in Contribution's State Account
    let contribution = &mut ctx.accounts.contribution;
    contribution.bounty_award_nominee = new_bounty_award_nominee;

    msg!("Bounty nominee now {:?}", new_bounty_award_nominee);
    Ok(())
}

