import * as anchor from '@project-serum/anchor';
import { AnchorProvider, BN, Idl, Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { AccountInfo, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AccountUtils, isKp, stringifyPKsAndBNs } from '../prog-common';
import { BountyPool } from '../types/bounty_pool';
import {
    findBountyPoolAuthorityPDA,
    findBountyPoolTokenAccountPDA,
    findContributionAccountPDA,
    findScoreboardAccountPDA,
} from './bounty-pool.pda'

export class BountyPoolClient extends AccountUtils {
    wallet: anchor.Wallet;
    provider!: anchor.Provider;
    bountyPoolProgram!: anchor.Program<BountyPool>;

    constructor(
        conn: Connection,
        wallet: anchor.Wallet,
        idl?: Idl,
        programId?: PublicKey
    ) {
        super(conn);
        this.wallet = wallet;
        this.setProvider();
        this.setBountyPoolProgram(idl, programId);
    }

    setProvider() {
        this.provider = new AnchorProvider(
            this.conn,
            this.wallet,
            AnchorProvider.defaultOptions()
        );
        anchor.setProvider(this.provider);
    }

    setBountyPoolProgram(idl?: Idl, programId?: PublicKey) {
        //instantiating program depends on the environment
        if (idl && programId) {
            //means running in prod
            this.bountyPoolProgram = new anchor.Program<BountyPool>(
                idl as any,
                programId,
                this.provider
            );
        } else {
            //means running inside test suite
            this.bountyPoolProgram = anchor.workspace.BountyPool as Program<BountyPool>;
        }
    }

    // -------------------------------------------------------- fetch deserialized accounts

    async fetchBountyPoolAccount(bountyPool: PublicKey) {
        return this.bountyPoolProgram.account.bountyPool.fetch(bountyPool);
    }

    async fetchContributionAccount(contributionAccount: PublicKey) {
        return this.bountyPoolProgram.account.contribution.fetch(contributionAccount);
    }

    async fetchScoreboardAccount(scoreboardAccount: PublicKey) {
        return this.bountyPoolProgram.account.scoreboard.fetch(scoreboardAccount);
    }

    async fetchTokenAccount(mint: PublicKey, tokenAcc: PublicKey): Promise<AccountInfo> {
        return this.deserializeTokenAccount(mint, tokenAcc);
    }

    // -------------------------------------------------------- get all PDAs by type
    //https://project-serum.github.io/anchor/ts/classes/accountclient.html#all

    async fetchAllBountyPoolPDAs(bounty_pool_manager?: PublicKey) {
        const filter = bounty_pool_manager
            ? [
                {
                    memcmp: {
                        offset: 10, //need to prepend 8 bytes for anchor's disc and 2 for version: u16
                        bytes: bounty_pool_manager.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.bountyPoolProgram.account.bountyPool.all(filter);
        console.log('Found a total of', pdas.length, 'bounty pool PDAs');
        return pdas;
    }

    async fetchAllContributionAccountPDAs(bounty_pool: PublicKey) {
        const filter = bounty_pool
            ? [
                {
                    memcmp: {
                        offset: 8, //need to prepend 8 bytes for anchor's disc
                        bytes: bounty_pool.toBase58(),
                    },
                },
            ]
            : [];
        const pdas = await this.bountyPoolProgram.account.contribution.all(filter);
        console.log('Found a total of', pdas.length, 'contribution account PDAs');
        return pdas;
    }

    // -------------------------------------------------------- execute ixs

    async initBountyPool(
        bountyPool: Keypair,
        bountyPoolManager: PublicKey | Keypair,
        bountyPoolTokenMint: PublicKey,
        bountyPoolEndsTs: BN
    ) {
        // Derive PDAs
        const [bountyPoolAuth, bountyPoolAuthBump] = await findBountyPoolAuthorityPDA(bountyPool.publicKey);
        const [tokenAcc, tokenAccBump] = await findBountyPoolTokenAccountPDA(bountyPool.publicKey, bountyPoolTokenMint);
        const [scoreboard, scoreboardBump] = await findScoreboardAccountPDA(bountyPool.publicKey);

        // Create Signers Array
        const signers = [bountyPool];
        if (isKp(bountyPoolManager)) signers.push(<Keypair>bountyPoolManager);

        console.log('initializing bounty pool account with pubkey: ', bountyPool.publicKey.toBase58());

        // Transaction
        const txSig = await this.bountyPoolProgram.methods
            .initBountyPool(
                bountyPoolAuthBump,
                bountyPoolEndsTs,
            )
            .accounts({
                bountyPool: bountyPool.publicKey,
                bountyPoolManager: isKp(bountyPoolManager) ? (<Keypair>bountyPoolManager).publicKey : <PublicKey>bountyPoolManager,
                bountyPoolAuthority: bountyPoolAuth,
                bountyPoolTokenAccount: tokenAcc,
                bountyPoolTokenMint: bountyPoolTokenMint,
                scoreboard: scoreboard,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            bountyPoolAuth,
            bountyPoolAuthBump,
            tokenAcc,
            tokenAccBump,
            scoreboard,
            scoreboardBump,
            txSig
        }
    }

    async contribute(
        bountyContributor: PublicKey | Keypair,
        bountyPool: PublicKey,
        bountyPoolTokenMint: PublicKey,
        sourceTokenAccount: PublicKey,
        amount: BN,
        bountyAwardNominee: PublicKey | null = null,
    ) {
        // Derive PDAs
        const [contributionAcc, contributionAccBump] = await findContributionAccountPDA(bountyPool, (<Keypair>bountyContributor).publicKey)
        const [bountyPoolAuth, bountyPoolAuthBump] = await findBountyPoolAuthorityPDA(bountyPool);
        const [tokenAcc, tokenAccBump] = await findBountyPoolTokenAccountPDA(bountyPool, bountyPoolTokenMint);
        const [scoreboard, scoreboardBump] = await findScoreboardAccountPDA(bountyPool);

        // Create Signers Array
        const signers = [];
        if (isKp(bountyContributor)) signers.push(<Keypair>bountyContributor);

        console.log('initializing contribution account with pubkey: ', contributionAcc.toBase58());

        // Transaction
        const txSig = await this.bountyPoolProgram.methods
            .contribute(
                bountyPoolAuthBump,
                scoreboardBump,
                tokenAccBump,
                amount,
                bountyAwardNominee
            )
            .accounts({
                contribution: contributionAcc,
                bountyContributor: isKp(bountyContributor) ? (<Keypair>bountyContributor).publicKey : <PublicKey>bountyContributor,
                bountyPool: bountyPool,
                bountyPoolAuthority: bountyPoolAuth,
                scoreboard: scoreboard,
                sourceTokenAccount: sourceTokenAccount,
                bountyPoolTokenAccount: tokenAcc,
                bountyPoolTokenMint: bountyPoolTokenMint,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc()

        return {
            contributionAcc,
            contributionAccBump,
            bountyPoolAuth,
            bountyPoolAuthBump,
            tokenAcc,
            tokenAccBump,
            scoreboard,
            scoreboardBump,
            txSig
        }
    }

    async addContribution(
        bountyContributor: PublicKey | Keypair,
        bountyPool: PublicKey,
        bountyPoolTokenMint: PublicKey,
        sourceTokenAccount: PublicKey,
        amount: BN,
    ) {
        // Derive PDAs
        const [contributionAcc, contributionAccBump] = await findContributionAccountPDA(bountyPool, (<Keypair>bountyContributor).publicKey)
        const [bountyPoolAuth, bountyPoolAuthBump] = await findBountyPoolAuthorityPDA(bountyPool);
        const [tokenAcc, tokenAccBump] = await findBountyPoolTokenAccountPDA(bountyPool, bountyPoolTokenMint);
        const [scoreboard, scoreboardBump] = await findScoreboardAccountPDA(bountyPool);

        // Create Signers Array
        const signers = [];
        if (isKp(bountyContributor)) signers.push(<Keypair>bountyContributor);

        console.log('adding', stringifyPKsAndBNs(amount), 'to contribution account with pubkey:', contributionAcc.toBase58());

        // Transaction
        const txSig = await this.bountyPoolProgram.methods
            .addContribution(
                contributionAccBump,
                bountyPoolAuthBump,
                scoreboardBump,
                tokenAccBump,
                amount,
            )
            .accounts({
                contribution: contributionAcc,
                bountyContributor: isKp(bountyContributor) ? (<Keypair>bountyContributor).publicKey : <PublicKey>bountyContributor,
                bountyPool: bountyPool,
                bountyPoolAuthority: bountyPoolAuth,
                scoreboard: scoreboard,
                sourceTokenAccount: sourceTokenAccount,
                bountyPoolTokenAccount: tokenAcc,
                bountyPoolTokenMint: bountyPoolTokenMint,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            contributionAcc,
            contributionAccBump,
            bountyPoolAuth,
            bountyPoolAuthBump,
            tokenAcc,
            tokenAccBump,
            scoreboard,
            scoreboardBump,
            txSig
        }
    }

    async removeContribution(
        bountyContributor: PublicKey | Keypair,
        bountyPool: PublicKey,
        bountyPoolTokenMint: PublicKey,
        destinationTokenAccount: PublicKey,
        receiver: PublicKey,
    ) {
        // Derive PDAs
        const [contributionAcc, contributionAccBump] = await findContributionAccountPDA(bountyPool, (<Keypair>bountyContributor).publicKey)
        const [bountyPoolAuth, bountyPoolAuthBump] = await findBountyPoolAuthorityPDA(bountyPool);
        const [tokenAcc, tokenAccBump] = await findBountyPoolTokenAccountPDA(bountyPool, bountyPoolTokenMint);
        const [scoreboard, scoreboardBump] = await findScoreboardAccountPDA(bountyPool);

        // Create Signers Array
        const signers = [];
        if (isKp(bountyContributor)) signers.push(<Keypair>bountyContributor);

        console.log('removing contribution from contribution account with pubkey:', contributionAcc.toBase58());

        // Transaction
        const txSig = await this.bountyPoolProgram.methods
            .removeContribution(
                contributionAccBump,
                bountyPoolAuthBump,
                scoreboardBump,
                tokenAccBump,
            )
            .accounts({
                contribution: contributionAcc,
                bountyContributor: isKp(bountyContributor) ? (<Keypair>bountyContributor).publicKey : <PublicKey>bountyContributor,
                bountyPool: bountyPool,
                bountyPoolAuthority: bountyPoolAuth,
                scoreboard: scoreboard,
                destinationTokenAccount: destinationTokenAccount,
                bountyPoolTokenAccount: tokenAcc,
                bountyPoolTokenMint: bountyPoolTokenMint,
                receiver: receiver,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            contributionAcc,
            contributionAccBump,
            bountyPoolAuth,
            bountyPoolAuthBump,
            tokenAcc,
            tokenAccBump,
            scoreboard,
            scoreboardBump,
            txSig
        }
    }

    async changeNominee(
        bountyContributor: PublicKey | Keypair,
        bountyPool: PublicKey,
        newBountyAwardNominee: PublicKey,
    ) {
        // Derive PDAs
        const [contributionAcc, contributionAccBump] = await findContributionAccountPDA(bountyPool, (<Keypair>bountyContributor).publicKey)
        const [bountyPoolAuth, bountyPoolAuthBump] = await findBountyPoolAuthorityPDA(bountyPool);
        const [scoreboard, scoreboardBump] = await findScoreboardAccountPDA(bountyPool);

        // Create Signers Array
        const signers = [];
        if (isKp(bountyContributor)) signers.push(<Keypair>bountyContributor);

        console.log('changing nominee for contribution account with pubkey:', contributionAcc.toBase58());

        // Transaction
        const txSig = await this.bountyPoolProgram.methods
            .changeNominee(
                contributionAccBump,
                bountyPoolAuthBump,
                scoreboardBump,
                newBountyAwardNominee
            )
            .accounts({
                contribution: contributionAcc,
                bountyContributor: isKp(bountyContributor) ? (<Keypair>bountyContributor).publicKey : <PublicKey>bountyContributor,
                bountyPool: bountyPool,
                bountyPoolAuthority: bountyPoolAuth,
                scoreboard: scoreboard,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            contributionAcc,
            contributionAccBump,
            bountyPoolAuth,
            bountyPoolAuthBump,
            scoreboard,
            scoreboardBump,
            txSig
        }
    }

    async awardBounty(
        permissionlessAuthorizer: PublicKey | Keypair,
        bountyWinner: PublicKey,
        bountyPool: PublicKey,
        bountyPoolTokenMint: PublicKey,
        destinationTokenAccount: PublicKey,
    ) {
        // Derive PDAs
        const [bountyPoolAuth, bountyPoolAuthBump] = await findBountyPoolAuthorityPDA(bountyPool);
        const [tokenAcc, tokenAccBump] = await findBountyPoolTokenAccountPDA(bountyPool, bountyPoolTokenMint);
        const [scoreboard, scoreboardBump] = await findScoreboardAccountPDA(bountyPool);

        // Create Signers Array
        const signers = [];
        if (isKp(permissionlessAuthorizer)) signers.push(<Keypair>permissionlessAuthorizer);

        console.log('awarding bounty to nominee account with pubkey:', bountyWinner.toBase58());

        // Transaction
        const txSig = await this.bountyPoolProgram.methods
            .awardBounty(
                bountyPoolAuthBump,
                scoreboardBump,
                tokenAccBump
            )
            .accounts({
                bountyPool: bountyPool,
                bountyPoolAuthority: bountyPoolAuth,
                scoreboard: scoreboard,
                permissionlessAuthorizer: permissionlessAuthorizer,
                bountyWinner: bountyWinner,
                destinationTokenAccount: destinationTokenAccount,
                bountyPoolTokenAccount: tokenAcc,
                bountyPoolTokenMint: bountyPoolTokenMint,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            bountyPoolAuth,
            bountyPoolAuthBump,
            tokenAcc,
            tokenAccBump,
            scoreboard,
            scoreboardBump,
            txSig
        }
    }

    async extendBountyEndsTs(
        bountyPool: PublicKey,
        bountyPoolManager: PublicKey | Keypair,
        bountyPoolTokenMint: PublicKey,
        newBountyPoolEndsTs: BN,
    ) {
        // Derive PDAs
        const [bountyPoolAuth, bountyPoolAuthBump] = await findBountyPoolAuthorityPDA(bountyPool);
        const [tokenAcc, tokenAccBump] = await findBountyPoolTokenAccountPDA(bountyPool, bountyPoolTokenMint);
        const [scoreboard, scoreboardBump] = await findScoreboardAccountPDA(bountyPool);

        // Create Signers Array
        const signers = [];
        if (isKp(bountyPoolManager)) signers.push(<Keypair>bountyPoolManager);

        console.log('extending bounty pool account with pubkey:', bountyPool.toBase58(), 'until', stringifyPKsAndBNs(newBountyPoolEndsTs));

        // Transaction
        const txSig = await this.bountyPoolProgram.methods
            .extendBountyEndTs(
                bountyPoolAuthBump,
                scoreboardBump,
                tokenAccBump,
                newBountyPoolEndsTs,
            )
            .accounts({
                bountyPool: bountyPool,
                bountyPoolManager: isKp(bountyPoolManager) ? (<Keypair>bountyPoolManager).publicKey : <PublicKey>bountyPoolManager,
                bountyPoolAuthority: bountyPoolAuth,
                scoreboard: scoreboard,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            bountyPoolAuth,
            bountyPoolAuthBump,
            tokenAcc,
            tokenAccBump,
            scoreboard,
            scoreboardBump,
            txSig
        }
    }

    async closeContributionAccount(
        bountyPool: PublicKey,
        bountyContributor: PublicKey | Keypair,
        bountyPoolTokenMint: PublicKey,
        receiver: PublicKey,
    ) {
        // Derive PDAs
        const [contributionAcc, contributionAccBump] = await findContributionAccountPDA(bountyPool, (<Keypair>bountyContributor).publicKey)
        const [bountyPoolAuth, bountyPoolAuthBump] = await findBountyPoolAuthorityPDA(bountyPool);
        const [tokenAcc, tokenAccBump] = await findBountyPoolTokenAccountPDA(bountyPool, bountyPoolTokenMint);

        // Create Signers Array
        const signers = [];
        if (isKp(bountyContributor)) signers.push(<Keypair>bountyContributor);

        console.log('closing contribution account with pubkey:', contributionAcc.toBase58());

        // Transaction
        const txSig = await this.bountyPoolProgram.methods
            .closeContributionAccount(
                contributionAccBump,
                bountyPoolAuthBump,
                tokenAccBump,
            )
            .accounts({
                contribution: contributionAcc,
                bountyContributor: isKp(bountyContributor) ? (<Keypair>bountyContributor).publicKey : <PublicKey>bountyContributor,
                bountyPool: bountyPool,
                bountyPoolAuthority: bountyPoolAuth,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            contributionAcc,
            contributionAccBump,
            bountyPoolAuth,
            bountyPoolAuthBump,
            tokenAcc,
            tokenAccBump,
            txSig
        }
    }

    async closeBountyPool(
        bountyPool: PublicKey,
        bountyPoolManager: PublicKey | Keypair,
        receiver: PublicKey,
    ) {
        // Derive PDAs
        const [scoreboard, scoreboardBump] = await findScoreboardAccountPDA(bountyPool);

        // Create Signers Array
        const signers = [];
        if (isKp(bountyPoolManager)) signers.push(<Keypair>bountyPoolManager);

        console.log('closing bounty pool account with pubkey:', bountyPool.toBase58());

        // Transaction
        const txSig = await this.bountyPoolProgram.methods
            .closeBountyPool(
                scoreboardBump,
            )
            .accounts({
                bountyPool: bountyPool,
                bountyPoolManager: isKp(bountyPoolManager) ? (<Keypair>bountyPoolManager).publicKey : <PublicKey>bountyPoolManager,
                scoreboard: scoreboard,
                receiver: receiver,
                systemProgram: SystemProgram.programId,
            })
            .signers(signers)
            .rpc();

        return {
            scoreboard,
            scoreboardBump,
            txSig
        }
    }
}
