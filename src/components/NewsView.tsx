import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { NewsItem } from '../types/market';
import { Newspaper, TrendingUp, TrendingDown, Clock, Tag, ExternalLink } from 'lucide-react';

export const NewsView: React.FC = () => {
  const { news, setActiveSymbol, setCurrentView } = useMarket();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Wire Feeds' },
    { id: 'TECH', label: 'Tech & Silicon' },
    { id: 'MACRO', label: 'Macro & Fed' },
    { id: 'EARNINGS', label: 'Earnings & Guidance' },
    { id: 'SEC', label: 'SEC Form 8-K' },
  ];

  const filteredNews = useMemo(() => {
    if (selectedCategory === 'ALL') return news;
    return news.filter((n) => n.category === selectedCategory);
  }, [news, selectedCategory]);

  return (
    <div className="bg-white border border-[#E0E3EB] rounded-md shadow-2xs overflow-hidden">
      {/* News Header & Filter Bar */}
      <div className="p-4 border-b border-[#E0E3EB] flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#2962FF]" />
          <h2 className="text-sm font-bold text-[#131722] tracking-tight">
            Institutional Wire & Catalyst Radar
          </h2>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-[#131722] text-white shadow-2xs'
                  : 'bg-[#F0F3FA] text-[#131722] hover:bg-[#eaedfd]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="divide-y divide-[#E0E3EB]">
        {filteredNews.map((item: NewsItem) => {
          const isExpanded = expandedId === item.id;
          return (
            <article
              key={item.id}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="p-4 hover:bg-[#F8F9FD] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  {/* Metadata line: clean typography with subtle separators */}
                  <div className="flex items-center gap-2 text-xs text-[#6A6D78]">
                    <span className="font-semibold text-[#131722]">{item.source}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#787B86]" />
                      {item.time}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.sentiment === 'BULLISH'
                          ? 'bg-[#E6F6F3] text-[#089981]'
                          : item.sentiment === 'BEARISH'
                          ? 'bg-[#FDEBED] text-[#F23645]'
                          : 'bg-[#F0F3FA] text-[#787B86]'
                      }`}
                    >
                      {item.sentiment}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-sm font-bold text-[#131722] leading-snug hover:text-[#2962FF] transition-colors">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-[#6A6D78] leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>

                  {/* Related Symbols Chips */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-[#787B86] flex items-center gap-0.5">
                      <Tag className="w-3 h-3" /> Impact:
                    </span>
                    {item.relatedSymbols.map((sym) => (
                      <button
                        key={sym}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveSymbol(sym);
                          setCurrentView('chart');
                        }}
                        className="px-1.5 py-0.5 bg-[#eaedfd] hover:bg-[#2962FF] text-[#0049db] hover:text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                        title={`Open ${sym} chart`}
                      >
                        ${sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 self-center text-[#787B86] hover:text-[#2962FF]">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[#E0E3EB] bg-[#FAF8FF] p-3 rounded text-xs text-[#434656] space-y-2">
                  <p className="font-medium text-[#131722]">Analytical Takeaway & Market Context:</p>
                  <p>
                    Institutional desk monitors indicate heightened liquidity around{' '}
                    {item.relatedSymbols.join(', ')} options chains following this report. Order book
                    imbalances lean {item.sentiment.toLowerCase()} into the close.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSymbol(item.relatedSymbols[0]);
                        setCurrentView('chart');
                      }}
                      className="px-2.5 py-1 bg-[#2962FF] text-white font-semibold rounded text-[11px]"
                    >
                      Inspect ${item.relatedSymbols[0]} Terminal
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
