import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  symbol: string;
  currentPrice: number;
  threshold: number;
  condition: 'above' | 'below';
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  symbol,
  currentPrice,
  threshold,
  condition,
  onClose,
  duration = 10000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-amber-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md animate-slide-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="font-semibold">Price Alert Triggered</h3>
          </div>
          <p className="text-sm mb-2">{message}</p>
          <div className="text-xs opacity-90">
            <div>
              <strong>{symbol}</strong> is now <strong>${currentPrice.toFixed(2)}</strong>
            </div>
            <div>
              Alert: {condition} ${threshold.toFixed(2)}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
          aria-label="Close notification"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
