import React from 'react';
import { useMarket } from '../context/MarketContext';
import { ViewTab } from '../types/market';
import { Search, Radio, Plus, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  onOpenOrderModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenOrderModal }) => {
  const {
    currentView,
    setCurrentView,
    isLiveStreaming,
    setIsLiveStreaming,
    setIsCommandPaletteOpen,
  } = useMarket();

  const navItems: { id: ViewTab; label: string }[] = [
    { id: 'overview', label: 'Markets Overview' },
    { id: 'chart', label: 'Terminal Chart' },
    { id: 'screener', label: 'Equity Screener' },
    { id: 'depth', label: 'Depth & Time/Sales' },
    { id: 'portfolio', label: 'Portfolio Desk' },
    { id: 'news', label: 'News Wire' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E0E3EB]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark (Single text element in display face as per Top Bar Contract) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2962FF]" />
            <span className="text-[17px] font-extrabold tracking-tight text-[#131722] whitespace-nowrap">
              Precision Market Terminal
            </span>
          </div>
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-[#089981] bg-[#E6F6F3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
            REGULAR SESSION · US EQUITIES
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#eaedfd] text-[#0049db] font-bold shadow-xs'
                    : 'text-[#6A6D78] hover:text-[#131722] hover:bg-[#F0F3FA]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search / Command palette trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-[#F0F3FA] hover:bg-[#eaedfd] border border-[#E0E3EB] rounded-lg text-xs text-[#787B86] hover:text-[#131722] transition-colors"
            title="Search symbols, indices, commands"
          >
            <Search className="w-3.5 h-3.5 text-[#6A6D78]" />
            <span className="hidden sm:inline text-xs text-[#6A6D78]">Search ticker...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-[#D1D4DC] rounded text-[#787B86] shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Live Feed Toggle */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
              isLiveStreaming
                ? 'border-[#c3c5d8] bg-white text-[#131722] hover:bg-[#F8F9FD]'
                : 'border-[#E0E3EB] bg-[#F0F3FA] text-[#787B86] hover:bg-white'
            }`}
            title="Toggle live price streaming simulation"
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                isLiveStreaming ? 'text-[#089981] animate-pulse' : 'text-[#787B86]'
              }`}
            />
            <span className="text-[11px] font-semibold tracking-wide">
              {isLiveStreaming ? 'STREAMING' : 'PAUSED'}
            </span>
          </button>

          {/* Quick Trade CTA */}
          <button
            onClick={onOpenOrderModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2962FF] hover:bg-[#0049db] active:bg-[#003ab3] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Trade Ticket</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar for smaller viewports */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-[#F0F3FA] overflow-x-auto border-t border-[#E0E3EB]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              currentView === item.id
                ? 'bg-white text-[#2962FF] font-semibold shadow-2xs'
                : 'text-[#6A6D78] hover:text-[#131722]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
