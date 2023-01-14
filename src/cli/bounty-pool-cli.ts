import { BountyPoolClient, findBountyPoolAuthorityPDA, findScoreboardAccountPDA } from '../bounty-pool';
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
// import * as SPLToken from "@solana/spl-token";
import { default as fs } from 'fs/promises';
import { default as yargs } from 'yargs';
import * as anchor from '@coral-xyz/anchor';
import { IDL as BountyPoolIDL } from '../types/bounty_pool';
import { BOUNTY_POOL_PROG_ID } from '../index';
import { stringifyPKsAndBNs } from '../prog-common';

// import {
//     findBountyPoolAuthorityPDA,
//     findBountyPoolTokenAccountPDA,
//     findContributionAccountPDA,
//     findScoreboardAccountPDA,
// } from '../bounty-pool/bounty-pool.pda';


import { networkConfig } from "../cli/config_devnet/networkConfig-devnet";
import { bountyPoolConfig } from "../cli/config_devnet/bountyPoolConfig-devnet";
import { contributionConfig } from "../cli/config_devnet/contributionConfig-devnet";


// import { networkConfig } from "../cli/config_mainnet/networkConfig-mainnet";
// import { bountyPoolConfig } from "../cli/config_mainnet/bountyPoolConfig-mainnet";
// import { contributionConfig } from "../cli/config_mainnet/contributionConfig-mainnet";

// ----------------------------------------------- Legend ---------------------------------------------------------

// -a contribution amount (amount)
// -b bounty_pool account address (bounty_pool)
// -d destination (token) account address (destination)
// -k pubkey of account being fetched (key)
// -m bounty_pool_manager account address (manager)
// -n bounty_award_nominee account address (nominee)
// -r receiver account address (receiver)
// -s token account address (spl-token)
// -t mint address (minT)
// -u unix timestamp (unix)
// -w bounty winner account address (winner)
// -z dryRun



const parser = yargs(process.argv.slice(2)).options({
    dryRun: {
        alias: 'z',
        type: 'boolean',
        default: false,
        description: 'set Dry Run flag'
    },
})



// ----------------------------------------------- bounty_pool manager instructions ----------------------------------------------



// Initialize bounty pool account (payer = bounty pool manager)
// Must config bounty pool parameters in bountyPoolConfig-devnet.ts
    .command('init-bounty-pool', 'Initialize a bounty pool account', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID,
                 );

                 const bountyPool = Keypair.generate();
                 const bountyPoolTokenMint = bountyPoolConfig.bountyPoolTokenMint;
                 const bountyPoolEndsTs: anchor.BN = bountyPoolConfig.bountyPoolEndsTs;

                 if (!argv.dryRun) {
                     const bountyPoolInstance = await bountyPoolClient.initBountyPool(
                         bountyPool,
                         wallet.payer,
                         bountyPoolTokenMint,
                         bountyPoolEndsTs,
                     );
                     console.log(stringifyPKsAndBNs(bountyPoolInstance));
                 } else {
                     console.log('Initializing bounty pool account with config parameters: \n',
                                 JSON.stringify(stringifyPKsAndBNs(bountyPoolConfig), null, 4));
                 }
             })



// Extend bounty pool
// Must config bounty pool parameters in bountyPoolConfig-devnet.ts
    .command('extend-bounty-pool', 'Extend bounty pool ends timestamp', {
        bountyPoolPubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'bounty pool account pubkey'
        },
        newBountyPoolEndsTs: {
            alias: 'u',
            type: 'string',
            demandOption: true,
            description: 'new bounty pool ends timestamp'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID,
                 );

                 const bountyPoolKey: PublicKey = new PublicKey(argv.bountyPoolPubkey);
                 const bountyPoolTokenMint = bountyPoolConfig.bountyPoolTokenMint;
                 // const newBountyPoolEndsTs: anchor.BN = bountyPoolConfig.bountyPoolEndsTs;
                 const newBountyPoolEndsTs: anchor.BN = new anchor.BN(argv.newBountyPoolEndsTs);

                 if (!argv.dryRun) {
                     const extendBountyPoolInstance = await bountyPoolClient.extendBountyEndsTs(
                         bountyPoolKey,
                         wallet.payer,
                         bountyPoolTokenMint,
                         newBountyPoolEndsTs,
                     );
                     console.log(stringifyPKsAndBNs(extendBountyPoolInstance));
                 } else {
                     console.log('Extending timestamp on bounty pool account with pubkey:', bountyPoolKey.toBase58());
                 }
             })



