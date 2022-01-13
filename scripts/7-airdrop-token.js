import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const bundleDropModule = sdk.getBundleDropModule("0x1B916452bA8Cd128b67D14fC9844c915728103Ba");
const tokenModule = sdk.getTokenModule("0xe6962EebC94258b3B7645132880F4Cbde0a4A43e");

(async () => {
  try {
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length === 0) {
      console.log("no nfts have been claimed yet");
      process.exit(0);
    }

    const airdropTargets = walletAddresses.map((address) => {
      const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
      console.log("✅ going to airdrop", randomAmount, "tokens to", address);

      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18)
      }

      return airdropTarget;
    })

    console.log("⭐️ starting airdrop");
    await tokenModule.transferBatch(airdropTargets)

    console.log("succesfully airdropped tokens to all holders of the NFT")
  } catch (e) {
    console.log("failed to airdrop tokens", e);
  }
})()