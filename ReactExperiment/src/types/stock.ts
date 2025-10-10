import { z } from 'zod';

// Zod schema for TwelveData Quote response
export const TwelveDataQuoteSchema = z.object({
  symbol: z.string(),
  name: z.string().optional(),
  exchange: z.string().optional(),
  currency: z.string().optional(),
  datetime: z.string().optional(),
  timestamp: z.number().optional(),
  open: z.string().optional(),
  high: z.string().optional(),
  low: z.string().optional(),
  close: z.string(),
  volume: z.string().optional(),
  previous_close: z.string(),
  change: z.string(),
  percent_change: z.string(),
});

// Inferred TypeScript type from Zod schema
export type TwelveDataQuoteResponse = z.infer<typeof TwelveDataQuoteSchema>;

// Transformed stock quote for easier use in components
export interface StockQuote {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
}

// Transform TwelveData response to our internal format
export function transformStockQuote(data: TwelveDataQuoteResponse): StockQuote {
  return {
    symbol: data.symbol,
    price: parseFloat(data.close),
    previousClose: parseFloat(data.previous_close),
    change: parseFloat(data.change),
    changePercent: parseFloat(data.percent_change),
  };
}

// Zod schema for TwelveData Time Series response
export const TimeSeriesValueSchema = z.object({
  datetime: z.string(),
  open: z.string(),
  high: z.string(),
  low: z.string(),
  close: z.string(),
  volume: z.string().optional(),
});

export const TimeSeriesMetaSchema = z.object({
  symbol: z.string(),
  interval: z.string(),
  currency: z.string().optional(),
  exchange_timezone: z.string().optional(),
  exchange: z.string().optional(),
  type: z.string().optional(),
});

export const TimeSeriesResponseSchema = z.object({
  meta: TimeSeriesMetaSchema,
  values: z.array(TimeSeriesValueSchema),
  status: z.string().optional(),
});

export type TimeSeriesResponse = z.infer<typeof TimeSeriesResponseSchema>;

// Transformed time series data point
export interface StockDataPoint {
  datetime: Date;
  price: number;
  open: number;
  high: number;
  low: number;
  volume?: number;
}

// Transform time series response to internal format
export function transformTimeSeries(data: TimeSeriesResponse): StockDataPoint[] {
  return data.values.map((value) => ({
    datetime: new Date(value.datetime),
    price: parseFloat(value.close),
    open: parseFloat(value.open),
    high: parseFloat(value.high),
    low: parseFloat(value.low),
    volume: value.volume ? parseFloat(value.volume) : undefined,
  }));
}

// Zod schema for Alpha Vantage Market Movers response
export const AlphaVantageStockSchema = z.object({
  ticker: z.string(),
  price: z.string(),
  change_amount: z.string(),
  change_percentage: z.string(),
  volume: z.string(),
});

export const AlphaVantageMarketMoversResponseSchema = z.object({
  metadata: z.string().optional(),
  last_updated: z.string().optional(),
  top_gainers: z.array(AlphaVantageStockSchema),
  top_losers: z.array(AlphaVantageStockSchema),
  most_actively_traded: z.array(AlphaVantageStockSchema).optional(),
});

export type AlphaVantageMarketMoversResponse = z.infer<typeof AlphaVantageMarketMoversResponseSchema>;

// Transformed market mover for easier use in components
export interface MarketMover {
  symbol: string;
  name?: string;
  exchange?: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
}

// Transform Alpha Vantage stock to internal format
export function transformAlphaVantageStock(stock: z.infer<typeof AlphaVantageStockSchema>): MarketMover {
  return {
    symbol: stock.ticker,
    price: parseFloat(stock.price),
    volume: parseFloat(stock.volume),
    change: parseFloat(stock.change_amount),
    changePercent: parseFloat(stock.change_percentage.replace('%', '')),
  };
}

// Transform Alpha Vantage market movers response to internal format
export function transformAlphaVantageMarketMovers(data: AlphaVantageMarketMoversResponse): {
  gainers: MarketMover[];
  losers: MarketMover[];
} {
  return {
    gainers: data.top_gainers.map(transformAlphaVantageStock),
    losers: data.top_losers.map(transformAlphaVantageStock),
  };
}
