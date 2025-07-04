export interface CostAlert {
  type: 'cost-overrun';
  severity: 'critical' | 'high' | 'medium' | 'low';
  service: string;
  serviceKey: string;
  currentCost: number;
  threshold: number;
  overrun: number;
  percentage: number;
  period: 'daily' | 'monthly';
  timestamp: string;
  alertId: string;
}

export interface CostThreshold {
  service: string;
  serviceKey: string;
  threshold: number;
  enabled: boolean;
}

export interface CostAlertsData {
  alerts: CostAlert[];
  alertStats: {
    totalThresholds: number;
    activeCooldowns: number;
    cooldownPeriod: number;
    lastUpdate: string;
  };
  thresholds: Record<string, number>;
  timestamp: string;
}

export interface MetricsData {
  budget: any;
  health: any;
  tests: any;
  alerts: any;
  costAlerts: any;
  timestamp: string;
}