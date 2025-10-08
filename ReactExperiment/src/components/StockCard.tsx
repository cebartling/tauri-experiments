import { StockQuote } from '../types/stock';

interface StockCardProps {
  quote: StockQuote;
}

export function StockCard({ quote }: StockCardProps) {
  const isPositive = quote.change >= 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{quote.symbol}</h3>
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900">
          ${quote.price.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1 rounded px-2 py-1 text-sm font-medium ${
            isPositive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(quote.change).toFixed(2)}</span>
          <span>({Math.abs(quote.changePercent).toFixed(2)}%)</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Previous Close: ${quote.previousClose.toFixed(2)}
      </div>
    </div>
  );
}
