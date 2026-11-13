import {
  CandlePoint,
  OpenOrder,
  OrderBookLevel,
  Position,
  RepoMarket,
  StakingVault,
  TapeTrade,
  Timeframe,
  TradeRecord,
} from '../types/market';

export const INITIAL_MARKETS: RepoMarket[] = [
  {
    id: 'bun',
    ticker: 'BUN/USD',
    symbol: 'BUN',
    repoSlug: 'oven-sh/bun',
    category: 'Runtime',
    license: 'MIT',
    stars: 76840,
    commitsPerWeek: 142,
    price: 42.84,
    change24h: 6.42,
    high24h: 44.10,
    low24h: 39.85,
    volume24h: 18420500,
    openInterest: 9240000,
    tvlStaked: 14680000,
    fundingRate: 0.0142,
    contractId: '0x84a2...f19c',
    milestoneTitle: 'v1.4 Native S3 & Zero-Copy Bundler',
    milestoneTargetDate: '2026-12-15',
    milestoneProbability: 78,
    sparkline: [37.9, 38.4, 38.1, 39.2, 39.8, 40.3, 39.9, 41.1, 41.6, 42.0, 41.7, 42.84],
    catalysts: [
      {
        hash: '9f3a81c',
        author: 'jarred-sumner',
        message: 'perf(jsc): reduce HTTP parser heap allocation by 28%',
        timestamp: '14m ago',
        impactBps: 185,
        branch: 'main',
      },
      {
        hash: '4c12e09',
        author: 'dylan-conway',
        message: 'feat(bundler): incremental CSS module chunk graph',
        timestamp: '2h ago',
        impactBps: 94,
        branch: 'main',
      },
      {
        hash: '71b0d42',
        author: 'ci-bot',
        message: 'bench: Linux x64 cold start regression fixed (-4.2ms)',
        timestamp: '5h ago',
        impactBps: 42,
        branch: 'main',
      },
    ],
  },
  {
    id: 'nextjs',
    ticker: 'NEXT/USD',
    symbol: 'NEXT',
    repoSlug: 'vercel/next.js',
    category: 'Frontend',
    license: 'MIT',
    stars: 131420,
    commitsPerWeek: 186,
    price: 118.60,
    change24h: 2.18,
    high24h: 120.45,
    low24h: 115.20,
    volume24h: 29410000,
    openInterest: 16120000,
    tvlStaked: 28400000,
    fundingRate: 0.0095,
    contractId: '0x31d9...a04b',
    milestoneTitle: 'Turbopack Persistent Cache GA',
    milestoneTargetDate: '2026-11-30',
    milestoneProbability: 86,
    sparkline: [113.2, 114.0, 113.8, 115.4, 116.1, 115.7, 116.9, 117.4, 118.1, 117.8, 118.2, 118.6],
    catalysts: [
      {
        hash: 'a21c90f',
        author: 'timneutkens',
        message: 'feat(turbopack): stabilize persistent disk cache serialization',
        timestamp: '28m ago',
        impactBps: 112,
        branch: 'canary',
      },
      {
        hash: '8e41b2a',
        author: 'shuding',
        message: 'fix(rsc): deduplicate streaming flight payloads in parallel routes',
        timestamp: '3h ago',
        impactBps: 56,
        branch: 'canary',
      },
    ],
  },
  {
    id: 'ruff',
    ticker: 'RUFF/USD',
    symbol: 'RUFF',
    repoSlug: 'astral-sh/ruff',
    category: 'Tooling',
    license: 'MIT',
    stars: 38910,
    commitsPerWeek: 114,
    price: 27.15,
    change24h: 9.84,
    high24h: 27.90,
    low24h: 24.50,
    volume24h: 11850200,
    openInterest: 5490000,
    tvlStaked: 8920000,
    fundingRate: 0.0215,
    contractId: '0x59e4...88b1',
    milestoneTitle: 'Red Knot Type Checker Alpha',
    milestoneTargetDate: '2026-12-01',
    milestoneProbability: 91,
    sparkline: [23.1, 23.4, 24.0, 24.2, 24.9, 25.3, 25.1, 25.8, 26.2, 26.7, 26.9, 27.15],
    catalysts: [
      {
        hash: 'f09d312',
        author: 'charliermarsh',
        message: 'feat(red-knot): incremental salsa query invalidation for generics',
        timestamp: '19m ago',
        impactBps: 245,
        branch: 'main',
      },
      {
        hash: '1b74e88',
        author: 'alexwaygood',
        message: 'perf(parser): zero-alloc f-string token scanner',
        timestamp: '4h ago',
        impactBps: 118,
        branch: 'main',
      },
    ],
  },
  {
    id: 'tailwind',
    ticker: 'TWND/USD',
    symbol: 'TWND',
    repoSlug: 'tailwindlabs/tailwindcss',
    category: 'Frontend',
    license: 'MIT',
    stars: 86240,
    commitsPerWeek: 64,
    price: 64.30,
    change24h: -1.45,
    high24h: 66.10,
    low24h: 63.75,
    volume24h: 9840000,
    openInterest: 4120000,
    tvlStaked: 11250000,
    fundingRate: -0.0042,
    contractId: '0x72c0...31e8',
    milestoneTitle: 'Oxide Engine v4.4 Container Queries',
    milestoneTargetDate: '2026-12-20',
    milestoneProbability: 74,
    sparkline: [66.2, 65.9, 65.4, 65.8, 65.1, 64.9, 65.2, 64.7, 64.6, 64.4, 64.5, 64.3],
    catalysts: [
      {
        hash: 'c34a77b',
        author: 'adamwathan',
        message: 'fix(oxide): handle nested @variant declarations inside @theme',
        timestamp: '1h ago',
        impactBps: -38,
        branch: 'main',
      },
      {
        hash: '5d2091c',
        author: 'robinmalfait',
        message: 'perf(scanner): skip binary vendor directories in glob walk',
        timestamp: '6h ago',
        impactBps: 29,
        branch: 'main',
      },
    ],
  },
  {
    id: 'biome',
    ticker: 'BIOM/USD',
    symbol: 'BIOM',
    repoSlug: 'biomejs/biome',
    category: 'Tooling',
    license: 'MIT',
    stars: 18920,
    commitsPerWeek: 92,
    price: 16.42,
    change24h: 4.19,
    high24h: 16.88,
    low24h: 15.60,
    volume24h: 5340800,
    openInterest: 2180000,
    tvlStaked: 4210000,
    fundingRate: 0.0112,
    contractId: '0x18f7...90d2',
    milestoneTitle: 'Multi-File Type Inference & CSS Linter',
    milestoneTargetDate: '2027-01-10',
    milestoneProbability: 69,
    sparkline: [15.1, 15.3, 15.2, 15.5, 15.8, 15.7, 16.0, 16.1, 15.9, 16.2, 16.3, 16.42],
    catalysts: [
      {
        hash: '66a19be',
        author: 'ematipico',
        message: 'feat(gritql): compile custom lint plugins into workspace daemon',
        timestamp: '42m ago',
        impactBps: 134,
        branch: 'main',
      },
    ],
  },
  {
    id: 'vite',
    ticker: 'VITE/USD',
    symbol: 'VITE',
    repoSlug: 'vitejs/vite',
    category: 'Tooling',
    license: 'MIT',
    stars: 72480,
    commitsPerWeek: 78,
    price: 51.90,
    change24h: 1.76,
    high24h: 52.50,
    low24h: 50.80,
    volume24h: 14120000,
    openInterest: 7890000,
    tvlStaked: 15400000,
    fundingRate: 0.0088,
    contractId: '0x94b3...c411',
    milestoneTitle: 'Rolldown Rust Bundler Default Integration',
    milestoneTargetDate: '2026-12-08',
    milestoneProbability: 83,
    sparkline: [50.4, 50.6, 50.9, 50.7, 51.1, 51.3, 51.2, 51.5, 51.4, 51.7, 51.8, 51.9],
    catalysts: [
      {
        hash: 'd81e402',
        author: 'patak-dev',
        message: 'feat(rolldown): align SSR environment API hooks with plugin container',
        timestamp: '55m ago',
        impactBps: 78,
        branch: 'main',
      },
    ],
  },
  {
    id: 'drizzle',
    ticker: 'DRZL/USD',
    symbol: 'DRZL',
    repoSlug: 'drizzle-team/drizzle-orm',
    category: 'Data',
    license: 'Apache-2.0',
    stars: 27450,
    commitsPerWeek: 84,
    price: 21.08,
    change24h: -2.86,
    high24h: 22.15,
    low24h: 20.90,
    volume24h: 6210000,
    openInterest: 3040000,
    tvlStaked: 5890000,
    fundingRate: -0.0065,
    contractId: '0x2c61...77ea',
    milestoneTitle: 'Zero-Runtime Migration Engine v1.0',
    milestoneTargetDate: '2026-12-28',
    milestoneProbability: 64,
    sparkline: [22.1, 22.0, 21.8, 21.9, 21.6, 21.5, 21.7, 21.4, 21.3, 21.2, 21.15, 21.08],
    catalysts: [
      {
        hash: '33f810a',
        author: 'andrii-sherman',
        message: 'fix(pg): preserve composite enum index ordering in push diff',
        timestamp: '2h ago',
        impactBps: -62,
        branch: 'beta',
      },
    ],
  },
  {
    id: 'deno',
    ticker: 'DENO/USD',
    symbol: 'DENO',
    repoSlug: 'denoland/deno',
    category: 'Runtime',
    license: 'MIT',
    stars: 101850,
    commitsPerWeek: 109,
    price: 34.72,
    change24h: 0.93,
    high24h: 35.10,
    low24h: 34.05,
    volume24h: 8740000,
    openInterest: 4670000,
    tvlStaked: 9150000,
    fundingRate: 0.0054,
    contractId: '0x6e08...12fa',
    milestoneTitle: 'JSR Native Workspace Resolution v2.6',
    milestoneTargetDate: '2026-11-25',
    milestoneProbability: 88,
    sparkline: [34.1, 34.2, 34.0, 34.3, 34.4, 34.2, 34.5, 34.6, 34.4, 34.6, 34.7, 34.72],
    catalysts: [
      {
        hash: 'e7712b9',
        author: 'bartlomieju',
        message: 'perf(ext/http): vectorize response header serialization in Hyper',
        timestamp: '3h ago',
        impactBps: 49,
        branch: 'main',
      },
    ],
  },
  {
    id: 'svelte',
    ticker: 'SVLT/USD',
    symbol: 'SVLT',
    repoSlug: 'sveltejs/svelte',
    category: 'Frontend',
    license: 'MIT',
    stars: 82910,
    commitsPerWeek: 58,
    price: 48.15,
    change24h: -0.64,
    high24h: 48.95,
    low24h: 47.70,
    volume24h: 7190000,
    openInterest: 3510000,
    tvlStaked: 8340000,
    fundingRate: 0.0021,
    contractId: '0x45a9...d30c',
    milestoneTitle: 'Async Runes Hydration Scheduler',
    milestoneTargetDate: '2027-01-18',
    milestoneProbability: 72,
    sparkline: [48.6, 48.5, 48.7, 48.4, 48.3, 48.5, 48.2, 48.4, 48.3, 48.1, 48.2, 48.15],
    catalysts: [
      {
        hash: '90b42c1',
        author: 'rich-harris',
        message: 'fix(runes): avoid redundant derived signal flush during unmount',
        timestamp: '4h ago',
        impactBps: -19,
        branch: 'main',
      },
    ],
  },
  {
    id: 'duckdb',
    ticker: 'DUCK/USD',
    symbol: 'DUCK',
    repoSlug: 'duckdb/duckdb',
    category: 'Data',
    license: 'MIT',
    stars: 28940,
    commitsPerWeek: 151,
    price: 56.40,
    change24h: 5.12,
    high24h: 57.20,
    low24h: 53.30,
    volume24h: 12950000,
    openInterest: 6820000,
    tvlStaked: 12780000,
    fundingRate: 0.0168,
    contractId: '0xb12a...55e4',
    milestoneTitle: 'DuckLake Distributed Iceberg Engine',
    milestoneTargetDate: '2026-12-12',
    milestoneProbability: 81,
    sparkline: [52.8, 53.1, 53.5, 53.4, 54.0, 54.4, 54.9, 55.1, 55.6, 55.9, 56.1, 56.4],
    catalysts: [
      {
        hash: '7c9910e',
        author: 'mytherin',
        message: 'feat(parquet): vectorized dictionary pushdown on ZSTD row groups',
        timestamp: '35m ago',
        impactBps: 164,
        branch: 'main',
      },
    ],
  },
];

