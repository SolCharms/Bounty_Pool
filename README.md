# Bounty_Pool
  ### A permissionless bounty rewards protocol

## Prelude

Open the terminal and cd into the desired working directory (For me it's ~/Development/Solana/ ).

Clone the Repository using the command 'git clone'. You should now have a local copy of the project as something like ~/Development/Solana/Bounty_Pool/

To conveniently use the program's CLI functionality from any directory without having to account for relative paths or typing out the absolute path to the CLI's directory every time, we will create a shorthand path alias. Open your .bashrc file (located in the Home directory) and add the following line at the bottom of the textfile: 

      alias pool-cli='ts-node ~/Development/Solana/Bounty_Pool/src/cli/bounty-pool-cli.ts'

## Configuration

We need to configure the .ts files in ../Bounty_pool/src/cli/config_devnet/

There are 3 configuration files and we will edit them as needed throughout the demonstration. They are:
- the network configuration
- the bounty pool configuration
- the contribution configuration

The network configuration (../config_devnet/networkConfig-devnet.ts) is necessary right away. We will first set up the configuration from the perspective of someone who will initialize and manage a bounty pool (later we will also do it from the perspective of a contributor). Two inputs are required: 
- the clusterApiUrl
- the signerKeypair

Here's what mine looks like:

![Screenshot from 2023-01-14 10-49-46](https://user-images.githubusercontent.com/97003046/212480731-70e83031-566a-4696-b530-8d55f66cd919.png)

## Initializing a Bounty Pool

To initialize a bounty pool we need to have decided on two things:
- what token must the bounty contributions be in
- when does the bounty contribution period end
    
For the purposes of this demonstration, I've minted a fictional token on devnet with mint address: BPTokSjfcnhNh1GCkg6xz3YHSF3J226guTrYFsJL3Qjf that will be used as the bounty pool token mint.

Here is what my bountyPoolConfig-devnet.ts file looks like:

![Screenshot from 2023-01-14 11-14-05](https://user-images.githubusercontent.com/97003046/212482523-f50eddb8-ff4f-4f76-b9f0-58156cdd262e.png)

We can now initialize a bounty pool. In terminal do:

      pool-cli init-bounty-pool
    
The output to the terminal will be something like:

![Screenshot from 2023-01-14 11-24-56](https://user-images.githubusercontent.com/97003046/212483146-fa3867b8-b862-4840-82a2-3e601ccee5eb.png)

where ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H is the account address of the bounty pool state account. We can view the bounty pool's state account by doing:

      pool-cli fetch-pool-by-key -k ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H
    
which will output the state account information to the terminal as:    

![Screenshot from 2023-01-14 11-28-20](https://user-images.githubusercontent.com/97003046/212483321-34c4be45-6863-4bf5-8b51-4f1728c15bd9.png)

And that's it. As you can see two PDA accounts were created in the process. One is the PDA token account that will hold the bountied funds and the other is a Scoreboard state account that will keep track of the nominees and their votes received.

## Making a Contribution

We need to go back to the network configuration file to reconfigure it to the perspective of a contributor. This just requires changing the path to the contributor's keypair.

![Screenshot from 2023-01-14 11-38-45](https://user-images.githubusercontent.com/97003046/212483893-a67ec27a-c031-4dde-9b0a-2e9c4a42e3d5.png)

Next we need to configure the contribution configuration file. This requires inputing the publickey of the bounty pool state account, the source token account (for the BPTokSjfcnhNh1GCkg6xz3YHSF3J226guTrYFsJL3Qjf token), and the contribution amount. The bounty award nominee can either be the wallet address of a nominee to win the bounty award or can be left blank and updated later. The source token account can be found by doing 
      
      solana config set --keypair ~/.config/solana/devnet-bounty-pool/contributor_1.json

followed by:

      spl-token accounts -v

Again, here's what my configuration file looks like:

![Screenshot from 2023-01-14 11-49-57](https://user-images.githubusercontent.com/97003046/212484625-22252b93-8713-429b-a129-3b3b3385cd8c.png)

This user can now contribute by doing the following command in the terminal:

      pool-cli contribute

which will take care of both account initialization and the contribution of funds. An output similar to the following will be displayed on the terminal:

![Screenshot from 2023-01-14 11-52-53](https://user-images.githubusercontent.com/97003046/212484748-284cbfec-74b9-4acc-8351-7b510a8e1d42.png)

From a managerial perspective, we can again run 

      pool-cli fetch-pool-by-key -k ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H

to observe that our pool now has one contributor in the bountyPoolContributors field:

![Screenshot from 2023-01-14 11-55-52](https://user-images.githubusercontent.com/97003046/212484924-e03ea944-2923-4c9d-b344-81cb447f7e6f.png)

We can also run the command

      pool-cli fetch-all-contributions -b ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H

to view all contributions to the particular bounty pool state account's address entered with the -b option.

![Screenshot from 2023-01-14 11-59-52](https://user-images.githubusercontent.com/97003046/212485260-6969dd63-bc88-4bf3-b9f7-c1299931125d.png)

Now, without going into the details, I've made contributions from 4 other contributors, varying in amount and nominee. Here are all the contributions:

![Screenshot from 2023-01-14 12-10-52](https://user-images.githubusercontent.com/97003046/212485853-926f19b7-7a8b-46af-9818-718392baec16.png)

We can see that one of the accounts has not yet named a nominee. This contributor has until the bounty pool expiry deadline to nominate a winner. In fact, any contributor can change their nominee any number of times by this deadline.

To do so one can put the publickey of the nominee in the configuration file and run 

      pool-cli change-nominee

or by using the -n option from the terminal.

      pool-cli change-nominee -n 8UEMUeH2HMaFohFqpiLni3TkiU6pkRybWaSBoPJ1QhN5 

We can now see that all contributors have nominated a winner for the bounty:

![Screenshot from 2023-01-14 12-18-48](https://user-images.githubusercontent.com/97003046/212486414-4651d159-d428-409e-ab07-0c599f51bf2d.png)

For popular bounties, there may be many contributors, so instead, one can fetch the Scoreboard state account for this particular bounty pool

      pool-cli fetch-scoreboard -b ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H

which lists the total amount of votes received by each nominee. Notice, if it hasn't become obvious yet, that 1 vote = 1 token contributed!

![Screenshot from 2023-01-14 12-22-23](https://user-images.githubusercontent.com/97003046/212486602-854c27d0-183b-4951-9c91-802c017c2fd1.png)

Up until the bounty pool expiry, contributions can be removed or added to. To remove a contribution, do

      pool-cli remove-contribution -d DPAqnjV6jNeYpkjhtFLNgUvLmTZ5QT549NCNuqjAGiZu -r cBxqSxZA6m8KtRvvWkYoytNs7akRYoFjzjs9R2pq5ij

where -d is the destination token account for the reclaimed BPTokSjfcnhNh1GCkg6xz3YHSF3J226guTrYFsJL3Qjf tokens and -r is the receiver's wallet address for the reclaimed lamports (reclaimed from the rent after closing the contribution state account)

The output to the terminal should look something similar to this:

![Screenshot from 2023-01-14 12-29-17](https://user-images.githubusercontent.com/97003046/212486887-2c566a70-d6c4-4b96-b3cf-772a899e8775.png)

Here is the updated Scoreboard account:

![Screenshot from 2023-01-14 12-30-28](https://user-images.githubusercontent.com/97003046/212486957-b0bd87f7-82de-4a08-9b59-39368401b61a.png)

To add a contribution do

      pool-cli add-contribution -a 47
      
where the -a option is the amount of tokens you want to contribute (here 47 was arbitrarily chosen among numbers less than 50). The output to the terminal looks as follows:

![Screenshot from 2023-01-14 12-36-10](https://user-images.githubusercontent.com/97003046/212487181-96da22a7-2915-4837-8783-40e62d7b6e72.png)

And again, the updated scoreboard account:

![Screenshot from 2023-01-14 12-37-08](https://user-images.githubusercontent.com/97003046/212487241-15062b2f-cd16-4cc8-81cf-41ff9ae90545.png)

Now, as you can see, there is a tie atop the leaderboard. So what happens in the case that the bounty pool expires and the tie remains? Well, in that case the bounty pool manager can extend the bounty pool expiry timestamp. This opens up all functionality to the contributors to add more contributions, remove contributions, and change their nominee. New users can also contribute. Essentially, the state of the program is identical as it would be if the extended timestamp was the one that was originally set by the bounty pool initializer. 

HOWEVER, the bounty pool period can ONLY be extended in the event that the scoreboard is non-empty (i.e. at least 1 contribution remains at the expiry timestamp) and there is a tie atop the leaderboard. 

MOREOVER, the only way to retreive the funds is to extend the expiration timestamp and break the tie. None of the program's instructions will process if the timestamp in the bounty pool's state account under the field bountyPoolEndsTs has passed. If there are any number of subsequent ties, the manager must each time extend the bounty pool expiration timestamp in an attempt to break the tie.

In this demo, you can see I've purposely created a scenario in which there is a tie atop the leaderboard. 

Although awarding the bounty is permissionless and anyone can call the instruction, attempting to award the bounty to one of the nominees tied atop the leaderboard with 

      pool-cli award-bounty -b ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H -w EJxKHr91acxD2NLbVYkS78Mi6SX1yiaQ9pnf87utmzCX -d 9Vae9mJukAnpABSPxJy4McM2Ddwr1UmG5v1gbWdXmKuo

throws the following error:

![Screenshot from 2023-01-14 13-04-38](https://user-images.githubusercontent.com/97003046/212488445-64705b07-11c6-4aab-992e-35662c1019a2.png)

Similarly, attempting to add a contribution amount with

    pool-cli add-contribution -a 100

gives the error:

![Screenshot from 2023-01-14 13-07-22](https://user-images.githubusercontent.com/97003046/212488574-bb128890-9e77-4e3b-9517-c46f4b006313.png)

And attempting to remove a contribution with

      pool-cli remove-contribution -d Gf26zs622Faw7s5ti3dJ3w9a3vJqaf8bjTgMYzSqtNQ8 -r CbLGSzECMrjaBsJ9RdtAAoHGoSRNRXkA9cotcdH4aXFE

results in the error:

![Screenshot from 2023-01-14 13-10-34](https://user-images.githubusercontent.com/97003046/212488681-bd2cebba-bbbb-48f5-9de0-e8a0cc43018d.png)

As you can see, it is absolutely necessary for the bounty pool manager to extend the bounty pool expiration timestamp.

## Extending the Bounty Pool Expiry Timestamp

To extend the bounty pool expiry ts, we must first reconfigure the network config file to set it back to the manager's keypair.

Then, we can run the command

      pool-cli extend-bounty-pool -b ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H -u 1673720400
      
to extend the pool to a new unix timestamp (here I've chosen it to be 20 minutes later than the previous expiry). The transaction is confirmed to the terminal as

![Screenshot from 2023-01-14 13-18-16](https://user-images.githubusercontent.com/97003046/212488972-c4c8e476-5afc-40aa-82c2-7a336bea32f9.png)

and the bounty pool's state account has been updated to reflect the changes requested. Running the command

      pool-cli fetch-pool-by-key -k ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H

we can see the updated expiry timestamp:

![Screenshot from 2023-01-14 13-20-44](https://user-images.githubusercontent.com/97003046/212489337-141e482d-096a-461c-9d2c-21c1209f8ff5.png)

Users can now once again access all the program instructions. A user can now break the tie, for example, by adding a single vote (1 token) with

      pool-cli add-contribution -a 1

and the scoreboard state account is updated to reflect this:

![Screenshot from 2023-01-14 13-25-36](https://user-images.githubusercontent.com/97003046/212489792-823efe2c-332c-4715-8608-0907934f04ba.png)

## Awarding the Bounty

If we now let the bounty pool period expire, any user can award the bounty to the correct winner, hence why it is permissionless. Note this requires passing in the winners publickey and an associated token account address for the BPTokSjfcnhNh1GCkg6xz3YHSF3J226guTrYFsJL3Qjf token mint.

If an account is passed in that is not the winner, say the second place finisher:

      pool-cli award-bounty -b ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H -w BYgex4FURYTiPvrYPvtoS7PtmBqzfQdF7pGm3zd714yJ -d 5MYCLJqW3MRnXn4Fzh9sQG5oq9guc95buYruzSogqZ3a

the program panics at the assertion that the key passed in must match the key with the most votes.

![Screenshot from 2023-01-14 13-30-03](https://user-images.githubusercontent.com/97003046/212490087-ce074d20-8629-45ac-83d2-2949ebad898e.png)

Running the command with the true winner's publickey and associated token account information 

      pool-cli award-bounty -b ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H -w EJxKHr91acxD2NLbVYkS78Mi6SX1yiaQ9pnf87utmzCX -d 9Vae9mJukAnpABSPxJy4McM2Ddwr1UmG5v1gbWdXmKuo

results in the successful transaction message:

![Screenshot from 2023-01-14 13-34-10](https://user-images.githubusercontent.com/97003046/212490250-e43b9d11-d210-45d4-8e39-3c47cbdc4961.png)

Here is the transaction signature (on devnet): 

      5ZqRGNRUV8xexKeNLwqUfrKPvFyf9hJ3AxPskCF4VywC5i3D9cgpGasad4PowL1Nhven1qJf9z9MfiNPJPvPF3Tj 

for anyone who wants to check it out. Note that the token transfer is very small since the program deals with values of the smallest denomination. That is to say, 1 Sol must be entered into the program as 1_000_000_000 not 1. The program recognizes 1 as 1 Lamport. Similarly, as the BPTokSjfcnhNh1GCkg6xz3YHSF3J226guTrYFsJL3Qjf token also has 9 decimals, the entered value of 100 is really 0.000_000_100 from a human perspective. Therefore, the total bounty reward being 298 tokens is 0.000_000_298 or 2.98 x 10^{-7} as displayed on solana explorer.
    
From here, contributors can close their contribution accounts to retrieve their rent reserved Lamports by running:

      pool-cli close-contribution -r CbLGSzECMrjaBsJ9RdtAAoHGoSRNRXkA9cotcdH4aXFE
    
with the -r option being for the receiver of the lamports to be reclaimed.

Once all contribution accounts are closed, and the field bountyPoolContributors in the bounty pool's state account reads 0, the bounty pool state account, along with the scoreboard account and the pool's PDA token account can all be closed by running the command:

      pool-cli close-bounty-pool -b ikGyBV8XKYRxBRgNEP5moREgiAoWEfw8KQKqcjtCj5H -r 2G5DP8MsRrwvhcus8jVwhZmQfdS8wfUbNByKQHkK8tDy
      
In this way, all state accounts can be closed and all lamports reserved for rent can be retreived.

## Additional Information

- A full list of commands (along with their required arguments) for the CLI can be found here

https://github.com/SolCharms/Bounty_Pool/blob/master/src/cli/bounty-pool-cli.ts