// Close bounty pool
// Must config bounty pool parameters in bountyPoolConfig-devnet.ts
    .command('close-bounty-pool', 'Close a bounty pool account', {
        bountyPoolPubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'bounty pool account pubkey'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID,
                 );

                 const bountyPoolKey: PublicKey = new PublicKey(argv.bountyPoolPubkey);
                 const receiverKey: PublicKey = argv.receiverPubkey ? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     const closeBountyPoolInstance = await bountyPoolClient.closeBountyPool(
                         bountyPoolKey,
                         wallet.payer,
                         receiverKey,
                     );
                     console.log(stringifyPKsAndBNs(closeBountyPoolInstance));
                 } else {
                     console.log('Closing bounty pool account with pubkey:', bountyPoolKey.toBase58());
                 }
             })



// ---------------------------------------------- bounty_pool contributor instructions -------------------------------------------



// Contribute to bounty pool
// Must config contribution account parameters in contributionConfig-devnet.ts
    .command('contribute', 'Contribute to bounty pool', {
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID,
                 );

                 const bountyPoolKey = contributionConfig.bountyPool;
                 const sourceTokenAccount = contributionConfig.sourceTokenAccount;
                 const amount = contributionConfig.amount;
                 const bountyAwardNominee = contributionConfig.bountyAwardNominee;

                 // use bounty pool pda account to get bounty pool token mint
                 const bountyPoolAcc = await bountyPoolClient.fetchBountyPoolAccount(bountyPoolKey);
                 const bountyPoolTokenMint = bountyPoolAcc.bountyPoolTokenMint;

                 if (!argv.dryRun) {
                     const contributeInstance = await bountyPoolClient.contribute(
                         wallet.payer,
                         bountyPoolKey,
                         bountyPoolTokenMint,
                         sourceTokenAccount,
                         amount,
                         bountyAwardNominee,
                     );
                     console.log(stringifyPKsAndBNs(contributeInstance));
                 } else {
                     console.log('Contributing to bounty pool account with pubkey:', bountyPoolKey.toBase58());
                 }
             })



// Add contribution to existing contribution account
// Must config contribution account parameters in contributionConfig-devnet.ts
    .command('add-contribution', 'Add contribution to existing contribution account', {
        contributionAmount:  {
            alias: 'a',
            type: 'string',
            demandOption: true,
            description: 'amount to add to contribution'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID,
                 );

                 const bountyPoolKey = contributionConfig.bountyPool;
                 const sourceTokenAccount = contributionConfig.sourceTokenAccount;
                 // const amount = contributionConfig.amount;
                 const amount: anchor.BN = new anchor.BN(argv.contributionAmount);

                 // use bounty pool pda account to get bounty pool token mint
                 const bountyPoolAcc = await bountyPoolClient.fetchBountyPoolAccount(bountyPoolKey);
                 const bountyPoolTokenMint = bountyPoolAcc.bountyPoolTokenMint;

                 if (!argv.dryRun) {
                     const addContributionInstance = await bountyPoolClient.addContribution(
                         wallet.payer,
                         bountyPoolKey,
                         bountyPoolTokenMint,
                         sourceTokenAccount,
                         amount,
                     );
                     console.log(stringifyPKsAndBNs(addContributionInstance));
                 } else {
                     console.log('Adding contribution to bounty pool account with pubkey:', bountyPoolKey.toBase58());
                 }
             })



// Remove contribution from contribution account
// Must config contribution account parameters in contributionConfig-devnet.ts
    .command('remove-contribution', 'Remove contribution from contribution account', {
        destinationTokenAccount: {
            alias: 'd',
            type: 'string',
            demandOption: true,
            description: 'destination token account for reclaimed tokens'
        },
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID,
                 );

                 const bountyPoolKey = contributionConfig.bountyPool;
                 const destinationTokenAccount = new PublicKey(argv.destinationTokenAccount);
                 const receiverKey: PublicKey = argv.receiverPubkey? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 // fetch bounty pool pda account to get bounty pool token mint
                 const bountyPoolAcc = await bountyPoolClient.fetchBountyPoolAccount(bountyPoolKey);
                 const bountyPoolTokenMint = bountyPoolAcc.bountyPoolTokenMint;

                 if (!argv.dryRun) {
                     const removeContributionInstance = await bountyPoolClient.removeContribution(
                         wallet.payer,
                         bountyPoolKey,
                         bountyPoolTokenMint,
                         destinationTokenAccount,
                         receiverKey,
                     );
                     console.log(stringifyPKsAndBNs(removeContributionInstance));
                 } else {
                     console.log('Removing contribution to bounty pool account with pubkey:', bountyPoolKey.toBase58());
                 }
             })



