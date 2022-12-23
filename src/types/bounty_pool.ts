export type BountyPool = {
  "version": "0.1.0",
  "name": "bounty_pool",
  "instructions": [
    {
      "name": "initBountyPool",
      "accounts": [
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bountyPoolManager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bountyPoolEndsTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "contribute",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "bountyAwardNominee",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "addContribution",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpContribution",
          "type": "u8"
        },
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeContribution",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpContribution",
          "type": "u8"
        },
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "changeNominee",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpContribution",
          "type": "u8"
        },
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "newBountyAwardNominee",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "awardBounty",
      "accounts": [
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "permissionlessAuthorizer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bountyWinner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "destinationTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "extendBountyEndTs",
      "accounts": [
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        },
        {
          "name": "newBountyPoolEndsTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeContributionAccount",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpContribution",
          "type": "u8"
        },
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "closeBountyPool",
      "accounts": [
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpScoreboard",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bountyPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u16"
          },
          {
            "name": "bountyPoolManager",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolAuthority",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolAuthoritySeed",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolAuthorityBumpSeed",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "bountyPoolTokenMint",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolContributors",
            "type": "u64"
          },
          {
            "name": "bountyPoolEndsTs",
            "type": "u64"
          },
          {
            "name": "bountyAwarded",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bountyPool",
            "type": "publicKey"
          },
          {
            "name": "bountyContributor",
            "type": "publicKey"
          },
          {
            "name": "contributionAmount",
            "type": "u64"
          },
          {
            "name": "bountyAwardNominee",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "scoreboard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bountyPool",
            "type": "publicKey"
          },
          {
            "name": "nomineeVoteArray",
            "type": {
              "vec": {
                "defined": "NomineeVoteTotal"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "NomineeVoteTotal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nominee",
            "type": "publicKey"
          },
          {
            "name": "voteTotal",
            "type": "u64"
          }
        ]
      }
    }
  ]
};

export const IDL: BountyPool = {
  "version": "0.1.0",
  "name": "bounty_pool",
  "instructions": [
    {
      "name": "initBountyPool",
      "accounts": [
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bountyPoolManager",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bountyPoolEndsTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "contribute",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "bountyAwardNominee",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "addContribution",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sourceTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpContribution",
          "type": "u8"
        },
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeContribution",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destinationTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpContribution",
          "type": "u8"
        },
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "changeNominee",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpContribution",
          "type": "u8"
        },
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "newBountyAwardNominee",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "awardBounty",
      "accounts": [
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "permissionlessAuthorizer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bountyWinner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "destinationTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolTokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "extendBountyEndTs",
      "accounts": [
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "scoreboard",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpScoreboard",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        },
        {
          "name": "newBountyPoolEndsTs",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeContributionAccount",
      "accounts": [
        {
          "name": "contribution",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyContributor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpContribution",
          "type": "u8"
        },
        {
          "name": "bumpBountyPoolAuth",
          "type": "u8"
        },
        {
          "name": "bumpTokenAccount",
          "type": "u8"
        }
      ]
    },
    {
      "name": "closeBountyPool",
      "accounts": [
        {
          "name": "bountyPool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bountyPoolManager",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "scoreboard",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumpScoreboard",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bountyPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u16"
          },
          {
            "name": "bountyPoolManager",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolAuthority",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolAuthoritySeed",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolAuthorityBumpSeed",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "bountyPoolTokenMint",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "bountyPoolContributors",
            "type": "u64"
          },
          {
            "name": "bountyPoolEndsTs",
            "type": "u64"
          },
          {
            "name": "bountyAwarded",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bountyPool",
            "type": "publicKey"
          },
          {
            "name": "bountyContributor",
            "type": "publicKey"
          },
          {
            "name": "contributionAmount",
            "type": "u64"
          },
          {
            "name": "bountyAwardNominee",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "scoreboard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bountyPool",
            "type": "publicKey"
          },
          {
            "name": "nomineeVoteArray",
            "type": {
              "vec": {
                "defined": "NomineeVoteTotal"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "NomineeVoteTotal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nominee",
            "type": "publicKey"
          },
          {
            "name": "voteTotal",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
