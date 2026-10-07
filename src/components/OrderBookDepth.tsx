import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { OrderBookRow, TimeSaleRow } from '../types/market';
import { ArrowDown, ArrowUp } from 'lucide-react';

export const OrderBookDepth: React.FC = () => {
  const { activeStock } = useMarket();
  const [filterBlockSize, setFilterBlockSize] = useState<number>(0);

  const spot = activeStock.price;

  // Generate dynamic Level 2 quotes around spot
  const { asks, bids, spread, spreadPercent } = useMemo(() => {
    const venues = ['NSDQ', 'ARCA', 'BATS', 'EDGX', 'IEX'];
    const askRows: OrderBookRow[] = [];
    const bidRows: OrderBookRow[] = [];

    let cumAsk = 0;
    for (let i = 8; i >= 1; i--) {
      const price = Number((spot + i * 0.02).toFixed(2));
      const size = Math.floor(100 + Math.random() * 800) * 10;
      cumAsk += size;
      askRows.push({
        venue: venues[i % venues.length],
        price,
        size,
        total: cumAsk,
      });
    }

    let cumBid = 0;
    for (let i = 1; i <= 8; i++) {
      const price = Number((spot - i * 0.02).toFixed(2));
      const size = Math.floor(100 + Math.random() * 800) * 10;
      cumBid += size;
      bidRows.push({
        venue: venues[(i + 2) % venues.length],
        price,
        size,
        total: cumBid,
      });
    }

    const lowestAsk = askRows[askRows.length - 1]?.price || spot + 0.01;
    const highestBid = bidRows[0]?.price || spot - 0.01;
    const sp = Number((lowestAsk - highestBid).toFixed(2));
    const spPct = Number(((sp / spot) * 100).toFixed(3));

    return { asks: askRows, bids: bidRows, spread: sp, spreadPercent: spPct };
  }, [spot]);

  // Generate simulated Time & Sales tape
  const timeSales = useMemo(() => {
    const list: TimeSaleRow[] = [];
    const now = new Date();
    for (let i = 0; i < 18; i++) {
      const t = new Date(now.getTime() - i * 3500);
      const isBuy = Math.random() > 0.45;
      const priceOffset = (Math.random() * 0.06 - 0.03);
      const price = Number((spot + priceOffset).toFixed(2));
      const size = Math.floor(50 + Math.random() * 650) * 5;
      list.push({
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        price,
        size,
        type: isBuy ? 'buy' : 'sell',
      });
    }
    return list;
  }, [spot]);

  const filteredTape = useMemo(() => {
    if (filterBlockSize === 0) return timeSales;
    return timeSales.filter((t) => t.size >= filterBlockSize);
  }, [timeSales, filterBlockSize]);

  const maxAskTotal = asks[0]?.total || 1;
  const maxBidTotal = bids[bids.length - 1]?.total || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Level 2 Order Book (7 cols) */}
      <div className="lg:col-span-7 bg-white border border-[#E0E3EB] rounded-md p-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB] mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#131722] tracking-tight">
              Level 2 Market Depth · {activeStock.symbol}
            </h3>
            <span className="text-[11px] font-semibold text-[#089981] bg-[#E6F6F3] px-1.5 py-0.5 rounded">
              DIRECT FEED
            </span>
          </div>
          <div className="text-xs text-[#6A6D78]">
            Spread: <span className="font-bold tabular-nums text-[#131722]">${spread.toFixed(2)}</span>{' '}
            <span className="text-[11px] text-[#787B86]">({spreadPercent}%)</span>
          </div>
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-4 text-[11px] font-semibold text-[#787B86] uppercase tracking-wider pb-1.5 border-b border-[#E0E3EB]">
          <span>Venue</span>
          <span className="text-right">Price</span>
          <span className="text-right">Size</span>
          <span className="text-right">Total Depth</span>
        </div>

        {/* Asks (Sell orders - red) */}
        <div className="flex flex-col-reverse divide-y divide-[#F0F3FA] my-1">
          {asks.map((ask, idx) => {
            const depthPct = Math.min(100, Math.round((ask.total / maxAskTotal) * 100));
            return (
              <div
                key={`ask-${idx}`}
                className="relative grid grid-cols-4 py-1 text-xs hover:bg-[#FDEBED]/40 transition-colors"
              >
                {/* Background Depth Bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-[#F23645]/10 pointer-events-none"
                  style={{ width: `${depthPct}%` }}
                />
                <span className="text-[#787B86] font-mono text-[11px]">{ask.venue}</span>
                <span className="text-right font-mono font-bold text-[#F23645] tabular-nums">
                  ${ask.price.toFixed(2)}
                </span>
                <span className="text-right font-mono text-[#131722] tabular-nums">
                  {ask.size.toLocaleString()}
                </span>
                <span className="text-right font-mono text-[#787B86] tabular-nums text-[11px]">
                  {ask.total.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mid-Market Price Divider */}
        <div className="py-2 my-1 px-3 bg-[#FAF8FF] border-y border-[#E0E3EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6A6D78]">Last Executed:</span>
            <span className="text-sm font-extrabold tabular-nums text-[#131722]">
              ${activeStock.price.toFixed(2)}
            </span>
          </div>
          <div className="text-[11px] font-medium text-[#787B86]">
            BBO: ${bids[0]?.price.toFixed(2)} × ${asks[asks.length - 1]?.price.toFixed(2)}
          </div>
        </div>

        {/* Bids (Buy orders - green) */}
        <div className="divide-y divide-[#F0F3FA]">
          {bids.map((bid, idx) => {
            const depthPct = Math.min(100, Math.round((bid.total / maxBidTotal) * 100));
            return (
              <div
                key={`bid-${idx}`}
                className="relative grid grid-cols-4 py-1 text-xs hover:bg-[#E6F6F3]/40 transition-colors"
              >
                {/* Background Depth Bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-[#089981]/10 pointer-events-none"
                  style={{ width: `${depthPct}%` }}
                />
                <span className="text-[#787B86] font-mono text-[11px]">{bid.venue}</span>
                <span className="text-right font-mono font-bold text-[#089981] tabular-nums">
                  ${bid.price.toFixed(2)}
                </span>
                <span className="text-right font-mono text-[#131722] tabular-nums">
                  {bid.size.toLocaleString()}
                </span>
                <span className="text-right font-mono text-[#787B86] tabular-nums text-[11px]">
                  {bid.total.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time & Sales (Live Tape) (5 cols) */}
      <div className="lg:col-span-5 bg-white border border-[#E0E3EB] rounded-md p-4 shadow-2xs flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB] mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#131722] tracking-tight">Time & Sales (Tape)</h3>
            <span className="w-2 h-2 rounded-full bg-[#089981] animate-ping" />
          </div>

          {/* Size Filter Pills */}
          <div className="flex items-center bg-[#F0F3FA] rounded-md p-0.5 border border-[#E0E3EB] text-[10px]">
            <button
              onClick={() => setFilterBlockSize(0)}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                filterBlockSize === 0 ? 'bg-white text-[#131722] shadow-2xs' : 'text-[#6A6D78]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterBlockSize(500)}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                filterBlockSize === 500 ? 'bg-white text-[#131722] shadow-2xs' : 'text-[#6A6D78]'
              }`}
            >
              &gt;500
            </button>
            <button
              onClick={() => setFilterBlockSize(1500)}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                filterBlockSize === 1500 ? 'bg-white text-[#131722] shadow-2xs' : 'text-[#6A6D78]'
              }`}
            >
              &gt;1.5K
            </button>
          </div>
        </div>

        {/* Tape Table Header */}
        <div className="grid grid-cols-4 text-[11px] font-semibold text-[#787B86] uppercase tracking-wider pb-1.5 border-b border-[#E0E3EB]">
          <span>Time</span>
          <span className="text-right">Price</span>
          <span className="text-right">Size</span>
          <span className="text-right">Condition</span>
        </div>

        {/* Tape Records */}
        <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-[#F0F3FA]">
          {filteredTape.map((trade, idx) => (
            <div
              key={`trade-${idx}`}
              className="grid grid-cols-4 py-1.5 text-xs hover:bg-[#F8F9FD] transition-colors items-center"
            >
              <span className="font-mono text-[#6A6D78] text-[11px]">{trade.time}</span>
              <span
                className={`text-right font-mono font-bold tabular-nums ${
                  trade.type === 'buy' ? 'text-[#089981]' : 'text-[#F23645]'
                }`}
              >
                ${trade.price.toFixed(2)}
              </span>
              <span className="text-right font-mono text-[#131722] tabular-nums font-semibold">
                {trade.size.toLocaleString()}
              </span>
              <span className="text-right text-[10px] text-[#787B86]">
                {trade.type === 'buy' ? (
                  <span className="inline-flex items-center text-[#089981]">
                    <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> ASK
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[#F23645]">
                    <ArrowDown className="w-2.5 h-2.5 mr-0.5" /> BID
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
