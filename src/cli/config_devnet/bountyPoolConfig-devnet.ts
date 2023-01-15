import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

type BountyPoolConfig = {
    bountyPoolTokenMint: PublicKey,
    bountyPoolEndsTs: BN,
}

export const bountyPoolConfig: BountyPoolConfig =
    {
        bountyPoolTokenMint: new PublicKey("BPTokSjfcnhNh1GCkg6xz3YHSF3J226guTrYFsJL3Qjf"),
        bountyPoolEndsTs: new BN(1_673_719_200) // must be greater than now_ts() // Currently set to:	Sat Jan 14 2023 13:00:00 GMT-0500 (Eastern Standard Time)
    }

