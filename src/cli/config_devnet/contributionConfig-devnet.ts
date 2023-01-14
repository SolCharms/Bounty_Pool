import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

type ContributionConfig = {
    bountyPool: PublicKey,
    sourceTokenAccount: PublicKey,
    amount: BN,
    bountyAwardNominee: PublicKey | null,
}

// // Contributor #1
// export const contributionConfig: ContributionConfig = {
//     bountyPool: new PublicKey("Fe2iL74WpBZXxMyV2fiFGgf81Y2zFWkxC3gfDnAWTnzd"),
//     sourceTokenAccount: new PublicKey("FoVa3SNaKaAY2YFwB8gxzfXh1AjQCmYf5o2Buyp5gWnu"),
//     amount: new BN(100),
//     bountyAwardNominee: new PublicKey("EJxKHr91acxD2NLbVYkS78Mi6SX1yiaQ9pnf87utmzCX"),
// }

// // Contributor #2
// export const contributionConfig: ContributionConfig = {
//     bountyPool: new PublicKey("Fe2iL74WpBZXxMyV2fiFGgf81Y2zFWkxC3gfDnAWTnzd"),
//     sourceTokenAccount: new PublicKey("CoR3q6VJpU4PMfsUGBt7AjYVgbBeedoLz4ogABcrk4Jt"),
//     amount: new BN(100),
//     bountyAwardNominee: new PublicKey("BYgex4FURYTiPvrYPvtoS7PtmBqzfQdF7pGm3zd714yJ"),
// }

// Contributor #3
export const contributionConfig: ContributionConfig = {
    bountyPool: new PublicKey("Fe2iL74WpBZXxMyV2fiFGgf81Y2zFWkxC3gfDnAWTnzd"),
    sourceTokenAccount: new PublicKey("GE6Vu3dVikqZ52o6csnvg6hYBTbEdJkt5rQ5UJ5hAMoy"),
    amount: new BN(25),
    bountyAwardNominee: null,
}

// // Contributor #4
// export const contributionConfig: ContributionConfig = {
//     bountyPool: new PublicKey("Fe2iL74WpBZXxMyV2fiFGgf81Y2zFWkxC3gfDnAWTnzd"),
//     sourceTokenAccount: new PublicKey("Gf26zs622Faw7s5ti3dJ3w9a3vJqaf8bjTgMYzSqtNQ8"),
//     amount: new BN(50),
//     bountyAwardNominee: null,
// }

// // Contributor #5
// export const contributionConfig: ContributionConfig = {
//     bountyPool: new PublicKey("Fe2iL74WpBZXxMyV2fiFGgf81Y2zFWkxC3gfDnAWTnzd"),
//     sourceTokenAccount: new PublicKey("DPAqnjV6jNeYpkjhtFLNgUvLmTZ5QT549NCNuqjAGiZu"),
//     amount: new BN(25),
//     bountyAwardNominee: new PublicKey("8UEMUeH2HMaFohFqpiLni3TkiU6pkRybWaSBoPJ1QhN5"),
// }
