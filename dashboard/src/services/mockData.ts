// Mock data service for ATT System Dashboard
import { 
  ApiHealthStatus, 
  BudgetMetrics, 
  TestResultMetrics, 
  AlertNotification, 
  SystemMetrics, 
  DashboardConfig,
  ATT_SERVICES,
  ServiceKey 
} from '../types/dashboard';

// Generate realistic API health data
export const generateApiHealthData = (): ApiHealthStatus[] => {
  return ATT_SERVICES.map(service => {
    const isHealthy = Math.random() > 0.15; // 85% healthy
    const successRate = isHealthy ? 
      85 + Math.random() * 15 : // 85-100% if healthy
      40 + Math.random() * 45;  // 40-85% if degraded
    
    return {
      service: service.name,
      endpoint: `api.${service.key}.com`,
      status: successRate > 95 ? 'healthy' : successRate > 75 ? 'degraded' : 'down',
      successRate: Math.round(successRate * 100) / 100,
      avgLatency: 200 + Math.random() * 800, // 200-1000ms
      lastCheck: new Date(Date.now() - Math.random() * 300000), // last 5 minutes
      dailyCalls: Math.floor(Math.random() * 5000) + 100,
      monthlyCalls: Math.floor(Math.random() * 150000) + 3000,
      errorCount: Math.floor(Math.random() * 50),
      lastError: successRate < 90 ? `HTTP ${Math.random() > 0.5 ? '429' : '500'} Error` : undefined
    };
  });
};

// Generate budget metrics with realistic API costs
export const generateBudgetData = (): BudgetMetrics[] => {
  const apiCosts: Record<string, number> = {
    openai_chat: 0.002,
    openai_vision: 0.01,
    replicate: 0.05,
    perplexity: 0.001,
    firecrawl: 0.005,
    scrapehero: 0.01,
    youtube: 0.0001,
    newsapi: 0.0002,
    google_keywords: 0.001,
    uspto: 0.002,
    eu_trademark: 0.002,
    textgears: 0.0005,
    media_modifier: 0.02,
    notion: 0.0001,
    slack: 0.0001
  };

  return ATT_SERVICES.map(service => {
    const costPerCall = apiCosts[service.key] || 0.001;
    const dailyCalls = Math.floor(Math.random() * 2000) + 100;
    const dailySpend = dailyCalls * costPerCall;
    const monthlySpend = dailySpend * (new Date().getDate()); // Current month progress
    const dailyBudget = service.category === 'AI' ? 50 : 10;
    const monthlyBudget = dailyBudget * 30;

    return {
      service: service.name,
      dailySpend: Math.round(dailySpend * 100) / 100,
      monthlySpend: Math.round(monthlySpend * 100) / 100,
      dailyBudget,
      monthlyBudget,
      costPerCall: Math.round(costPerCall * 10000) / 10000,
      projectedMonthlySpend: Math.round(dailySpend * 30 * 100) / 100,
      alertThreshold: 80,
      currency: 'USD'
    };
  });
};

// Generate test results over time
export const generateTestResults = (): TestResultMetrics[] => {
  const results: TestResultMetrics[] = [];
  const testTypes: Array<'unit' | 'mock' | 'real' | 'e2e'> = ['unit', 'mock', 'real', 'e2e'];
  
  // Generate last 30 days of test data
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    testTypes.forEach(type => {
      const total = type === 'unit' ? 150 : type === 'mock' ? 80 : type === 'real' ? 30 : 20;
      const passRate = 0.85 + Math.random() * 0.1; // 85-95% pass rate
      const passed = Math.floor(total * passRate);
      const failed = total - passed;
      
      results.push({
        timestamp: new Date(date),
        testType: type,
        passed,
        failed,
        total,
        duration: type === 'unit' ? 120 : type === 'mock' ? 300 : type === 'real' ? 900 : 1800,
        cost: type === 'real' ? Math.random() * 5 : type === 'e2e' ? Math.random() * 10 : 0,
        failedTests: failed > 0 ? [`${type}_test_${Math.floor(Math.random() * 10)}`] : undefined
      });
    });
  }
  
  return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate alert notifications
