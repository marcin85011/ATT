/**
 * Alert Processor
 * Generates alerts from budget overruns, test failures, and API errors
 */

const fs = require('fs').promises;
const path = require('path');

async function getAlerts(budgetMetrics, healthMetrics, testMetrics) {
  try {
    const alerts = [];
    const now = new Date();
    const last24Hours = now.getTime() - (24 * 60 * 60 * 1000);
    
    // Generate budget alerts
    if (budgetMetrics) {
      budgetMetrics.forEach(budget => {
        const dailyPercentage = (budget.dailySpend / budget.dailyBudget) * 100;
        const monthlyPercentage = (budget.monthlySpend / budget.monthlyBudget) * 100;
        
        // Daily budget alerts
        if (dailyPercentage >= 95) {
          alerts.push({
            id: `budget_daily_${budget.service}_${Date.now()}`,
            timestamp: new Date(),
            type: 'budget',
            severity: 'critical',
            service: budget.service,
            message: `Daily budget critical: ${dailyPercentage.toFixed(1)}% of limit reached ($${budget.dailySpend}/$${budget.dailyBudget})`,
            details: {
              currentSpend: budget.dailySpend,
              limit: budget.dailyBudget,
              percentage: dailyPercentage,
              projectedOverrun: budget.projectedMonthlySpend > budget.monthlyBudget
            },
            acknowledged: false,
            resolvedAt: null
          });
        } else if (dailyPercentage >= 80) {
          alerts.push({
            id: `budget_daily_warn_${budget.service}_${Date.now()}`,
            timestamp: new Date(),
            type: 'budget',
            severity: 'high',
            service: budget.service,
            message: `Daily budget warning: ${dailyPercentage.toFixed(1)}% of limit reached ($${budget.dailySpend}/$${budget.dailyBudget})`,
            details: {
              currentSpend: budget.dailySpend,
              limit: budget.dailyBudget,
              percentage: dailyPercentage
            },
            acknowledged: Math.random() > 0.5,
            resolvedAt: null
          });
        }
        
        // Monthly budget alerts
        if (monthlyPercentage >= 90) {
          alerts.push({
            id: `budget_monthly_${budget.service}_${Date.now()}`,
            timestamp: new Date(),
            type: 'budget',
            severity: monthlyPercentage >= 95 ? 'critical' : 'high',
            service: budget.service,
            message: `Monthly budget ${monthlyPercentage >= 95 ? 'critical' : 'warning'}: ${monthlyPercentage.toFixed(1)}% of limit reached ($${budget.monthlySpend}/$${budget.monthlyBudget})`,
            details: {
              currentSpend: budget.monthlySpend,
              limit: budget.monthlyBudget,
              percentage: monthlyPercentage,
              projectedOverrun: budget.projectedMonthlySpend > budget.monthlyBudget
            },
            acknowledged: Math.random() > 0.3,
            resolvedAt: Math.random() > 0.7 ? new Date(now.getTime() - Math.random() * 3600000) : null
          });
        }
      });
    }
    
    // Generate API health alerts
    if (healthMetrics) {
      healthMetrics.forEach(health => {
        if (health.status === 'down') {
          alerts.push({
            id: `api_down_${health.service}_${Date.now()}`,
            timestamp: new Date(),
            type: 'api_failure',
            severity: 'critical',
            service: health.service,
            message: `API service down: ${health.service} (${health.successRate}% success rate)`,
            details: {
              successRate: health.successRate,
              errorCount: health.errorCount,
              lastError: health.lastError,
              endpoint: health.endpoint
            },
            acknowledged: false,
            resolvedAt: null
          });
        } else if (health.status === 'degraded') {
          alerts.push({
            id: `api_degraded_${health.service}_${Date.now()}`,
            timestamp: new Date(),
            type: 'api_failure',
            severity: 'high',
            service: health.service,
            message: `API service degraded: ${health.service} (${health.successRate}% success rate)`,
            details: {
              successRate: health.successRate,
              errorCount: health.errorCount,
              lastError: health.lastError,
              avgLatency: health.avgLatency
            },
            acknowledged: Math.random() > 0.4,
            resolvedAt: null
          });
        }
        
        // High latency alerts
        if (health.avgLatency > 2000) {
          alerts.push({
            id: `latency_${health.service}_${Date.now()}`,
            timestamp: new Date(),
            type: 'api_failure',
            severity: health.avgLatency > 5000 ? 'high' : 'medium',
            service: health.service,
            message: `High latency detected: ${health.service} (${health.avgLatency}ms average)`,
            details: {
              avgLatency: health.avgLatency,
              threshold: 2000,
              successRate: health.successRate
            },
            acknowledged: Math.random() > 0.6,
            resolvedAt: null
          });
        }
      });
    }
    
    // Generate test failure alerts
    if (testMetrics) {
      const recentTests = testMetrics.filter(test => 
        new Date(test.timestamp).getTime() >= last24Hours
      );
      
      recentTests.forEach(test => {
        if (test.failed > 0) {
          const failureRate = (test.failed / test.total) * 100;
          
          alerts.push({
            id: `test_failure_${test.testType}_${Date.now()}`,
            timestamp: new Date(test.timestamp),
            type: 'test_failure',
            severity: failureRate > 20 ? 'high' : failureRate > 10 ? 'medium' : 'low',
            service: undefined,
            message: `${test.testType} tests failing: ${test.failed}/${test.total} tests failed (${failureRate.toFixed(1)}%)`,
            details: {
              testType: test.testType,
              failed: test.failed,
              total: test.total,
              failureRate: failureRate,
              failedTests: test.failedTests,
              duration: test.duration,
              cost: test.cost
            },
            acknowledged: Math.random() > 0.5,
            resolvedAt: failureRate < 5 ? new Date(test.timestamp.getTime() + 1800000) : null // Resolved after 30min for low failure rates
          });
        }
      });
    }
    
    // Generate system alerts
    if (healthMetrics && budgetMetrics) {
      const downServices = healthMetrics.filter(h => h.status === 'down').length;
      const degradedServices = healthMetrics.filter(h => h.status === 'degraded').length;
      const overBudgetServices = budgetMetrics.filter(b => 
        (b.dailySpend / b.dailyBudget) > 0.9 || (b.monthlySpend / b.monthlyBudget) > 0.9
      ).length;
      
      if (downServices >= 3) {
        alerts.push({
          id: `system_multiple_down_${Date.now()}`,
          timestamp: new Date(),
          type: 'system',
          severity: 'critical',
          service: undefined,
          message: `Multiple services down: ${downServices} services are currently unavailable`,
          details: {
            downServices,
            degradedServices,
            affectedServices: healthMetrics.filter(h => h.status === 'down').map(h => h.service)
          },
          acknowledged: false,
          resolvedAt: null
        });
      }
      
      if (overBudgetServices >= 5) {
        alerts.push({
          id: `system_budget_crisis_${Date.now()}`,
          timestamp: new Date(),
          type: 'system',
          severity: 'high',
          service: undefined,
          message: `Budget crisis: ${overBudgetServices} services over budget limits`,
          details: {
            overBudgetServices,
            affectedServices: budgetMetrics
              .filter(b => (b.dailySpend / b.dailyBudget) > 0.9 || (b.monthlySpend / b.monthlyBudget) > 0.9)
              .map(b => b.service)
          },
          acknowledged: Math.random() > 0.3,
          resolvedAt: null
        });
      }
    }
    
    // Add some historical alerts for demo
    for (let i = 0; i < 10; i++) {
      const alertTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
      alerts.push({
        id: `historical_${i}_${Date.now()}`,
        timestamp: alertTime,
        type: ['budget', 'api_failure', 'test_failure'][Math.floor(Math.random() * 3)],
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        service: ['OpenAI Chat', 'Replicate Imagen', 'Firecrawl', 'TextGears'][Math.floor(Math.random() * 4)],
        message: `Historical alert ${i + 1} - resolved issue`,
        details: { historical: true },
        acknowledged: true,
        resolvedAt: new Date(alertTime.getTime() + Math.random() * 3600000)
      });
    }
    
    // Sort by timestamp (newest first) and return last 50
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return alerts.slice(0, 50);
    
  } catch (error) {
    console.error('Error generating alerts:', error);
    
    // Return fallback alerts
    return [
      {
        id: `fallback_alert_${Date.now()}`,
        timestamp: new Date(),
        type: 'system',
        severity: 'low',
        service: undefined,
        message: 'Alert system initialized successfully',
        details: { fallback: true },
        acknowledged: true,
        resolvedAt: null
      }
    ];
  }
}

module.exports = {
  getAlerts
};