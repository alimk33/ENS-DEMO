export interface BalanceResult {
  sufficient: boolean;
  availableBalance: string;
}

export interface BalanceIntegration {
  hasEnoughBalance(
    userId: string,
    amount: string,
  ): Promise<BalanceResult>;
}