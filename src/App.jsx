import { useEffect, useMemo, useState } from "react";
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { ethers } from 'ethers';
import { UnsupportedChainIdError } from "@web3-react/core";

const sdk = new ThirdwebSDK("rinkeby");

const bundleDropModule = sdk.getBundleDropModule("0x1B916452bA8Cd128b67D14fC9844c915728103Ba");

const tokenModule = sdk.getTokenModule("0xe6962EebC94258b3B7645132880F4Cbde0a4A43e");

const voteModule = sdk.getVoteModule("0xBC2B6B2B0CBB0e9089C118DBF82a335D54810D23");

const App = () => {

  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋🏻 Address:", address);

  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddresses, setMemberAddresses] = useState([]);

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const shortenAddress = (address) => {
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
  }

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    voteModule.getAll().then((proposals) => {
      setProposals(proposals)
      console.log("proposals", proposals)
    }).catch((e) => {
      console.log("failed to get proposals", e);
    })
  }, [hasClaimedNFT])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    if (!proposals.length) {
      return;
    }

    voteModule.hasVoted(proposals[0].proposalId, address).then((hasVoted) => {
      setHasVoted(hasVoted);
      if (hasVoted) {
        console.log("user has already voted")
      } else {
        console.log("user has not voted yet")
      }
    }).catch((e) => {
      console.log("failed to check if wallet has cast vote", e);
    })
  }, [hasClaimedNFT])

  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer])

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    bundleDropModule.getAllClaimerAddresses("0").then((addresses) => {
      console.log("🚀 member addresses", addresses);
      setMemberAddresses(addresses);
    }).catch((e) => {
      console.log("failed to get member list", e);
    })
  }, [hasClaimedNFT])

  useEffect(() => {

    if (!hasClaimedNFT) {
      return;
    }

    tokenModule.getAllHolderBalances().then((amounts) => {
      console.log("💰 amounts", amounts);
      setMemberTokenAmounts(amounts)
    }).catch((e) => {
      console.log("failed to get member token amounts", e);
    })

  }, [hasClaimedNFT])

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts])

  useEffect(() => {
    if (!address) {
      return;
    }

    return bundleDropModule.balanceOf(address, "0").then((balance) => {
      if (balance.gt(0)) {
        setHasClaimedNFT(true)
        console.log("✨ This user has a membership NFT");
      } else {
        setHasClaimedNFT(false);
        console.log("😢 This user does not have a membership NFT");
      }
    }).catch((e) => {
      setHasClaimedNFT(false);
      console.log("failed to check nft balance", e);
    }) 
  }, [address])

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to the Rinkeby test network</h2>
        <p>This dApp only works on the Rinkeby network, pelase switch networks in your connected wallet.</p>
      </div>
    )
  }
  

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to TerriblyNamedDAO</h1>
        <button className="btn-hero" onClick={() => connectWallet("injected")}>
          Connect your wallet
        </button>
      </div>
    );
  }

  const mintNft = () => {
    setIsClaiming(true);

    bundleDropModule.claim("0", 1).then(() => {
      setHasClaimedNFT(true);

      console.log(`🌊 Succesfully minted membership NFT. Check it out on OpenSea:https://testnets.opensea.io/assets/${bundleDropModule.address}/0`);
    }).catch((e) => {
      console.log("failed to claim nft", e);
    }).finally(() => {
      setIsClaiming(false);
    });
  }

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>TerriblyNamedDAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active proposals</h2>
            <form onSubmit={(async (e) => {
              e.preventDefault();
              e.stopPropagation();

              setIsVoting(true);

              const votes = proposals.map((proposal) => {
                let voteResult = {
                  proposalId: proposal.proposalId,
                  vote: 2
                };
                proposal.votes.forEach((vote) => {
                  const elem = document.getElementById(proposal.proposalId + "-" + vote.type);

                  if (elem.checked) {
                    voteResult.vote = vote.type;
                    return;
                  }
                });
                return voteResult
              });

              try {
                const delegation = await tokenModule.getDelegationOf(address);
                if (delegation === ethers.constants.AddressZero) {
                  await tokenModule.delegateTo(address);
                }

                try {
                  await Promise.all(
                    votes.map(async (vote) => {
                      const proposal = await voteModule.get(vote.proposalId);
                      if (proposal.state === 1) {
                        return voteModule.vote(vote.proposalId, vote.vote);
                      }
                      return;
                    })
                  );

                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        const proposal = await voteModule.get(vote.proposalId);

                        if (proposal.state === 4) {
                          return voteModule.execute(vote.proposalId);
                        }
                      })
                    );
                    setHasVoted(true);
                    console.log("successfully voted!");
                  } catch (e) {
                    console.log("failed to execute votes", e);
                  }
                } catch (e) {
                  console.log("failed to vote", e);
                }
              } catch (e) {
                console.log("failed to delegate tokens", e);
              } finally {
                setIsVoting(false);
              }
            })}>
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => {
                      return (
                      <div key={vote.type}>
                        <input type="radio" name={proposal.proposalId} id={proposal.proposalId + "-" + vote.type} value={vote.type} defaultChecked={vote.type === 2} />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting ? "Voting..." : hasVoted ? "You already voted" : "Submit votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mint-nft">
      <h1>Mint your free TerriblyNamedDAO Membership NFT</h1>
      <button
        disabled={isClaiming} 
        onClick={() => mintNft()}
      >
        {isClaiming ? 'Minting...' : 'Mint your free NFT!'}
      </button>
    </div>
  )
};

export default App;