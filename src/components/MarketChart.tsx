import React, { useMemo, useState } from 'react';
import { CandlePoint, RepoMarket, Timeframe } from '../types/market';
import { formatCompactUsd, formatUsd } from '../utils/format';

interface MarketChartProps {
  market: RepoMarket;
  candles: CandlePoint[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  liveFeed: boolean;
  onToggleLiveFeed: () => void;
}

const TIMEFRAMES: Timeframe[] = ['1H', '4H', '1D', '1W', '1M'];

export const MarketChart: React.FC<MarketChartProps> = ({
  market,
  candles,
  timeframe,
  onTimeframeChange,
  liveFeed,
  onToggleLiveFeed,
}) => {
  const [chartMode, setChartMode] = useState<'candles' | 'line'>('candles');
  const [showCommits, setShowCommits] = useState(true);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 760;
  const height = 290;
  const padLeft = 10;
  const padRight = 58;
  const padTop = 16;
  const padBottom = 26;
  const volumeHeight = 46;
  const priceAreaHeight = height - padTop - padBottom - (showCommits ? volumeHeight + 10 : 0);

  const { minPrice, maxPrice, maxCommits, yTicks } = useMemo(() => {
    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);
    const rawMin = Math.min(...lows);
    const rawMax = Math.max(...highs);
    const pad = (rawMax - rawMin) * 0.08 || 0.5;
    const minP = Math.max(0.1, rawMin - pad);
    const maxP = rawMax + pad;
    const maxC = Math.max(...candles.map((c) => c.commits), 1);

    const ticks: number[] = [];
    for (let i = 0; i < 5; i++) {
      ticks.push(minP + ((maxP - minP) * i) / 4);
    }

    return { minPrice: minP, maxPrice: maxP, maxCommits: maxC, yTicks: ticks };
  }, [candles]);

  const plotWidth = width - padLeft - padRight;
  const stepX = plotWidth / Math.max(1, candles.length);

  const priceToY = (price: number) => {
    const ratio = (price - minPrice) / (maxPrice - minPrice || 1);
    return padTop + priceAreaHeight - ratio * priceAreaHeight;
  };

  const activeCandle = hoverIdx !== null ? candles[hoverIdx] : candles[candles.length - 1];
  const isPositive = activeCandle ? activeCandle.close >= activeCandle.open : market.change24h >= 0;