export const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    marketId: 'bun',
    ticker: 'BUN/USD',
    repoSlug: 'oven-sh/bun',
    side: 'long',
    sizeUsd: 12000,
    collateralUsd: 2400,
    leverage: 5,
    entryPrice: 40.65,
    liqPrice: 32.92,
    openedAt: '2026-11-12 16:40:12',
  },
  {
    id: 'pos-2',
    marketId: 'ruff',
    ticker: 'RUFF/USD',
    repoSlug: 'astral-sh/ruff',
    side: 'long',
    sizeUsd: 6000,
    collateralUsd: 1500,
    leverage: 4,
    entryPrice: 25.40,
    liqPrice: 19.30,
    openedAt: '2026-11-12 19:15:04',
  },
  {
    id: 'pos-3',
    marketId: 'tailwind',
    ticker: 'TWND/USD',
    repoSlug: 'tailwindlabs/tailwindcss',
    side: 'short',
    sizeUsd: 4500,
    collateralUsd: 1500,
    leverage: 3,
    entryPrice: 65.10,
    liqPrice: 86.14,
    openedAt: '2026-11-12 20:08:47',
  },
];

export const INITIAL_OPEN_ORDERS: OpenOrder[] = [
  {
    id: 'ord-1',
    marketId: 'bun',
    ticker: 'BUN/USD',
    side: 'long',
    type: 'limit',
    limitPrice: 41.20,
    collateralUsd: 1000,
    leverage: 5,
    createdAt: '21:14:09',
  },
  {
    id: 'ord-2',
    marketId: 'nextjs',
    ticker: 'NEXT/USD',
    side: 'short',
    type: 'limit',
    limitPrice: 122.50,
    collateralUsd: 800,
    leverage: 3,
    createdAt: '21:42:33',
  },
];

