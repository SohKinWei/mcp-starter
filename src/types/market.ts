export type Timeframe = '1D' | '5D' | '1M' | '6M' | '1Y' | 'ALL';

export type ChartType = 'candle' | 'area';

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  avgVolume: number;
  marketCap: number; // in billions
  peRatio: number;
  dividendYield: number;
  week52High: number;
  week52Low: number;
  beta: number;
  sparkline: number[];
  candles: CandleData[];
  description: string;
}

export interface IndexData {
  symbol: string;
  name: string;
  emblem: string;
  emblemColor: string;
  badgeLabel: string;
  value: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

export interface OrderBookRow {
  venue: string;
  size: number;
  price: number;
  total: number;
}

export interface TimeSaleRow {
  time: string;
  price: number;
  size: number;
  type: 'buy' | 'sell';
}

export interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPl: number;
  unrealizedPlPercent: number;
  dayPl: number;
}

export interface OrderRecord {
  id: string;
  timestamp: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP';
  shares: number;
  price: number;
  total: number;
  status: 'FILLED' | 'CANCELLED';
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  relatedSymbols: string[];
  category: 'EARNINGS' | 'MACRO' | 'SEC' | 'ANALYSIS' | 'TECH';
  url?: string;
}

export type ViewTab = 'overview' | 'chart' | 'screener' | 'depth' | 'portfolio' | 'news';
