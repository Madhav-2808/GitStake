export type ScreenId = 'terminal' | 'markets' | 'vaults' | 'portfolio';

export type EcosystemCategory = 'Runtime' | 'Frontend' | 'Tooling' | 'Data';

export type Timeframe = '1H' | '4H' | '1D' | '1W' | '1M';

export interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  commits: number;
}

export interface CommitCatalyst {
  hash: string;
  author: string;
  message: string;
  timestamp: string;
  impactBps: number; // positive or negative basis points
  branch: string;
}

export interface RepoMarket {
  id: string;
  ticker: string; // e.g., BUN/USD
  symbol: string; // e.g., BUN
  repoSlug: string; // e.g., oven-sh/bun
  category: EcosystemCategory;
  license: string;
  stars: number;
  commitsPerWeek: number;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  openInterest: number;
  tvlStaked: number;
  fundingRate: number; // percentage per 8h
  contractId: string;
  milestoneTitle: string;
  milestoneTargetDate: string;
  milestoneProbability: number; // 0-100
  sparkline: number[];
  catalysts: CommitCatalyst[];
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface TapeTrade {
  id: string;
  time: string;
  price: number;
  size: number;
  side: 'long' | 'short';
}

export interface Position {
  id: string;
  marketId: string;
  ticker: string;
  repoSlug: string;
  side: 'long' | 'short';
  sizeUsd: number;
  collateralUsd: number;
  leverage: number;
  entryPrice: number;
  liqPrice: number;
  openedAt: string;
}

export interface OpenOrder {
  id: string;
  marketId: string;
  ticker: string;
  side: 'long' | 'short';
  type: 'limit' | 'stake';
  limitPrice: number;
  collateralUsd: number;
  leverage: number;
  createdAt: string;
}

export interface TradeRecord {
  id: string;
  timestamp: string;
  ticker: string;
  side: 'long' | 'short';
  action: 'Open' | 'Close' | 'Limit Fill' | 'Stake Claim';
  price: number;
  sizeUsd: number;
  feeUsd: number;
  realizedPnl?: number;
  txHash: string;
}

export interface StakingVault {
  id: string;
  marketId: string;
  repoSlug: string;
  pairLabel: string; // e.g., STK/BUN
  lockEpoch: 'Flexible' | '30D Epoch' | '90D Epoch';
  baseApy: number;
  sponsorBoostApy: number;
  tvlUsd: number;
  capacityUsd: number;
  userStakedUsd: number;
  claimableYieldUsd: number;
  maintainerAddress: string;
}
