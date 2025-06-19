import { createCoin } from "@zoralabs/coins-sdk";
import { SplitV2Client } from '@0xsplits/splits-sdk';

export async function createCoin(coinParams: any, walletClient: WalletClient, publicClient: PublicClient) {
  try {
    const result = await createCoin(coinParams, walletClient, publicClient);

    console.log("Transaction hash:", result.hash);
    console.log("Coin address:", result.address);
    console.log("Deployment details:", result.deployment);

    return result;
  } catch (error) {
    console.error("Error creating coin:", error);
    throw error;
  }
}

export function createSplitsClient() {
  const splitsClient = new SplitV2Client({
    chainId,
    publicClient, // viem public client (optional, required if using any of the contract functions)
    walletClient, // viem wallet client (optional, required if using any contract write functions. must have an account already attached)
    includeEnsNames, // boolean, defaults to false. If true, will return ens names for any split recipient or controller (only for mainnet)
    // If you want to return ens names on chains other than mainnet, you can pass in a mainnet public client
    // here. Be aware though that the ens name may not necessarily resolve to the proper address on the
    // other chain for non EOAs (e.g. Gnosis Safe's)
    ensPublicClient, // viem public client (optional)
    apiConfig: {
      apiKey: string // You can create an API key by signing up on our app, and accessing your account settings at app.splits.org/settings.
    }, // Splits GraphQL API key config, this is required for the data client to access the splits graphQL API.
  })
}
