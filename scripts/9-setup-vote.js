import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js';

const voteModule = sdk.getVoteModule("0xBC2B6B2B0CBB0e9089C118DBF82a335D54810D23");

const tokenModule = sdk.getTokenModule("0xe6962EebC94258b3B7645132880F4Cbde0a4A43e");

(async () => {
  try {
    await tokenModule.grantRole("minter", voteModule.address);

    console.log("succesfully gave vote module permission to act on token module");
  } catch (e) {
    console.log("failed to grant vote module permissions on token module", e);
    process.exit(1);
  }

  try {
    const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS);

    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    await tokenModule.transfer(
      voteModule.address,
      percent90
    );
    console.log('successfully transfered tokens to the vote module');
    
  } catch (e) {
    console.log("failed to transfer tokens to vote module", e);
  }
})()