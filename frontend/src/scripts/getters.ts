import {type Address} from "viem";
import { getCoin, getCoins } from "@zoralabs/coins-sdk";

export async function fetchSingleCoin(addr: Address, chainId: number) {
  const response = await getCoin({
    address: addr,
    chain: chainId, // Optional: Base chain set by default
  });
 
  const coin = response.data?.zora20Token;
 
  if (coin) {
    console.log("Coin Details:");
    console.log("- Name:", coin.name);
    console.log("- Symbol:", coin.symbol);
    console.log("- Description:", coin.description);
    console.log("- Total Supply:", coin.totalSupply);
    console.log("- Market Cap:", coin.marketCap);
    console.log("- 24h Volume:", coin.volume24h);
    console.log("- Creator:", coin.creatorAddress);
    console.log("- Created At:", coin.createdAt);
    console.log("- Unique Holders:", coin.uniqueHolders);
 
    // Access media if available
    if (coin.mediaContent?.previewImage) {
      console.log("- Preview Image:", coin.mediaContent.previewImage);
    }
  }
 
  return response.data?.zora20Token;
}

export async function fetchMultipleCoins(coinsAddr: Address[], chainId: number) {
	const coins = coinsAddr.map(addr => {
		return {chainId, collectionAddress: addr}
	});
	
  const response = await getCoins({
    coins
  });
 
  // Process each coin in the response
  response.data?.zora20Tokens?.forEach((coin: any, index: number) => {
    console.log(`Coin ${index + 1}: ${coin.name} (${coin.symbol})`);
    console.log(`- Market Cap: ${coin.marketCap}`);
    console.log(`- 24h Volume: ${coin.volume24h}`);
    console.log(`- Holders: ${coin.uniqueHolders}`);
    console.log("-----------------------------------");
  });
 
  return response.data?.zora20Tokens;
}