export const INITIAL_TRADES: TradeRecord[] = [
  {
    id: 'trd-101',
    timestamp: '2026-11-12 20:08:47',
    ticker: 'TWND/USD',
    side: 'short',
    action: 'Open',
    price: 65.10,
    sizeUsd: 4500,
    feeUsd: 2.25,
    txHash: '0x94d2...e81b',
  },
  {
    id: 'trd-102',
    timestamp: '2026-11-12 19:15:04',
    ticker: 'RUFF/USD',
    side: 'long',
    action: 'Open',
    price: 25.40,
    sizeUsd: 6000,
    feeUsd: 3.00,
    txHash: '0x71b4...a92c',
  },
  {
    id: 'trd-103',
    timestamp: '2026-11-12 17:52:19',
    ticker: 'VITE/USD',
    side: 'long',
    action: 'Close',
    price: 51.65,
    sizeUsd: 8000,
    feeUsd: 4.00,
    realizedPnl: 412.80,
    txHash: '0x38a9...4f01',
  },
  {
    id: 'trd-104',
    timestamp: '2026-11-12 16:40:12',
    ticker: 'BUN/USD',
    side: 'long',
    action: 'Open',
    price: 40.65,
    sizeUsd: 12000,
    feeUsd: 6.00,
    txHash: '0x12f0...8c33',
  },
  {
    id: 'trd-105',
    timestamp: '2026-11-12 14:11:05',
    ticker: 'DUCK/USD',
    side: 'long',
    action: 'Stake Claim',
    price: 55.10,
    sizeUsd: 3200,
    feeUsd: 0.40,
    realizedPnl: 184.50,
    txHash: '0xc5e3...91ad',
  },
];

