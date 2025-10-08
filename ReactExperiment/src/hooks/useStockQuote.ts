import useSWR from 'swr';
import {
  TwelveDataQuoteSchema,
  StockQuote,
  transformStockQuote,
} from '../types/stock';

const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com/quote';

interface UseStockQuoteOptions {
  refreshInterval?: number;
}

async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const url = `${BASE_URL}?symbol=${symbol}&apikey=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Check for API error messages
  if (data.status === 'error') {
    throw new Error(data.message || `Invalid symbol: ${symbol}`);
  }

  if (data.code === 429) {
    throw new Error('API call frequency exceeded. Please try again later.');
  }

  // Validate the response with Zod
  const validatedData = TwelveDataQuoteSchema.parse(data);

  return transformStockQuote(validatedData);
}

export function useStockQuote(
  symbol: string | null,
  options: UseStockQuoteOptions = {}
) {
  const { refreshInterval = 60000 } = options; // Default: refresh every 60 seconds

  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `stock-${symbol}` : null,
    () => fetchStockQuote(symbol!),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Prevent duplicate requests within 10 seconds
    }
  );

  return {
    quote: data,
    error,
    isLoading,
    refetch: mutate,
  };
}
