import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Search, Star } from 'lucide-react';
import { EcosystemCategory, RepoMarket } from '../types/market';
import {
  formatCompactUsd,
  formatSignedPct,
  formatStars,
  formatUsd,
} from '../utils/format';
import { Sparkline } from './Sparkline';

interface MarketsScreenProps {
  markets: RepoMarket[];
  starredIds: string[];
  onToggleStar: (id: string) => void;
  onTradeMarket: (marketId: string) => void;
}

type SortKey = 'volume24h' | 'price' | 'change24h' | 'tvlStaked' | 'commitsPerWeek';

export const MarketsScreen: React.FC<MarketsScreenProps> = ({
  markets,
  starredIds,
  onToggleStar,
  onTradeMarket,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | 'Starred' | EcosystemCategory>('All');
  const [sortKey, setSortKey] = useState<SortKey>('volume24h');
  const [sortDesc, setSortDesc] = useState(true);

  const summary = useMemo(() => {
    const totalVol = markets.reduce((acc, m) => acc + m.volume24h, 0);
    const totalTvl = markets.reduce((acc, m) => acc + m.tvlStaked, 0);
    const totalCommits = markets.reduce((acc, m) => acc + m.commitsPerWeek, 0);
    return {
      count: markets.length,
      totalVol,
      totalTvl,
      totalCommits,
    };
  }, [markets]);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = markets.filter((m) => {
      if (category === 'Starred' && !starredIds.includes(m.id)) return false;
      if (category !== 'All' && category !== 'Starred' && m.category !== category) {
        return false;
      }
      if (!q) return true;
      return (
        m.ticker.toLowerCase().includes(q) ||
        m.repoSlug.toLowerCase().includes(q) ||
        m.milestoneTitle.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDesc ? -diff : diff;
    });
  }, [markets, search, category, starredIds, sortKey, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 space-y-5">
      {/* Header & Summary Strip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#dfe2eb]">
            Repository Markets Screener
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Synthetic index perpetuals and milestone prediction contracts anchored to open-source repositories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Active Pairs</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#dfe2eb] mt-1">
            {summary.count}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">24h Notional Volume</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#dfe2eb] mt-1">
            {formatCompactUsd(summary.totalVol)}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Total Staked TVL</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#d29922] mt-1">
            {formatCompactUsd(summary.totalTvl)}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Tracked Commits (7d)</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#58a6ff] mt-1">
            {summary.totalCommits.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters & Screener Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
        <div className="p-3 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {(['All', 'Starred', 'Runtime', 'Frontend', 'Tooling', 'Data'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-mono rounded whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    category === cat
                      ? 'bg-[#21262d] text-[#58a6ff] border border-[#58a6ff]/40'
                      : 'text-[#8b949e] hover:text-[#dfe2eb] border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticker, repo, or milestone..."
              aria-label="Search repository markets"
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded pl-8 pr-3 py-1.5 text-xs font-mono text-[#dfe2eb] placeholder-[#6e7681] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono tabular-nums">
            <thead>
              <tr className="border-b border-[#21262d] text-[#8b949e] text-[11px]">
                <th className="py-2.5 px-3 text-left font-medium">Pair / Repository</th>
                <th className="py-2.5 px-3 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort('price')}
                    className="inline-flex items-center gap-1 hover:text-[#dfe2eb] cursor-pointer"
                  >
                    Mark Price <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort('change24h')}
                    className="inline-flex items-center gap-1 hover:text-[#dfe2eb] cursor-pointer"
                  >
                    24h Delta <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-center font-medium">7D Curve</th>
                <th className="py-2.5 px-3 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort('commitsPerWeek')}
                    className="inline-flex items-center gap-1 hover:text-[#dfe2eb] cursor-pointer"
                  >
                    Commits/Wk <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort('volume24h')}
                    className="inline-flex items-center gap-1 hover:text-[#dfe2eb] cursor-pointer"
                  >
                    24h Vol <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort('tvlStaked')}
                    className="inline-flex items-center gap-1 hover:text-[#dfe2eb] cursor-pointer"
                  >
                    Staked TVL <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 text-left font-medium">Milestone Catalyst</th>
                <th className="py-2.5 px-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#8b949e]">
                    No markets match your current search or ecosystem filter.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((m) => {
                  const bull = m.change24h >= 0;
                  const starred = starredIds.includes(m.id);
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#1f242c] transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => onToggleStar(m.id)}
                            aria-label={starred ? 'Unstar market' : 'Star market'}
                            className="text-[#8b949e] hover:text-[#d29922] cursor-pointer"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                starred ? 'text-[#d29922] fill-[#d29922]' : ''
                              }`}
                            />
                          </button>
                          <div>
                            <div className="text-[#dfe2eb] font-semibold">
                              {m.ticker}
                            </div>
                            <div className="text-[11px] text-[#8b949e] font-sans">
                              {m.repoSlug} · {m.category} · {formatStars(m.stars)} stars
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-[#dfe2eb] font-medium">
                        {formatUsd(m.price)}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-medium ${
                          bull ? 'text-[#3fb950]' : 'text-[#f85149]'
                        }`}
                      >
                        {bull ? '▲' : '▼'} {formatSignedPct(m.change24h)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex justify-center">
                          <Sparkline data={m.sparkline} positive={bull} width={76} height={22} />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-[#58a6ff]">
                        {m.commitsPerWeek}
                      </td>
                      <td className="py-3 px-3 text-right text-[#dfe2eb]">
                        {formatCompactUsd(m.volume24h)}
                      </td>
                      <td className="py-3 px-3 text-right text-[#d29922]">
                        {formatCompactUsd(m.tvlStaked)}
                      </td>
                      <td className="py-3 px-3 text-left max-w-[240px]">
                        <div className="text-[#dfe2eb] truncate font-sans">
                          {m.milestoneTitle}
                        </div>
                        <div className="text-[11px] text-[#8b949e]">
                          {m.milestoneProbability}% odds · {m.milestoneTargetDate}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onTradeMarket(m.id)}
                          className="px-3 py-1.5 text-[11px] font-semibold bg-[#21262d] hover:bg-[#3fb950] text-[#dfe2eb] hover:text-[#0d1117] border border-[#30363d] hover:border-[#3fb950] rounded transition-colors cursor-pointer"
                        >
                          Trade
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
    </div>
  );
};