// Change nominee for existing contribution account
// Must config contribution account parameters in contributionConfig-devnet.ts
    .command('change-nominee', 'Change nominee for existing contribution account', {
        newNomineePubkey: {
            alias: 'n',
            type: 'string',
            demandOption: false,
            description: 'new bounty pool award nominee'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID,
                 );

                 const bountyPoolKey = contributionConfig.bountyPool;
                 const newNomineePubkey: PublicKey = argv.newNomineePubkey? new PublicKey(argv.newNomineePubkey) : null;

                 if (!argv.dryRun) {
                     const changeNomineeInstance = await bountyPoolClient.changeNominee(
                         wallet.payer,
                         bountyPoolKey,
                         newNomineePubkey
                     );
                     console.log(stringifyPKsAndBNs(changeNomineeInstance));
                 } else {
                     console.log('Changing nominee for bounty pool with pubkey:', bountyPoolKey.toBase58());
                 }
             })



// Close contribution account
// Must config contribution account parameters in contributionConfig-devnet.ts
    .command('close-contribution', 'Close contribution account', {
        receiverPubkey: {
            alias: 'r',
            type: 'string',
            demandOption: false,
            description: 'receiver account for reclaimed rent lamports'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID,
                 );

                 const bountyPoolKey = contributionConfig.bountyPool;
                 const receiverKey: PublicKey = argv.receiverPubkey? new PublicKey(argv.receiverPubkey) : wallet.publicKey;

                 // fetch bounty pool pda account to get bounty pool token mint
                 const bountyPoolAcc = await bountyPoolClient.fetchBountyPoolAccount(bountyPoolKey);
                 const bountyPoolTokenMint = bountyPoolAcc.bountyPoolTokenMint;

                 if (!argv.dryRun) {
                     const closeContributionInstance = await bountyPoolClient.closeContributionAccount(
                         bountyPoolKey,
                         wallet.payer,
                         bountyPoolTokenMint,
                         receiverKey
                     );
                     console.log(stringifyPKsAndBNs(closeContributionInstance));
                 } else {
                     console.log('Closing contribution account for bounty pool with pubkey:', bountyPoolKey.toBase58());
                 }
             })



// Award Bounty
    .command('award-bounty', 'Award bounty to bounty pool award winner', {
        bountyPoolPubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'bounty pool account pubkey'
        },
        bountyWinnerPubkey: {
            alias: 'w',
            type: 'string',
            demandOption: true,
            description: 'bounty pool award winner pubkey'
        },
        destinationTokenAccount: {
            alias: 'd',
            type: 'string',
            demandOption: true,
            description: 'destination token account for reclaimed tokens'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID,
                 );

                 const bountyPoolKey: PublicKey = new PublicKey(argv.bountyPoolPubkey);

                 // use bounty pool pda account to get bounty pool token mint and PDA token account
                 const bountyPoolAcc = await bountyPoolClient.fetchBountyPoolAccount(bountyPoolKey);
                 const bountyPoolTokenMint = bountyPoolAcc.bountyPoolTokenMint;

                 const bountyWinnerKey: PublicKey = new PublicKey(argv.bountyWinnerPubkey);
                 const destinationTokenAccountKey: PublicKey = new PublicKey(argv.destinationTokenAccount);


                 if (!argv.dryRun) {
                     const awardBountyInstance = await bountyPoolClient.awardBounty(
                         wallet.payer,
                         bountyWinnerKey,
                         bountyPoolKey,
                         bountyPoolTokenMint,
                         destinationTokenAccountKey,
                     );
                     console.log(stringifyPKsAndBNs(awardBountyInstance));
                 } else {
                     console.log('Changing nominee for bounty pool with pubkey:', bountyPoolKey.toBase58());
                 }
             })



// ------------------------------------------ PDA account fetching instructions -----------------------------------



