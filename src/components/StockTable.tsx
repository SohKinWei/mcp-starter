import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { StockQuote } from '../types/market';
import {
  Star,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

type SortColumn = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap' | 'peRatio';
type FilterCategory = 'ALL' | 'WATCHLIST' | 'GAINERS' | 'LOSERS' | 'TECH' | 'HIGH_VOL';

export const StockTable: React.FC = () => {
  const {
    stocks,
    activeSymbol,
    setActiveSymbol,
    watchlist,
    toggleWatchlist,
    isWatchlisted,
    setDetailModalSymbol,
    lastTickSymbols,
  } = useMarket();

  const [search, setSearch] = useState<string>('');
  const [filterCat, setFilterCat] = useState<FilterCategory>('ALL');
  const [sortCol, setSortCol] = useState<SortColumn>('marketCap');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    // Category filter
    switch (filterCat) {
      case 'WATCHLIST':
        result = result.filter((s) => watchlist.includes(s.symbol));
        break;
      case 'GAINERS':
        result = result.filter((s) => s.changePercent > 0);
        break;
      case 'LOSERS':
        result = result.filter((s) => s.changePercent < 0);
        break;
      case 'TECH':
        result = result.filter(
          (s) => s.sector === 'Technology' || s.sector === 'Semiconductors'
        );
        break;
      case 'HIGH_VOL':
        result = result.filter((s) => s.volume > 35000000);
        break;
      default:
        break;
    }

    // Sorting
    result.sort((a, b) => {
      let valA: string | number = a[sortCol];
      let valB: string | number = b[sortCol];

      if (typeof valA === 'string') {
        const comp = valA.localeCompare(valB as string);
        return sortDir === 'asc' ? comp : -comp;
      }
      return sortDir === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  }, [stocks, search, filterCat, sortCol, sortDir, watchlist]);

  // Mini Sparkline renderer
  const renderRowSparkline = (spark: number[], isPositive: boolean) => {
    if (!spark || spark.length < 2) return null;
    const min = Math.min(...spark);
    const max = Math.max(...spark);
    const range = max - min || 1;
    const w = 70;
    const h = 20;

    const points = spark.map((val, i) => {
      const x = (i / (spark.length - 1)) * w;
      const y = h - ((val - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return (
      <svg width={w} height={h} className="overflow-visible inline-block">
        <path
          d={`M ${points.join(' L ')}`}
          fill="none"
          stroke={isPositive ? '#089981' : '#F23645'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="bg-white border border-[#E0E3EB] rounded-md shadow-2xs overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-3 sm:px-4 sm:py-3 border-b border-[#E0E3EB] flex flex-wrap items-center justify-between gap-3 bg-white">
        {/* Category Filter Pills (conforming to style guide) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Equities' },
            { id: 'WATCHLIST', label: `Watchlist (${watchlist.length})` },
            { id: 'GAINERS', label: 'Top Gainers' },
            { id: 'LOSERS', label: 'Top Losers' },
            { id: 'TECH', label: 'Tech & Semis' },
            { id: 'HIGH_VOL', label: 'High Volume' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id as FilterCategory)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                filterCat === cat.id
                  ? 'bg-[#131722] text-white shadow-2xs'
                  : 'bg-[#F0F3FA] text-[#131722] hover:bg-[#eaedfd]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input with leading icon and keyboard badge */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#787B86]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter symbols, names..."
            className="w-full bg-[#F0F3FA] focus:bg-white border border-[#E0E3EB] focus:border-[#2962FF] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#131722] placeholder-[#787B86] focus:outline-none focus:ring-1 focus:ring-[#2962FF] transition-all"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E0E3EB] bg-[#FAF8FF] text-[11px] font-semibold text-[#787B86] uppercase tracking-wider select-none">
              <th className="py-2.5 pl-4 pr-1 w-10 text-center">★</th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-3 cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol / Name</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th className="py-2.5 px-3 hidden md:table-cell">Sector</th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Last Spot</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center hidden sm:table-cell">Intraday Trend</th>
              <th
                onClick={() => handleSort('volume')}
                className="py-2.5 px-3 text-right hidden lg:table-cell cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('marketCap')}
                className="py-2.5 px-3 text-right hidden xl:table-cell cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Mkt Cap</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('peRatio')}
                className="py-2.5 px-3 text-right hidden xl:table-cell cursor-pointer hover:text-[#131722]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>P/E</span>
                  <ArrowUpDown className="w-3 h-3 text-[#787B86]" />
                </div>
              </th>
              <th className="py-2.5 pr-4 pl-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E3EB]">
            {filteredStocks.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-xs text-[#787B86]">
                  No matching equities found for your criteria.
                </td>
              </tr>
            ) : (
              filteredStocks.map((stock: StockQuote) => {
                const isSelected = stock.symbol === activeSymbol;
                const isPositive = stock.change >= 0;
                const tick = lastTickSymbols[stock.symbol];
                const favorited = isWatchlisted(stock.symbol);

                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => setActiveSymbol(stock.symbol)}
                    className={`h-[44px] text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-[#eaedfd]/50 font-medium'
                        : 'hover:bg-[#F8F9FD]'
                    } ${
                      tick === 'up'
                        ? 'bg-[#E6F6F3]/50'
                        : tick === 'down'
                        ? 'bg-[#FDEBED]/50'
                        : ''
                    }`}
                  >
                    {/* Star / Watchlist */}
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(stock.symbol);
                      }}
                      className="py-2 pl-4 pr-1 text-center"
                    >
                      <button
                        title={favorited ? 'Remove from watchlist' : 'Add to watchlist'}
                        className="p-1 rounded hover:bg-[#E0E3EB] text-[#787B86] hover:text-[#131722]"
                      >
                        <Star
                          className={`w-3.5 h-3.5 transition-colors ${
                            favorited
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-[#c3c5d8]'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-2 px-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-extrabold text-[#131722] text-[13px] tracking-tight">
                          {stock.symbol}
                        </span>
                        <span className="text-[#6A6D78] text-[11px] truncate max-w-[140px] hidden sm:inline">
                          {stock.name}
                        </span>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-2 px-3 text-[#6A6D78] text-[11px] hidden md:table-cell">
                      {stock.sector}
                    </td>

                    {/* Price */}
                    <td className="py-2 px-3 text-right">
                      <span className="font-bold tabular-nums text-[#131722] text-[13px]">
                        ${stock.price.toFixed(2)}
                      </span>
                    </td>

                    {/* 24h Change */}
                    <td className="py-2 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-semibold tabular-nums text-xs ${
                            isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                        <span className="text-[10px] tabular-nums text-[#787B86]">
                          {isPositive ? '+' : ''}
                          ${stock.change.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Sparkline */}
                    <td className="py-2 px-3 text-center hidden sm:table-cell">
                      {renderRowSparkline(stock.sparkline, isPositive)}
                    </td>

                    {/* Volume */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-[#6A6D78] hidden lg:table-cell text-[11px]">
                      {(stock.volume / 1000000).toFixed(2)}M
                    </td>

                    {/* Market Cap */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-[#6A6D78] hidden xl:table-cell text-[11px]">
                      ${stock.marketCap}B
                    </td>

                    {/* P/E Ratio */}
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-[#6A6D78] hidden xl:table-cell text-[11px]">
                      {stock.peRatio.toFixed(1)}x
                    </td>

                    {/* Actions */}
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailModalSymbol(stock.symbol);
                      }}
                      className="py-2 pr-4 pl-2 text-right"
                    >
                      <button
                        title="View instrument dossier"
                        className="p-1.5 text-[#787B86] hover:text-[#2962FF] hover:bg-[#eaedfd] rounded transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination / Summary Footer */}
      <div className="px-4 py-2 bg-[#FAF8FF] border-t border-[#E0E3EB] flex items-center justify-between text-xs text-[#6A6D78]">
        <span>
          Showing <strong className="text-[#131722]">{filteredStocks.length}</strong> of{' '}
          <strong className="text-[#131722]">{stocks.length}</strong> active instruments
        </span>
        <span className="text-[11px] text-[#787B86]">
          Real-time BATS/IEX NBBO consolidation feed
        </span>
      </div>
    </div>
  );
};
