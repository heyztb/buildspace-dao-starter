import sdk from './1-initialize-sdk.js';

const appModule = sdk.getAppModule("0xB80c11A324D59D1f409B10447AB562916Fed01E6");

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "TerriblyNamedDAO Proposals",
      votingTokenAddress: "0xe6962EebC94258b3B7645132880F4Cbde0a4A43e",
      proposalStartWaitTimeInSeconds: 0,
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      votingQuorumFraction: 0,
      minimumNumberOfTokensNeededToPropose: "0"
    });

    console.log("successfully deployed vote module, address:", voteModule.address);

  } catch (e) {
    console.log('failed to deploy vote module', e);
  }
})()