  const linePoints = useMemo(() => {
    return candles
      .map((c, idx) => {
        const x = padLeft + idx * stepX + stepX / 2;
        const y = priceToY(c.close);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [candles, stepX, minPrice, maxPrice, priceAreaHeight]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const idx = Math.floor((relX - padLeft) / stepX);
    if (idx >= 0 && idx < candles.length) {
      setHoverIdx(idx);
    } else {
      setHoverIdx(null);
    }
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded flex flex-col">
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#30363d]">
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-1 text-[11px] font-mono font-medium rounded transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#21262d] text-[#58a6ff] border border-[#58a6ff]/40'
                  : 'text-[#8b949e] hover:text-[#dfe2eb] border border-transparent'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Active OHLC Readout */}
        {activeCandle && (
          <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono tabular-nums text-[#8b949e]">
            <span>
              O <span className="text-[#dfe2eb]">{activeCandle.open.toFixed(2)}</span>
            </span>
            <span>
              H <span className="text-[#dfe2eb]">{activeCandle.high.toFixed(2)}</span>
            </span>
            <span>
              L <span className="text-[#dfe2eb]">{activeCandle.low.toFixed(2)}</span>
            </span>
            <span>
              C{' '}
              <span className={isPositive ? 'text-[#3fb950]' : 'text-[#f85149]'}>
                {activeCandle.close.toFixed(2)}
              </span>
            </span>
            <span>
              Vol <span className="text-[#dfe2eb]">{formatCompactUsd(activeCandle.volume)}</span>
            </span>
            <span>
              Commits <span className="text-[#58a6ff]">{activeCandle.commits}</span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded p-0.5">
            <button
              type="button"
              onClick={() => setChartMode('candles')}
              className={`px-2 py-0.5 text-[11px] font-mono rounded-sm transition-colors cursor-pointer ${
                chartMode === 'candles'
                  ? 'bg-[#21262d] text-[#dfe2eb]'
                  : 'text-[#8b949e] hover:text-[#dfe2eb]'
              }`}
            >
              OHLC
            </button>
            <button
              type="button"
              onClick={() => setChartMode('line')}
              className={`px-2 py-0.5 text-[11px] font-mono rounded-sm transition-colors cursor-pointer ${
                chartMode === 'line'
                  ? 'bg-[#21262d] text-[#dfe2eb]'
                  : 'text-[#8b949e] hover:text-[#dfe2eb]'
              }`}
            >
              Line
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCommits((prev) => !prev)}
            className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
              showCommits
                ? 'bg-[#21262d] text-[#58a6ff] border-[#58a6ff]/40'
                : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:text-[#dfe2eb]'
            }`}
          >
            Commits
          </button>

          <button
            type="button"
            onClick={onToggleLiveFeed}
            className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
              liveFeed
                ? 'bg-[#3fb950]/12 text-[#3fb950] border-[#3fb950]/40'
                : 'bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:text-[#dfe2eb]'
            }`}
          >
            {liveFeed ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      {/* SVG Plot Area */}
      <div className="relative w-full bg-[#0d1117]/60">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[270px] sm:h-[300px] block select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Horizontal gridlines + Y-axis labels */}
          {yTicks.map((tick, i) => {
            const y = priceToY(tick);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#21262d"
                  strokeWidth={1}
                />
                <text
                  x={width - padRight + 6}
                  y={y + 3.5}
                  fill="#8b949e"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {tick.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Current Mark Price Horizontal Reference */}
          <line
            x1={padLeft}
            y1={priceToY(market.price)}
            x2={width - padRight}
            y2={priceToY(market.price)}
            stroke={market.change24h >= 0 ? '#3fb950' : '#f85149'}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.75}
          />
          <rect
            x={width - padRight + 2}
            y={priceToY(market.price) - 8}
            width={52}
            height={16}
            rx={2}
            fill={market.change24h >= 0 ? '#3fb950' : '#f85149'}
          />
          <text
            x={width - padRight + 28}
            y={priceToY(market.price) + 3.5}
            textAnchor="middle"
            fill="#0d1117"
            fontSize="10"
            fontWeight="600"
            fontFamily="JetBrains Mono, monospace"
          >
            {market.price.toFixed(2)}
          </text>

          {/* Candlesticks or Line */}
          {chartMode === 'candles' ? (
            candles.map((c, idx) => {
              const xCenter = padLeft + idx * stepX + stepX / 2;
              const candleW = Math.max(3, stepX * 0.58);
              const bull = c.close >= c.open;
              const color = bull ? '#3fb950' : '#f85149';
              const yHigh = priceToY(c.high);
              const yLow = priceToY(c.low);
              const yOpen = priceToY(c.open);
              const yClose = priceToY(c.close);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyH = Math.max(1.5, Math.abs(yClose - yOpen));

              return (
                <g key={idx}>
                  <line
                    x1={xCenter}
                    y1={yHigh}
                    x2={xCenter}
                    y2={yLow}
                    stroke={color}
                    strokeWidth={1.2}
                  />
                  <rect
                    x={xCenter - candleW / 2}
                    y={bodyTop}
                    width={candleW}
                    height={bodyH}
                    fill={color}
                    opacity={hoverIdx === idx ? 1 : 0.9}
                  />
                </g>
              );
            })
          ) : (
            <polyline
              fill="none"
              stroke={market.change24h >= 0 ? '#3fb950' : '#f85149'}
              strokeWidth={1.75}
              strokeLinejoin="round"
              points={linePoints}
            />
          )}

          {/* Commit Velocity Histogram */}
          {showCommits && (
            <g>
              <line
                x1={padLeft}
                y1={height - padBottom - volumeHeight - 4}
                x2={width - padRight}
                y2={height - padBottom - volumeHeight - 4}
                stroke="#21262d"
                strokeWidth={1}
              />
              {candles.map((c, idx) => {
                const xCenter = padLeft + idx * stepX + stepX / 2;
                const barW = Math.max(3, stepX * 0.56);
                const barH = Math.max(2, (c.commits / maxCommits) * volumeHeight);
                const yBar = height - padBottom - barH;
                return (
                  <rect
                    key={idx}
                    x={xCenter - barW / 2}
                    y={yBar}
                    width={barW}
                    height={barH}
                    fill="#58a6ff"
                    opacity={hoverIdx === idx ? 0.85 : 0.35}
                  />
                );
              })}
              <text
                x={width - padRight + 6}
                y={height - padBottom - 4}
                fill="#58a6ff"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                CMT
              </text>
            </g>
          )}

          {/* X-axis Labels */}
          {candles.map((c, idx) => {
            if (idx % 8 !== 0 && idx !== candles.length - 1) return null;
            const xCenter = padLeft + idx * stepX + stepX / 2;
            return (
              <text
                key={idx}
                x={xCenter}
                y={height - 7}
                textAnchor="middle"
                fill="#8b949e"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {c.time}
              </text>
            );
          })}

          {/* Crosshair on Hover */}
          {hoverIdx !== null && candles[hoverIdx] && (
            <g pointerEvents="none">
              <line
                x1={padLeft + hoverIdx * stepX + stepX / 2}
                y1={padTop}
                x2={padLeft + hoverIdx * stepX + stepX / 2}
                y2={height - padBottom}
                stroke="#58a6ff"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.7}
              />
              <line
                x1={padLeft}
                y1={priceToY(candles[hoverIdx].close)}
                x2={width - padRight}
                y2={priceToY(candles[hoverIdx].close)}
                stroke="#58a6ff"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.7}
              />
            </g>
          )}
        </svg>

        {/* Compact mobile/tablet OHLC bar */}
        {activeCandle && (
          <div className="xl:hidden flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 border-t border-[#21262d] text-[11px] font-mono tabular-nums text-[#8b949e]">
            <span>{activeCandle.time}</span>
            <span>O {formatUsd(activeCandle.open)}</span>
            <span>H {formatUsd(activeCandle.high)}</span>
            <span>L {formatUsd(activeCandle.low)}</span>
            <span className={isPositive ? 'text-[#3fb950]' : 'text-[#f85149]'}>
              C {formatUsd(activeCandle.close)}
            </span>
            <span className="text-[#58a6ff]">{activeCandle.commits} commits</span>
          </div>
        )}
      </div>
    </div>
  );
};
