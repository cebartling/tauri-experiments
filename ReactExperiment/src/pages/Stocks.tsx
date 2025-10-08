import { useState } from 'react';
import { useStockQuote } from '../hooks/useStockQuote';
import { StockCard } from '../components/StockCard';

export default function Stocks() {
  const [symbol, setSymbol] = useState('');
  const [activeSymbol, setActiveSymbol] = useState<string | null>('IBM'); // Default to IBM for demo
  const { quote, error, isLoading } = useStockQuote(activeSymbol);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      setActiveSymbol(symbol.trim().toUpperCase());
    }
  };

  const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'IBM'];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Stock Prices</h1>

      <div className="mb-8">
        <form onSubmit={handleSubmit} className="mb-4">
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
      </div>

      <div className="min-h-[200px]">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading stock data...</div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Error loading stock data: {error.message}
            </p>
            {error.message.includes('frequency') && (
              <p className="mt-2 text-xs text-red-700">
                TwelveData free tier allows 800 requests per day. Please wait
                or upgrade your API key.
              </p>
            )}
          </div>
        )}

        {!isLoading && !error && quote && <StockCard quote={quote} />}
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-900">
          Getting Started with Your Own API Key
        </h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-blue-800">
          <li>
            Visit{' '}
            <a
              href="https://twelvedata.com/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              TwelveData
            </a>{' '}
            to get a free API key
          </li>
          <li>Copy your API key</li>
          <li>
            Add it to your <code className="rounded bg-blue-100 px-1">.env</code>{' '}
            file as <code className="rounded bg-blue-100 px-1">VITE_TWELVE_DATA_API_KEY</code>
          </li>
          <li>Restart the dev server</li>
        </ol>
        <p className="mt-2 text-xs text-blue-700">
          Free tier includes 800 API calls per day and 8 requests per minute.
        </p>
      </div>
    </div>
  );
}
