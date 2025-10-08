import { useState, useEffect } from 'react';
import { useAlertStore } from '../stores/alertStore';
import { AlertCondition } from '../types/alert';

export default function Alerts() {
  const { alerts, highlightedAlerts, isLoaded, addAlert, removeAlert, loadAlerts } = useAlertStore();
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [threshold, setThreshold] = useState('');

  useEffect(() => {
    if (!isLoaded) {
      loadAlerts();
    }
  }, [isLoaded, loadAlerts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim() || !threshold) {
      return;
    }

    const thresholdNumber = parseFloat(threshold);
    if (isNaN(thresholdNumber) || thresholdNumber <= 0) {
      return;
    }

    addAlert(symbol.trim().toUpperCase(), condition, thresholdNumber);

    // Reset form
    setSymbol('');
    setThreshold('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Price Alerts</h1>

      {/* Add Alert Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Alert</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Symbol
              </label>
              <input
                type="text"
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as AlertCondition)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="above">Price Above</option>
                <option value="below">Price Below</option>
              </select>
            </div>

            <div>
              <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-1">
                Threshold Price ($)
              </label>
              <input
                type="number"
                id="threshold"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g., 150.00"
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Add Alert
          </button>
        </form>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>

          {!isLoaded ? (
            <p className="text-gray-500">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="text-gray-500">No alerts configured. Create one above to get started.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 transition-all ${
                    highlightedAlerts.has(alert.id)
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-gray-900">{alert.symbol}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.condition === 'above'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {alert.condition === 'above' ? '↑' : '↓'} {alert.condition} ${alert.threshold.toFixed(2)}
                        </span>
                        {highlightedAlerts.has(alert.id) && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            TRIGGERED
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Created: {formatDate(alert.createdAt)}</div>
                        {alert.lastTriggeredAt && (
                          <div className="text-amber-600 font-medium">
                            Last triggered: {formatDate(alert.lastTriggeredAt)}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                      aria-label="Delete alert"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
