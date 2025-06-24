import { SplitV2Client } from '@0xsplits/splits-sdk';
import { SplitV2Type } from '@0xsplits/splits-sdk/types';
import axios from "axios";
import { toast } from "sonner";
import { keccak256, toBytes, getContract, type Address, type PublicClient, type WalletClient } from "viem";

import RemixerABI from "../assets/RemixerABI.json";

const RemixerAddress = import.meta.env.VITE_REMIXER_CONTRACT!;
const SplitsApiKey = import.meta.env.VITE_SPLITS_API_KEY!;

export function createSplitsClient(
  chainId: number,
  publicClient?: PublicClient,
  walletClient?: WalletClient,
) {
  const splitsClient = new SplitV2Client({
    chainId,
    publicClient, // viem public client (optional, required if using any of the contract functions)
    walletClient, // viem wallet client (optional, required if using any contract write functions. must have an account already attached)
    includeEnsNames: false, // boolean, defaults to false. If true, will return ens names for any split recipient or controller (only for mainnet)
    // If you want to return ens names on chains other than mainnet, you can pass in a mainnet public client
    // here. Be aware though that the ens name may not necessarily resolve to the proper address on the
    // other chain for non EOAs (e.g. Gnosis Safe's)
    //ensPublicClient, // viem public client (optional)
    apiConfig: {
      apiKey: SplitsApiKey, // You can create an API key by signing up on our app, and accessing your account settings at app.splits.org/settings.
    }, // Splits GraphQL API key config, this is required for the data client to access the splits graphQL API.
  });

  return splitsClient;
}

export async function createSplit(recipients: Address[], shares: number[], owner: Address, creator: Address, chainId: number, splitsClient: SplitV2Client) {
  const recipientsAllocations = recipients.map((addr, index) => ({
    address: addr,
    percentAllocation: shares[index]
  }));
  
  const args = {
    recipients: recipientsAllocations,
    distributorFeePercent: 1.0000,
    totalAllocationPercent: 100.0000,
    splitType: SplitV2Type.Push,
    ownerAddress: owner,
    creatorAddress: creator,
    chainId
  }

  const response = await splitsClient.createSplit(args);
  return response;
}

export async function uploadFileToIPFS(file: File, filename: string): Promise<string | undefined> {
  const isCodespace = import.meta.env.VITE_IS_CODESPACE === 'true';  // if using GitHub codespace. It redirects localhost.
  const codespaceName = import.meta.env.VITE_CODESPACE_NAME;
  
  //if (!isCodespace || !codespaceName) throw new Error("Required environment variables not set");
  
  const formData = new FormData();
  formData.set("file", file);
  formData.set("filename", filename);

  let endpoint: string;
  const isDev = import.meta.env.DEV; // true in vite dev, false in build

  // https://bug-free-engine-qgj465q64wqc95rq-5000.app.github.dev/
  if(isDev){
    if (isCodespace && codespaceName)
      endpoint = `https://${codespaceName}-5000.app.github.dev/api/uploadFileToIPFS`;
    else  // locally in coputer
      endpoint = "http://localhost:5000/api/uploadFileToIPFS"
  } else {  // use serverless function in build
    endpoint = "/api/uploadFileToIPFS";
  }

  const response = await axios.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const result = response.data;

  if (response.statusText === "OK" || response.status === 200) {
    return result.cid;
  } else {
    throw new Error(result.error || "Unknown error");
  }
};

export async function uploadJsonToIPFS(data: any, filename: string): Promise<string | undefined> {
  const isCodespace = import.meta.env.VITE_IS_CODESPACE === 'true';  // if using GitHub codespace. It redirects localhost.
  const codespaceName = import.meta.env.VITE_CODESPACE_NAME;
  
  //if (!isCodespace || !codespaceName) throw new Error("Required environment variables not set");
  
  let dataStr: string;

  if (data instanceof Object) dataStr = JSON.stringify(data, (_, value) => typeof value === 'bigint' ? value.toString() : value);
  else dataStr = data.toString();

  const formData = new FormData();
  formData.set("data", dataStr);
  formData.set("filename", filename);

  let endpoint: string;
  const isDev = import.meta.env.DEV; // true in vite dev, falsy in build
  
  // https://bug-free-engine-qgj465q64wqc95rq-5000.app.github.dev/
  if(isDev){
    if (isCodespace && codespaceName)
      endpoint = `https://${codespaceName}-5000.app.github.dev/api/uploadJSONToIPFS`;
    else  // locally in coputer
      endpoint = "http://localhost:5000/api/uploadJSONToIPFS"
  } else {  // use serverless function in build
    endpoint = "/api/uploadJSONToIPFS";
  }

  const response = await axios.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const result = response.data;

  if (response.statusText === "OK" || response.status === 200) {
    return result.cid;
  } else {
    throw new Error(result.error || "Unknown error");
  }
};

export async function addRemixerCoin(coin: Address, payoutRecipient: Address, revenueShare: number, owners: Address[], client: WalletClient): Promise<`0x${string}`> {
    const contract = getContract({
        address: RemixerAddress,
        abi: RemixerABI,
        client
    });

    const txHash = await contract.write.addCoin([
      coin,
      payoutRecipient,
      revenueShare,
      owners
    ]);
    
    return txHash;
}

export async function createRemixerCoin(
  payoutRecipient: Address,
  owners: Address[],
  uri: string,
  name: string,
  symbol: string,
  revenueShare: number,
  saltStr: string,
  client: WalletClient
): Promise<`0x${string}`> {
    const contract = getContract({
        address: RemixerAddress,
        abi: RemixerABI,
        client
    });
    const salt = keccak256(toBytes(saltStr));
    const txHash = await contract.write.createCoin([
      payoutRecipient,
      owners,
      uri,
      name,
      symbol,
      revenueShare,
      salt
    ]);
    
    return txHash;
}

export function handleError(error: Error) {
    console.error("Error:", error);
    toast.error(`Error: ${error.message}`);
}

export function handleSuccess(message: string) {
    console.log("Success:", message);
    toast.success(message);
}