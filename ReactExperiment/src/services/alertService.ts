import { useAlertStore } from '../stores/alertStore';
import { AlertTrigger } from '../types/alert';

const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com/quote';
const POLL_INTERVAL = 30000; // 30 seconds

let pollingInterval: number | null = null;

interface QuoteResponse {
  symbol: string;
  close: string;
  status?: string;
  code?: number;
}

async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const url = `${BASE_URL}?symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch price for ${symbol}`);
      return null;
    }

    const data: QuoteResponse = await response.json();

    if (data.status === 'error' || data.code === 429) {
      console.error(`API error for ${symbol}:`, data);
      return null;
    }

    return parseFloat(data.close);
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

async function checkAlerts(): Promise<AlertTrigger[]> {
  const { alerts } = useAlertStore.getState();
  const triggeredAlerts: AlertTrigger[] = [];

  // Get unique symbols
  const symbols = [...new Set(alerts.map((alert) => alert.symbol))];

  // Fetch prices for all symbols
  const pricePromises = symbols.map(async (symbol) => {
    const price = await fetchPrice(symbol);
    return { symbol, price };
  });

  const prices = await Promise.all(pricePromises);
  const priceMap = new Map(
    prices.filter((p) => p.price !== null).map((p) => [p.symbol, p.price!])
  );

  // Check each alert
  for (const alert of alerts) {
    const currentPrice = priceMap.get(alert.symbol);
    if (currentPrice === undefined) continue;

    let shouldTrigger = false;

    if (alert.condition === 'above' && currentPrice > alert.threshold) {
      shouldTrigger = true;
    } else if (alert.condition === 'below' && currentPrice < alert.threshold) {
      shouldTrigger = true;
    }

    // Only trigger if condition is met and alert hasn't been triggered in the last 30 seconds
    // This prevents rapid re-triggering
    if (shouldTrigger) {
      const timeSinceLastTrigger = alert.lastTriggeredAt
        ? Date.now() - alert.lastTriggeredAt
        : Infinity;

      if (timeSinceLastTrigger > POLL_INTERVAL) {
        triggeredAlerts.push({
          alertId: alert.id,
          symbol: alert.symbol,
          currentPrice,
          threshold: alert.threshold,
          condition: alert.condition,
          triggeredAt: Date.now(),
        });
      }
    }
  }

  return triggeredAlerts;
}

export function startAlertPolling(
  onAlertTriggered: (trigger: AlertTrigger) => void
): void {
  if (pollingInterval !== null) {
    console.warn('Alert polling is already running');
    return;
  }

  const poll = async () => {
    try {
      const triggeredAlerts = await checkAlerts();

      for (const trigger of triggeredAlerts) {
        // Update the alert's last triggered timestamp
        useAlertStore.getState().updateAlertTrigger(trigger.alertId);

        // Highlight the alert
        useAlertStore.getState().highlightAlert(trigger.alertId);

        // Call the callback (which will show toast)
        onAlertTriggered(trigger);

        // Remove highlight after 10 seconds
        setTimeout(() => {
          useAlertStore.getState().unhighlightAlert(trigger.alertId);
        }, 10000);
      }
    } catch (error) {
      console.error('Error in alert polling:', error);
    }
  };

  // Run immediately on start
  poll();

  // Then run every 30 seconds
  pollingInterval = window.setInterval(poll, POLL_INTERVAL);
}

export function stopAlertPolling(): void {
  if (pollingInterval !== null) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}
