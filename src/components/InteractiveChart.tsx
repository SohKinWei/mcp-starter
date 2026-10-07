import React, { useState, useMemo, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { Timeframe, ChartType, CandleData } from '../types/market';
import {
  TrendingUp,
  BarChart2,
  Activity,
  Layers,
  Maximize2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const InteractiveChart: React.FC = () => {
  const { activeStock, activeTimeframe, setActiveTimeframe, lastTickSymbols } = useMarket();

  const [chartType, setChartType] = useState<ChartType>('candle');
  const [showSma20, setShowSma20] = useState<boolean>(true);
  const [showEma50, setShowEma50] = useState<boolean>(false);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showRsi, setShowRsi] = useState<boolean>(false);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const candles = activeStock.candles || [];

  // Calculate SMA 20
  const sma20 = useMemo(() => {
    const period = 8;
    return candles.map((c, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return Number((sum / period).toFixed(2));
    });
  }, [candles]);

  // Calculate EMA
  const ema50 = useMemo(() => {
    const k = 2 / (12 + 1);
    let prevEma: number | null = null;
    return candles.map((c, i) => {
      if (i === 0) {
        prevEma = c.close;
        return prevEma;
      }
      const ema = c.close * k + (prevEma as number) * (1 - k);
      prevEma = ema;
      return Number(ema.toFixed(2));
    });
  }, [candles]);

  // Calculate Bollinger Bands
  const bollingerBands = useMemo(() => {
    const period = 10;
    return candles.map((c, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1);
      const mean = slice.reduce((acc, curr) => acc + curr.close, 0) / period;
      const variance =
        slice.reduce((acc, curr) => acc + Math.pow(curr.close - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      return {
        upper: Number((mean + 2 * stdDev).toFixed(2)),
        lower: Number((mean - 2 * stdDev).toFixed(2)),
        middle: Number(mean.toFixed(2)),
      };
    });
  }, [candles]);

  // Calculate RSI 14
  const rsi14 = useMemo(() => {
    const period = 8;
    const rsiValues: (number | null)[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        rsiValues.push(null);
        continue;
      }
      const diff = candles[i].close - candles[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);

      if (i < period) {
        rsiValues.push(null);
      } else {
        const avgGain = gains / period;
        const avgLoss = losses / period || 0.0001;
        const rs = avgGain / avgLoss;
        const rsi = 100 - 100 / (1 + rs);
        rsiValues.push(Number(rsi.toFixed(1)));
        // roll forward
        const prevDiff = candles[i - period + 1].close - candles[i - period].close;
        if (prevDiff >= 0) gains -= prevDiff;
        else losses -= Math.abs(prevDiff);
      }
    }
    return rsiValues;
  }, [candles]);

  // Min and Max prices for chart geometry
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (!candles.length) return { minPrice: 0, maxPrice: 100, maxVolume: 1000 };
    let min = Infinity;
    let max = -Infinity;
    let volMax = 0;
    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > volMax) volMax = c.volume;
    });
    const padding = (max - min) * 0.08 || 2;
    return {
      minPrice: Math.floor((min - padding) * 10) / 10,
      maxPrice: Math.ceil((max + padding) * 10) / 10,
      maxVolume: volMax,
    };
  }, [candles]);

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = showRsi ? 300 : 360;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (val: number) => {
    return svgHeight - ((val - minPrice) / priceRange) * (svgHeight - 40) - 20;
  };

  const getX = (index: number) => {
    const step = svgWidth / (candles.length || 1);
    return index * step + step / 2;
  };

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.min(candles.length - 1, Math.floor(ratio * candles.length));
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Sparkline Area Path
  const areaPath = useMemo(() => {
    if (!candles.length) return '';
    const points = candles.map((c, i) => `${getX(i)},${getY(c.close)}`);
    return `M ${points.join(' L ')}`;
  }, [candles, maxPrice, minPrice]);

  const closedAreaPath = useMemo(() => {
    if (!candles.length) return '';
    const firstX = getX(0);
    const lastX = getX(candles.length - 1);
    return `${areaPath} L ${lastX},${svgHeight} L ${firstX},${svgHeight} Z`;
  }, [areaPath, candles.length, svgHeight]);

  const isUp = activeStock.change >= 0;
  const isTicking = lastTickSymbols[activeStock.symbol];

  return (
    <div className="bg-white border border-[#E0E3EB] rounded-md shadow-2xs overflow-hidden flex flex-col">
      {/* Chart Header Bar */}
      <div className="px-4 py-3 border-b border-[#E0E3EB] bg-white flex flex-wrap items-center justify-between gap-3">
        {/* Symbol Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-[#131722] tracking-tight">
              {activeStock.symbol}
            </span>
            <span className="text-xs font-medium text-[#6A6D78] hidden sm:inline">
              {activeStock.name}
            </span>
            <span className="text-[11px] font-semibold text-[#787B86] bg-[#F0F3FA] px-1.5 py-0.5 rounded">
              {activeStock.sector}
            </span>
          </div>

          {/* Real-time price badge */}
          <div
            className={`flex items-baseline gap-2 px-2 py-0.5 rounded transition-colors ${
              isTicking === 'up'
                ? 'bg-[#E6F6F3]'
                : isTicking === 'down'
                ? 'bg-[#FDEBED]'
                : 'bg-transparent'
            }`}
          >
            <span className="text-lg font-bold tabular-nums text-[#131722]">
              ${activeStock.price.toFixed(2)}
            </span>
            <span
              className={`text-xs font-semibold tabular-nums flex items-center ${
                isUp ? 'text-[#089981]' : 'text-[#F23645]'
              }`}
            >
              {isUp ? '+' : ''}
              {activeStock.change.toFixed(2)} ({isUp ? '+' : ''}
              {activeStock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Timeframe Pill Toggles (1D, 5D, 1M, 6M, 1Y, ALL) */}
          <div className="flex items-center bg-[#F0F3FA] rounded-full p-0.5 border border-[#E0E3EB]">
            {(['1D', '5D', '1M', '6M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  activeTimeframe === tf
                    ? 'bg-[#131722] text-white shadow-2xs'
                    : 'text-[#6A6D78] hover:text-[#131722]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-[#F0F3FA] rounded-md p-0.5 border border-[#E0E3EB]">
            <button
              onClick={() => setChartType('candle')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                chartType === 'candle'
                  ? 'bg-white text-[#2962FF] shadow-2xs font-bold'
                  : 'text-[#6A6D78] hover:text-[#131722]'
              }`}
              title="Candlestick chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-[#2962FF] shadow-2xs font-bold'
                  : 'text-[#6A6D78] hover:text-[#131722]'
              }`}
              title="Area line chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicators Dropdown / Badges */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSma20(!showSma20)}
              className={`px-2 py-1 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                showSma20
                  ? 'bg-[#2962FF]/10 text-[#2962FF] border-[#2962FF]/30'
                  : 'bg-white text-[#787B86] border-[#E0E3EB] hover:text-[#131722]'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowEma50(!showEma50)}
              className={`px-2 py-1 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                showEma50
                  ? 'bg-[#84f7db]/40 text-[#006b59] border-[#006b59]/30'
                  : 'bg-white text-[#787B86] border-[#E0E3EB] hover:text-[#131722]'
              }`}
            >
              EMA 50
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-1 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                showBollinger
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-white text-[#787B86] border-[#E0E3EB] hover:text-[#131722]'
              }`}
            >
              BB
            </button>
            <button
              onClick={() => setShowRsi(!showRsi)}
              className={`px-2 py-1 text-[10px] font-semibold rounded border transition-colors cursor-pointer ${
                showRsi
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-white text-[#787B86] border-[#E0E3EB] hover:text-[#131722]'
              }`}
            >
              RSI
            </button>
          </div>
        </div>
      </div>

      {/* Intraday Inspector Sub-bar */}
      {activeCandle && (
        <div className="px-4 py-1.5 bg-[#F8F9FD] border-b border-[#E0E3EB] flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6A6D78]">
          <span className="font-semibold text-[#131722]">
            Time: <span className="tabular-nums font-normal">{activeCandle.time}</span>
          </span>
          <span>
            O: <strong className="tabular-nums text-[#131722]">${activeCandle.open.toFixed(2)}</strong>
          </span>
          <span>
            H: <strong className="tabular-nums text-[#131722]">${activeCandle.high.toFixed(2)}</strong>
          </span>
          <span>
            L: <strong className="tabular-nums text-[#131722]">${activeCandle.low.toFixed(2)}</strong>
          </span>
          <span>
            C: <strong className="tabular-nums text-[#131722]">${activeCandle.close.toFixed(2)}</strong>
          </span>
          <span>
            Vol: <strong className="tabular-nums text-[#131722]">{activeCandle.volume.toLocaleString()}</strong>
          </span>
          {showSma20 && hoverIndex !== null && sma20[hoverIndex] && (
            <span className="text-[#2962FF] font-medium">
              SMA(20): <span className="tabular-nums">${sma20[hoverIndex]}</span>
            </span>
          )}
          {showRsi && hoverIndex !== null && rsi14[hoverIndex] && (
            <span className="text-purple-600 font-medium">
              RSI(14): <span className="tabular-nums">{rsi14[hoverIndex]}</span>
            </span>
          )}
        </div>
      )}

      {/* SVG Canvas Area */}
      <div
        ref={chartContainerRef}
        className="relative w-full bg-[#FFFFFF] p-2 select-none overflow-hidden"
        style={{ minHeight: '360px' }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? '#089981' : '#F23645'} stopOpacity="0.25" />
              <stop offset="90%" stopColor={isUp ? '#089981' : '#F23645'} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
            const y = svgHeight * ratio;
            const priceVal = maxPrice - (maxPrice - minPrice) * ratio;
            return (
              <g key={idx}>
                <line
                  x1="0"
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="#E0E3EB"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={svgWidth - 6}
                  y={y - 4}
                  textAnchor="end"
                  fill="#787B86"
                  fontSize="10"
                  className="tabular-nums font-mono font-medium"
                >
                  ${priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Bollinger Bands Fill & Lines */}
          {showBollinger && (
            <>
              {(() => {
                const upperPoints: string[] = [];
                const lowerPoints: string[] = [];
                bollingerBands.forEach((bb, i) => {
                  if (bb) {
                    upperPoints.push(`${getX(i)},${getY(bb.upper)}`);
                    lowerPoints.unshift(`${getX(i)},${getY(bb.lower)}`);
                  }
                });
                if (upperPoints.length) {
                  const bbPath = `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;
                  return <path d={bbPath} fill="url(#bollingerGradient)" />;
                }
                return null;
              })()}
              <path
                d={bollingerBands
                  .map((bb, i) => (bb ? `${getX(i)},${getY(bb.upper)}` : null))
                  .filter(Boolean)
                  .join(' L ')
                  ? `M ${bollingerBands
                      .map((bb, i) => (bb ? `${getX(i)},${getY(bb.upper)}` : null))
                      .filter(Boolean)
                      .join(' L ')}`
                  : ''}
                fill="none"
                stroke="#d97706"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              <path
                d={bollingerBands
                  .map((bb, i) => (bb ? `${getX(i)},${getY(bb.lower)}` : null))
                  .filter(Boolean)
                  .join(' L ')
                  ? `M ${bollingerBands
                      .map((bb, i) => (bb ? `${getX(i)},${getY(bb.lower)}` : null))
                      .filter(Boolean)
                      .join(' L ')}`
                  : ''}
                fill="none"
                stroke="#d97706"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
            </>
          )}

          {/* Volume sub-bars at bottom */}
          {showVolume &&
            candles.map((c, i) => {
              const x = getX(i);
              const barHeight = (c.volume / (maxVolume || 1)) * 55;
              const y = svgHeight - barHeight;
              const isCandleUp = c.close >= c.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - 4}
                  y={y}
                  width="8"
                  height={barHeight}
                  fill={isCandleUp ? '#089981' : '#F23645'}
                  opacity="0.25"
                />
              );
            })}

          {/* Chart Graphic: Area or Candlestick */}
          {chartType === 'area' ? (
            <>
              <path d={closedAreaPath} fill="url(#areaGradient)" />
              <path
                d={areaPath}
                fill="none"
                stroke={isUp ? '#089981' : '#F23645'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            // Candlesticks
            candles.map((c, i) => {
              const x = getX(i);
              const candleUp = c.close >= c.open;
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(openY - closeY));
              const color = candleUp ? '#089981' : '#F23645';

              return (
                <g key={`candle-${i}`}>
                  {/* High - Low Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle Body */}
                  <rect
                    x={x - 5}
                    y={bodyTop}
                    width="10"
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })
          )}

          {/* SMA 20 Line */}
          {showSma20 && (
            <path
              d={sma20
                .map((val, i) => (val !== null ? `${getX(i)},${getY(val)}` : null))
                .filter(Boolean)
                .join(' L ')
                ? `M ${sma20
                    .map((val, i) => (val !== null ? `${getX(i)},${getY(val)}` : null))
                    .filter(Boolean)
                    .join(' L ')}`
                : ''}
              fill="none"
              stroke="#2962FF"
              strokeWidth="1.8"
            />
          )}

          {/* EMA 50 Line */}
          {showEma50 && (
            <path
              d={ema50
                .map((val, i) => (val !== null ? `${getX(i)},${getY(val)}` : null))
                .filter(Boolean)
                .join(' L ')
                ? `M ${ema50
                    .map((val, i) => (val !== null ? `${getX(i)},${getY(val)}` : null))
                    .filter(Boolean)
                    .join(' L ')}`
                : ''}
              fill="none"
              stroke="#006b59"
              strokeWidth="1.8"
            />
          )}

          {/* Hover Crosshair */}
          {hoverIndex !== null && (
            <>
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1="0"
                x2={getX(hoverIndex)}
                y2={svgHeight}
                stroke="#6A6D78"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Horizontal line */}
              <line
                x1="0"
                y1={getY(candles[hoverIndex].close)}
                x2={svgWidth}
                y2={getY(candles[hoverIndex].close)}
                stroke="#6A6D78"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {/* Price Callout Box on Right Axis */}
              <g
                transform={`translate(${svgWidth - 55}, ${
                  getY(candles[hoverIndex].close) - 10
                })`}
              >
                <rect width="55" height="20" rx="3" fill="#131722" />
                <text
                  x="27"
                  y="14"
                  fill="#FFFFFF"
                  fontSize="10"
                  textAnchor="middle"
                  className="font-mono tabular-nums font-bold"
                >
                  ${candles[hoverIndex].close.toFixed(2)}
                </text>
              </g>
              {/* Time Callout Box on Bottom Axis */}
              <g transform={`translate(${getX(hoverIndex) - 25}, ${svgHeight - 16})`}>
                <rect width="50" height="16" rx="3" fill="#131722" />
                <text
                  x="25"
                  y="12"
                  fill="#FFFFFF"
                  fontSize="9"
                  textAnchor="middle"
                  className="font-mono tabular-nums"
                >
                  {candles[hoverIndex].time}
                </text>
              </g>
            </>
          )}
        </svg>

        {/* RSI Sub-pane if toggled */}
        {showRsi && (
          <div className="mt-2 pt-2 border-t border-[#E0E3EB]">
            <div className="flex items-center justify-between text-[11px] text-[#6A6D78] mb-1">
              <span className="font-semibold text-purple-700">RSI(14)</span>
              <span>Overbought: 70 · Oversold: 30</span>
            </div>
            <svg viewBox={`0 0 ${svgWidth} 60`} className="w-full h-14 overflow-visible">
              {/* Boundary lines 70 & 30 */}
              <line
                x1="0"
                y1="18"
                x2={svgWidth}
                y2="18"
                stroke="#ba1a1a"
                strokeDasharray="2 2"
                strokeWidth="0.8"
                opacity="0.4"
              />
              <line
                x1="0"
                y1="42"
                x2={svgWidth}
                y2="42"
                stroke="#089981"
                strokeDasharray="2 2"
                strokeWidth="0.8"
                opacity="0.4"
              />
              {/* RSI Curve */}
              <path
                d={rsi14
                  .map((val, i) =>
                    val !== null ? `${getX(i)},${60 - (val / 100) * 60}` : null
                  )
                  .filter(Boolean)
                  .join(' L ')
                  ? `M ${rsi14
                      .map((val, i) =>
                        val !== null ? `${getX(i)},${60 - (val / 100) * 60}` : null
                      )
                      .filter(Boolean)
                      .join(' L ')}`
                  : ''}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="1.6"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Fundamental Quick Stats Footer */}
      <div className="px-4 py-2.5 bg-[#FAF8FF] border-t border-[#E0E3EB] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div>
          <span className="text-[#787B86] block text-[11px]">Open</span>
          <span className="font-semibold tabular-nums text-[#131722]">
            ${activeStock.open.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-[#787B86] block text-[11px]">Day High / Low</span>
          <span className="font-semibold tabular-nums text-[#131722]">
            ${activeStock.high.toFixed(2)} - ${activeStock.low.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-[#787B86] block text-[11px]">Volume</span>
          <span className="font-semibold tabular-nums text-[#131722]">
            {(activeStock.volume / 1000000).toFixed(2)}M
          </span>
        </div>
        <div>
          <span className="text-[#787B86] block text-[11px]">Market Cap</span>
          <span className="font-semibold tabular-nums text-[#131722]">
            ${activeStock.marketCap}B
          </span>
        </div>
        <div>
          <span className="text-[#787B86] block text-[11px]">P/E Ratio</span>
          <span className="font-semibold tabular-nums text-[#131722]">
            {activeStock.peRatio.toFixed(1)}x
          </span>
        </div>
        <div>
          <span className="text-[#787B86] block text-[11px]">52-Week Range</span>
          <span className="font-semibold tabular-nums text-[#131722]">
            ${activeStock.week52Low.toFixed(2)} - ${activeStock.week52High.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
