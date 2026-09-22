export interface SepUser {
  userId: string;
  walletAddress: string;
}

export interface UserIntegration {
  getUserById(userId: string): Promise<SepUser | null>;
}