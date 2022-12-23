import { PublicKey } from '@solana/web3.js';
import { BOUNTY_POOL_PROG_ID } from '../index';

export const findBountyPoolAuthorityPDA = async (bountyPool: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [bountyPool.toBytes()],
        BOUNTY_POOL_PROG_ID
    );
};

export const findBountyPoolTokenAccountPDA = async (bountyPool: PublicKey, tokenMint: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('token_account'), bountyPool.toBytes(), tokenMint.toBytes()],
        BOUNTY_POOL_PROG_ID
    );
};

export const findContributionAccountPDA = async (bountyPool: PublicKey, contributor: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('contribution'), bountyPool.toBytes(), contributor.toBytes()],
        BOUNTY_POOL_PROG_ID
    );
};

export const findScoreboardAccountPDA = async (bountyPool: PublicKey) => {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('scoreboard'), bountyPool.toBytes()],
        BOUNTY_POOL_PROG_ID
    );
};
