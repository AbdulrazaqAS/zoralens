import { type GetCoinResponse } from "@zoralabs/coins-sdk";

export const NavItems = {
  portfolio: "Portfolio",
  explore: "Explore",
};

export type Zora20Token = GetCoinResponse["zora20Token"];
export interface CoinMetadata {
  balance?: string;
  balanceEther?: string;
  price: bigint;
  value?: bigint;
  id: string;
  coin: Zora20Token;
}

export type ProfileData = {
  address?: string; // User's wallet address
  handle?: string; // Username/handle
  displayName?: string; // User's display name
  bio?: string; // User's biography/description
  joinedAt?: string; // When the user joined
  profileImage?: {
    // Profile image data
    small?: string; // Small version of profile image
    medium?: string; // Medium version of profile image
    blurhash?: string; // Blurhash for image loading
  };
  linkedWallets?: Array<{
    // Connected social accounts
    type?: string;
    url?: string;
  }>;
};
