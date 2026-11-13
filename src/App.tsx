import { useEffect, useState } from 'react';
import { DepositModal } from './components/DepositModal';
import { MarketsScreen } from './components/MarketsScreen';
import { PortfolioScreen } from './components/PortfolioScreen';
import { TerminalScreen } from './components/TerminalScreen';
import { TopBar } from './components/TopBar';
import { VaultsScreen } from './components/VaultsScreen';
import {
  INITIAL_MARKETS,
  INITIAL_OPEN_ORDERS,
  INITIAL_POSITIONS,
  INITIAL_TRADES,
  INITIAL_VAULTS,
} from './data/marketsData';
import {
  OpenOrder,
  Position,
  RepoMarket,
  ScreenId,
  StakingVault,
  TradeRecord,
} from './types/market';

function formatNowTimestamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function makeTxHash(): string {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0');
  return `0x${hex.slice(0, 4)}...${hex.slice(2)}`;
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('terminal');
  const [markets, setMarkets] = useState<RepoMarket[]>(INITIAL_MARKETS);
  const [selectedMarketId, setSelectedMarketId] = useState<string>('bun');
  const [starredIds, setStarredIds] = useState<string[]>(['bun', 'nextjs', 'ruff']);
  const [availableBalance, setAvailableBalance] = useState<number>(18450.0);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>(INITIAL_OPEN_ORDERS);
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>(INITIAL_TRADES);
  const [vaults, setVaults] = useState<StakingVault[]>(INITIAL_VAULTS);
  const [liveFeed, setLiveFeed] = useState<boolean>(true);
  const [tickCounter, setTickCounter] = useState<number>(1);
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);

  // Subtle live tick feed for real-time market simulation
  useEffect(() => {
    if (!liveFeed) return;
    const timer = window.setInterval(() => {
      setTickCounter((prev) => prev + 1);
      setMarkets((prevMarkets) =>
        prevMarkets.map((m) => {
          const jitter = (Math.random() - 0.495) * 0.0028;
          const nextPrice = Math.max(0.5, Number((m.price * (1 + jitter)).toFixed(2)));
          const nextSparkline = [...m.sparkline.slice(1), nextPrice];
          return {
            ...m,
            price: nextPrice,
            high24h: Math.max(m.high24h, nextPrice),
            low24h: Math.min(m.low24h, nextPrice),
            sparkline: nextSparkline,
          };
        })
      );
    }, 2600);
    return () => window.clearInterval(timer);
  }, [liveFeed]);

  const handleToggleStar = (id: string) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteOrder = (params: {
    market: RepoMarket;
    side: 'long' | 'short';
    orderType: 'market' | 'limit' | 'stake';
    collateralUsd: number;
    leverage: number;
    limitPrice?: number;
  }): { ok: boolean; message: string } => {
    const { market, side, orderType, collateralUsd, leverage, limitPrice } = params;

    if (!Number.isFinite(collateralUsd) || collateralUsd < 10) {
      return { ok: false, message: 'Minimum collateral is $10.00 USDC.' };
    }

    const sizeUsd = collateralUsd * leverage;
    const feeUsd = Number((sizeUsd * 0.0005).toFixed(2));
    const totalRequired = collateralUsd + (orderType === 'limit' ? 0 : feeUsd);

    if (totalRequired > availableBalance) {
      return {
        ok: false,
        message: 'Insufficient available USDC balance for collateral and fee.',
      };
    }

    if (orderType === 'limit') {
      const targetPrice = limitPrice ?? market.price;
      if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
        return { ok: false, message: 'Enter a valid limit price.' };
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setAvailableBalance((prev) => Number((prev - collateralUsd).toFixed(2)));
      setOpenOrders((prev) => [
        {
          id: `ord-${Date.now()}`,
          marketId: market.id,
          ticker: market.ticker,
          side,
          type: 'limit',
          limitPrice: Number(targetPrice.toFixed(2)),
          collateralUsd,
          leverage,
          createdAt: timeStr,
        },
        ...prev,
      ]);

      return {
        ok: true,
        message: `Limit ${side.toUpperCase()} placed on ${market.ticker} at $${targetPrice.toFixed(2)}.`,
      };
    }

    const entryPrice = market.price;
    const liqPrice =
      leverage <= 1
        ? 0
        : side === 'long'
          ? Number((entryPrice * (1 - 0.9 / leverage)).toFixed(2))
          : Number((entryPrice * (1 + 0.9 / leverage)).toFixed(2));

    setAvailableBalance((prev) => Number((prev - totalRequired).toFixed(2)));
    setPositions((prev) => [
      {
        id: `pos-${Date.now()}`,
        marketId: market.id,
        ticker: market.ticker,
        repoSlug: market.repoSlug,
        side,
        sizeUsd,
        collateralUsd,
        leverage,
        entryPrice,
        liqPrice,
        openedAt: formatNowTimestamp(),
      },
      ...prev,
    ]);

    setTradeHistory((prev) => [
      {
        id: `trd-${Date.now()}`,
        timestamp: formatNowTimestamp(),
        ticker: market.ticker,
        side,
        action: 'Open',
        price: entryPrice,
        sizeUsd,
        feeUsd,
        txHash: makeTxHash(),
      },
      ...prev,
    ]);

    return {
      ok: true,
      message: `Executed ${side.toUpperCase()} ${leverage}x on ${market.ticker} ($${sizeUsd.toLocaleString()}).`,
    };
  };

  const handleClosePosition = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;
    const market = markets.find((m) => m.id === pos.marketId);
    const mark = market ? market.price : pos.entryPrice;

    const pctDelta =
      pos.side === 'long'
        ? (mark - pos.entryPrice) / pos.entryPrice
        : (pos.entryPrice - mark) / pos.entryPrice;
    const realizedPnl = Number((pos.sizeUsd * pctDelta).toFixed(2));
    const closeFee = Number((pos.sizeUsd * 0.0005).toFixed(2));
    const returned = Math.max(0, pos.collateralUsd + realizedPnl - closeFee);

    setPositions((prev) => prev.filter((p) => p.id !== positionId));
    setAvailableBalance((prev) => Number((prev + returned).toFixed(2)));
    setTradeHistory((prev) => [
      {
        id: `trd-${Date.now()}`,
        timestamp: formatNowTimestamp(),
        ticker: pos.ticker,
        side: pos.side,
        action: 'Close',
        price: mark,
        sizeUsd: pos.sizeUsd,
        feeUsd: closeFee,
        realizedPnl,
        txHash: makeTxHash(),
      },
      ...prev,
    ]);
  };

  const handleCancelOrder = (orderId: string) => {
    const ord = openOrders.find((o) => o.id === orderId);
    if (!ord) return;
    setOpenOrders((prev) => prev.filter((o) => o.id !== orderId));
    setAvailableBalance((prev) => Number((prev + ord.collateralUsd).toFixed(2)));
  };

  const handleStakeVault = (
    vaultId: string,
    amount: number
  ): { ok: boolean; message: string } => {
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter a valid stake amount.' };
    }
    if (amount > availableBalance) {
      return { ok: false, message: 'Insufficient available USDC balance.' };
    }
    const target = vaults.find((v) => v.id === vaultId);
    if (!target) return { ok: false, message: 'Vault not found.' };

    setAvailableBalance((prev) => Number((prev - amount).toFixed(2)));
    setVaults((prev) =>
      prev.map((v) =>
        v.id === vaultId
          ? {
              ...v,
              userStakedUsd: Number((v.userStakedUsd + amount).toFixed(2)),
              tvlUsd: v.tvlUsd + amount,
            }
          : v
      )
    );
    return {
      ok: true,
      message: `Staked $${amount.toLocaleString()} into ${target.pairLabel}.`,
    };
  };

  const handleUnstakeVault = (
    vaultId: string,
    amount: number
  ): { ok: boolean; message: string } => {
    const target = vaults.find((v) => v.id === vaultId);
    if (!target) return { ok: false, message: 'Vault not found.' };
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, message: 'Enter a valid unstake amount.' };
    }
    if (amount > target.userStakedUsd) {
      return { ok: false, message: 'Amount exceeds your staked principal in this vault.' };
    }

    setAvailableBalance((prev) => Number((prev + amount).toFixed(2)));
    setVaults((prev) =>
      prev.map((v) =>
        v.id === vaultId
          ? {
              ...v,
              userStakedUsd: Number((v.userStakedUsd - amount).toFixed(2)),
              tvlUsd: Math.max(0, v.tvlUsd - amount),
            }
          : v
      )
    );
    return {
      ok: true,
      message: `Unstaked $${amount.toLocaleString()} from ${target.pairLabel}.`,
    };
  };

  const handleClaimYield = (vaultId: string) => {
    const target = vaults.find((v) => v.id === vaultId);
    if (!target || target.claimableYieldUsd <= 0) return;
    const reward = target.claimableYieldUsd;
    setAvailableBalance((prev) => Number((prev + reward).toFixed(2)));
    setVaults((prev) =>
      prev.map((v) =>
        v.id === vaultId ? { ...v, claimableYieldUsd: 0 } : v
      )
    );
    setTradeHistory((prev) => [
      {
        id: `trd-${Date.now()}`,
        timestamp: formatNowTimestamp(),
        ticker: target.pairLabel,
        side: 'long',
        action: 'Stake Claim',
        price: 1.0,
        sizeUsd: reward,
        feeUsd: 0,
        realizedPnl: reward,
        txHash: makeTxHash(),
      },
      ...prev,
    ]);
  };

  const handleSelectMarketForTrade = (marketId: string) => {
    setSelectedMarketId(marketId);
    setActiveScreen('terminal');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#dfe2eb]">
      <TopBar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onOpenDeposit={() => setIsDepositOpen(true)}
      />

      <main className="flex-1">
        {activeScreen === 'terminal' && (
          <TerminalScreen
            markets={markets}
            selectedMarketId={selectedMarketId}
            onSelectMarket={setSelectedMarketId}
            starredIds={starredIds}
            onToggleStar={handleToggleStar}
            availableBalance={availableBalance}
            positions={positions}
            openOrders={openOrders}
            tradeHistory={tradeHistory}
            liveFeed={liveFeed}
            onToggleLiveFeed={() => setLiveFeed((prev) => !prev)}
            tickCounter={tickCounter}
            onExecuteOrder={handleExecuteOrder}
            onClosePosition={handleClosePosition}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {activeScreen === 'markets' && (
          <MarketsScreen
            markets={markets}
            starredIds={starredIds}
            onToggleStar={handleToggleStar}
            onTradeMarket={handleSelectMarketForTrade}
          />
        )}

        {activeScreen === 'vaults' && (
          <VaultsScreen
            vaults={vaults}
            availableBalance={availableBalance}
            onStakeVault={handleStakeVault}
            onUnstakeVault={handleUnstakeVault}
            onClaimYield={handleClaimYield}
          />
        )}

        {activeScreen === 'portfolio' && (
          <PortfolioScreen
            markets={markets}
            availableBalance={availableBalance}
            positions={positions}
            openOrders={openOrders}
            vaults={vaults}
            tradeHistory={tradeHistory}
            onClosePosition={handleClosePosition}
            onCancelOrder={handleCancelOrder}
            onSelectMarketForTrade={handleSelectMarketForTrade}
          />
        )}
      </main>

      <footer className="border-t border-[#21262d] bg-[#0d1117] px-4 lg:px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-[#6e7681]">
          <span>Dev Terminal Market — Open-Source Synthetic Index &amp; Staking Workspace</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveScreen('terminal')}
              className="hover:text-[#dfe2eb] transition-colors cursor-pointer"
            >
              Terminal
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('markets')}
              className="hover:text-[#dfe2eb] transition-colors cursor-pointer"
            >
              Markets
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('vaults')}
              className="hover:text-[#dfe2eb] transition-colors cursor-pointer"
            >
              Vaults
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('portfolio')}
              className="hover:text-[#dfe2eb] transition-colors cursor-pointer"
            >
              Portfolio
            </button>
          </div>
        </div>
      </footer>

      <DepositModal
        isOpen={isDepositOpen}
        availableBalance={availableBalance}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={(amt) =>
          setAvailableBalance((prev) => Number((prev + amt).toFixed(2)))
        }
        onWithdraw={(amt) =>
          setAvailableBalance((prev) => Math.max(0, Number((prev - amt).toFixed(2))))
        }
      />
    </div>
  );
}
