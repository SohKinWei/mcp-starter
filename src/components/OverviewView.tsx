import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { InteractiveChart } from './InteractiveChart';
import { SECTOR_PERFORMANCE } from '../data/mockMarketData';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Zap,
} from 'lucide-react';

interface OverviewViewProps {
  onOpenOrderModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onOpenOrderModal }) => {
  const {
    stocks,
    activeSymbol,
    setActiveSymbol,
    watchlist,
    toggleWatchlist,
    lastTickSymbols,
    setCurrentView,
  } = useMarket();

  const [moverTab, setMoverTab] = useState<'gainers' | 'losers' | 'active'>('gainers');

  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const mostActive = [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5);

  const displayedMovers =
    moverTab === 'gainers' ? gainers : moverTab === 'losers' ? losers : mostActive;

  return (
    <div className="space-y-4">
      {/* Macro Breadth & Sector Performance Strip */}
      <div className="bg-white border border-[#E0E3EB] rounded-md p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Breadth Stats */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#089981]" />
              <span className="text-[#6A6D78]">Market Breadth:</span>
              <span className="font-bold text-[#131722] tabular-nums">68% Advancing</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[#6A6D78]">VIX Volatility:</span>
              <span className="font-bold text-[#089981] tabular-nums">14.82 (-3.4%)</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-[#6A6D78]">52W Highs/Lows:</span>
              <span className="font-bold text-[#131722] tabular-nums">184 / 14</span>
            </div>
          </div>

          {/* Sector Mini Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {SECTOR_PERFORMANCE.map((sector) => {
              const isUp = sector.change >= 0;
              return (
                <div
                  key={sector.name}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F0F3FA] border border-[#E0E3EB] shrink-0"
                >
                  <span className="text-[#6A6D78]">{sector.name}</span>
                  <span
                    className={`font-bold tabular-nums ${
                      isUp ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {isUp ? '+' : ''}
                    {sector.change}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Pro Chart & Sector Leaders (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <InteractiveChart />

          {/* Quick Quick-Trade Callout Banner */}
          <div className="bg-[#eaedfd]/50 border border-[#c3c5d8] rounded-md p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2962FF] text-white flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#131722]">Instant Order Routing</h4>
                <p className="text-[11px] text-[#6A6D78]">
                  Zero-latency simulated execution for {activeSymbol} at spot NBBO rates.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('depth')}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E0E3EB] hover:bg-[#F0F3FA] text-[#131722] rounded-md transition-colors"
              >
                Inspect L2 Depth
              </button>
              <button
                onClick={onOpenOrderModal}
                className="px-3.5 py-1.5 text-xs font-bold bg-[#2962FF] hover:bg-[#0049db] text-white rounded-md shadow-xs transition-colors cursor-pointer"
              >
                Execute {activeSymbol} Order
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Watchlist & Market Movers (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Watchlist Panel */}
          <div className="bg-white border border-[#E0E3EB] rounded-md shadow-2xs overflow-hidden">
            <div className="p-3.5 border-b border-[#E0E3EB] flex items-center justify-between bg-white">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-xs font-bold text-[#131722] tracking-tight">Active Watchlist</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#787B86] tabular-nums">
                {watchlist.length} Pinned
              </span>
            </div>

            <div className="divide-y divide-[#F0F3FA] max-h-72 overflow-y-auto">
              {watchlist.map((sym) => {
                const stock = stocks.find((s) => s.symbol === sym);
                if (!stock) return null;
                const isSelected = stock.symbol === activeSymbol;
                const isUp = stock.change >= 0;
                const tick = lastTickSymbols[stock.symbol];

                return (
                  <div
                    key={sym}
                    onClick={() => setActiveSymbol(sym)}
                    className={`px-3 py-2 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#eaedfd]/60 font-medium' : 'hover:bg-[#F8F9FD]'
                    } ${
                      tick === 'up'
                        ? 'bg-[#E6F6F3]/50'
                        : tick === 'down'
                        ? 'bg-[#FDEBED]/50'
                        : ''
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-[#131722]">{stock.symbol}</span>
                      <span className="text-[11px] text-[#6A6D78] truncate max-w-[100px]">
                        {stock.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <span className="font-bold tabular-nums text-[#131722]">
                        ${stock.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded ${
                          isUp
                            ? 'bg-[#E6F6F3] text-[#089981]'
                            : 'bg-[#FDEBED] text-[#F23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Market Movers Panel (Gainers / Losers / Active) */}
          <div className="bg-white border border-[#E0E3EB] rounded-md shadow-2xs overflow-hidden">
            <div className="p-2 border-b border-[#E0E3EB] bg-[#FAF8FF] flex items-center justify-between">
              <div className="flex items-center bg-[#F0F3FA] rounded-md p-0.5 border border-[#E0E3EB] w-full text-[11px]">
                <button
                  onClick={() => setMoverTab('gainers')}
                  className={`flex-1 py-1 font-semibold rounded text-center transition-colors cursor-pointer ${
                    moverTab === 'gainers'
                      ? 'bg-white text-[#089981] shadow-2xs font-bold'
                      : 'text-[#6A6D78]'
                  }`}
                >
                  Top Gainers
                </button>
                <button
                  onClick={() => setMoverTab('losers')}
                  className={`flex-1 py-1 font-semibold rounded text-center transition-colors cursor-pointer ${
                    moverTab === 'losers'
                      ? 'bg-white text-[#F23645] shadow-2xs font-bold'
                      : 'text-[#6A6D78]'
                  }`}
                >
                  Top Losers
                </button>
                <button
                  onClick={() => setMoverTab('active')}
                  className={`flex-1 py-1 font-semibold rounded text-center transition-colors cursor-pointer ${
                    moverTab === 'active'
                      ? 'bg-white text-[#131722] shadow-2xs font-bold'
                      : 'text-[#6A6D78]'
                  }`}
                >
                  Most Active
                </button>
              </div>
            </div>

            <div className="divide-y divide-[#F0F3FA]">
              {displayedMovers.map((stock) => {
                const isUp = stock.change >= 0;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => setActiveSymbol(stock.symbol)}
                    className="px-3.5 py-2 flex items-center justify-between text-xs hover:bg-[#F8F9FD] cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-extrabold text-[#131722]">{stock.symbol}</div>
                      <div className="text-[10px] text-[#787B86]">{stock.sector}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold tabular-nums text-[#131722]">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold tabular-nums flex items-center justify-end ${
                          isUp ? 'text-[#089981]' : 'text-[#F23645]'
                        }`}
                      >
                        {isUp ? (
                          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                        )}
                        {isUp ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