export const INITIAL_VAULTS: StakingVault[] = [
  {
    id: 'v-bun',
    marketId: 'bun',
    repoSlug: 'oven-sh/bun',
    pairLabel: 'STK/BUN',
    lockEpoch: '30D Epoch',
    baseApy: 11.4,
    sponsorBoostApy: 6.8,
    tvlUsd: 14680000,
    capacityUsd: 20000000,
    userStakedUsd: 4200,
    claimableYieldUsd: 68.42,
    maintainerAddress: '0xoven...992e',
  },
  {
    id: 'v-next',
    marketId: 'nextjs',
    repoSlug: 'vercel/next.js',
    pairLabel: 'STK/NEXT',
    lockEpoch: '90D Epoch',
    baseApy: 9.2,
    sponsorBoostApy: 8.5,
    tvlUsd: 28400000,
    capacityUsd: 32000000,
    userStakedUsd: 3500,
    claimableYieldUsd: 114.20,
    maintainerAddress: '0xvrcl...410a',
  },
  {
    id: 'v-ruff',
    marketId: 'ruff',
    repoSlug: 'astral-sh/ruff',
    pairLabel: 'STK/RUFF',
    lockEpoch: 'Flexible',
    baseApy: 12.8,
    sponsorBoostApy: 4.9,
    tvlUsd: 8920000,
    capacityUsd: 12000000,
    userStakedUsd: 1800,
    claimableYieldUsd: 29.15,
    maintainerAddress: '0xastr...712c',
  },
  {
    id: 'v-duck',
    marketId: 'duckdb',
    repoSlug: 'duckdb/duckdb',
    pairLabel: 'STK/DUCK',
    lockEpoch: '30D Epoch',
    baseApy: 10.6,
    sponsorBoostApy: 5.4,
    tvlUsd: 12780000,
    capacityUsd: 16000000,
    userStakedUsd: 0,
    claimableYieldUsd: 0,
    maintainerAddress: '0xduck...308b',
  },
  {
    id: 'v-vite',
    marketId: 'vite',
    repoSlug: 'vitejs/vite',
    pairLabel: 'STK/VITE',
    lockEpoch: '90D Epoch',
    baseApy: 8.9,
    sponsorBoostApy: 6.1,
    tvlUsd: 15400000,
    capacityUsd: 18000000,
    userStakedUsd: 2500,
    claimableYieldUsd: 47.90,
    maintainerAddress: '0xvite...114f',
  },
  {
    id: 'v-biome',
    marketId: 'biome',
    repoSlug: 'biomejs/biome',
    pairLabel: 'STK/BIOM',
    lockEpoch: 'Flexible',
    baseApy: 13.5,
    sponsorBoostApy: 3.8,
    tvlUsd: 4210000,
    capacityUsd: 7500000,
    userStakedUsd: 0,
    claimableYieldUsd: 0,
    maintainerAddress: '0xbiom...621d',
  },
];

