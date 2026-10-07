import React from 'react';
import { useMarket } from '../context/MarketContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Plus,
  Shield,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface PortfolioViewProps {
  onOpenOrderModal: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onOpenOrderModal }) => {
  const {
    positions,
    orders,
    cashBalance,
    portfolioValue,
    totalUnrealizedPl,
    closePosition,
    resetPortfolio,
    setActiveSymbol,
    setCurrentView,
  } = useMarket();

  const totalPositionsVal = positions.reduce((acc, p) => acc + p.marketValue, 0);
  const totalCostBasis = positions.reduce((acc, p) => acc + p.shares * p.avgPrice, 0);
  const totalUnrealizedPct =
    totalCostBasis > 0 ? Number(((totalUnrealizedPl / totalCostBasis) * 100).toFixed(2)) : 0;
  const isOverallProfitable = totalUnrealizedPl >= 0;

  return (
    <div className="space-y-4">
      {/* Account Metric Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Net Liquidation Value */}
        <div className="bg-white border border-[#E0E3EB] rounded-md p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6A6D78] mb-1">
            <span>Net Portfolio Value</span>
            <Wallet className="w-4 h-4 text-[#2962FF]" />
          </div>
          <div className="text-2xl font-black text-[#131722] tabular-nums tracking-tight">
            ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span
              className={`font-semibold tabular-nums flex items-center ${
                isOverallProfitable ? 'text-[#089981]' : 'text-[#F23645]'
              }`}
            >
              {isOverallProfitable ? (
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              {isOverallProfitable ? '+' : ''}
              {totalUnrealizedPct}%
            </span>
            <span className="text-[#787B86]">total return</span>
          </div>
        </div>

        {/* Buying Power */}
        <div className="bg-white border border-[#E0E3EB] rounded-md p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6A6D78] mb-1">
            <span>Cash & Buying Power</span>
            <Shield className="w-4 h-4 text-[#006b59]" />
          </div>
          <div className="text-2xl font-black text-[#131722] tabular-nums tracking-tight">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-[#787B86]">
            Margin Cap: ${(cashBalance * 2).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-white border border-[#E0E3EB] rounded-md p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6A6D78] mb-1">
            <span>Unrealized P&L</span>
            <Layers className="w-4 h-4 text-[#737687]" />
          </div>
          <div
            className={`text-2xl font-black tabular-nums tracking-tight ${
              isOverallProfitable ? 'text-[#089981]' : 'text-[#F23645]'
            }`}
          >
            {isOverallProfitable ? '+' : ''}$
            {Math.abs(totalUnrealizedPl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-[#787B86]">
            {positions.length} active positions open
          </div>
        </div>

        {/* Invested Equity / Allocation */}
        <div className="bg-white border border-[#E0E3EB] rounded-md p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#6A6D78] mb-1">
            <span>Invested Equity</span>
            <button
              onClick={resetPortfolio}
              className="flex items-center gap-1 text-[11px] text-[#787B86] hover:text-[#131722] transition-colors"
              title="Reset simulated trading balance"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
          <div className="text-2xl font-black text-[#131722] tabular-nums tracking-tight">
            ${totalPositionsVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          {/* Allocation Bar */}
          <div className="mt-2 w-full bg-[#E0E3EB] h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-[#2962FF] h-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((totalPositionsVal / (portfolioValue || 1)) * 100)
                )}%`,
              }}
              title="Equities"
            />
            <div
              className="bg-[#089981] h-full transition-all"
              style={{
                width: `${Math.max(
                  0,
                  Math.round((cashBalance / (portfolioValue || 1)) * 100)
                )}%`,
              }}
              title="Cash"
            />
          </div>
        </div>
      </div>

      {/* Open Positions Table */}
      <div className="bg-white border border-[#E0E3EB] rounded-md shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E0E3EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#131722] tracking-tight">
              Open Positions ({positions.length})
            </h3>
            <span className="text-[11px] text-[#787B86]">
              Real-time mark-to-market valuations
            </span>
          </div>
          <button
            onClick={onOpenOrderModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2962FF] hover:bg-[#0049db] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>New Order</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E3EB] bg-[#FAF8FF] text-[11px] font-semibold text-[#787B86] uppercase tracking-wider">
                <th className="py-2.5 px-4">Symbol</th>
                <th className="py-2.5 px-3 text-right">Shares</th>
                <th className="py-2.5 px-3 text-right">Avg Entry</th>
                <th className="py-2.5 px-3 text-right">Current Price</th>
                <th className="py-2.5 px-3 text-right">Market Value</th>
                <th className="py-2.5 px-3 text-right">Unrealized P&L</th>
                <th className="py-2.5 px-3 text-right hidden sm:table-cell">Day P&L</th>
                <th className="py-2.5 pr-4 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3EB]">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#787B86]">
                    You have no active positions. Use the Trade Ticket or Screener to enter a simulated order.
                  </td>
                </tr>
              ) : (
                positions.map((pos) => {
                  const isProfit = pos.unrealizedPl >= 0;
                  return (
                    <tr
                      key={pos.symbol}
                      className="h-[44px] text-xs hover:bg-[#F8F9FD] transition-colors"
                    >
                      <td className="py-2 px-4">
                        <button
                          onClick={() => {
                            setActiveSymbol(pos.symbol);
                            setCurrentView('chart');
                          }}
                          className="font-extrabold text-[#131722] hover:text-[#2962FF] text-[13px] tracking-tight hover:underline cursor-pointer"
                        >
                          {pos.symbol}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-[#131722] font-semibold">
                        {pos.shares}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-[#6A6D78]">
                        ${pos.avgPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-[#131722] font-bold">
                        ${pos.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-[#131722] font-semibold">
                        ${pos.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-bold tabular-nums font-mono ${
                              isProfit ? 'text-[#089981]' : 'text-[#F23645]'
                            }`}
                          >
                            {isProfit ? '+' : ''}$
                            {pos.unrealizedPl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span
                            className={`text-[10px] tabular-nums font-semibold ${
                              isProfit ? 'text-[#089981]' : 'text-[#F23645]'
                            }`}
                          >
                            {isProfit ? '+' : ''}
                            {pos.unrealizedPlPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right hidden sm:table-cell">
                        <span
                          className={`font-mono tabular-nums ${
                            pos.dayPl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {pos.dayPl >= 0 ? '+' : ''}$
                          {pos.dayPl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-2 pr-4 pl-3 text-right">
                        <button
                          onClick={() => closePosition(pos.symbol)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#F23645] hover:bg-[#FDEBED] border border-[#F23645]/30 rounded transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Execution History */}
      <div className="bg-white border border-[#E0E3EB] rounded-md shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E0E3EB] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#131722] tracking-tight">
            Order Audit Trail & Execution History
          </h3>
          <span className="text-[11px] text-[#787B86]">{orders.length} events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E0E3EB] bg-[#FAF8FF] text-[11px] font-semibold text-[#787B86] uppercase tracking-wider">
                <th className="py-2.5 px-4">Order ID</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Shares</th>
                <th className="py-2.5 px-3 text-right">Filled Price</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
                <th className="py-2.5 pr-4 pl-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E3EB]">
              {orders.map((ord) => (
                <tr key={ord.id} className="h-[40px] text-xs hover:bg-[#F8F9FD]">
                  <td className="py-2 px-4 font-mono text-[#787B86] text-[11px]">{ord.id}</td>
                  <td className="py-2 px-3 font-mono text-[#6A6D78] text-[11px]">{ord.timestamp}</td>
                  <td className="py-2 px-3 font-extrabold text-[#131722]">{ord.symbol}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ord.side === 'BUY'
                          ? 'bg-[#E6F6F3] text-[#089981]'
                          : 'bg-[#FDEBED] text-[#F23645]'
                      }`}
                    >
                      {ord.side}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#6A6D78] font-mono text-[11px]">{ord.type}</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums">{ord.shares}</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">
                    ${ord.price.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums font-bold">
                    ${ord.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 pr-4 pl-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#089981]">
                      <CheckCircle className="w-3 h-3" /> FILLED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
