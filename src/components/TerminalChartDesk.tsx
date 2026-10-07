import React from 'react';
import { useMarket } from '../context/MarketContext';
import { InteractiveChart } from './InteractiveChart';
import { OrderBookDepth } from './OrderBookDepth';
import { ArrowLeftRight, Activity, TrendingUp } from 'lucide-react';

interface TerminalChartDeskProps {
  onOpenOrderModal: () => void;
}

export const TerminalChartDesk: React.FC<TerminalChartDeskProps> = ({ onOpenOrderModal }) => {
  const { activeStock, stocks, setActiveSymbol } = useMarket();

  return (
    <div className="space-y-4">
      {/* Quick Instrument Switcher Bar */}
      <div className="bg-white border border-[#E0E3EB] rounded-md p-2 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-[#787B86] uppercase tracking-wider px-2">
            Favorites:
          </span>
          {stocks.slice(0, 8).map((s) => (
            <button
              key={s.symbol}
              onClick={() => setActiveSymbol(s.symbol)}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                s.symbol === activeStock.symbol
                  ? 'bg-[#131722] text-white'
                  : 'bg-[#F0F3FA] text-[#131722] hover:bg-[#eaedfd]'
              }`}
            >
              {s.symbol}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenOrderModal}
          className="px-3 py-1 bg-[#2962FF] hover:bg-[#0049db] text-white text-xs font-bold rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          Place Order
        </button>
      </div>

      {/* Main Interactive Chart */}
      <InteractiveChart />

      {/* Level 2 Market Depth & Time & Sales */}
      <div className="pt-2">
        <OrderBookDepth />
      </div>
    </div>
  );
};