// Deterministic pseudo-random helper so charts stay stable per market + timeframe
function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function generateCandles(market: RepoMarket, timeframe: Timeframe): CandlePoint[] {
  const count = 48;
  const seedBase =
    market.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0) * 31, 0) +
    timeframe.charCodeAt(0) * 17;
  const rand = seededRandom(seedBase);

  const volScale =
    timeframe === '1H'
      ? 0.004
      : timeframe === '4H'
        ? 0.008
        : timeframe === '1D'
          ? 0.014
          : timeframe === '1W'
            ? 0.022
            : 0.032;

  const points: CandlePoint[] = [];
  const trendSign = market.change24h >= 0 ? 1 : -1;
  let current = market.price * (1 - trendSign * Math.min(0.08, Math.abs(market.change24h) / 100));

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const drift = (trendSign * 0.0014) + (rand() - 0.48) * volScale;
    const open = current;
    const close = isLast ? market.price : Math.max(0.5, open * (1 + drift));
    const wickUp = Math.abs(rand() * volScale * 0.7 * open);
    const wickDown = Math.abs(rand() * volScale * 0.7 * open);
    const high = Math.max(open, close) + wickUp;
    const low = Math.max(0.2, Math.min(open, close) - wickDown);
    const volume = Math.round((market.volume24h / count) * (0.55 + rand() * 0.95));
    const commits = Math.max(1, Math.round((market.commitsPerWeek / 24) * (0.4 + rand() * 1.4)));

    let label = '';
    if (timeframe === '1H') {
      const minsAgo = (count - 1 - i) * 1;
      label = minsAgo === 0 ? 'Now' : `-${minsAgo}m`;
    } else if (timeframe === '4H') {
      const minsAgo = (count - 1 - i) * 5;
      label = minsAgo === 0 ? 'Now' : `-${minsAgo}m`;
    } else if (timeframe === '1D') {
      const hrs = Math.floor(((count - 1 - i) * 30) / 60);
      const mins = ((count - 1 - i) * 30) % 60;
      label = i === count - 1 ? '22:00' : `-${hrs}h${mins ? mins + 'm' : ''}`;
    } else if (timeframe === '1W') {
      const day = Math.floor((i / count) * 7) + 1;
      label = `D${day}`;
    } else {
      label = `Oct ${Math.min(30, i + 1)}`;
    }

    points.push({
      time: label,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      commits,
    });
    current = close;
  }

  return points;
}

