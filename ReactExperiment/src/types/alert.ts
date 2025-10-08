export type AlertCondition = 'above' | 'below';

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  threshold: number;
  createdAt: number;
  lastTriggeredAt?: number;
  isHighlighted?: boolean;
}

export interface AlertTrigger {
  alertId: string;
  symbol: string;
  currentPrice: number;
  threshold: number;
  condition: AlertCondition;
  triggeredAt: number;
}
