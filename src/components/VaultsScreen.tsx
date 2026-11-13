import React, { useMemo, useState } from 'react';
import { StakingVault } from '../types/market';
import { formatCompactUsd, formatUsd } from '../utils/format';

interface VaultsScreenProps {
  vaults: StakingVault[];
  availableBalance: number;
  onStakeVault: (vaultId: string, amount: number) => { ok: boolean; message: string };
  onUnstakeVault: (vaultId: string, amount: number) => { ok: boolean; message: string };
  onClaimYield: (vaultId: string) => void;
}

type EpochFilter = 'All' | 'Flexible' | '30D Epoch' | '90D Epoch';

export const VaultsScreen: React.FC<VaultsScreenProps> = ({
  vaults,
  availableBalance,
  onStakeVault,
  onUnstakeVault,
  onClaimYield,
}) => {
  const [epochFilter, setEpochFilter] = useState<EpochFilter>('All');
  const [activeVaultId, setActiveVaultId] = useState<string>(vaults[0]?.id ?? '');
  const [actionMode, setActionMode] = useState<'stake' | 'unstake'>('stake');
  const [amountInput, setAmountInput] = useState('1000');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const totals = useMemo(() => {
    const userStaked = vaults.reduce((acc, v) => acc + v.userStakedUsd, 0);
    const claimable = vaults.reduce((acc, v) => acc + v.claimableYieldUsd, 0);
    const totalPoolTvl = vaults.reduce((acc, v) => acc + v.tvlUsd, 0);
    const weightedApy =
      userStaked > 0
        ? vaults.reduce(
            (acc, v) => acc + v.userStakedUsd * (v.baseApy + v.sponsorBoostApy),
            0
          ) / userStaked
        : vaults.reduce((acc, v) => acc + (v.baseApy + v.sponsorBoostApy), 0) /
          Math.max(1, vaults.length);

    return { userStaked, claimable, totalPoolTvl, weightedApy };
  }, [vaults]);

  const filteredVaults = useMemo(() => {
    if (epochFilter === 'All') return vaults;
    return vaults.filter((v) => v.lockEpoch === epochFilter);
  }, [vaults, epochFilter]);

  const selectedVault = useMemo(
    () => vaults.find((v) => v.id === activeVaultId) ?? vaults[0],
    [vaults, activeVaultId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVault) return;
    const amt = Number(amountInput);
    const res =
      actionMode === 'stake'
        ? onStakeVault(selectedVault.id, amt)
        : onUnstakeVault(selectedVault.id, amt);
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#dfe2eb]">
          Algorithmic Staking Vaults
        </h1>
        <p className="text-xs text-[#8b949e] mt-1">
          Provide liquidity to open-source maintainer pools and earn base execution fees plus sponsor token rewards.
        </p>
      </div>

      {/* Vault Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Your Staked Principal</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#dfe2eb] mt-1">
            {formatUsd(totals.userStaked)}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Claimable Sponsor Yield</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#fabc45] mt-1">
            {formatUsd(totals.claimable)}
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Weighted Net APY</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#3fb950] mt-1">
            {totals.weightedApy.toFixed(2)}%
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3">
          <div className="text-[11px] font-mono text-[#8b949e]">Protocol Pool TVL</div>
          <div className="text-xl font-mono font-semibold tabular-nums text-[#dfe2eb] mt-1">
            {formatCompactUsd(totals.totalPoolTvl)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Vault Directory Table / Grid */}
        <div className="xl:col-span-8 bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
          <div className="p-3 border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {(['All', 'Flexible', '30D Epoch', '90D Epoch'] as EpochFilter[]).map((ep) => (
                <button
                  key={ep}
                  type="button"
                  onClick={() => setEpochFilter(ep)}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                    epochFilter === ep
                      ? 'bg-[#21262d] text-[#fabc45] border border-[#d29922]/40'
                      : 'text-[#8b949e] hover:text-[#dfe2eb] border border-transparent'
                  }`}
                >
                  {ep}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-mono text-[#8b949e]">
              {filteredVaults.length} pools
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-[#21262d] text-[#8b949e] text-[11px]">
                  <th className="py-2.5 px-3 text-left font-medium">Vault / Repository</th>
                  <th className="py-2.5 px-3 text-left font-medium">Lock Epoch</th>
                  <th className="py-2.5 px-3 text-right font-medium">Total APY</th>
                  <th className="py-2.5 px-3 text-right font-medium">Pool Capacity</th>
                  <th className="py-2.5 px-3 text-right font-medium">Your Stake</th>
                  <th className="py-2.5 px-3 text-right font-medium">Claimable</th>
                  <th className="py-2.5 px-3 text-right font-medium">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]">
                {filteredVaults.map((v) => {
                  const totalApy = v.baseApy + v.sponsorBoostApy;
                  const utilPct = Math.min(100, (v.tvlUsd / v.capacityUsd) * 100);
                  const isSelected = selectedVault?.id === v.id;

                  return (
                    <tr
                      key={v.id}
                      onClick={() => {
                        setActiveVaultId(v.id);
                        setFeedback(null);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#1f242c]' : 'hover:bg-[#1f242c]'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="text-[#dfe2eb] font-semibold">{v.pairLabel}</div>
                        <div className="text-[11px] text-[#8b949e] font-sans">
                          {v.repoSlug} · {v.maintainerAddress}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center h-5 px-1.5 text-[11px] rounded-[2px] border border-[#d29922]/40 bg-[#d29922]/12 text-[#fabc45]">
                          {v.lockEpoch}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="text-[#3fb950] font-semibold">
                          {totalApy.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-[#8b949e]">
                          {v.baseApy.toFixed(1)}% + {v.sponsorBoostApy.toFixed(1)}% boost
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="text-[#dfe2eb]">
                          {formatCompactUsd(v.tvlUsd)} / {formatCompactUsd(v.capacityUsd)}
                        </div>
                        <div className="w-24 ml-auto h-1 bg-[#0d1117] mt-1 overflow-hidden">
                          <div
                            className="h-full bg-[#d29922]"
                            style={{ width: `${utilPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-[#dfe2eb]">
                        {formatUsd(v.userStakedUsd)}
                      </td>
                      <td className="py-3 px-3 text-right text-[#fabc45]">
                        {formatUsd(v.claimableYieldUsd)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {v.claimableYieldUsd > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClaimYield(v.id);
                            }}
                            className="px-2.5 py-1 text-[11px] bg-[#d29922]/15 hover:bg-[#d29922] text-[#fabc45] hover:text-[#0d1117] border border-[#d29922]/50 rounded transition-colors cursor-pointer"
                          >
                            Claim
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveVaultId(v.id);
                              setActionMode('stake');
                            }}
                            className="px-2.5 py-1 text-[11px] bg-[#21262d] hover:bg-[#30363d] text-[#dfe2eb] border border-[#30363d] rounded transition-colors cursor-pointer"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Vault Execution Panel */}
        {selectedVault && (
          <form
            onSubmit={handleSubmit}
            className="xl:col-span-4 bg-[#161b22] border border-[#30363d] rounded p-4 space-y-4"
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#21262d]">
              <div>
                <h2 className="text-sm font-mono font-semibold text-[#dfe2eb]">
                  {selectedVault.pairLabel}
                </h2>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  {selectedVault.repoSlug} · {selectedVault.lockEpoch}
                </p>
              </div>
              <div className="text-right font-mono tabular-nums">
                <div className="text-sm font-semibold text-[#3fb950]">
                  {(selectedVault.baseApy + selectedVault.sponsorBoostApy).toFixed(1)}% APY
                </div>
                <div className="text-[11px] text-[#fabc45]">
                  Sponsor Boost +{selectedVault.sponsorBoostApy.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-[#0d1117] border border-[#30363d] rounded">
              <button
                type="button"
                onClick={() => {
                  setActionMode('stake');
                  setFeedback(null);
                }}
                className={`py-1.5 text-xs font-mono font-medium rounded-sm transition-colors cursor-pointer ${
                  actionMode === 'stake'
                    ? 'bg-[#21262d] text-[#fabc45] border border-[#d29922]/40'
                    : 'text-[#8b949e] hover:text-[#dfe2eb]'
                }`}
              >
                Stake USDC
              </button>
              <button
                type="button"
                onClick={() => {
                  setActionMode('unstake');
                  setFeedback(null);
                }}
                className={`py-1.5 text-xs font-mono font-medium rounded-sm transition-colors cursor-pointer ${
                  actionMode === 'unstake'
                    ? 'bg-[#21262d] text-[#dfe2eb] border border-[#30363d]'
                    : 'text-[#8b949e] hover:text-[#dfe2eb]'
                }`}
              >
                Unstake
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <label htmlFor="vault-amount" className="text-[#8b949e]">
                  Amount (USDC)
                </label>
                <span className="tabular-nums text-[#8b949e]">
                  {actionMode === 'stake' ? 'Avail ' : 'Staked '}
                  <span className="text-[#dfe2eb]">
                    {formatUsd(
                      actionMode === 'stake'
                        ? availableBalance
                        : selectedVault.userStakedUsd
                    )}
                  </span>
                </span>
              </div>
              <div className="relative">
                <input
                  id="vault-amount"
                  type="number"
                  min="1"
                  step="any"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded px-3 py-2.5 pr-14 font-mono tabular-nums text-xs text-[#dfe2eb] outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAmountInput(
                      actionMode === 'stake'
                        ? availableBalance.toFixed(2)
                        : selectedVault.userStakedUsd.toFixed(2)
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[#58a6ff] hover:bg-[#21262d] rounded cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-[#21262d] space-y-1.5 text-xs font-mono tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Maintainer Treasury Split</span>
                <span className="text-[#dfe2eb]">15% of protocol fee</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8b949e]">Est. Annual Yield</span>
                <span className="text-[#3fb950]">
                  {formatUsd(
                    ((Number(amountInput) || 0) *
                      (selectedVault.baseApy + selectedVault.sponsorBoostApy)) /
                      100
                  )}
                  /yr
                </span>
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
                actionMode === 'stake'
                  ? 'bg-[#d29922] hover:bg-[#fabc45] text-[#0d1117]'
                  : 'bg-[#21262d] hover:bg-[#30363d] text-[#dfe2eb] border border-[#30363d]'
              }`}
            >
              {actionMode === 'stake'
                ? `Stake into ${selectedVault.pairLabel}`
                : `Unstake from ${selectedVault.pairLabel}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
