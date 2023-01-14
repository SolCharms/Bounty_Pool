import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

type BountyPoolConfig = {
    bountyPoolTokenMint: PublicKey,
    bountyPoolEndsTs: BN,
}

// Bounty Pool config which will be imported by CLI

export const bountyPoolConfig: BountyPoolConfig =
    {
        bountyPoolTokenMint: new PublicKey("BPTokSjfcnhNh1GCkg6xz3YHSF3J226guTrYFsJL3Qjf"),
        bountyPoolEndsTs: new BN(1_671_768_000) // must be greater than now_ts() // Currently set to: Thu Dec 22 2022 23:00:00 GMT-0500 (Eastern Standard Time)
    }