export const generateAlerts = (): AlertNotification[] => {
  const alertTypes: Array<'budget' | 'api_failure' | 'test_failure' | 'system'> = 
    ['budget', 'api_failure', 'test_failure', 'system'];
  
  const alerts: AlertNotification[] = [];
  
  // Generate recent alerts
  for (let i = 0; i < 15; i++) {
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const service = ATT_SERVICES[Math.floor(Math.random() * ATT_SERVICES.length)];
    const severity = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';
    
    let message = '';
    switch (type) {
      case 'budget':
        message = `Budget threshold exceeded for ${service.name} (85% of monthly limit)`;
        break;
      case 'api_failure':
        message = `${service.name} API experiencing high error rates (>10%)`;
        break;
      case 'test_failure':
        message = `Integration tests failing for ${service.name}`;
        break;
      case 'system':
        message = `System health degraded - multiple services affected`;
        break;
    }
    
    const timestamp = new Date(Date.now() - Math.random() * 86400000); // last 24 hours
    
    alerts.push({
      id: `alert_${i}_${Date.now()}`,
      timestamp,
      type,
      severity: severity as any,
      service: type !== 'system' ? service.name : undefined,
      message,
      details: { errorCode: Math.random() > 0.5 ? 'HTTP_429' : 'TIMEOUT' },
      acknowledged: Math.random() > 0.3, // 70% acknowledged
      resolvedAt: Math.random() > 0.5 ? new Date(timestamp.getTime() + 3600000) : undefined
    });
  }
  
  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate system metrics
export const generateSystemMetrics = (): SystemMetrics => {
  const apiHealth = generateApiHealthData();
  const budget = generateBudgetData();
  const tests = generateTestResults().slice(0, 10); // last 10 test runs
  
  return {
    totalApiCalls: apiHealth.reduce((sum, api) => sum + api.dailyCalls, 0),
    totalSpend: budget.reduce((sum, b) => sum + b.monthlySpend, 0),
    avgSystemHealth: apiHealth.reduce((sum, api) => sum + api.successRate, 0) / apiHealth.length,
    activeAlerts: generateAlerts().filter(a => !a.acknowledged).length,
    testPassRate: tests.reduce((sum, t) => sum + (t.passed / t.total), 0) / tests.length * 100,
    uptime: 99.2 + Math.random() * 0.7, // 99.2-99.9%
    lastDeployment: new Date(Date.now() - Math.random() * 604800000) // last week
  };
};

// Generate dashboard configuration
export const generateDashboardConfig = (): DashboardConfig => {
  const services: DashboardConfig['services'] = {};
  
  ATT_SERVICES.forEach(service => {
    services[service.key] = {
      enabled: true,
      priority: service.category === 'AI' ? 'high' : 
               service.category === 'Data' ? 'medium' : 'low',
      budgetLimit: service.category === 'AI' ? 100 : 20
    };
  });

  return {
    budgetThresholds: {
      warning: 80,
      critical: 95
    },
    refreshInterval: 30, // 30 seconds
    mockMode: true,
    alertsEnabled: true,
    services
  };
};

// Real-time data simulation
export class MockDataService {
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Array<(data: any) => void> = [];

  startRealTimeUpdates() {
    if (this.updateInterval) return;

    this.updateInterval = setInterval(() => {
      const updates = {
        apiHealth: generateApiHealthData(),
        budgetMetrics: generateBudgetData(),
        systemMetrics: generateSystemMetrics(),
        timestamp: new Date()
      };

      this.subscribers.forEach(callback => callback(updates));
    }, 5000); // Update every 5 seconds
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

  // Simulate API calls for testing
  async simulateApiCall(service: string): Promise<{ success: boolean; latency: number; cost: number }> {
    const latency = 200 + Math.random() * 800;
    await new Promise(resolve => setTimeout(resolve, latency));
    
    return {
      success: Math.random() > 0.1, // 90% success rate
      latency,
      cost: Math.random() * 0.01
    };
  }
}

export const mockDataService = new MockDataService();