// ATT System Dashboard Data Models
export interface ApiHealthStatus {
  service: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  successRate: number; // 0-100
  avgLatency: number; // milliseconds
  lastCheck: Date;
  dailyCalls: number;
  monthlyCalls: number;
  errorCount: number;
  lastError?: string;
}

export interface BudgetMetrics {
  service: string;
  dailySpend: number;
  monthlySpend: number;
  dailyBudget: number;
  monthlyBudget: number;
  costPerCall: number;
  projectedMonthlySpend: number;
  alertThreshold: number; // percentage
  currency: string;
}

export interface TestResultMetrics {
  timestamp: Date;
  testType: 'unit' | 'mock' | 'real' | 'e2e';
  passed: number;
  failed: number;
  total: number;
  duration: number; // seconds
  cost: number;
  failedTests?: string[];
}

export interface AlertNotification {
  id: string;
  timestamp: Date;
  type: 'budget' | 'api_failure' | 'test_failure' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  service?: string;
  message: string;
  details?: any;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface SystemMetrics {
  totalApiCalls: number;
  totalSpend: number;
  avgSystemHealth: number; // 0-100
  activeAlerts: number;
  testPassRate: number; // 0-100
  uptime: number; // percentage
  lastDeployment: Date;
}

export interface DashboardConfig {
  budgetThresholds: {
    warning: number; // percentage
    critical: number; // percentage
  };
  refreshInterval: number; // seconds
  mockMode: boolean;
  alertsEnabled: boolean;
  services: {
    [key: string]: {
      enabled: boolean;
      priority: 'low' | 'medium' | 'high';
      budgetLimit: number;
    };
  };
}

export interface DashboardState {
  apiHealth: ApiHealthStatus[];
  budgetMetrics: BudgetMetrics[];
  testResults: TestResultMetrics[];
  alerts: AlertNotification[];
  systemMetrics: SystemMetrics;
  config: DashboardConfig;
  isLoading: boolean;
  lastUpdated: Date;
}

// ATT System Services Configuration
export const ATT_SERVICES = [
  { name: 'OpenAI Chat', key: 'openai_chat', category: 'AI' },
  { name: 'OpenAI Vision', key: 'openai_vision', category: 'AI' },
  { name: 'Replicate Imagen', key: 'replicate', category: 'AI' },
  { name: 'Perplexity', key: 'perplexity', category: 'AI' },
  { name: 'Google Sheets', key: 'google_sheets', category: 'Storage' },
  { name: 'Google Drive', key: 'google_drive', category: 'Storage' },
  { name: 'Firecrawl', key: 'firecrawl', category: 'Data' },
  { name: 'ScrapeHero', key: 'scrapehero', category: 'Data' },
  { name: 'YouTube API', key: 'youtube', category: 'Data' },
  { name: 'NewsAPI', key: 'newsapi', category: 'Data' },
  { name: 'Google Keywords', key: 'google_keywords', category: 'Research' },
  { name: 'USPTO Trademark', key: 'uspto', category: 'Research' },
  { name: 'EU Trademark', key: 'eu_trademark', category: 'Research' },
  { name: 'TextGears', key: 'textgears', category: 'Quality' },
  { name: 'Media Modifier', key: 'media_modifier', category: 'Design' },
  { name: 'Notion', key: 'notion', category: 'Backup' },
  { name: 'Slack', key: 'slack', category: 'Notifications' }
] as const;

export type ServiceKey = typeof ATT_SERVICES[number]['key'];
export type ServiceCategory = typeof ATT_SERVICES[number]['category'];