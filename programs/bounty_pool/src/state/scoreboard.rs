use anchor_lang::prelude::*;

use crate::state::{NomineeVoteTotal};
use prog_common::{errors::ErrorCode};

#[repr(C)]
#[account]
#[derive(Debug)]
pub struct Scoreboard {
    // Each scoreboard belongs to a single bounty pool
    pub bounty_pool: Pubkey,

    // The scoreboard
    pub nominee_vote_array: Vec<NomineeVoteTotal>,
}

impl Scoreboard {

    pub fn calculate_bounty_winner(&self) -> Result<Pubkey> {

        // Collect the vote totals and ensure there is at least one nominee with votes
        let vote_total_array: Vec<u64> = self.nominee_vote_array.iter().map(|x| x.vote_total).collect();
        assert!(vote_total_array.len() > 0);

        // Calculate the largest vote total
        let largest_vote_total: &u64 = vote_total_array.iter().max().unwrap();

        // Find all indices whose vote total is equal to the largest vote total
        let mut index_array: Vec<usize> = vec!();

        for i in 0..vote_total_array.len() {

            if vote_total_array[i] == *largest_vote_total {
                index_array.push(i);
            }

        }

        // If there is more than one index which is tied for largest vote total, throw error
        if index_array.len() > 1 {
            return Err(error!(ErrorCode::TiedAtopScoreboard))
        }

        let winner_pubkey: Pubkey = self.nominee_vote_array[index_array[0]].nominee;
        return Ok(winner_pubkey)
    }

}
