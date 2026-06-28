export interface ApiLog {
  url: string;
  method: string;
  status: number;
  result: string;
}

export interface WalletData {
  address: string;
  ensName: string | null;
  username: string | null;
  walletAgeDays: number | null;
  totalPredictions: number | null;
  marketsParticipated: number | null;
  tradingVolume: number | null;
  totalTrades: number | null;
  activeDays: number | null;
  activeWeeks: number | null;
  activeMonths: number | null;
  lpActivity: boolean | null;
  lpRewards: number | null;
  sportsMarketActivity: number | null;
  firstTrade: string | null;
  latestTrade: string | null;
  profit_loss: number | null;
  portfolioValue: number | null;
  txCountOnChain: number;
  isEstimated?: boolean;
  apiLogs?: ApiLog[];
}

export interface SimulationSettings {
  totalTokenSupply: number;
  fdv: number;
  allocationPct: number; // 1 to 100
  eligibleWalletsCount: number;
  tierDistribution: {
    tier1: number; // percentage of pool e.g. 40
    tier2: number; // e.g. 30
    tier3: number; // e.g. 20
    tier4: number; // e.g. 10
  };
  advanced: {
    scoreWeights: {
      volume: number;      // weight out of 100
      predictions: number; // weight out of 100
      months: number;      // weight out of 100
      weeks: number;       // weight out of 100
    };
    minScore: number;
    lpBonus: number;       // multiplier e.g. 1.25
    sportsBonus: number;   // multiplier e.g. 1.10
    sybilPenalty: boolean;
    whalePenalty: boolean;
    profitableTraderPenalty: boolean;
    maxWalletAllocation: number; // Max tokens e.g. 100000
    rewardFormula: "standard" | "exponential" | "linear";
  };
}
