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
