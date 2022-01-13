import { ethers } from 'ethers';
import sdk from './1-initialize-sdk.js';
import { readFileSync } from 'fs';

const app = sdk.getAppModule("0xB80c11A324D59D1f409B10447AB562916Fed01E6");

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: "TerriblyNamedDAO Membership",
      description: "A DAO for fun",
      image: readFileSync("scripts/assets/membership.png"),
      primarySaleRecipientAddress: ethers.constants.AddressZero
    });

     console.log(
      "✅ Successfully deployed bundleDrop module, address:",
      bundleDropModule.address,
    );
    console.log(
      "✅ bundleDrop metadata:",
      await bundleDropModule.getMetadata(),
    );

  } catch (e) {
    console.log("failed to deploy bundleDrop module", e);
  }
})()