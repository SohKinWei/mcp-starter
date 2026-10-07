import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { X, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface OrderEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderEntryDrawer: React.FC<OrderEntryDrawerProps> = ({ isOpen, onClose }) => {
  const { activeStock, stocks, cashBalance, executeTrade, setActiveSymbol } = useMarket();

  const [selectedSymbol, setSelectedSymbol] = useState<string>(activeStock.symbol);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [shares, setShares] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(activeStock.price);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  if (!isOpen) return null;

  const currentStock = stocks.find((s) => s.symbol === selectedSymbol) || activeStock;
  const executionPrice = orderType === 'MARKET' ? currentStock.price : limitPrice;
  const totalCost = Number((shares * executionPrice).toFixed(2));

  const handleSharesPercent = (percent: number) => {
    if (side === 'BUY') {
      const maxShares = Math.floor((cashBalance * (percent / 100)) / executionPrice);
      setShares(Math.max(1, maxShares));
    } else {
      setShares(Math.max(1, Math.floor(50 * (percent / 100))));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = executeTrade({
      symbol: selectedSymbol,
      side,
      type: orderType,
      shares,
      price: executionPrice,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1600);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white border border-[#E0E3EB] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Drawer Header */}
        <div className="px-5 py-3.5 bg-white border-b border-[#E0E3EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#131722] tracking-tight">
              Order Execution Desk
            </h3>
            <span className="text-[11px] font-semibold text-[#2962FF] bg-[#2962FF]/10 px-2 py-0.5 rounded-full">
              PAPER TRADING
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#787B86] hover:text-[#131722] rounded hover:bg-[#F0F3FA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Symbol Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#6A6D78] mb-1">
              Instrument Symbol
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedSymbol}
                onChange={(e) => {
                  setSelectedSymbol(e.target.value);
                  setActiveSymbol(e.target.value);
                  const found = stocks.find((s) => s.symbol === e.target.value);
                  if (found) setLimitPrice(found.price);
                }}
                className="flex-1 bg-[#F0F3FA] border border-[#E0E3EB] rounded-md px-3 py-2 text-sm font-bold text-[#131722] focus:outline-none focus:border-[#2962FF] focus:ring-1 focus:ring-[#2962FF]"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} · {s.name} (${s.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side Toggle: BUY / SELL */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F3FA] rounded-md border border-[#E0E3EB]">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`py-2 text-xs font-bold rounded transition-colors cursor-pointer ${
                side === 'BUY'
                  ? 'bg-[#089981] text-white shadow-xs'
                  : 'text-[#6A6D78] hover:text-[#131722]'
              }`}
            >
              BUY / LONG
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`py-2 text-xs font-bold rounded transition-colors cursor-pointer ${
                side === 'SELL'
                  ? 'bg-[#F23645] text-white shadow-xs'
                  : 'text-[#6A6D78] hover:text-[#131722]'
              }`}
            >
              SELL / SHORT
            </button>
          </div>

          {/* Order Type: MARKET / LIMIT / STOP */}
          <div>
            <label className="block text-xs font-semibold text-[#6A6D78] mb-1">Order Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['MARKET', 'LIMIT', 'STOP'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                    orderType === type
                      ? 'border-[#2962FF] bg-[#2962FF]/10 text-[#2962FF]'
                      : 'border-[#E0E3EB] bg-white text-[#6A6D78] hover:text-[#131722]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Limit Price Input if not Market */}
          {orderType !== 'MARKET' && (
            <div>
              <label className="block text-xs font-semibold text-[#6A6D78] mb-1">
                {orderType === 'LIMIT' ? 'Limit Price ($)' : 'Stop Price ($)'}
              </label>
              <input
                type="number"
                step="0.05"
                value={limitPrice}
                onChange={(e) => setLimitPrice(Number(e.target.value))}
                className="w-full bg-[#F0F3FA] border border-[#E0E3EB] rounded-md px-3 py-2 text-sm font-semibold tabular-nums text-[#131722] focus:outline-none focus:border-[#2962FF]"
              />
            </div>
          )}

          {/* Quantity / Shares */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#6A6D78]">Order Quantity (Shares)</label>
              <span className="text-[11px] text-[#787B86] tabular-nums">
                Avail. Cash: ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <input
              type="number"
              min="1"
              value={shares}
              onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-[#F0F3FA] border border-[#E0E3EB] rounded-md px-3 py-2 text-sm font-bold tabular-nums text-[#131722] focus:outline-none focus:border-[#2962FF]"
            />
            {/* Quick % buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleSharesPercent(pct)}
                  className="flex-1 py-1 text-[11px] font-semibold bg-[#F0F3FA] hover:bg-[#E0E3EB] text-[#6A6D78] rounded transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Cost Summary Breakdown */}
          <div className="p-3 bg-[#FAF8FF] border border-[#E0E3EB] rounded-md space-y-1.5 text-xs">
            <div className="flex justify-between text-[#6A6D78]">
              <span>Execution Price</span>
              <span className="font-semibold tabular-nums text-[#131722]">
                ${executionPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-[#6A6D78]">
              <span>Commission</span>
              <span className="font-semibold text-[#089981]">$0.00 (Zero Fee)</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-[#E0E3EB] font-bold text-sm text-[#131722]">
              <span>Estimated Total</span>
              <span className="tabular-nums">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Feedback alert */}
          {feedback && (
            <div
              className={`p-3 rounded-md text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-[#E6F6F3] text-[#089981] border border-[#089981]/30'
                  : 'bg-[#FDEBED] text-[#F23645] border border-[#F23645]/30'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-[#6A6D78] hover:text-[#131722] hover:bg-[#F0F3FA] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-2 py-2 text-xs font-bold text-white rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                side === 'BUY'
                  ? 'bg-[#089981] hover:bg-[#00725f]'
                  : 'bg-[#F23645] hover:bg-[#ba1a1a]'
              }`}
            >
              <span>Submit {side} Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
