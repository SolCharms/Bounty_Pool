use anchor_lang::prelude::*;

pub const LATEST_BOUNTY_POOL_VERSION: u16 = 0;

#[proc_macros::assert_size(192)] // +12 to make it divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct BountyPool {
    pub version: u16,

    pub bounty_pool_manager: Pubkey,

    pub bounty_pool_authority: Pubkey,

    pub bounty_pool_authority_seed: Pubkey,

    pub bounty_pool_authority_bump_seed: [u8; 1],

    // --------------- Bounty Token Info

    pub bounty_pool_token_mint: Pubkey,

    pub bounty_pool_token_account: Pubkey,

    // --------------- PDA counts

    pub bounty_pool_contributors: u64,

    // --------------- Timestamps

    pub bounty_pool_ends_ts: u64,

    pub bounty_awarded: bool,

}

impl BountyPool {

    pub fn bounty_pool_seeds(&self) -> [&[u8]; 2] {
        [self.bounty_pool_authority_seed.as_ref(), &self.bounty_pool_authority_bump_seed]
    }

}