// Fetch all bounty pool PDAs for a given manager and display their account info
// Pass in manager pubkey or will default to pubkey of manager keypair path in networkConfig.ts
    .command('fetch-all-pools', 'Fetch all bounty pool PDA accounts info', {
        managerPubkey: {
            alias: 'm',
            type: 'string',
            demandOption: false,
            description: 'bounty pool manager pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID
                 );

                 const managerKey: PublicKey = argv.managerPubkey ? new PublicKey(argv.managerPubkey) : wallet.publicKey;

                 if (!argv.dryRun) {
                     console.log('Fetching all bounty pool PDAs for manager with pubkey:', managerKey.toBase58());
                     const bountyPoolPDAs = await bountyPoolClient.fetchAllBountyPoolPDAs(managerKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= bountyPoolPDAs.length; num++) {
                         console.log('Bounty Pool account', num, ':');
                         console.log(stringifyPKsAndBNs(bountyPoolPDAs[num - 1]));
                     }

                 } else {
                     console.log('Found a total of n bounty pool PDAs for manager pubkey:', managerKey.toBase58());
                 }
             })



// Fetch bounty pool PDA by Pubkey
// Bounty pool account pubkey required in command
    .command('fetch-pool-by-key', 'Fetch bounty pool PDA account info by pubkey', {
        bountyPoolPubkey: {
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'bounty pool account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID
                 );

                 const bountyPoolKey: PublicKey = new PublicKey(argv.bountyPoolPubkey);

                 if (!argv.dryRun) {

                     const bountyPoolPDA = await bountyPoolClient.fetchBountyPoolAccount(bountyPoolKey);

                     console.log('Displaying account info for bounty pool with pubkey: ', bountyPoolKey.toBase58());
                     console.log(stringifyPKsAndBNs(bountyPoolPDA));

                 } else {
                     console.log('Found bounty pool PDA for pubkey:', bountyPoolKey.toBase58());
                 }
             })



// Fetch all contribution PDAs for a given bounty pool and display their account info
// Bounty pool account pubkey required in command
    .command('fetch-all-contributions', 'Fetch all contribution PDA accounts info', {
        bountyPoolPubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'bounty pool account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID
                 );

                 const bountyPoolKey: PublicKey = new PublicKey(argv.bountyPoolPubkey);

                 if (!argv.dryRun) {
                     console.log('Fetching all contribution PDAs for bounty pool with pubkey:', bountyPoolKey.toBase58());
                     const contributionPDAs = await bountyPoolClient.fetchAllContributionAccountPDAs(bountyPoolKey);

                     // Loop over all PDAs and display account info
                     for (let num = 1; num <= contributionPDAs.length; num++) {
                         console.log('Contribution account', num, ':');
                         console.log(stringifyPKsAndBNs(contributionPDAs[num - 1]));
                     }

                 } else {
                     console.log('Found a total of n contribution PDAs for bounty pool pubkey:', bountyPoolKey.toBase58());
                 }
             })



// Fetch contribution PDA by pubkey
// Contribution pubkey required in command
    .command('fetch-contribution-by-key', 'Fetch contribution PDA account info by pubkey', {
        contributionPubkey:{
            alias: 'k',
            type: 'string',
            demandOption: true,
            description: 'contribution account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID
                 );

                 const contributionKey: PublicKey = new PublicKey(argv.contributionPubkey);

                 if (!argv.dryRun) {

                     const contributionPDA = await bountyPoolClient.fetchContributionAccount(contributionKey);

                     console.log('Displaying account info for contribution account with pubkey: ', contributionKey.toBase58());
                     console.log(stringifyPKsAndBNs(contributionPDA));

                 } else {
                     console.log('Found contribution PDA for pubkey:', contributionKey.toBase58());
                 }
             })



// Fetch Scoreboard account PDA
// Bounty pool account pubkey required in command
    .command('fetch-scoreboard', 'Fetch scoreboard PDA account info', {
        bountyPoolPubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'bounty pool account pubkey'
        }
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID
                 );

                 const bountyPoolKey: PublicKey = new PublicKey(argv.bountyPoolPubkey);

                 if (!argv.dryRun) {

                     const [scoreboardKey, _scoreboardKeyBump] = await findScoreboardAccountPDA(bountyPoolKey);
                     const scoreboardPDA = await bountyPoolClient.fetchScoreboardAccount(scoreboardKey);

                     console.log('Displaying account info for scoreboard PDA with pubkey: ', scoreboardKey.toBase58());
                     console.dir(stringifyPKsAndBNs(scoreboardPDA), {depth: null, maxArrayLength: null});
                     //console.log(stringifyPKsAndBNs(scoreboardPDA));
                 } else {
                     console.log('Found scoreboard PDA account for bounty pool with pubkey: ', bountyPoolKey.toBase58());
                 }
             })



