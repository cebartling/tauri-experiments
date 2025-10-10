import { useMarketMovers } from '../hooks/useMarketMovers';
import { MarketMoversHeatmap } from '../components/MarketMoversHeatmap';

export function MarketMovers() {
  const { gainers, losers, error, isLoading } = useMarketMovers({
    refreshInterval: 300000, // Refresh every 5 minutes
    limit: 10,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700">Loading market data...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching top gainers and losers</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">Error loading market data</div>
          <div className="text-sm text-gray-600 mt-2">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-gray-600 mt-2">
          Real-time view of the top 10 gainers and top 10 losers in the stock market.
          Data refreshes every 5 minutes.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <MarketMoversHeatmap gainers={gainers} losers={losers} />
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Data provided by Alpha Vantage API</p>
        <p className="mt-1">Hover over cells for detailed information</p>
      </div>
    </div>
  );
}
