import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { Search, TrendingUp, Compass, ShoppingCart, RefreshCw, X } from 'lucide-react';
import { ViewTab } from '../types/market';

interface CommandPaletteProps {
  onOpenOrderModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onOpenOrderModal }) => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    stocks,
    setActiveSymbol,
    setCurrentView,
    isLiveStreaming,
    setIsLiveStreaming,
    resetPortfolio,
  } = useMarket();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredStocks = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase())
  );

  const navigationCommands: { id: ViewTab; label: string; desc: string }[] = [
    { id: 'overview', label: 'Go to Markets Overview', desc: 'Main macro terminal and indices' },
    { id: 'chart', label: 'Go to Terminal Chart', desc: 'Interactive candlestick charts' },
    { id: 'screener', label: 'Go to Equity Screener', desc: 'High-density tabular market quotes' },
    { id: 'depth', label: 'Go to Level 2 Depth', desc: 'Order book ladder & time and sales' },
    { id: 'portfolio', label: 'Go to Portfolio Desk', desc: 'Open positions & paper trades' },
    { id: 'news', label: 'Go to News Wire', desc: 'Institutional catalysts & SEC filings' },
  ];

  const filteredNav = navigationCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white border border-[#E0E3EB] rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="p-3 border-b border-[#E0E3EB] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#787B86] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, view, or command (e.g., NVDA, Screener, Trade)..."
            className="w-full text-sm font-medium text-[#131722] placeholder-[#787B86] focus:outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-[#787B86] hover:text-[#131722] rounded hover:bg-[#F0F3FA]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#F0F3FA]">
          {/* Quick Action Commands */}
          <div className="pb-2">
            <div className="px-3 py-1.5 text-[10px] font-bold text-[#787B86] uppercase tracking-wider">
              Quick Actions
            </div>
            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                onOpenOrderModal();
              }}
              className="w-full px-3 py-2 text-left rounded-md hover:bg-[#eaedfd] flex items-center justify-between text-xs text-[#131722] font-semibold group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-[#2962FF]" />
                <span>Open New Trade Order Ticket</span>
              </div>
              <span className="text-[10px] text-[#787B86] font-normal group-hover:text-[#2962FF]">
                Execute Market / Limit
              </span>
            </button>
            <button
              onClick={() => {
                setIsLiveStreaming(!isLiveStreaming);
                setIsCommandPaletteOpen(false);
              }}
              className="w-full px-3 py-2 text-left rounded-md hover:bg-[#F0F3FA] flex items-center justify-between text-xs text-[#131722] group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#089981]" />
                <span>{isLiveStreaming ? 'Pause Live Price Stream' : 'Resume Live Price Stream'}</span>
              </div>
              <span className="text-[10px] text-[#787B86]">Toggle Simulation</span>
            </button>
          </div>

          {/* Equities matching */}
          {filteredStocks.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#787B86] uppercase tracking-wider">
                Instruments & Equities
              </div>
              {filteredStocks.slice(0, 5).map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => {
                    setActiveSymbol(stock.symbol);
                    setCurrentView('chart');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left rounded-md hover:bg-[#F8F9FD] flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-[#131722] text-[13px]">{stock.symbol}</span>
                    <span className="text-[#6A6D78] text-[11px] truncate max-w-[200px]">
                      {stock.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-bold text-[#131722]">${stock.price.toFixed(2)}</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        stock.change >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
                      }`}
                    >
                      {stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Navigation Commands */}
          {filteredNav.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#787B86] uppercase tracking-wider">
                Terminal Navigation
              </div>
              {filteredNav.map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => {
                    setCurrentView(nav.id);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left rounded-md hover:bg-[#F8F9FD] flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-semibold text-[#131722]">
                    <Compass className="w-3.5 h-3.5 text-[#6A6D78]" />
                    <span>{nav.label}</span>
                  </div>
                  <span className="text-[10px] text-[#787B86]">{nav.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#FAF8FF] border-t border-[#E0E3EB] flex items-center justify-between text-[11px] text-[#787B86]">
          <span>Navigation: ↑ ↓ Enter to select</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
