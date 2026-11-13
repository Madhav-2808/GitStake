import React from 'react';
import { ScreenId } from '../types/market';

interface TopBarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenDeposit: () => void;
}

const NAV_ITEMS: { id: ScreenId; label: string }[] = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'markets', label: 'Markets' },
  { id: 'vaults', label: 'Vaults' },
  { id: 'portfolio', label: 'Portfolio' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  onNavigate,
  onOpenDeposit,
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 bg-[#161b22] border-b border-[#30363d] px-4 lg:px-6 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <button
        type="button"
        onClick={() => onNavigate('terminal')}
        className="text-base font-bold tracking-tight text-[#dfe2eb] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff] rounded"
      >
        Dev Terminal Market
      </button>

      {/* Zone 2: 4 single-line nav links */}
      <nav aria-label="Primary navigation" className="flex items-center gap-6 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`relative py-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff] ${
                isActive
                  ? 'text-[#dfe2eb]'
                  : 'text-[#8b949e] hover:text-[#dfe2eb]'
              }`}
            >
              {item.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-[#58a6ff]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onOpenDeposit}
          className="px-3.5 py-1.5 text-xs font-semibold font-mono text-[#0d1117] bg-[#3fb950] hover:bg-[#67df70] rounded transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff] shadow-[0_0_12px_rgba(63,185,80,0.18)]"
        >
          Deposit USDC
        </button>
      </div>
    </header>
  );
};
