import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import {
  OpenOrder,
  Position,
  RepoMarket,
  StakingVault,
  TradeRecord,
} from '../types/market';
import { formatSignedPct, formatSignedUsd, formatUsd } from '../utils/format';

interface PortfolioScreenProps {
  markets: RepoMarket[];
  availableBalance: number;
  positions: Position[];
  openOrders: OpenOrder[];
  vaults: StakingVault[];
  tradeHistory: TradeRecord[];
  onClosePosition: (positionId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onSelectMarketForTrade: (marketId: string) => void;
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({
  markets,
  availableBalance,
  positions,
  openOrders,
  vaults,
  tradeHistory,
  onClosePosition,
  onCancelOrder,
  onSelectMarketForTrade,
}) => {
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'long' | 'short'>('all');

  const marketPrices = useMemo(() => {
    const map: Record<string, number> = {};
    markets.forEach((m) => {
      map[m.id] = m.price;
    });
    return map;
  }, [markets]);

  const metrics = useMemo(() => {
    let marginUsed = 0;
    let unrealizedPnl = 0;

    positions.forEach((p) => {
      marginUsed += p.collateralUsd;
      const mark = marketPrices[p.marketId] ?? p.entryPrice;
      const delta =
        p.side === 'long'
          ? (mark - p.entryPrice) / p.entryPrice
          : (p.entryPrice - mark) / p.entryPrice;
      unrealizedPnl += p.sizeUsd * delta;
    });

    const stakedPrincipal = vaults.reduce((acc, v) => acc + v.userStakedUsd, 0);
    const claimableYield = vaults.reduce((acc, v) => acc + v.claimableYieldUsd, 0);
    const totalEquity =
      availableBalance + marginUsed + unrealizedPnl + stakedPrincipal + claimableYield;

    return {
      totalEquity,
      availableBalance,
      marginUsed,
      unrealizedPnl,
      stakedPrincipal,
      claimableYield,
    };
  }, [availableBalance, positions, marketPrices, vaults]);

  // Simple 14-point portfolio equity trajectory anchored to current totalEquity
  const equitySeries = useMemo(() => {
    const base = metrics.totalEquity;
    const multipliers = [
      0.88, 0.895, 0.89, 0.91, 0.925, 0.918, 0.94, 0.952, 0.948, 0.965, 0.978,
      0.985, 0.992, 1.0,
    ];
    return multipliers.map((m, i) => ({
      label: i === 13 ? 'Now' : `D-${13 - i}`,
      value: Number((base * m).toFixed(2)),
    }));
  }, [metrics.totalEquity]);

  const filteredHistory = useMemo(() => {
    if (ledgerFilter === 'all') return tradeHistory;
    return tradeHistory.filter((t) => t.side === ledgerFilter);
  }, [tradeHistory, ledgerFilter]);

  const handleExportCsv = () => {
    const header = [
      'Timestamp',
      'Ticker',
      'Side',
      'Action',
      'Price',
      'SizeUSD',
      'FeeUSD',
      'RealizedPnL',
      'TxHash',
    ];
    const rows = filteredHistory.map((t) => [
      t.timestamp,
      t.ticker,
      t.side,
      t.action,
      t.price.toFixed(2),
      t.sizeUsd.toFixed(2),
      t.feeUsd.toFixed(2),
      t.realizedPnl !== undefined ? t.realizedPnl.toFixed(2) : '',
      t.txHash,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dev-terminal-market-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // SVG equity chart geometry
  const chartW = 720;
  const chartH = 150;
  const minEq = Math.min(...equitySeries.map((e) => e.value));
  const maxEq = Math.max(...equitySeries.map((e) => e.value));
  const eqRange = maxEq - minEq || 1;
  const eqPoints = equitySeries
    .map((pt, idx) => {
      const x = 16 + (idx / (equitySeries.length - 1)) * (chartW - 32);
      const y = chartH - 18 - ((pt.value - minEq) / eqRange) * (chartH - 36);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#dfe2eb]">
            Portfolio &amp; Margin Ledger
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Unified cross-margin collateral, active repository positions, and settlement history.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#dfe2eb] rounded transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Download CSV
        </button>
      </div>

      {/* 4-Column Portfolio KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Total Net Equity</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#dfe2eb] mt-1">
            {formatUsd(metrics.totalEquity)}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Available USDC</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#58a6ff] mt-1">
            {formatUsd(metrics.availableBalance)}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Unrealized PnL</div>
          <div
            className={`text-xl font-mono font-semibold tabular-nums mt-1 ${
              metrics.unrealizedPnl >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'
            }`}
          >
            {formatSignedUsd(metrics.unrealizedPnl)}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Staked in Vaults</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#fabc45] mt-1">
            {formatUsd(metrics.stakedPrincipal)}
          </div>
        </div>
      </div>

      {/* Equity Curve + Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#21262d]">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#dfe2eb]">
              14-Day Account Equity Curve
            </h2>
            <span className="text-xs font-mono tabular-nums text-[#3fb950]">
              +13.64% (14D)
            </span>
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-40 mt-2 block">
            <line x1={16} y1={18} x2={chartW - 16} y2={18} stroke="#21262d" strokeWidth={1} />
            <line
              x1={16}
              y1={chartH / 2}
              x2={chartW - 16}
              y2={chartH / 2}
              stroke="#21262d"
              strokeWidth={1}
            />
            <line
              x1={16}
              y1={chartH - 18}
              x2={chartW - 16}
              y2={chartH - 18}
              stroke="#21262d"
              strokeWidth={1}
            />
            <polyline
              fill="none"
              stroke="#3fb950"
              strokeWidth={1.75}
              strokeLinejoin="round"
              points={eqPoints}
            />
          </svg>
        </div>

        <div className="lg:col-span-4 bg-[#161b22] border border-[#30363d] rounded p-3 space-y-3">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#dfe2eb] pb-2 border-b border-[#21262d]">
            Collateral Breakdown
          </h2>
          <div className="space-y-2.5 text-xs font-mono tabular-nums">
            <div className="flex items-center justify-between">
              <span className="text-[#8b949e]">Free Margin (USDC)</span>
              <span className="text-[#dfe2eb]">{formatUsd(metrics.availableBalance)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8b949e]">Active Position Margin</span>
              <span className="text-[#dfe2eb]">{formatUsd(metrics.marginUsed)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8b949e]">Staked Vault Liquidity</span>
              <span className="text-[#fabc45]">{formatUsd(metrics.stakedPrincipal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8b949e]">Pending Sponsor Rewards</span>
              <span className="text-[#3fb950]">{formatUsd(metrics.claimableYield)}</span>
            </div>
            <div className="pt-2 border-t border-[#21262d] flex items-center justify-between">
              <span className="text-[#8b949e]">Pending Limit Orders</span>
              <span className="text-[#58a6ff]">{openOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
        <div className="px-3 py-2.5 border-b border-[#30363d] flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#dfe2eb]">
            Active Positions ({positions.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono tabular-nums">
            <thead>
              <tr className="border-b border-[#21262d] text-[#8b949e] text-[11px]">
                <th className="py-2 px-3 text-left font-medium">Market</th>
                <th className="py-2 px-3 text-left font-medium">Side</th>
                <th className="py-2 px-3 text-right font-medium">Collateral</th>
                <th className="py-2 px-3 text-right font-medium">Notional</th>
                <th className="py-2 px-3 text-right font-medium">Entry</th>
                <th className="py-2 px-3 text-right font-medium">Mark</th>
                <th className="py-2 px-3 text-right font-medium">Unrealized PnL</th>
                <th className="py-2 px-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-[#8b949e]">
                    No active positions.
                  </td>
                </tr>
              ) : (
                positions.map((pos) => {
                  const mark = marketPrices[pos.marketId] ?? pos.entryPrice;
                  const delta =
                    pos.side === 'long'
                      ? (mark - pos.entryPrice) / pos.entryPrice
                      : (pos.entryPrice - mark) / pos.entryPrice;
                  const pnl = pos.sizeUsd * delta;
                  const roe = (pnl / pos.collateralUsd) * 100;
                  return (
                    <tr key={pos.id} className="hover:bg-[#1f242c]">
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => onSelectMarketForTrade(pos.marketId)}
                          className="text-[#dfe2eb] hover:text-[#58a6ff] font-semibold cursor-pointer"
                        >
                          {pos.ticker}
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center h-5 px-1.5 text-[11px] rounded-[2px] border ${
                            pos.side === 'long'
                              ? 'bg-[#3fb950]/12 border-[#3fb950]/40 text-[#3fb950]'
                              : 'bg-[#f85149]/12 border-[#f85149]/40 text-[#f85149]'
                          }`}
                        >
                          {pos.side.toUpperCase()} {pos.leverage}x
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#8b949e]">
                        {formatUsd(pos.collateralUsd)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#dfe2eb]">
                        {formatUsd(pos.sizeUsd)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#8b949e]">
                        {pos.entryPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#dfe2eb]">
                        {mark.toFixed(2)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-medium ${
                          pnl >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'
                        }`}
                      >
                        {formatSignedUsd(pnl)} ({formatSignedPct(roe)})
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onClosePosition(pos.id)}
                          className="px-2.5 py-1 text-[11px] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#dfe2eb] rounded cursor-pointer"
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
        </div>
      </div>

      {/* Pending Orders (if any) */}
      {openOrders.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[#30363d]">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#dfe2eb]">
              Pending Limit Orders ({openOrders.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-[#21262d] text-[#8b949e] text-[11px]">
                  <th className="py-2 px-3 text-left font-medium">Created</th>
                  <th className="py-2 px-3 text-left font-medium">Market</th>
                  <th className="py-2 px-3 text-left font-medium">Side</th>
                  <th className="py-2 px-3 text-right font-medium">Trigger Price</th>
                  <th className="py-2 px-3 text-right font-medium">Collateral</th>
                  <th className="py-2 px-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]">
                {openOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#1f242c]">
                    <td className="py-2 px-3 text-[#8b949e]">{ord.createdAt}</td>
                    <td className="py-2 px-3 text-[#dfe2eb] font-semibold">{ord.ticker}</td>
                    <td className="py-2 px-3 text-[#58a6ff]">
                      {ord.side.toUpperCase()} {ord.leverage}x
                    </td>
                    <td className="py-2 px-3 text-right text-[#dfe2eb]">
                      {ord.limitPrice.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-[#dfe2eb]">
                      {formatUsd(ord.collateralUsd)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onCancelOrder(ord.id)}
                        className="px-2.5 py-1 text-[11px] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#f85149] rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settlement Ledger */}
      <div className="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
        <div className="px-3 py-2.5 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#dfe2eb]">
            Execution &amp; Settlement Ledger
          </h2>
          <div className="flex items-center gap-1">
            {(['all', 'long', 'short'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setLedgerFilter(f)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded capitalize cursor-pointer ${
                  ledgerFilter === f
                    ? 'bg-[#21262d] text-[#58a6ff] border border-[#58a6ff]/40'
                    : 'text-[#8b949e] hover:text-[#dfe2eb]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono tabular-nums">
            <thead>
              <tr className="border-b border-[#21262d] text-[#8b949e] text-[11px]">
                <th className="py-2 px-3 text-left font-medium">Timestamp</th>
                <th className="py-2 px-3 text-left font-medium">Market</th>
                <th className="py-2 px-3 text-left font-medium">Action</th>
                <th className="py-2 px-3 text-right font-medium">Price</th>
                <th className="py-2 px-3 text-right font-medium">Size</th>
                <th className="py-2 px-3 text-right font-medium">Fee</th>
                <th className="py-2 px-3 text-right font-medium">Realized PnL</th>
                <th className="py-2 px-3 text-right font-medium">Tx Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {filteredHistory.map((trd) => (
                <tr key={trd.id} className="hover:bg-[#1f242c]">
                  <td className="py-2.5 px-3 text-[#8b949e]">{trd.timestamp}</td>
                  <td className="py-2.5 px-3 text-[#dfe2eb] font-semibold">
                    {trd.ticker}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={
                        trd.side === 'long' ? 'text-[#3fb950]' : 'text-[#f85149]'
                      }
                    >
                      {trd.action} · {trd.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#dfe2eb]">
                    {trd.price.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#dfe2eb]">
                    {formatUsd(trd.sizeUsd)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[#8b949e]">
                    {formatUsd(trd.feeUsd)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right ${
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
                  <td className="py-2.5 px-3 text-right text-[#58a6ff]">
                    {trd.txHash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
