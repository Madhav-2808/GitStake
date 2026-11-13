import React, { useMemo, useState } from 'react';
import { GitCommit, Search, Star } from 'lucide-react';
import {
  generateCandles,
  generateOrderBook,
  generateTapeTrades,
} from '../data/marketsData';
import {
  EcosystemCategory,
  OpenOrder,
  Position,
  RepoMarket,
  Timeframe,
  TradeRecord,
} from '../types/market';
import {
  formatCompactUsd,
  formatSignedPct,
  formatSignedUsd,
  formatStars,
  formatUsd,
} from '../utils/format';
import { MarketChart } from './MarketChart';
import { Sparkline } from './Sparkline';

interface TerminalScreenProps {
  markets: RepoMarket[];
  selectedMarketId: string;
  onSelectMarket: (id: string) => void;
  starredIds: string[];
  onToggleStar: (id: string) => void;
  availableBalance: number;
  positions: Position[];
  openOrders: OpenOrder[];
  tradeHistory: TradeRecord[];
  liveFeed: boolean;
  onToggleLiveFeed: () => void;
  tickCounter: number;
  onExecuteOrder: (params: {
    market: RepoMarket;
    side: 'long' | 'short';
    orderType: 'market' | 'limit' | 'stake';
    collateralUsd: number;
    leverage: number;
    limitPrice?: number;
  }) => { ok: boolean; message: string };
  onClosePosition: (positionId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

type IndexFilter = 'All' | 'Starred' | EcosystemCategory;
type BottomTab = 'positions' | 'orders' | 'catalysts' | 'history';

export const TerminalScreen: React.FC<TerminalScreenProps> = ({
  markets,
  selectedMarketId,
  onSelectMarket,
  starredIds,
  onToggleStar,
  availableBalance,
  positions,
  openOrders,
  tradeHistory,
  liveFeed,
  onToggleLiveFeed,
  tickCounter,
  onExecuteOrder,
  onClosePosition,
  onCancelOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [indexFilter, setIndexFilter] = useState<IndexFilter>('All');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [bottomTab, setBottomTab] = useState<BottomTab>('positions');
  const [bookView, setBookView] = useState<'book' | 'tape'>('book');

  // Position Entry Form State
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stake'>('market');
  const [collateralInput, setCollateralInput] = useState('1000');
  const [limitPriceInput, setLimitPriceInput] = useState('');
  const [leverage, setLeverage] = useState(5);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const selectedMarket = useMemo(
    () => markets.find((m) => m.id === selectedMarketId) ?? markets[0],
    [markets, selectedMarketId]
  );

  const filteredMarkets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return markets.filter((m) => {
      if (indexFilter === 'Starred' && !starredIds.includes(m.id)) return false;
      if (
        indexFilter !== 'All' &&
        indexFilter !== 'Starred' &&
        m.category !== indexFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        m.ticker.toLowerCase().includes(q) ||
        m.repoSlug.toLowerCase().includes(q) ||
        m.symbol.toLowerCase().includes(q)
      );
    });
  }, [markets, searchQuery, indexFilter, starredIds]);

  const candles = useMemo(
    () => generateCandles(selectedMarket, timeframe),
    [selectedMarket, timeframe]
  );

  const orderBook = useMemo(
    () => generateOrderBook(selectedMarket.price, tickCounter),
    [selectedMarket.price, tickCounter]
  );

  const tapeTrades = useMemo(
    () => generateTapeTrades(selectedMarket.price, tickCounter),
    [selectedMarket.price, tickCounter]
  );

  const marketPrices = useMemo(() => {
    const map: Record<string, number> = {};
    markets.forEach((m) => {
      map[m.id] = m.price;
    });
    return map;
  }, [markets]);

  const collateralNum = Number(collateralInput) || 0;
  const effectiveLeverage = orderType === 'stake' ? 1 : leverage;
  const effectivePrice =
    orderType === 'limit' && Number(limitPriceInput) > 0
      ? Number(limitPriceInput)
      : selectedMarket.price;
  const estSizeUsd = collateralNum * effectiveLeverage;
  const estFeeUsd = estSizeUsd * 0.0005;
  const estLiqPrice =
    effectiveLeverage <= 1
      ? 0
      : side === 'long'
        ? effectivePrice * (1 - 0.9 / effectiveLeverage)
        : effectivePrice * (1 + 0.9 / effectiveLeverage);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onExecuteOrder({
      market: selectedMarket,
      side,
      orderType,
      collateralUsd: collateralNum,
      leverage: effectiveLeverage,
      limitPrice: orderType === 'limit' ? effectivePrice : undefined,
    });
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleBookPriceClick = (price: number) => {
    setOrderType('limit');
    setLimitPriceInput(price.toFixed(2));
  };

  const isStarred = starredIds.includes(selectedMarket.id);
  const isMarketBull = selectedMarket.change24h >= 0;

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT PANE: Repository Index */}
        <aside className="xl:col-span-3 bg-[#161b22] border border-[#30363d] rounded flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#30363d] space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#dfe2eb]">
                Repository Index
              </h2>
              <span className="text-[11px] font-mono tabular-nums text-[#8b949e]">
                {filteredMarkets.length} pairs
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter repo or ticker..."
                aria-label="Filter repositories"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded pl-8 pr-3 py-1.5 text-xs font-mono text-[#dfe2eb] placeholder-[#6e7681] outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {(['All', 'Starred', 'Runtime', 'Frontend', 'Tooling', 'Data'] as IndexFilter[]).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setIndexFilter(tab)}
                    className={`px-2 py-1 text-[11px] font-mono rounded whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      indexFilter === tab
                        ? 'bg-[#21262d] text-[#58a6ff] border border-[#58a6ff]/40'
                        : 'text-[#8b949e] hover:text-[#dfe2eb] border border-transparent'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="divide-y divide-[#21262d] max-h-[340px] xl:max-h-[680px] overflow-y-auto">
            {filteredMarkets.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-[#8b949e]">No repository pairs match filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIndexFilter('All');
                  }}
                  className="px-3 py-1 text-xs font-mono text-[#58a6ff] bg-[#21262d] border border-[#30363d] rounded hover:bg-[#30363d] cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredMarkets.map((m) => {
                const active = m.id === selectedMarket.id;
                const bull = m.change24h >= 0;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelectMarket(m.id);
                      setLimitPriceInput('');
                      setFeedback(null);
                    }}
                    className={`w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#1f242c]'
                        : 'hover:bg-[#1f242c]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-mono font-semibold ${
                            active ? 'text-[#58a6ff]' : 'text-[#dfe2eb]'
                          }`}
                        >
                          {m.ticker}
                        </span>
                        {starredIds.includes(m.id) && (
                          <Star className="w-3 h-3 text-[#d29922] fill-[#d29922] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#8b949e] truncate">
                        {m.repoSlug}
                      </p>
                    </div>

                    <div className="hidden sm:block shrink-0">
                      <Sparkline
                        data={m.sparkline}
                        positive={bull}
                        width={54}
                        height={18}
                      />
                    </div>

                    <div className="text-right shrink-0 font-mono tabular-nums">
                      <div className="text-xs font-medium text-[#dfe2eb]">
                        {formatUsd(m.price)}
                      </div>
                      <div
                        className={`text-[11px] ${
                          bull ? 'text-[#3fb950]' : 'text-[#f85149]'
                        }`}
                      >
                        {bull ? '▲' : '▼'} {formatSignedPct(m.change24h)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* CENTER PANE: Market Header + Chart + Positions/Catalysts */}
        <section className="xl:col-span-6 space-y-4 min-w-0">
          {/* Active Repo Ticker Header */}
          <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#21262d]">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-base font-bold font-mono text-[#dfe2eb]">
                    {selectedMarket.ticker}
                  </h1>
                  <span className="text-xs font-mono text-[#58a6ff]">
                    {selectedMarket.repoSlug}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleStar(selectedMarket.id)}
                    aria-label={isStarred ? 'Remove from starred' : 'Star repository market'}
                    className="p-1 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-[#d29922] transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isStarred ? 'text-[#d29922] fill-[#d29922]' : ''
                      }`}
                    />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#8b949e] font-mono">
                  <span>{selectedMarket.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedMarket.license}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{formatStars(selectedMarket.stars)} stars</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{selectedMarket.commitsPerWeek} commits/wk</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedMarket.contractId}</span>
                </div>
              </div>

              <div className="text-right font-mono tabular-nums">
                <div className="text-xl font-semibold text-[#dfe2eb]">
                  {formatUsd(selectedMarket.price)}
                </div>
                <div
                  className={`text-xs font-medium ${
                    isMarketBull ? 'text-[#3fb950]' : 'text-[#f85149]'
                  }`}
                >
                  {isMarketBull ? '▲' : '▼'} {formatSignedPct(selectedMarket.change24h)} (24h)
                </div>
              </div>
            </div>

            {/* Key Market Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs font-mono tabular-nums">
              <div>
                <div className="text-[11px] text-[#8b949e]">24h Range</div>
                <div className="text-[#dfe2eb] mt-0.5">
                  {selectedMarket.low24h.toFixed(2)} – {selectedMarket.high24h.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b949e]">24h Volume</div>
                <div className="text-[#dfe2eb] mt-0.5">
                  {formatCompactUsd(selectedMarket.volume24h)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b949e]">Open Interest</div>
                <div className="text-[#dfe2eb] mt-0.5">
                  {formatCompactUsd(selectedMarket.openInterest)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#8b949e]">8h Funding / Yield</div>
                <div
                  className={`mt-0.5 ${
                    selectedMarket.fundingRate >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'
                  }`}
                >
                  {selectedMarket.fundingRate >= 0 ? '+' : ''}
                  {selectedMarket.fundingRate.toFixed(4)}%
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Candlestick / Commit Chart */}
          <MarketChart
            market={selectedMarket}
            candles={candles}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            liveFeed={liveFeed}
            onToggleLiveFeed={onToggleLiveFeed}
          />

          {/* Bottom Tabbed Panel: Positions, Open Orders, Commit Catalysts, History */}
          <div className="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-3 border-b border-[#30363d] overflow-x-auto">
              <div className="flex items-center gap-4">
                {(
                  [
                    { id: 'positions', label: `Positions (${positions.length})` },
                    { id: 'orders', label: `Open Orders (${openOrders.length})` },
                    {
                      id: 'catalysts',
                      label: `Commit Catalysts (${selectedMarket.catalysts.length})`,
                    },
                    { id: 'history', label: `Trade History (${tradeHistory.length})` },
                  ] as { id: BottomTab; label: string }[]
                ).map((t) => {
                  const active = bottomTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBottomTab(t.id)}
                      className={`relative py-2.5 text-xs font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        active
                          ? 'text-[#dfe2eb] font-semibold'
                          : 'text-[#8b949e] hover:text-[#dfe2eb]'
                      }`}
                    >
                      {t.label}
                      {active && (
                        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#58a6ff]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Contents */}
            <div className="overflow-x-auto">
              {bottomTab === 'positions' && (
                <table className="w-full text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-[#21262d] text-[#8b949e] text-[11px]">
                      <th className="py-2 px-3 text-left font-medium">Market</th>
                      <th className="py-2 px-3 text-left font-medium">Side</th>
                      <th className="py-2 px-3 text-right font-medium">Size</th>
                      <th className="py-2 px-3 text-right font-medium">Entry</th>
                      <th className="py-2 px-3 text-right font-medium">Mark</th>
                      <th className="py-2 px-3 text-right font-medium">Liq.</th>
                      <th className="py-2 px-3 text-right font-medium">Unrealized PnL</th>
                      <th className="py-2 px-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {positions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-[#8b949e]">
                          No open positions. Enter a Long or Short order on the right panel.
                        </td>
                      </tr>
                    ) : (
                      positions.map((pos) => {
                        const mark = marketPrices[pos.marketId] ?? pos.entryPrice;
                        const pctDelta =
                          pos.side === 'long'
                            ? (mark - pos.entryPrice) / pos.entryPrice
                            : (pos.entryPrice - mark) / pos.entryPrice;
                        const pnl = pos.sizeUsd * pctDelta;
                        const roe = (pnl / pos.collateralUsd) * 100;
                        const pnlPos = pnl >= 0;

                        return (
                          <tr
                            key={pos.id}
                            className="hover:bg-[#1f242c] transition-colors"
                          >
                            <td className="py-2.5 px-3 text-left">
                              <button
                                type="button"
                                onClick={() => onSelectMarket(pos.marketId)}
                                className="text-[#dfe2eb] hover:text-[#58a6ff] font-semibold cursor-pointer"
                              >
                                {pos.ticker}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 text-left">
                              <span
                                className={`inline-flex items-center h-5 px-1.5 text-[11px] rounded-[2px] border ${
                                  pos.side === 'long'
                                    ? 'bg-[#3fb950]/12 border-[#3fb950]/40 text-[#3fb950]'
                                    : 'bg-[#f85149]/12 border-[#f85149]/40 text-[#f85149]'
                                }`}
                              >
                                {pos.side === 'long' ? 'LONG' : 'SHORT'} {pos.leverage}x
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#dfe2eb]">
                              {formatUsd(pos.sizeUsd, 0)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#8b949e]">
                              {pos.entryPrice.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#dfe2eb]">
                              {mark.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#d29922]">
                              {pos.liqPrice > 0 ? pos.liqPrice.toFixed(2) : '—'}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-medium ${
                                pnlPos ? 'text-[#3fb950]' : 'text-[#f85149]'
                              }`}
                            >
                              {formatSignedUsd(pnl)} ({formatSignedPct(roe)})
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => onClosePosition(pos.id)}
                                className="px-2.5 py-1 text-[11px] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#dfe2eb] rounded transition-colors cursor-pointer"
                              >
                                Close
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {bottomTab === 'orders' && (
                <table className="w-full text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-[#21262d] text-[#8b949e] text-[11px]">
                      <th className="py-2 px-3 text-left font-medium">Time</th>
                      <th className="py-2 px-3 text-left font-medium">Market</th>
                      <th className="py-2 px-3 text-left font-medium">Side</th>
                      <th className="py-2 px-3 text-right font-medium">Limit Price</th>
                      <th className="py-2 px-3 text-right font-medium">Collateral</th>
                      <th className="py-2 px-3 text-right font-medium">Notional</th>
                      <th className="py-2 px-3 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {openOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-[#8b949e]">
                          No pending limit orders.
                        </td>
                      </tr>
                    ) : (
                      openOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#1f242c]">
                          <td className="py-2.5 px-3 text-[#8b949e]">{ord.createdAt}</td>
                          <td className="py-2.5 px-3 text-[#dfe2eb] font-semibold">
                            {ord.ticker}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center h-5 px-1.5 text-[11px] rounded-[2px] border ${
                                ord.side === 'long'
                                  ? 'bg-[#3fb950]/12 border-[#3fb950]/40 text-[#3fb950]'
                                  : 'bg-[#f85149]/12 border-[#f85149]/40 text-[#f85149]'
                              }`}
                            >
                              {ord.side.toUpperCase()} {ord.leverage}x
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#dfe2eb]">
                            {ord.limitPrice.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#8b949e]">
                            {formatUsd(ord.collateralUsd)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-[#dfe2eb]">
                            {formatUsd(ord.collateralUsd * ord.leverage)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => onCancelOrder(ord.id)}
                              className="px-2.5 py-1 text-[11px] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#f85149] rounded transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {bottomTab === 'catalysts' && (
                <div className="divide-y divide-[#21262d]">
                  <div className="px-3 py-2.5 bg-[#0d1117]/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[#8b949e]">Active Prediction Milestone: </span>
                      <span className="text-[#dfe2eb] font-medium">
                        {selectedMarket.milestoneTitle}
                      </span>
                    </div>
                    <div className="tabular-nums text-[#d29922]">
                      Target {selectedMarket.milestoneTargetDate} · Implied Odds{' '}
                      {selectedMarket.milestoneProbability}%
                    </div>
                  </div>
                  {selectedMarket.catalysts.map((cat) => {
                    const posImpact = cat.impactBps >= 0;
                    return (
                      <div
                        key={cat.hash}
                        className="px-3 py-2.5 hover:bg-[#1f242c] flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <GitCommit className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
                            <span className="text-[#58a6ff]">{cat.hash}</span>
                            <span className="text-[#8b949e]">{cat.branch}</span>
                            <span aria-hidden="true" className="text-[#6e7681]">·</span>
                            <span className="text-[#8b949e]">{cat.author}</span>
                            <span aria-hidden="true" className="text-[#6e7681]">·</span>
                            <span className="text-[#6e7681]">{cat.timestamp}</span>
                          </div>
                          <p className="text-xs text-[#dfe2eb] truncate">
                            {cat.message}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 font-mono tabular-nums text-xs ${
                            posImpact ? 'text-[#3fb950]' : 'text-[#f85149]'
                          }`}
                        >
                          {posImpact ? '▲ +' : '▼ '}
                          {cat.impactBps} bps
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {bottomTab === 'history' && (
                <table className="w-full text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="border-b border-[#21262d] text-[#8b949e] text-[11px]">
                      <th className="py-2 px-3 text-left font-medium">Timestamp</th>
                      <th className="py-2 px-3 text-left font-medium">Market</th>
                      <th className="py-2 px-3 text-left font-medium">Action</th>
                      <th className="py-2 px-3 text-right font-medium">Price</th>
                      <th className="py-2 px-3 text-right font-medium">Size</th>
                      <th className="py-2 px-3 text-right font-medium">Realized PnL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {tradeHistory.slice(0, 8).map((trd) => (
                      <tr key={trd.id} className="hover:bg-[#1f242c]">
                        <td className="py-2 px-3 text-[#8b949e]">{trd.timestamp}</td>
                        <td className="py-2 px-3 text-[#dfe2eb] font-semibold">
                          {trd.ticker}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={
                              trd.side === 'long' ? 'text-[#3fb950]' : 'text-[#f85149]'
                            }
                          >
                            {trd.action} ({trd.side.toUpperCase()})
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-[#dfe2eb]">
                          {trd.price.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-[#dfe2eb]">
                          {formatUsd(trd.sizeUsd)}
                        </td>
                        <td
                          className={`py-2 px-3 text-right ${
                            trd.realizedPnl === undefined
                              ? 'text-[#8b949e]'
                              : trd.realizedPnl >= 0
                                ? 'text-[#3fb950]'
                                : 'text-[#f85149]'
                          }`}
                        >
                          {trd.realizedPnl === undefined
                            ? '—'
                            : formatSignedUsd(trd.realizedPnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT PANE: Order Book + Position Entry Ticket */}
        <aside className="xl:col-span-3 space-y-4">
          {/* Order Book / Recent Tape */}
          <div className="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBookView('book')}
                  className={`text-xs font-mono font-semibold cursor-pointer ${
                    bookView === 'book' ? 'text-[#dfe2eb]' : 'text-[#8b949e] hover:text-[#dfe2eb]'
                  }`}
                >
                  Order Book
                </button>
                <span className="text-[#30363d]">/</span>
                <button
                  type="button"
                  onClick={() => setBookView('tape')}
                  className={`text-xs font-mono font-semibold cursor-pointer ${
                    bookView === 'tape' ? 'text-[#dfe2eb]' : 'text-[#8b949e] hover:text-[#dfe2eb]'
                  }`}
                >
                  Market Tape
                </button>
              </div>
              <span className="text-[11px] font-mono text-[#8b949e]">
                {selectedMarket.symbol}
              </span>
            </div>

            {bookView === 'book' ? (
              <div className="text-[11px] font-mono tabular-nums">
                <div className="grid grid-cols-3 px-3 py-1.5 text-[#8b949e] border-b border-[#21262d]">
                  <span>Price (USD)</span>
                  <span className="text-right">Size</span>
                  <span className="text-right">Total</span>
                </div>

                {/* Asks */}
                <div className="divide-y divide-[#21262d]/40">
                  {orderBook.asks.map((lvl, idx) => {
                    const maxAskTotal = orderBook.asks[0]?.total || 1;
                    const depthPct = Math.min(100, (lvl.total / maxAskTotal) * 100);
                    return (
                      <button
                        key={`ask-${idx}`}
                        type="button"
                        onClick={() => handleBookPriceClick(lvl.price)}
                        className="relative w-full grid grid-cols-3 px-3 py-1 hover:bg-[#1f242c] text-left cursor-pointer"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 right-0 bg-[#f85149]/10 pointer-events-none"
                          style={{ width: `${depthPct}%` }}
                        />
                        <span className="relative text-[#f85149]">
                          {lvl.price.toFixed(2)}
                        </span>
                        <span className="relative text-right text-[#dfe2eb]">
                          {lvl.size.toFixed(2)}
                        </span>
                        <span className="relative text-right text-[#8b949e]">
                          {lvl.total.toFixed(1)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Spread Row */}
                <div className="px-3 py-1.5 bg-[#0d1117] border-y border-[#30363d] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#dfe2eb]">
                    {selectedMarket.price.toFixed(2)}
                  </span>
                  <span className="text-[#8b949e]">
                    Spread {orderBook.spread.toFixed(2)} ({orderBook.spreadPct}%)
                  </span>
                </div>

                {/* Bids */}
                <div className="divide-y divide-[#21262d]/40">
                  {orderBook.bids.map((lvl, idx) => {
                    const maxBidTotal =
                      orderBook.bids[orderBook.bids.length - 1]?.total || 1;
                    const depthPct = Math.min(100, (lvl.total / maxBidTotal) * 100);
                    return (
                      <button
                        key={`bid-${idx}`}
                        type="button"
                        onClick={() => handleBookPriceClick(lvl.price)}
                        className="relative w-full grid grid-cols-3 px-3 py-1 hover:bg-[#1f242c] text-left cursor-pointer"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 right-0 bg-[#3fb950]/10 pointer-events-none"
                          style={{ width: `${depthPct}%` }}
                        />
                        <span className="relative text-[#3fb950]">
                          {lvl.price.toFixed(2)}
                        </span>
                        <span className="relative text-right text-[#dfe2eb]">
                          {lvl.size.toFixed(2)}
                        </span>
                        <span className="relative text-right text-[#8b949e]">
                          {lvl.total.toFixed(1)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-[11px] font-mono tabular-nums max-h-[346px] overflow-y-auto">
                <div className="grid grid-cols-3 px-3 py-1.5 text-[#8b949e] border-b border-[#21262d]">
                  <span>Price</span>
                  <span className="text-right">Size</span>
                  <span className="text-right">Time</span>
                </div>
                <div className="divide-y divide-[#21262d]">
                  {tapeTrades.map((t) => (
                    <div
                      key={t.id}
                      className="grid grid-cols-3 px-3 py-1 hover:bg-[#1f242c]"
                    >
                      <span
                        className={
                          t.side === 'long' ? 'text-[#3fb950]' : 'text-[#f85149]'
                        }
                      >
                        {t.price.toFixed(2)}
                      </span>
                      <span className="text-right text-[#dfe2eb]">
                        {t.size.toFixed(2)}
                      </span>
                      <span className="text-right text-[#8b949e]">{t.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Position Entry Ticket */}
          <form
            onSubmit={handlePlaceOrder}
            className="bg-[#161b22] border border-[#30363d] rounded p-3 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#dfe2eb]">
                Position Entry
              </h2>
              <span className="text-[11px] font-mono text-[#8b949e]">
                {selectedMarket.ticker}
              </span>
            </div>

            {/* Long / Short Selector */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setSide('long')}
                className={`py-2 text-xs font-mono font-semibold rounded transition-all cursor-pointer ${
                  side === 'long'
                    ? 'bg-[#3fb950] text-[#0d1117] shadow-[0_0_12px_rgba(63,185,80,0.2)]'
                    : 'bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:text-[#dfe2eb]'
                }`}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setSide('short')}
                className={`py-2 text-xs font-mono font-semibold rounded transition-all cursor-pointer ${
                  side === 'short'
                    ? 'bg-[#f85149] text-white shadow-[0_0_12px_rgba(248,81,73,0.2)]'
                    : 'bg-[#21262d] text-[#8b949e] border border-[#30363d] hover:text-[#dfe2eb]'
                }`}
              >
                Short
              </button>
            </div>

            {/* Order Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#0d1117] border border-[#30363d] rounded">
              {(
                [
                  { id: 'market', label: 'Market' },
                  { id: 'limit', label: 'Limit' },
                  { id: 'stake', label: 'Stake 1x' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setOrderType(mode.id);
                    if (mode.id === 'limit' && !limitPriceInput) {
                      setLimitPriceInput(selectedMarket.price.toFixed(2));
                    }
                  }}
                  className={`py-1 text-[11px] font-mono rounded-sm transition-colors cursor-pointer ${
                    orderType === mode.id
                      ? 'bg-[#21262d] text-[#58a6ff]'
                      : 'text-[#8b949e] hover:text-[#dfe2eb]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Limit Price Input */}
            {orderType === 'limit' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <label htmlFor="limit-price" className="text-[#8b949e]">
                    Limit Price (USD)
                  </label>
                  <button
                    type="button"
                    onClick={() => setLimitPriceInput(selectedMarket.price.toFixed(2))}
                    className="text-[#58a6ff] hover:underline cursor-pointer"
                  >
                    Mid {selectedMarket.price.toFixed(2)}
                  </button>
                </div>
                <input
                  id="limit-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={limitPriceInput}
                  onChange={(e) => setLimitPriceInput(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded px-3 py-2 font-mono tabular-nums text-xs text-[#dfe2eb] outline-none"
                />
              </div>
            )}

            {/* Collateral Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <label htmlFor="collateral-usd" className="text-[#8b949e]">
                  Collateral (USDC)
                </label>
                <span className="tabular-nums text-[#8b949e]">
                  Avail{' '}
                  <span className="text-[#dfe2eb]">
                    {formatUsd(availableBalance)}
                  </span>
                </span>
              </div>
              <div className="relative">
                <input
                  id="collateral-usd"
                  type="number"
                  min="10"
                  step="any"
                  value={collateralInput}
                  onChange={(e) => setCollateralInput(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded px-3 py-2 pr-14 font-mono tabular-nums text-xs text-[#dfe2eb] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCollateralInput(availableBalance.toFixed(2))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[#58a6ff] hover:bg-[#21262d] rounded cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Precision Leverage Slider */}
            {orderType !== 'stake' && (
              <div className="space-y-2 pt-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#8b949e]">Leverage</span>
                  <span className="text-[#58a6ff] font-semibold tabular-nums">
                    {leverage}x
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  aria-label="Position leverage"
                  className="w-full terminal-slider"
                  style={{
                    background: `linear-gradient(to right, #58a6ff ${((leverage - 1) / 19) * 100}%, #30363d ${((leverage - 1) / 19) * 100}%)`,
                  }}
                />
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 5, 10, 20].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLeverage(lvl)}
                      className={`py-1 text-[10px] font-mono tabular-nums rounded border transition-colors cursor-pointer ${
                        leverage === lvl
                          ? 'bg-[#21262d] border-[#58a6ff] text-[#58a6ff]'
                          : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-[#dfe2eb]'
                      }`}
                    >
                      {lvl}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Execution Summary */}
            <div className="pt-2 border-t border-[#21262d] space-y-1.5 text-[11px] font-mono tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Est. Notional Size</span>
                <span className="text-[#dfe2eb]">{formatUsd(estSizeUsd)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Est. Liq. Price</span>
                <span className="text-[#d29922]">
                  {estLiqPrice > 0 ? formatUsd(estLiqPrice) : 'No Liquidation (1x)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Execution Fee (0.05%)</span>
                <span className="text-[#8b949e]">{formatUsd(estFeeUsd)}</span>
              </div>
            </div>

            {feedback && (
              <div
                className={`px-2.5 py-2 text-[11px] font-mono rounded border ${
                  feedback.ok
                    ? 'bg-[#3fb950]/12 border-[#3fb950]/40 text-[#3fb950]'
                    : 'bg-[#f85149]/12 border-[#f85149]/40 text-[#f85149]'
                }`}
              >
                {feedback.text}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 text-xs font-mono font-semibold rounded transition-all cursor-pointer ${
                side === 'long'
                  ? 'bg-[#2ea043] hover:bg-[#3fb950] text-[#0d1117] shadow-[0_0_12px_rgba(63,185,80,0.2)]'
                  : 'bg-[#da3633] hover:bg-[#f85149] text-white shadow-[0_0_12px_rgba(248,81,73,0.2)]'
              }`}
            >
              {orderType === 'stake'
                ? `Stake ${selectedMarket.symbol}`
                : orderType === 'limit'
                  ? `Place ${side === 'long' ? 'Long' : 'Short'} Limit`
                  : `Open ${side === 'long' ? 'Long' : 'Short'} ${selectedMarket.symbol}`}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};