// Fetch Bounty pool Authority PDA
// Bounty pool account pubkey required in command
    .command('fetch-pool-auth', 'Fetch bounty pool authority PDA pubkey', {
        bountyPoolPubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'bounty pool account pubkey'
        }
    },
             async (argv) => {

                 const bountyPoolKey: PublicKey = new PublicKey(argv.bountyPoolPubkey);

                 if (!argv.dryRun) {

                     const [bountyPoolAuthKey, _bountyPoolAuthKeyBump] = await findBountyPoolAuthorityPDA(bountyPoolKey);

                     console.log('Bounty Pool authority key is: ', bountyPoolAuthKey.toBase58());

                 } else {
                     console.log('Found bounty pool authority key for bounty pool with pubkey: ', bountyPoolKey.toBase58());
                 }
             })



// Fetch PDA token account
// Token mint and token account pubkeys required in command
    .command('fetch-token-account', 'Fetch token account info by pubkey', {
        tokenMint: {
            alias: 't',
            type: 'string',
            demandOption: true,
            description: 'mint address of spl-token'
        },
        tokenAccount: {
            alias: 's',
            type: 'string',
            demandOption: true,
            description: 'pubkey of associated spl-token account'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID
                 );

                 const mintKey: PublicKey = new PublicKey(argv.tokenMint);
                 const tokenAccountKey: PublicKey = new PublicKey(argv.tokenAccount);

                 if (!argv.dryRun) {

                     const tokenAccountPDA = await bountyPoolClient.fetchTokenAccount(mintKey, tokenAccountKey);

                     console.log('Displaying account info for token account PDA with pubkey: ', tokenAccountKey.toBase58());
                     console.log(stringifyPKsAndBNs(tokenAccountPDA));

                 } else {
                     console.log('Found token account PDA for pubkey:', tokenAccountKey.toBase58());
                 }
             })



// Fetch bounty pool token PDA account balance
// Bounty pool pubkey required in command
    .command('fetch-pool-balance', 'Fetch Bounty Pool\'s PDA token account balance', {
        bountyPoolPubkey: {
            alias: 'b',
            type: 'string',
            demandOption: true,
            description: 'bounty pool account pubkey'
        },
    },
             async (argv) => {
                 const rpcConn = new Connection(networkConfig.clusterApiUrl, { confirmTransactionInitialTimeout: 91000 });
                 const wallet: anchor.Wallet = new anchor.Wallet(await loadWallet(networkConfig.signerKeypair));
                 const bountyPoolClient: BountyPoolClient = new BountyPoolClient(
                     rpcConn,
                     wallet,
                     BountyPoolIDL,
                     BOUNTY_POOL_PROG_ID
                 );

                 const bountyPoolKey: PublicKey = new PublicKey(argv.bountyPoolPubkey);

                 // use bounty pool pda account to get bounty pool token mint and PDA token account
                 const bountyPoolAcc = await bountyPoolClient.fetchBountyPoolAccount(bountyPoolKey);
                 const bountyPoolTokenMint = bountyPoolAcc.bountyPoolTokenMint;
                 const bountyPoolTokenAccount = bountyPoolAcc.bountyPoolTokenAccount;

                 if (!argv.dryRun) {

                     const tokenAccountPDA = await bountyPoolClient.fetchTokenAccount(bountyPoolTokenMint, bountyPoolTokenAccount);
                     const balance: anchor.BN = tokenAccountPDA.amount;

                     console.log('Token account balance for bounty pool with pubkey ', bountyPoolKey.toBase58(), 'is: ');
                     console.log(stringifyPKsAndBNs(balance));

                 } else {
                     console.log('Found token account PDA for bounty pool with pubkey:', bountyPoolKey.toBase58());
                 }
             })




// ------------------------------------------------ misc ----------------------------------------------------------
    .usage('Usage: $0 [-d] -c [config_file] <command> <options>')
    .help();



async function loadWallet(fileName: string): Promise<Keypair> {
    let walletBytes = JSON.parse((await fs.readFile(fileName)).toString());
    let privKeyBytes = walletBytes.slice(0,32);
    let keypair = Keypair.fromSeed(Uint8Array.from(privKeyBytes));
    return keypair
}



// Let's go!
(async() => {
    await parser.argv;
    process.exit();
})();
