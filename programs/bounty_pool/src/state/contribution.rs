use anchor_lang::prelude::*;

#[proc_macros::assert_size(112)] // divisible by 8
#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Contribution {
    // Each bounty contribution belongs to a single bounty pool
    pub bounty_pool: Pubkey,

    // The bounty contributor
    pub bounty_contributor: Pubkey,

    // The contribution amount
    pub contribution_amount: u64,

    // The account nominated by contributor to win the bounty
    pub bounty_award_nominee: Option<Pubkey>
}
