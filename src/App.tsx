/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { TopBar } from './components/TopBar';
import { IndexTickerBar } from './components/IndexTickerBar';
import { OverviewView } from './components/OverviewView';
import { TerminalChartDesk } from './components/TerminalChartDesk';
import { StockTable } from './components/StockTable';
import { OrderBookDepth } from './components/OrderBookDepth';
import { PortfolioView } from './components/PortfolioView';
import { NewsView } from './components/NewsView';
import { OrderEntryDrawer } from './components/OrderEntryDrawer';
import { StockDetailModal } from './components/StockDetailModal';
import { CommandPalette } from './components/CommandPalette';

const MainTerminalContent: React.FC = () => {
  const { currentView } = useMarket();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131722] flex flex-col">
      {/* Top Navigation Bar adhering to the Top Bar Contract */}
      <TopBar onOpenOrderModal={() => setIsOrderModalOpen(true)} />

      {/* Market Index Ticker Cards with emblems, tabular figures, and sparklines */}
      <IndexTickerBar />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-4">
        {currentView === 'overview' && (
          <OverviewView onOpenOrderModal={() => setIsOrderModalOpen(true)} />
        )}
        {currentView === 'chart' && (
          <TerminalChartDesk onOpenOrderModal={() => setIsOrderModalOpen(true)} />
        )}
        {currentView === 'screener' && <StockTable />}
        {currentView === 'depth' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E0E3EB] rounded-md p-3 text-xs text-[#6A6D78]">
              Direct Consolidated Depth of Book (Level 2) and Time & Sales streaming prints.
            </div>
            <OrderBookDepth />
          </div>
        )}
        {currentView === 'portfolio' && (
          <PortfolioView onOpenOrderModal={() => setIsOrderModalOpen(true)} />
        )}
        {currentView === 'news' && <NewsView />}
      </main>

      {/* Terminal Footer */}
      <footer className="w-full bg-white border-t border-[#E0E3EB] py-3 text-xs text-[#6A6D78]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#131722]">Precision Market Terminal</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Market Data Engine</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#089981] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#089981]" />
              WebSocket Connected
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#787B86]">
            <span>Press <kbd className="px-1.5 py-0.5 bg-[#F0F3FA] border border-[#E0E3EB] rounded font-semibold text-[#131722]">⌘K</kbd> for Command Palette</span>
            <span>Paper Trading Simulation</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <OrderEntryDrawer
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
      <StockDetailModal onOpenOrderModal={() => setIsOrderModalOpen(true)} />
      <CommandPalette onOpenOrderModal={() => setIsOrderModalOpen(true)} />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainTerminalContent />
    </MarketProvider>
  );
}
