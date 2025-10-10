import useSWR from 'swr';
import {
  AlphaVantageMarketMoversResponseSchema,
  MarketMover,
  transformAlphaVantageMarketMovers,
} from '../types/stock';

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

interface UseMarketMoversOptions {
  refreshInterval?: number;
  limit?: number;
}

interface MarketMoversData {
  gainers: MarketMover[];
  losers: MarketMover[];
}

async function fetchMarketMovers(limit: number): Promise<MarketMoversData> {
  const url = `${BASE_URL}?function=TOP_GAINERS_LOSERS&apikey=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Check for API error messages
  if (data.Note) {
    throw new Error('API call frequency exceeded. Please try again later.');
  }

  if (data.Information) {
    throw new Error(data.Information);
  }

  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }

  // Validate the response with Zod
  const validatedData = AlphaVantageMarketMoversResponseSchema.parse(data);

  // Transform and limit the results
  const transformed = transformAlphaVantageMarketMovers(validatedData);

  return {
    gainers: transformed.gainers.slice(0, limit),
    losers: transformed.losers.slice(0, limit),
  };
}

export function useMarketMovers(options: UseMarketMoversOptions = {}) {
  const { refreshInterval = 300000, limit = 10 } = options; // Default: refresh every 5 minutes, get 10 stocks

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(
    `alpha-vantage-market-movers-${limit}`,
    () => fetchMarketMovers(limit),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Prevent duplicate requests within 60 seconds
    }
  );

  return {
    gainers: data?.gainers,
    losers: data?.losers,
    error,
    isLoading,
    refetch: mutate,
  };
}
