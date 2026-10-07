import React from 'react';
import { useMarket } from '../context/MarketContext';
import { X, ExternalLink, Plus, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StockDetailModalProps {
  onOpenOrderModal: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ onOpenOrderModal }) => {
  const {
    detailModalSymbol,
    setDetailModalSymbol,
    stocks,
    setActiveSymbol,
    setCurrentView,
    toggleWatchlist,
    isWatchlisted,
  } = useMarket();

  if (!detailModalSymbol) return null;

  const stock = stocks.find((s) => s.symbol === detailModalSymbol);
  if (!stock) return null;

  const isPositive = stock.change >= 0;
  const favorited = isWatchlisted(stock.symbol);

  // 52-week position percentage
  const week52Range = stock.week52High - stock.week52Low || 1;
  const currentPct = Math.min(
    100,
    Math.max(0, ((stock.price - stock.week52Low) / week52Range) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white border border-[#E0E3EB] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#E0E3EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-black text-[#131722] tracking-tight">{stock.symbol}</h2>
                <span className="text-sm font-semibold text-[#6A6D78]">{stock.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#787B86]">
                <span>{stock.sector}</span>
                <span aria-hidden="true">·</span>
                <span>NASDAQ Global Select</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleWatchlist(stock.symbol)}
              className="p-1.5 rounded hover:bg-[#F0F3FA] text-[#787B86] hover:text-amber-500 transition-colors"
              title="Toggle Watchlist"
            >
              <Star
                className={`w-4 h-4 ${
                  favorited ? 'text-amber-500 fill-amber-500' : 'text-[#c3c5d8]'
                }`}
              />
            </button>
            <button
              onClick={() => setDetailModalSymbol(null)}
              className="p-1.5 rounded hover:bg-[#F0F3FA] text-[#787B86] hover:text-[#131722]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Price & Delta Overview */}
        <div className="p-5 bg-[#FAF8FF] border-b border-[#E0E3EB] flex items-center justify-between">
          <div>
            <div className="text-3xl font-black text-[#131722] tabular-nums tracking-tight">
              ${stock.price.toFixed(2)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span
                className={`font-bold tabular-nums flex items-center ${
                  isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                {isPositive ? '+' : ''}${stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </span>
              <span className="text-[#787B86]">today</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveSymbol(stock.symbol);
                setCurrentView('chart');
                setDetailModalSymbol(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E0E3EB] hover:bg-[#F0F3FA] text-[#131722] rounded-md transition-colors flex items-center gap-1"
            >
              <span>Inspect Chart</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setActiveSymbol(stock.symbol);
                setDetailModalSymbol(null);
                onOpenOrderModal();
              }}
              className="px-3.5 py-1.5 text-xs font-bold bg-[#2962FF] hover:bg-[#0049db] text-white rounded-md shadow-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Trade</span>
            </button>
          </div>
        </div>

        {/* 52-Week Range Bar */}
        <div className="p-5 border-b border-[#E0E3EB] space-y-1.5">
          <div className="flex justify-between text-xs text-[#6A6D78]">
            <span>52-Week Low: <strong>${stock.week52Low.toFixed(2)}</strong></span>
            <span>52-Week High: <strong>${stock.week52High.toFixed(2)}</strong></span>
          </div>
          <div className="relative w-full h-2 bg-[#E0E3EB] rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#2962FF] rounded-full"
              style={{ width: `${currentPct}%` }}
            />
          </div>
        </div>

        {/* Key Fundamental Metrics Grid */}
        <div className="p-5 grid grid-cols-3 gap-4 text-xs border-b border-[#E0E3EB]">
          <div>
            <span className="text-[#787B86] block text-[11px]">Market Cap</span>
            <span className="font-bold tabular-nums text-[#131722] text-sm">
              ${stock.marketCap} Billion
            </span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[11px]">P/E Ratio</span>
            <span className="font-bold tabular-nums text-[#131722] text-sm">
              {stock.peRatio.toFixed(1)}x
            </span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[11px]">Dividend Yield</span>
            <span className="font-bold tabular-nums text-[#131722] text-sm">
              {stock.dividendYield > 0 ? `${(stock.dividendYield * 100).toFixed(2)}%` : 'None'}
            </span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[11px]">Avg Daily Volume</span>
            <span className="font-bold tabular-nums text-[#131722] text-sm">
              {(stock.avgVolume / 1000000).toFixed(1)}M
            </span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[11px]">Beta (5Y)</span>
            <span className="font-bold tabular-nums text-[#131722] text-sm">
              {stock.beta.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[11px]">Previous Close</span>
            <span className="font-bold tabular-nums text-[#131722] text-sm">
              ${stock.prevClose.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Company Profile Brief */}
        <div className="p-5 text-xs text-[#434656] space-y-1">
          <span className="font-bold text-[#131722] text-[11px] uppercase tracking-wider block">
            Institutional Company Profile
          </span>
          <p className="leading-relaxed">{stock.description}</p>
        </div>
      </div>
    </div>
  );
};
