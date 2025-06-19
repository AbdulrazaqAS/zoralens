import { createCoin } from "@zoralabs/coins-sdk";

async function createMyCoin(coinParams: any, walletClient: WalletClient, publicClient: PublicClient) {
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