import React from 'react';
import { useMarket } from '../context/MarketContext';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { IndexData } from '../types/market';

export const IndexTickerBar: React.FC = () => {
  const { indices } = useMarket();

  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 64;
    const height = 24;

    const coords = points.map((val, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${coords.join(' L ')}`;
    const strokeColor = isPositive ? '#089981' : '#F23645';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#E0E3EB]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {indices.map((idx: IndexData) => {
            const isPositive = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                className="flex items-center justify-between gap-3 min-w-[210px] xl:min-w-[220px] flex-1 bg-white hover:bg-[#F8F9FD] border border-[#E0E3EB] hover:border-[#D1D4DC] rounded-md px-3 py-2 transition-all group"
              >
                {/* Emblem + Symbol & Spot Value */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: idx.emblemColor }}
                  >
                    {idx.emblem}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-[#6A6D78] leading-tight flex items-center gap-1">
                      <span>{idx.name}</span>
                    </div>
                    <div className="text-[13px] font-bold text-[#131722] tabular-nums tracking-tight leading-snug">
                      {idx.value.toLocaleString('en-US', {
                        minimumFractionDigits: idx.value < 10 ? 2 : 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>

                {/* Delta Pill + Inline Sparkline */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                      isPositive
                        ? 'bg-[#E6F6F3] text-[#089981]'
                        : 'bg-[#FDEBED] text-[#F23645]'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {idx.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    {renderSparkline(idx.sparkline, isPositive)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
