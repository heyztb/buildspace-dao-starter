import sdk from './1-initialize-sdk.js';

const tokenModule = await sdk.getTokenModule("0xe6962EebC94258b3B7645132880F4Cbde0a4A43e");

(async () => {
  try {
    console.log("current roles: ", await tokenModule.getAllRoleMembers());

    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
    console.log("roles after revoking ourselves: ", await tokenModule.getAllRoleMembers());

  } catch (e) {
    console.error("failed to revoke our permissions from the DAO treasury", e);
  }
})()
