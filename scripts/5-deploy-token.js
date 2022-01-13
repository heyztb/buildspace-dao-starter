import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0xB80c11A324D59D1f409B10447AB562916Fed01E6");

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      name: "TerriblyNamedDAO Governance Token",
      symbol: "PAWN",
    });

    console.log("✅ succesfully deployed token module, address:", tokenModule.address);
  } catch (e) {
    console.log("failed to deploy token module", e);
  }
})()