export function generateOrderBook(
  price: number,
  seedOffset: number
): { asks: OrderBookLevel[]; bids: OrderBookLevel[]; spread: number; spreadPct: number } {
  const rand = seededRandom(Math.round(price * 100) + seedOffset);
  const step = Math.max(0.01, Number((price * 0.0008).toFixed(2)));
  const asks: OrderBookLevel[] = [];
  const bids: OrderBookLevel[] = [];

  let askTotal = 0;
  for (let i = 0; i < 8; i++) {
    const levelPrice = Number((price + step * (i + 1)).toFixed(2));
    const size = Number((12 + rand() * 85).toFixed(2));
    askTotal += size;
    asks.push({ price: levelPrice, size, total: Number(askTotal.toFixed(2)) });
  }
  asks.reverse(); // highest ask at top, lowest ask nearest spread

  let bidTotal = 0;
  for (let i = 0; i < 8; i++) {
    const levelPrice = Number(Math.max(0.01, price - step * (i + 1)).toFixed(2));
    const size = Number((14 + rand() * 90).toFixed(2));
    bidTotal += size;
    bids.push({ price: levelPrice, size, total: Number(bidTotal.toFixed(2)) });
  }

  const bestAsk = asks[asks.length - 1].price;
  const bestBid = bids[0].price;
  const spread = Number((bestAsk - bestBid).toFixed(2));
  const spreadPct = Number(((spread / price) * 100).toFixed(3));

  return { asks, bids, spread, spreadPct };
}

export function generateTapeTrades(price: number, seedOffset: number): TapeTrade[] {
  const rand = seededRandom(Math.round(price * 13) + seedOffset);
  const trades: TapeTrade[] = [];
  const baseSeconds = 22 * 3600 + 1 * 60 + 26;

  for (let i = 0; i < 16; i++) {
    const sec = baseSeconds - i * Math.floor(2 + rand() * 14);
    const hh = String(Math.floor(sec / 3600) % 24).padStart(2, '0');
    const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    const side: 'long' | 'short' = rand() > 0.44 ? 'long' : 'short';
    const delta = (rand() - 0.5) * price * 0.0025;
    trades.push({
      id: `tape-${i}-${seedOffset}`,
      time: `${hh}:${mm}:${ss}`,
      price: Number((price + delta).toFixed(2)),
      size: Number((3 + rand() * 48).toFixed(2)),
      side,
    });
  }
  return trades;
}
