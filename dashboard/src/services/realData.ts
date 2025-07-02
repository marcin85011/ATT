// Real data service for ATT System Dashboard
// Fetches live metrics from http://localhost:4000/api

// Re-export types for convenience (tree-shaking optimization)
export type {
  ApiHealthStatus,
  BudgetMetrics,
  TestResultMetrics,
  AlertNotification,
  SystemMetrics,
  DashboardConfig,
  DashboardState,
  ServiceKey,
  ServiceCategory
} from '../types/dashboard';

import {
  ApiHealthStatus,
  BudgetMetrics,
  TestResultMetrics,
  AlertNotification,
  SystemMetrics,
  DashboardConfig
} from '../types/dashboard';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// API Error class for better error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        endpoint
      );
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0,
      endpoint
    );
  }
}

// Real data fetchers matching mock service interface
export const fetchApiHealthData = (): Promise<ApiHealthStatus[]> => {
  return apiFetch<ApiHealthStatus[]>('/health');
};

export const fetchBudgetData = (): Promise<BudgetMetrics[]> => {
  return apiFetch<BudgetMetrics[]>('/budget');
};

export const fetchTestResults = (): Promise<TestResultMetrics[]> => {
  return apiFetch<TestResultMetrics[]>('/tests');
};

export const fetchAlerts = (): Promise<AlertNotification[]> => {
  return apiFetch<AlertNotification[]>('/alerts');
};

export const fetchApiStatus = () => {
  return apiFetch<{
    status: string;
    timestamp: string;
    version: string;
    uptime: number;
    cache: {
      lastUpdated: string;
      entriesLoaded: {
        budget: number;
        health: number;
        tests: number;
        alerts: number;
      };
    };
  }>('/status');
};

// Generate system metrics from individual components
export const generateSystemMetrics = async (): Promise<SystemMetrics> => {
  try {
    const [apiHealth, budgetMetrics, alerts] = await Promise.all([
      fetchApiHealthData(),
      fetchBudgetData(),
      fetchAlerts()
    ]);

    return {
      totalApiCalls: apiHealth.reduce((sum, api) => sum + api.dailyCalls, 0),
      totalSpend: budgetMetrics.reduce((sum, budget) => sum + budget.monthlySpend, 0),
      avgSystemHealth: apiHealth.reduce((sum, api) => sum + api.successRate, 0) / apiHealth.length,
      activeAlerts: alerts.filter(alert => !alert.acknowledged).length,
      testPassRate: 95, // Will be calculated from test results in future
      uptime: 99.5,
      lastDeployment: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    };
  } catch (error) {
    // Fallback system metrics
    return {
      totalApiCalls: 0,
      totalSpend: 0,
      avgSystemHealth: 0,
      activeAlerts: 0,
      testPassRate: 0,
      uptime: 0,
      lastDeployment: new Date()
    };
  }
};

// Generate dashboard config (static for now)
export const generateDashboardConfig = (): DashboardConfig => {
  return {
    budgetThresholds: {
      warning: 80,
      critical: 95
    },
    refreshInterval: 30, // 30 seconds
    mockMode: false, // Real data mode
    alertsEnabled: true,
    services: {
      openai_chat: { enabled: true, priority: 'high', budgetLimit: 100 },
      openai_vision: { enabled: true, priority: 'high', budgetLimit: 100 },
      replicate: { enabled: true, priority: 'high', budgetLimit: 100 },
      perplexity: { enabled: true, priority: 'high', budgetLimit: 100 },
      google_sheets: { enabled: true, priority: 'medium', budgetLimit: 20 },
      google_drive: { enabled: true, priority: 'medium', budgetLimit: 20 },
      firecrawl: { enabled: true, priority: 'medium', budgetLimit: 20 },
      scrapehero: { enabled: true, priority: 'medium', budgetLimit: 20 },
      youtube: { enabled: true, priority: 'low', budgetLimit: 20 },
      newsapi: { enabled: true, priority: 'low', budgetLimit: 20 },
      google_keywords: { enabled: true, priority: 'medium', budgetLimit: 20 },
      uspto: { enabled: true, priority: 'medium', budgetLimit: 20 },
      eu_trademark: { enabled: true, priority: 'medium', budgetLimit: 20 },
      textgears: { enabled: true, priority: 'low', budgetLimit: 20 },
      media_modifier: { enabled: true, priority: 'medium', budgetLimit: 20 },
      notion: { enabled: true, priority: 'low', budgetLimit: 20 },
      slack: { enabled: true, priority: 'low', budgetLimit: 20 }
    }
  };
};

// Real-time data service class to match mock service interface
export class RealDataService {
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: any) => void> = [];
  private pollingInterval: number = 30000; // 30 seconds

  startRealTimeUpdates() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(async () => {
      try {
        const updates = {
          apiHealth: await fetchApiHealthData(),
          budgetMetrics: await fetchBudgetData(),
          systemMetrics: await generateSystemMetrics(),
          timestamp: new Date()
        };

        this.subscribers.forEach(callback => {
          try {
            callback(updates);
          } catch (error) {
            console.warn('Error in real-time update callback:', error);
          }
        });
      } catch (error) {
        console.warn('Error fetching real-time updates:', error);
      }
    }, this.pollingInterval);
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  setPollingInterval(ms: number) {
    this.pollingInterval = ms;
    if (this.updateInterval) {
      this.stopRealTimeUpdates();
      this.startRealTimeUpdates();
    }
  }
}

export const realDataService = new RealDataService();