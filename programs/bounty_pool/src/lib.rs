use anchor_lang::prelude::*;
use instructions::*;

declare_id!("G5WACzeoeYUg7De2P51gL8emBUsMHJ1LTCAG9zPfrgiK");

pub mod instructions;
pub mod state;

#[program]
pub mod bounty_pool {
    use super::*;

    pub fn init_bounty_pool(
        ctx: Context<InitBountyPool>,
        _bump_bounty_pool_auth: u8,
        bounty_pool_ends_ts: u64,
    ) -> Result<()> {
        msg!("initializing bounty pool");
        instructions::init_bounty_pool::handler(
            ctx,
            bounty_pool_ends_ts,
        )
    }

    pub fn contribute(
        ctx: Context<Contribute>,
        _bump_bounty_pool_auth: u8,
        _bump_scoreboard: u8,
        _bump_token_account: u8,
        amount: u64,
        bounty_award_nominee: Option<Pubkey>,
    ) -> Result<()> {
        msg!("contributing to bounty pool");
        instructions::contribute::handler(
            ctx,
            amount,
            bounty_award_nominee,
        )
    }

    pub fn add_contribution(
        ctx: Context<AddContribution>,
        _bump_contribution: u8,
        _bump_bounty_pool_auth: u8,
        _bump_scoreboard: u8,
        _bump_token_account: u8,
        amount: u64
    ) -> Result<()> {
        msg!("adding to existing contribution");
        instructions::add_contribution::handler(
            ctx,
            amount,
        )
    }

    pub fn remove_contribution(
        ctx: Context<RemoveContribution>,
        _bump_contribution: u8,
        _bump_bounty_pool_auth: u8,
        _bump_scoreboard: u8,
        _bump_token_account: u8,
    ) -> Result<()> {
        msg!("removing contribution to bounty pool");
        instructions::remove_contribution::handler(ctx)
    }

    pub fn change_nominee(
        ctx: Context<ChangeNominee>,
        _bump_contribution: u8,
        _bump_bounty_pool_auth: u8,
        _bump_scoreboard: u8,
        new_bounty_award_nominee: Option<Pubkey>,
    ) -> Result<()> {
        msg!("changing bounty award nominee");
        instructions::change_nominee::handler(
            ctx,
            new_bounty_award_nominee,
        )
    }

    pub fn award_bounty(
        ctx: Context<AwardBounty>,
        _bump_bounty_pool_auth: u8,
        _bump_scoreboard: u8,
        _bump_token_account: u8,
    ) -> Result<()> {
        msg!("awarding bounty");
        instructions::award_bounty::handler(ctx)
    }

    pub fn extend_bounty_end_ts(
        ctx: Context<ExtendBounty>,
        _bump_bounty_pool_auth: u8,
        _bump_scoreboard: u8,
        _bump_token_account: u8,
        new_bounty_pool_ends_ts: u64,
    ) -> Result<()> {
        msg!("extending bounty end timestamp");
        instructions::extend_bounty_end_ts::handler(
            ctx,
            new_bounty_pool_ends_ts,
        )
    }

    pub fn close_contribution_account(
        ctx: Context<CloseContribution>,
        _bump_contribution: u8,
        _bump_bounty_pool_auth: u8,
        _bump_token_account: u8,
    ) -> Result<()> {
        msg!("closing contribution account");
        instructions::close_contribution_account::handler(ctx)
    }

    pub fn close_bounty_pool(
        ctx: Context<CloseBountyPool>,
        _bump_scoreboard: u8,
    ) -> Result<()> {
        msg!("closing bounty pool");
        instructions::close_bounty_pool::handler(ctx)
    }

}
