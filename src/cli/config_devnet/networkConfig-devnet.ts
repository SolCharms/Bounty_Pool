type NetworkConfig = {
    clusterApiUrl: string,
    signerKeypair: string
}

export const networkConfig: NetworkConfig =
    {
        clusterApiUrl: "https://api.devnet.solana.com",
        signerKeypair: "/home/charalambos/.config/solana/devnet-bounty-pool/bounty_pool_manager.json"
    }

// export const networkConfig: NetworkConfig =
//     {
//         clusterApiUrl: "https://api.devnet.solana.com",
//         signerKeypair: "/home/charalambos/.config/solana/devnet-bounty-pool/contributor_3.json"
//     }

