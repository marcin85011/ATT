#!/usr/bin/env node

/**
 * ATT System Cost Monitor Script
 * Tracks and reports API costs across all agents
 */

require('dotenv').config();

async function costMonitor() {
  console.log('💰 ATT System Cost Monitor - Daily Tracking\n');
  
  const dailyBudget = parseFloat(process.env.DAILY_BUDGET_LIMIT) || 5.00;
  const alertThreshold = parseFloat(process.env.COST_ALERT_THRESHOLD) || 4.00;
  
  // Simulate cost tracking (in production, this would read from cost tracker)
  const costs = {
    timestamp: new Date().toISOString(),
    daily_budget: dailyBudget,
    alert_threshold: alertThreshold,
    agents: {
      'agent_05_firecrawl': {
        api: 'Firecrawl',
        requests: 0,
        cost_per_request: 0.002,
        total_cost: 0.00
      },
      'agent_06_scrapehero': {
        api: 'ScrapeHero',
        requests: 0,
        cost_per_request: 0.005,
        total_cost: 0.00
      },
      'agent_07_perplexity': {
        api: 'Perplexity',
        requests: 0,
        cost_per_request: 0.001,
        total_cost: 0.00
      },
      'agent_09_trademark': {
        api: 'USPTO/EUIPO',
        requests: 0,
        cost_per_request: 0.00,
        total_cost: 0.00
      },
      'agent_10_replicate': {
        api: 'Replicate',
        requests: 0,
        cost_per_request: 0.005,
        total_cost: 0.00
      },
      'agent_11_openai': {
        api: 'OpenAI Vision',
        requests: 0,
        cost_per_request: 0.01,
        total_cost: 0.00
      }
    }
  };

  // Calculate totals
  const totalCost = Object.values(costs.agents).reduce((sum, agent) => sum + agent.total_cost, 0);
  const totalRequests = Object.values(costs.agents).reduce((sum, agent) => sum + agent.requests, 0);
  const remainingBudget = dailyBudget - totalCost;
  const budgetUsedPercent = (totalCost / dailyBudget) * 100;

  console.log(`📊 Daily Cost Summary:`);
  console.log(`Total Spent: $${totalCost.toFixed(4)}`);
  console.log(`Budget Remaining: $${remainingBudget.toFixed(4)}`);
  console.log(`Budget Used: ${budgetUsedPercent.toFixed(1)}%`);
  console.log(`Total API Requests: ${totalRequests}\n`);

  // Agent breakdown
  console.log(`📋 Cost Breakdown by Agent:`);
  Object.entries(costs.agents).forEach(([agentId, agent]) => {
    const efficiency = agent.requests > 0 ? (agent.total_cost / agent.requests).toFixed(4) : 'N/A';
    console.log(`${agentId.padEnd(20)} | ${agent.api.padEnd(12)} | Requests: ${String(agent.requests).padStart(4)} | Cost: $${agent.total_cost.toFixed(4)} | Avg: $${efficiency}`);
  });

  // Projections
  const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;
  const projectedDailyRequests = totalRequests * (24 / new Date().getHours() || 1);
  const projectedDailyCost = projectedDailyRequests * avgCostPerRequest;

  console.log(`\n📈 Daily Projections:`);
  console.log(`Projected Requests: ${Math.round(projectedDailyRequests)}`);
  console.log(`Projected Cost: $${projectedDailyCost.toFixed(2)}`);
  console.log(`Projected Budget Usage: ${(projectedDailyCost / dailyBudget * 100).toFixed(1)}%`);

  // Alerts
  console.log(`\n🚨 Alerts:`);
  if (totalCost >= dailyBudget) {
    console.log(`❌ BUDGET EXCEEDED! Spent $${totalCost.toFixed(4)} of $${dailyBudget}`);
  } else if (totalCost >= alertThreshold) {
    console.log(`⚠️ BUDGET WARNING! Approaching limit ($${totalCost.toFixed(4)} of $${dailyBudget})`);
  } else if (projectedDailyCost >= dailyBudget) {
    console.log(`⚠️ PROJECTION WARNING! On track to exceed budget (projected: $${projectedDailyCost.toFixed(2)})`);
  } else {
    console.log(`✅ Budget on track`);
  }

  // Recommendations
  console.log(`\n💡 Recommendations:`);
  if (budgetUsedPercent > 80) {
    console.log(`- Reduce API calls or increase budget`);
    console.log(`- Focus on highest-value operations only`);
  } else if (budgetUsedPercent < 20 && new Date().getHours() > 12) {
    console.log(`- Budget utilization low, consider scaling up operations`);
    console.log(`- Optimize for more niche processing`);
  } else {
    console.log(`- Current usage is optimal`);
  }

  // Most expensive operations
  const sortedAgents = Object.entries(costs.agents)
    .sort((a, b) => b[1].total_cost - a[1].total_cost)
    .filter(([_, agent]) => agent.total_cost > 0);

  if (sortedAgents.length > 0) {
    console.log(`\n💸 Top Cost Centers:`);
    sortedAgents.slice(0, 3).forEach(([agentId, agent], index) => {
      console.log(`${index + 1}. ${agent.api}: $${agent.total_cost.toFixed(4)} (${agent.requests} requests)`);
    });
  }

  // Write results to file
  const results = {
    ...costs,
    summary: {
      total_cost: totalCost,
      remaining_budget: remainingBudget,
      budget_used_percent: budgetUsedPercent,
      total_requests: totalRequests,
      projected_daily_cost: projectedDailyCost,
      alert_level: totalCost >= dailyBudget ? 'critical' : 
                   totalCost >= alertThreshold ? 'warning' : 'normal'
    }
  };

  const fs = require('fs').promises;
  await fs.writeFile('./cost-monitor-results.json', JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to cost-monitor-results.json`);

  return results.summary.alert_level === 'critical' ? 1 : 0;
}

if (require.main === module) {
  costMonitor().then(process.exit).catch(err => {
    console.error('❌ Cost monitor failed:', err);
    process.exit(1);
  });
}

module.exports = { costMonitor };