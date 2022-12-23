use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_lang::solana_program::hash::hash;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::system_instruction::create_account;

use crate::state::{BountyPool, NomineeVoteTotal, LATEST_BOUNTY_POOL_VERSION};
use prog_common::{now_ts};
use prog_common::{errors::ErrorCode};

#[derive(Accounts)]
#[instruction(bump_bounty_pool_auth: u8)]
pub struct InitBountyPool<'info> {
    // Bounty Pool and Bounty Pool Manager
    #[account(init, payer = bounty_pool_manager, space = 8 + std::mem::size_of::<BountyPool>())]
    pub bounty_pool: Box<Account<'info, BountyPool>>,

    #[account(mut)]
    pub bounty_pool_manager: Signer<'info>,

    /// CHECK:
    #[account(mut, seeds = [bounty_pool.key().as_ref()], bump = bump_bounty_pool_auth)]
    pub bounty_pool_authority: AccountInfo<'info>,

    // The Bounty Pool's pda token account and token mint
    #[account(init, seeds = [b"token_account".as_ref(), bounty_pool.key().as_ref(), bounty_pool_token_mint.key().as_ref()],
              bump, token::mint = bounty_pool_token_mint, token::authority = bounty_pool_authority, payer = bounty_pool_manager)]
    pub bounty_pool_token_account: Box<Account<'info, TokenAccount>>,
    pub bounty_pool_token_mint: Box<Account<'info, Mint>>,

    /// CHECK:
    // The Scoreboard PDA account associated to the bounty pool
    #[account(mut)]
    pub scoreboard: AccountInfo<'info>,

    // misc
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

}

pub fn handler(ctx: Context<InitBountyPool>, bounty_pool_ends_ts: u64) -> Result<()> {

    let now_ts = now_ts()?;

    // Ensure bounty pool end_ts is greater than now_ts
    if bounty_pool_ends_ts < now_ts {
        return Err(error!(ErrorCode::InvalidNewBountyPoolEndsTs));
    }

    let bounty_pool = &mut ctx.accounts.bounty_pool;

    // Manually derive the pubkey of the bounty_pool authority PDA responsible for all token transfers in/out of the new bounty_pool account
    let (bounty_pool_authority_key, bump_bounty_pool_auth) = Pubkey::find_program_address(&[bounty_pool.key().as_ref()], ctx.program_id);
    // Check that the derived authority PDA pubkey matches the one provided
    assert_eq!(ctx.accounts.bounty_pool_authority.key(), bounty_pool_authority_key);

    // Record Bounty_Pool's State
    bounty_pool.version = LATEST_BOUNTY_POOL_VERSION;
    bounty_pool.bounty_pool_manager = ctx.accounts.bounty_pool_manager.key();

    bounty_pool.bounty_pool_authority = ctx.accounts.bounty_pool_authority.key();
    bounty_pool.bounty_pool_authority_seed = bounty_pool.key();
    bounty_pool.bounty_pool_authority_bump_seed = [bump_bounty_pool_auth];

    bounty_pool.bounty_pool_token_mint = ctx.accounts.bounty_pool_token_mint.key();
    bounty_pool.bounty_pool_token_account = ctx.accounts.bounty_pool_token_account.key();

    bounty_pool.bounty_pool_contributors = 0;
    bounty_pool.bounty_pool_ends_ts = bounty_pool_ends_ts;
    bounty_pool.bounty_awarded = false;

    // Find Scoreboard bump - doing this program-side to reduce amount of info to be passed in (tx size)
    let (_pk, bump) = Pubkey::find_program_address(
        &[
            b"scoreboard".as_ref(),
            ctx.accounts.bounty_pool.key().as_ref(),
        ],
        ctx.program_id,
    );

    // Create the Scoreboard PDA account if it doesn't exist
    if ctx.accounts.scoreboard.data_is_empty() {
        create_pda_with_space(
            &[
                b"scoreboard".as_ref(),
                ctx.accounts.bounty_pool.key().as_ref(),
                &[bump],
            ],
            &ctx.accounts.scoreboard,
            8 + 32 + 4 + (std::mem::size_of::<NomineeVoteTotal>() * 0),
            ctx.program_id,
            &ctx.accounts.bounty_pool_manager.to_account_info(),
            &ctx.accounts.system_program.to_account_info(),
        )?;

        // Perform all necessary conversions to bytes
        let disc = hash("account:Scoreboard".as_bytes());

        let mut buffer: Vec<u8> = Vec::new();
        let nominee_vote_array: Vec<NomineeVoteTotal> = vec!();
        nominee_vote_array.serialize(&mut buffer).unwrap();

        let buffer_as_slice: &[u8] = buffer.as_slice();
        let buffer_slice_length: usize = buffer_as_slice.len();
        let slice_end_byte = 40 + buffer_slice_length;

        // Pack byte data into Listing account
        let mut scoreboard_account_raw = ctx.accounts.scoreboard.data.borrow_mut();
        scoreboard_account_raw[..8].clone_from_slice(&disc.to_bytes()[..8]);
        scoreboard_account_raw[8..40].clone_from_slice(&ctx.accounts.bounty_pool.key().to_bytes());
        scoreboard_account_raw[40..slice_end_byte].clone_from_slice(buffer_as_slice);
    }

    msg!("New bounty pool account with pubkey {} initialized", ctx.accounts.bounty_pool.key());
    msg!("New scoreboard with pubkey {} accompanying bounty pool initialized", ctx.accounts.scoreboard.key());
    Ok(())

}

// Auxiliary helper functions

fn create_pda_with_space<'info>(
    pda_seeds: &[&[u8]],
    pda_info: &AccountInfo<'info>,
    space: usize,
    owner: &Pubkey,
    funder_info: &AccountInfo<'info>,
    system_program_info: &AccountInfo<'info>,
) -> Result<()> {
    //create a PDA and allocate space inside of it at the same time - can only be done from INSIDE the program
    //based on https://github.com/solana-labs/solana-program-library/blob/7c8e65292a6ebc90de54468c665e30bc590c513a/feature-proposal/program/src/processor.rs#L148-L163
    invoke_signed(
        &create_account(
            &funder_info.key,
            &pda_info.key,
            1.max(Rent::get()?.minimum_balance(space)),
            space as u64,
            owner,
        ),
        &[
            funder_info.clone(),
            pda_info.clone(),
            system_program_info.clone(),
        ],
        &[pda_seeds], //this is the part you can't do outside the program
    )
        .map_err(Into::into)
}
