import sdk from './1-initialize-sdk.js';
import { readFileSync } from 'fs';

const bundleDrop = sdk.getBundleDropModule(
  "0x1B916452bA8Cd128b67D14fC9844c915728103Ba"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Chess Player",
        description: "This NFT grants you access to TerriblyNamedDAO",
        image: readFileSync("scripts/assets/membership.png")
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (e) {
    console.log("failed to create the new NFT", e);
  }
})()