export type SepNetwork = "sep-mainnet" | "sep-testnet";

export type NameStatus = "active";

export interface SepName {
  userId: string;

  username: string;
  fullName: string;
  normalizedName: string;

  walletAddress: string;

  network: SepNetwork;

  status: NameStatus;

  createdAt: Date;
  updatedAt: Date;
}