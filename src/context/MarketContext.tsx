import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { StockQuote, IndexData, Position, OrderRecord, Timeframe, ViewTab, NewsItem } from '../types/market';
import { INITIAL_INDICES, INITIAL_STOCKS, INITIAL_POSITIONS, INITIAL_ORDERS, INITIAL_NEWS } from '../data/mockMarketData';

interface MarketContextType {
  stocks: StockQuote[];
  indices: IndexData[];
  activeSymbol: string;
  setActiveSymbol: (sym: string) => void;
  activeStock: StockQuote;
  activeTimeframe: Timeframe;
  setActiveTimeframe: (tf: Timeframe) => void;
  currentView: ViewTab;
  setCurrentView: (view: ViewTab) => void;
  watchlist: string[];
  toggleWatchlist: (sym: string) => void;
  isWatchlisted: (sym: string) => boolean;
  isLiveStreaming: boolean;
  setIsLiveStreaming: (live: boolean) => void;
  positions: Position[];
  orders: OrderRecord[];
  cashBalance: number;
  portfolioValue: number;
  totalUnrealizedPl: number;
  executeTrade: (params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP';
    shares: number;
    price: number;
  }) => { success: boolean; message: string };
  closePosition: (symbol: string) => void;
  resetPortfolio: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  detailModalSymbol: string | null;
  setDetailModalSymbol: (sym: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  news: NewsItem[];
  lastTickSymbols: Record<string, 'up' | 'down'>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<StockQuote[]>(INITIAL_STOCKS);
  const [indices, setIndices] = useState<IndexData[]>(INITIAL_INDICES);
  const [activeSymbol, setActiveSymbol] = useState<string>('NVDA');
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1D');
  const [currentView, setCurrentView] = useState<ViewTab>('overview');
  const [watchlist, setWatchlist] = useState<string[]>(['NVDA', 'AAPL', 'MSFT', 'TSLA', 'PLTR', 'SPY']);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [cashBalance, setCashBalance] = useState<number>(65336.25);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [detailModalSymbol, setDetailModalSymbol] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [news] = useState<NewsItem[]>(INITIAL_NEWS);
  const [lastTickSymbols, setLastTickSymbols] = useState<Record<string, 'up' | 'down'>>({});

  const activeStock = useMemo(() => {
    return stocks.find((s) => s.symbol === activeSymbol) || stocks[0];
  }, [stocks, activeSymbol]);

  const toggleWatchlist = useCallback((sym: string) => {
    setWatchlist((prev) =>
      prev.includes(sym) ? prev.filter((item) => item !== sym) : [...prev, sym]
    );
  }, []);

  const isWatchlisted = useCallback(
    (sym: string) => watchlist.includes(sym),
    [watchlist]
  );

  // Live price tick simulation
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // Pick 2 random stocks to tick
      const randomIndices = [
        Math.floor(Math.random() * stocks.length),
        Math.floor(Math.random() * stocks.length),
      ];

      const newTicks: Record<string, 'up' | 'down'> = {};

      setStocks((prevStocks) =>
        prevStocks.map((stock, idx) => {
          if (!randomIndices.includes(idx)) return stock;

          const isUp = Math.random() > 0.48;
          const deltaPct = (Math.random() * 0.003 + 0.0005) * (isUp ? 1 : -1);
          const newPrice = Number((stock.price * (1 + deltaPct)).toFixed(2));
          const newChange = Number((newPrice - stock.prevClose).toFixed(2));
          const newChangePercent = Number(((newChange / stock.prevClose) * 100).toFixed(2));
          const newHigh = Math.max(stock.high, newPrice);
          const newLow = Math.min(stock.low, newPrice);
          const newVolume = stock.volume + Math.floor(Math.random() * 2500);

          newTicks[stock.symbol] = isUp ? 'up' : 'down';

          const updatedSpark = [...stock.sparkline.slice(1), newPrice];

          return {
            ...stock,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            high: newHigh,
            low: newLow,
            volume: newVolume,
            sparkline: updatedSpark,
          };
        })
      );

      // Micro update one index
      if (Math.random() > 0.4) {
        setIndices((prev) =>
          prev.map((idx) => {
            if (Math.random() > 0.3) return idx;
            const delta = (Math.random() - 0.48) * (idx.value * 0.0006);
            const val = Number((idx.value + delta).toFixed(2));
            const change = Number((idx.change + delta).toFixed(2));
            const changePercent = Number(((change / (val - change)) * 100).toFixed(2));
            return {
              ...idx,
              value: val,
              change,
              changePercent,
              sparkline: [...idx.sparkline.slice(1), val],
            };
          })
        );
      }

      setLastTickSymbols((prev) => ({ ...prev, ...newTicks }));

      // Clear tick flash after 600ms
      setTimeout(() => {
        setLastTickSymbols({});
      }, 600);
    }, 2400);

    return () => clearInterval(interval);
  }, [isLiveStreaming, stocks.length]);

  // Sync positions when current prices change
  useEffect(() => {
    setPositions((prev) =>
      prev.map((pos) => {
        const live = stocks.find((s) => s.symbol === pos.symbol);
        if (!live) return pos;
        const marketValue = Number((pos.shares * live.price).toFixed(2));
        const unrealizedPl = Number((marketValue - pos.shares * pos.avgPrice).toFixed(2));
        const unrealizedPlPercent = Number(
          ((unrealizedPl / (pos.shares * pos.avgPrice)) * 100).toFixed(2)
        );
        const dayPl = Number((pos.shares * live.change).toFixed(2));
        return {
          ...pos,
          currentPrice: live.price,
          marketValue,
          unrealizedPl,
          unrealizedPlPercent,
          dayPl,
        };
      })
    );
  }, [stocks]);

  const totalPositionsValue = useMemo(() => {
    return positions.reduce((acc, p) => acc + p.marketValue, 0);
  }, [positions]);

  const portfolioValue = useMemo(() => {
    return Number((cashBalance + totalPositionsValue).toFixed(2));
  }, [cashBalance, totalPositionsValue]);

  const totalUnrealizedPl = useMemo(() => {
    return Number(positions.reduce((acc, p) => acc + p.unrealizedPl, 0).toFixed(2));
  }, [positions]);

  // Execute Trade function
  const executeTrade = useCallback(
    ({
      symbol,
      side,
      type,
      shares,
      price,
    }: {
      symbol: string;
      side: 'BUY' | 'SELL';
      type: 'MARKET' | 'LIMIT' | 'STOP';
      shares: number;
      price: number;
    }) => {
      const stock = stocks.find((s) => s.symbol === symbol);
      const executionPrice = type === 'MARKET' ? (stock ? stock.price : price) : price;
      const totalCost = executionPrice * shares;

      if (side === 'BUY') {
        if (totalCost > cashBalance) {
          return {
            success: false,
            message: `Insufficient buying power. Required: $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}, Available: $${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          };
        }

        // Deduct cash
        setCashBalance((prev) => Number((prev - totalCost).toFixed(2)));

        // Update positions
        setPositions((prev) => {
          const existing = prev.find((p) => p.symbol === symbol);
          if (existing) {
            const newShares = existing.shares + shares;
            const newTotalCost = existing.shares * existing.avgPrice + totalCost;
            const newAvgPrice = Number((newTotalCost / newShares).toFixed(2));
            const marketValue = Number((newShares * executionPrice).toFixed(2));
            const unrealizedPl = Number((marketValue - newTotalCost).toFixed(2));
            const unrealizedPlPercent = Number(((unrealizedPl / newTotalCost) * 100).toFixed(2));

            return prev.map((p) =>
              p.symbol === symbol
                ? {
                    ...p,
                    shares: newShares,
                    avgPrice: newAvgPrice,
                    currentPrice: executionPrice,
                    marketValue,
                    unrealizedPl,
                    unrealizedPlPercent,
                  }
                : p
            );
          } else {
            return [
              ...prev,
              {
                symbol,
                shares,
                avgPrice: executionPrice,
                currentPrice: executionPrice,
                marketValue: Number(totalCost.toFixed(2)),
                unrealizedPl: 0,
                unrealizedPlPercent: 0,
                dayPl: 0,
              },
            ];
          }
        });
      } else {
        // SELL
        const existing = positions.find((p) => p.symbol === symbol);
        if (!existing || existing.shares < shares) {
          return {
            success: false,
            message: `Insufficient shares to sell. You currently hold ${existing ? existing.shares : 0} shares of ${symbol}.`,
          };
        }

        // Credit cash
        setCashBalance((prev) => Number((prev + totalCost).toFixed(2)));

        // Update positions
        setPositions((prev) => {
          if (existing.shares === shares) {
            return prev.filter((p) => p.symbol !== symbol);
          } else {
            const remainingShares = existing.shares - shares;
            const marketValue = Number((remainingShares * executionPrice).toFixed(2));
            const unrealizedPl = Number((marketValue - remainingShares * existing.avgPrice).toFixed(2));
            const unrealizedPlPercent = Number(
              ((unrealizedPl / (remainingShares * existing.avgPrice)) * 100).toFixed(2)
            );
            return prev.map((p) =>
              p.symbol === symbol
                ? {
                    ...p,
                    shares: remainingShares,
                    marketValue,
                    unrealizedPl,
                    unrealizedPlPercent,
                  }
                : p
            );
          }
        });
      }

      // Add to orders log
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const newOrder: OrderRecord = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp,
        symbol,
        side,
        type,
        shares,
        price: executionPrice,
        total: Number(totalCost.toFixed(2)),
        status: 'FILLED',
      };

      setOrders((prev) => [newOrder, ...prev]);

      return {
        success: true,
        message: `Successfully executed ${side} ${shares} shares of ${symbol} @ $${executionPrice.toFixed(2)}`,
      };
    },
    [cashBalance, positions, stocks]
  );

  const closePosition = useCallback(
    (symbol: string) => {
      const pos = positions.find((p) => p.symbol === symbol);
      if (!pos) return;
      executeTrade({
        symbol,
        side: 'SELL',
        type: 'MARKET',
        shares: pos.shares,
        price: pos.currentPrice,
      });
    },
    [positions, executeTrade]
  );

  const resetPortfolio = useCallback(() => {
    setPositions(INITIAL_POSITIONS);
    setOrders(INITIAL_ORDERS);
    setCashBalance(65336.25);
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <MarketContext.Provider
      value={{
        stocks,
        indices,
        activeSymbol,
        setActiveSymbol,
        activeStock,
        activeTimeframe,
        setActiveTimeframe,
        currentView,
        setCurrentView,
        watchlist,
        toggleWatchlist,
        isWatchlisted,
        isLiveStreaming,
        setIsLiveStreaming,
        positions,
        orders,
        cashBalance,
        portfolioValue,
        totalUnrealizedPl,
        executeTrade,
        closePosition,
        resetPortfolio,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        detailModalSymbol,
        setDetailModalSymbol,
        searchQuery,
        setSearchQuery,
        news,
        lastTickSymbols,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within a MarketProvider');
  return ctx;
};
