import { SplitV2Client } from '@0xsplits/splits-sdk';
import { SplitV2Type } from '@0xsplits/splits-sdk/types';
import axios from "axios";
import type { Address, PublicClient, WalletClient } from "viem";

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
  const formData = new FormData();
  formData.set("file", file);
  formData.set("filename", filename);

  const isDev = import.meta.env.DEV; // true in dev, false in build

  const endpoint = isDev
    ? "http://localhost:5000/api/uploadFileToIPFS"
    : "/api/uploadFileToIPFS";

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
  let dataStr: string;

  if (data instanceof Object) dataStr = JSON.stringify(data, (_, value) => typeof value === 'bigint' ? value.toString() : value);
  else dataStr = data.toString();

  const formData = new FormData();
  formData.set("data", dataStr);
  formData.set("filename", filename);

  const isDev = import.meta.env.DEV; // true in dev, false in build

  const endpoint = isDev
    ? "http://localhost:5000/api/uploadJSONToIPFS"
    : "/api/uploadJSONToIPFS";

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
