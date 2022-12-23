use anchor_lang::prelude::*;

#[proc_macros::assert_size(40)]
#[repr(C)]
#[derive(Debug, Copy, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct NomineeVoteTotal {
    // --------------- nominee vote total information
    pub nominee: Pubkey,

    // --------------- for vote_total: 1 token == 1 vote
    pub vote_total: u64,

}
