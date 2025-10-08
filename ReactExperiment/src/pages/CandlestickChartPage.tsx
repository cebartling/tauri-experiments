import { useState } from 'react';
import { useStockTimeSeries } from '../hooks/useStockTimeSeries';
import { CandlestickChart } from '../components/CandlestickChart';

export default function CandlestickChartPage() {
  const [symbol, setSymbol] = useState('');
  const [activeSymbol, setActiveSymbol] = useState<string | null>('AAPL');
  const [interval, setInterval] = useState<'1min' | '5min' | '15min' | '30min' | '1h'>('5min');

  const { data, error, isLoading } = useStockTimeSeries(activeSymbol, {
    interval,
    outputsize: interval === '1min' ? 390 : 78, // Full day for 1min, or 78 points for other intervals
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      setActiveSymbol(symbol.trim().toUpperCase());
    }
  };

  const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];
  const intervals: Array<'1min' | '5min' | '15min' | '30min' | '1h'> = ['1min', '5min', '15min', '30min', '1h'];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Candlestick Charts</h1>

      {/* Search and Controls */}
      <div className="mb-8 space-y-4">
        {/* Symbol Search */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter stock symbol (e.g., AAPL)"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </form>

        {/* Popular Symbols */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Popular:</span>
          {popularSymbols.map((sym) => (
            <button
              key={sym}
              onClick={() => setActiveSymbol(sym)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                activeSymbol === sym
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Interval Selection */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Interval:</span>
          {intervals.map((int) => (
            <button
              key={int}
              onClick={() => setInterval(int)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                interval === int
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {int}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Error loading chart data: {error.message}
            </p>
            {error.message.includes('frequency') && (
              <p className="mt-2 text-xs text-red-700">
                TwelveData free tier allows 800 requests per day and 8 requests
                per minute. Please wait or upgrade your API key.
              </p>
            )}
          </div>
        )}

        {!isLoading && !error && data && data.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeSymbol} - Intraday ({interval})
              </h2>
              <p className="text-sm text-gray-500">
                {data.length} data points • Last updated:{' '}
                {new Date(data[data.length - 1].datetime).toLocaleString()}
              </p>
            </div>
            <CandlestickChart data={data} symbol={activeSymbol || ''} />
          </div>
        )}

        {!isLoading && !error && data && data.length === 0 && (
          <div className="flex items-center justify-center py-32">
            <div className="text-gray-500">
              No data available for this symbol and interval
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">About Candlestick Charts</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-blue-800">
          <li>Green candles indicate price increase (close higher than open)</li>
          <li>Red candles indicate price decrease (close lower than open)</li>
          <li>The body shows the range between open and close prices</li>
          <li>The wicks (thin lines) show the high and low prices for the period</li>
          <li>Hover over any candle to see detailed OHLC (Open, High, Low, Close) data</li>
          <li>Data is automatically refreshed every 60 seconds</li>
        </ul>
      </div>
    </div>
  );
}
