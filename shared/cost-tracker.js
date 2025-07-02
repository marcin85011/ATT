/**
 * ATT System Cost Tracker - Shared Module
 * Tracks API costs across all agents with budget monitoring
 */

const fs = require('fs').promises;
const path = require('path');

async function trackCost(operation, cost, description) {
  try {
    const costEntry = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      operation,
      cost: parseFloat(cost),
      description,
      type: 'api_call',
      agent_id: operation.includes('-') ? operation.split('-').slice(-1)[0] : 'unknown'
    };

    console.log(`💰 Cost tracked: ${operation} - $${cost} - ${description}`);
    
    // Enhanced file logging with JSONL format for better performance
    const costFile = path.join(__dirname, '../cost-tracking.jsonl');
    const logLine = JSON.stringify(costEntry) + '\n';
    
    await fs.appendFile(costFile, logLine);
    
    // Also maintain the JSON file for compatibility
    const jsonFile = path.join(__dirname, '../cost-tracking.json');
    let existingCosts = [];
    
    try {
      const data = await fs.readFile(jsonFile, 'utf8');
      existingCosts = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, start fresh
    }
    
    existingCosts.push(costEntry);
    
    // Keep only last 1000 entries in JSON file to prevent bloat
    if (existingCosts.length > 1000) {
      existingCosts = existingCosts.slice(-1000);
    }
    
    await fs.writeFile(jsonFile, JSON.stringify(existingCosts, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Cost tracking failed:', error.message);
    return false;
  }
}

async function getCostSummary() {
  try {
    const dailyBudget = parseFloat(process.env.DAILY_BUDGET_LIMIT) || 5.00;
    const qcCostLimit = parseFloat(process.env.QC_COST_LIMIT) || 0.012;
    
    // Read cost data from JSON file
    const jsonFile = path.join(__dirname, '../cost-tracking.json');
    let costs = [];
    
    try {
      const data = await fs.readFile(jsonFile, 'utf8');
      costs = JSON.parse(data);
    } catch (error) {
      // No cost data yet
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayCosts = costs.filter(c => c.date === today);
    
    const dailyTotal = todayCosts.reduce((sum, cost) => sum + cost.cost, 0);
    const qcCosts = todayCosts.filter(c => 
      ['28', '29', '30', '31'].includes(c.agent_id)
    ).reduce((sum, cost) => sum + cost.cost, 0);
    
    return {
      daily_total: Math.round(dailyTotal * 10000) / 10000, // Round to 4 decimal places
      remaining_budget: Math.max(0, dailyBudget - dailyTotal),
      qc_cost_limit: qcCostLimit,
      qc_costs_today: Math.round(qcCosts * 10000) / 10000,
      qc_remaining: Math.max(0, qcCostLimit - qcCosts),
      budget_percentage_used: (dailyTotal / dailyBudget) * 100,
      total_operations_today: todayCosts.length
    };
  } catch (error) {
    console.error('❌ Cost summary failed:', error.message);
    const dailyBudget = parseFloat(process.env.DAILY_BUDGET_LIMIT) || 5.00;
    return { 
      daily_total: 0, 
      remaining_budget: dailyBudget,
      qc_cost_limit: parseFloat(process.env.QC_COST_LIMIT) || 0.012,
      error: error.message
    };
  }
}

async function checkBudgetAlert(currentCost) {
  const threshold = parseFloat(process.env.COST_ALERT_THRESHOLD) || 4.00;
  const dailyBudget = parseFloat(process.env.DAILY_BUDGET_LIMIT) || 5.00;
  
  return {
    alert_triggered: currentCost >= threshold,
    threshold_percentage: (currentCost / dailyBudget) * 100,
    approaching_limit: currentCost >= (dailyBudget * 0.8), // 80% of budget
    cost_per_hour: await calculateHourlyCostRate()
  };
}

async function getDailySummary(targetDate = null) {
  try {
    const date = targetDate || new Date().toISOString().split('T')[0];
    
    // Read cost data from JSON file
    const jsonFile = path.join(__dirname, '../cost-tracking.json');
    let costs = [];
    
    try {
      const data = await fs.readFile(jsonFile, 'utf8');
      costs = JSON.parse(data);
    } catch (error) {
      // No cost data yet
    }
    
    const dayCosts = costs.filter(c => c.date === date);
    
    // Group by agent
    const byAgent = {};
    const byOperation = {};
    
    dayCosts.forEach(cost => {
      // By agent
      if (!byAgent[cost.agent_id]) {
        byAgent[cost.agent_id] = { total: 0, operations: 0, descriptions: [] };
      }
      byAgent[cost.agent_id].total += cost.cost;
      byAgent[cost.agent_id].operations += 1;
      byAgent[cost.agent_id].descriptions.push(cost.description);
      
      // By operation type
      if (!byOperation[cost.operation]) {
        byOperation[cost.operation] = { total: 0, count: 0 };
      }
      byOperation[cost.operation].total += cost.cost;
      byOperation[cost.operation].count += 1;
    });
    
    const totalCost = dayCosts.reduce((sum, cost) => sum + cost.cost, 0);
    const qcAgents = ['28', '29', '30', '31'];
    const qcCosts = dayCosts.filter(c => qcAgents.includes(c.agent_id));
    const qcTotal = qcCosts.reduce((sum, cost) => sum + cost.cost, 0);
    
    // Calculate hourly distribution
    const hourlyDistribution = {};
    dayCosts.forEach(cost => {
      const hour = new Date(cost.timestamp).getHours();
      if (!hourlyDistribution[hour]) hourlyDistribution[hour] = 0;
      hourlyDistribution[hour] += cost.cost;
    });
    
    return {
      date,
      total_cost: Math.round(totalCost * 10000) / 10000,
      total_operations: dayCosts.length,
      qc_cost: Math.round(qcTotal * 10000) / 10000,
      qc_operations: qcCosts.length,
      by_agent: Object.fromEntries(
        Object.entries(byAgent).map(([agent, data]) => [
          agent, 
          {
            total: Math.round(data.total * 10000) / 10000,
            operations: data.operations,
            avg_cost: Math.round((data.total / data.operations) * 10000) / 10000
          }
        ])
      ),
      by_operation: Object.fromEntries(
        Object.entries(byOperation).map(([op, data]) => [
          op,
          {
            total: Math.round(data.total * 10000) / 10000,
            count: data.count,
            avg_cost: Math.round((data.total / data.count) * 10000) / 10000
          }
        ])
      ),
      hourly_distribution: hourlyDistribution,
      peak_hour: Object.entries(hourlyDistribution).reduce((a, b) => 
        hourlyDistribution[a[0]] > hourlyDistribution[b[0]] ? a : b, [0, 0])[0],
      budget_status: {
        daily_budget: parseFloat(process.env.DAILY_BUDGET_LIMIT) || 5.00,
        percentage_used: (totalCost / (parseFloat(process.env.DAILY_BUDGET_LIMIT) || 5.00)) * 100,
        qc_limit: parseFloat(process.env.QC_COST_LIMIT) || 0.012,
        qc_percentage_used: (qcTotal / (parseFloat(process.env.QC_COST_LIMIT) || 0.012)) * 100
      }
    };
  } catch (error) {
    console.error('❌ Daily summary failed:', error.message);
    return {
      date: targetDate || new Date().toISOString().split('T')[0],
      error: error.message,
      total_cost: 0,
      total_operations: 0
    };
  }
}

async function calculateHourlyCostRate() {
  try {
    const summary = await getCostSummary();
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hoursElapsed = (now - startOfDay) / (1000 * 60 * 60);
    
    return hoursElapsed > 0 ? summary.daily_total / hoursElapsed : 0;
  } catch (error) {
    return 0;
  }
}

async function checkDailyBudget() {
  try {
    const dailyBudget = parseFloat(process.env.DAILY_BUDGET_LIMIT) || 5.00;
    
    // Read cost data from JSON file
    const jsonFile = path.join(__dirname, '../cost-tracking.json');
    let costs = [];
    
    try {
      const data = await fs.readFile(jsonFile, 'utf8');
      costs = JSON.parse(data);
    } catch (error) {
      // No cost data yet, budget is available
      return {
        withinBudget: true,
        remaining: dailyBudget,
        dailySpend: 0,
        budgetLimit: dailyBudget
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayCosts = costs.filter(c => c.date === today);
    const dailySpend = todayCosts.reduce((sum, cost) => sum + cost.cost, 0);
    
    const remaining = Math.max(0, dailyBudget - dailySpend);
    const withinBudget = dailySpend < dailyBudget;
    
    return {
      withinBudget,
      remaining: Math.round(remaining * 10000) / 10000, // Round to 4 decimal places
      dailySpend: Math.round(dailySpend * 10000) / 10000,
      budgetLimit: dailyBudget
    };
  } catch (error) {
    console.error('❌ Budget check failed:', error.message);
    // On error, assume budget is available to avoid blocking workflows
    const dailyBudget = parseFloat(process.env.DAILY_BUDGET_LIMIT) || 5.00;
    return {
      withinBudget: true,
      remaining: dailyBudget,
      dailySpend: 0,
      budgetLimit: dailyBudget,
      error: error.message
    };
  }
}

module.exports = { 
  trackCost, 
  getCostSummary, 
  checkBudgetAlert, 
  getDailySummary,
  calculateHourlyCostRate,
  checkDailyBudget 
};