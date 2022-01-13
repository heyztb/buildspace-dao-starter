import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js';

const tokenModule = sdk.getTokenModule("0xe6962EebC94258b3B7645132880F4Cbde0a4A43e");

(async () => {
  try {
    const amount = 1_000_000;
    const erc20Amount = ethers.utils.parseUnits(amount.toString(), 18);

    await tokenModule.mint(erc20Amount);
    const totalSupply = await tokenModule.totalSupply();

    console.log("✅ There is now", ethers.utils.formatUnits(totalSupply, 18), "$PAWN in circulation");
  } catch (e) {
    console.log("failed to print money", e);
  }
})()