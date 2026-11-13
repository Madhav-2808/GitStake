import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatUsd } from '../utils/format';

interface DepositModalProps {
  isOpen: boolean;
  availableBalance: number;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  availableBalance,
  onClose,
  onDeposit,
  onWithdraw,
}) => {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amountInput, setAmountInput] = useState('5000');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const parsed = Number(amountInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter a valid positive USDC amount.');
      return;
    }
    if (mode === 'withdraw' && parsed > availableBalance) {
      setError('Insufficient available USDC balance.');
      return;
    }
    setError('');
    if (mode === 'deposit') {
      onDeposit(parsed);
    } else {
      onWithdraw(parsed);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collateral-modal-title"
    >
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
          <h2 id="collateral-modal-title" className="text-sm font-semibold text-[#dfe2eb]">
            Margin Collateral Vault
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#8b949e] hover:text-[#dfe2eb] hover:bg-[#21262d] rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#0d1117] border border-[#30363d] rounded">
            <button
              type="button"
              onClick={() => {
                setMode('deposit');
                setError('');
              }}
              className={`py-1.5 text-xs font-mono font-medium rounded transition-colors cursor-pointer ${
                mode === 'deposit'
                  ? 'bg-[#21262d] text-[#3fb950] border border-[#3fb950]/40'
                  : 'text-[#8b949e] hover:text-[#dfe2eb]'
              }`}
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('withdraw');
                setError('');
              }}
              className={`py-1.5 text-xs font-mono font-medium rounded transition-colors cursor-pointer ${
                mode === 'withdraw'
                  ? 'bg-[#21262d] text-[#dfe2eb] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#dfe2eb]'
              }`}
            >
              Withdraw
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="collateral-amount" className="text-[#8b949e]">
                Amount (USDC)
              </label>
              <span className="font-mono tabular-nums text-[#8b949e]">
                Avail: <span className="text-[#dfe2eb]">{formatUsd(availableBalance)}</span>
              </span>
            </div>
            <div className="relative">
              <input
                id="collateral-amount"
                type="number"
                min="1"
                step="any"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setError('');
                }}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] rounded px-3 py-2.5 pr-16 font-mono tabular-nums text-sm text-[#dfe2eb] outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setAmountInput(
                    mode === 'withdraw' ? availableBalance.toFixed(2) : '10000'
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[11px] font-mono text-[#58a6ff] hover:bg-[#21262d] rounded cursor-pointer"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setAmountInput(String(amt));
                  setError('');
                }}
                className="py-1.5 text-xs font-mono tabular-nums bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#dfe2eb] rounded transition-colors cursor-pointer"
              >
                ${(amt / 1000).toFixed(0)}k
              </button>
            ))}
          </div>

          {error && (
            <p className="text-xs font-mono text-[#f85149]">{error}</p>
          )}

          <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-xs font-mono text-[#8b949e]">
            <span>Settlement Network</span>
            <span className="text-[#dfe2eb]">Arbitrum / Base L2</span>
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 text-xs font-semibold font-mono rounded transition-all cursor-pointer ${
              mode === 'deposit'
                ? 'bg-[#3fb950] hover:bg-[#67df70] text-[#0d1117] shadow-[0_0_12px_rgba(63,185,80,0.2)]'
                : 'bg-[#21262d] hover:bg-[#30363d] text-[#dfe2eb] border border-[#30363d]'
            }`}
          >
            {mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
};
