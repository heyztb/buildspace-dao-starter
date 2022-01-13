import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js';

const voteModule = sdk.getVoteModule("0xBC2B6B2B0CBB0e9089C118DBF82a335D54810D23");

const tokenModule = sdk.getTokenModule("0xe6962EebC94258b3B7645132880F4Cbde0a4A43e");

(async () => {
  try { 
    const amount = 420_000;
    await voteModule.propose(
      "Should the DAO mint an additional " + amount + " tokens into the treasury?",
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "mint",
            [
              voteModule.address,
              ethers.utils.parseUnits(amount.toString(), 18)
            ]
          ),
          toAddress: tokenModule.address
        }
      ],
    );

    console.log('successfully created new proposal to mint tokens');
  } catch (e) {
    console.log("failed to create new proposal", e);
  }

  try {
    const amount = 6_900;
    await voteModule.propose(
      "Should the DAO transfer " + amount + " tokens from the treasury to " + process.env.WALLET_ADDRESS + " for being awesome?",
      [
        {
          nativeTokenValue: 0,
          transactionData: tokenModule.contract.interface.encodeFunctionData(
            "transfer",
            [
              process.env.WALLET_ADDRESS,
              ethers.utils.parseUnits(amount.toString(), 18)
            ]
          ),
          toAddress: tokenModule.address
        }
      ],
    );

    console.log("successfully created proposal to reward ourself from the treasury");
  } catch (e) {
    console.log("failed to create new proposal", e);
  }
})()
