import useSWR from 'swr';
import {
  TimeSeriesResponseSchema,
  StockDataPoint,
  transformTimeSeries,
} from '../types/stock';

const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com/time_series';

interface UseStockTimeSeriesOptions {
  interval?: '1min' | '5min' | '15min' | '30min' | '1h';
  outputsize?: number;
  refreshInterval?: number;
}

async function fetchStockTimeSeries(
  symbol: string,
  interval: string = '1min',
  outputsize: number = 390
): Promise<StockDataPoint[]> {
  const url = `${BASE_URL}?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`;

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
  const validatedData = TimeSeriesResponseSchema.parse(data);

  // Transform and reverse to get chronological order (TwelveData returns newest first)
  return transformTimeSeries(validatedData).reverse();
}

export function useStockTimeSeries(
  symbol: string | null,
  options: UseStockTimeSeriesOptions = {}
) {
  const {
    interval = '1min',
    outputsize = 390,
    refreshInterval = 60000,
  } = options;

  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `timeseries-${symbol}-${interval}-${outputsize}` : null,
    () => fetchStockTimeSeries(symbol!, interval, outputsize),
    {
      refreshInterval,
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Prevent duplicate requests within 30 seconds
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}
