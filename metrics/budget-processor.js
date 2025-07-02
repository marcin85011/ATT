/**
 * Budget Metrics Processor
 * Processes cost-tracking files to generate budget metrics
 */

const fs = require('fs').promises;
const path = require('path');

// ATT Services mapping (from dashboard types)
const ATT_SERVICES = [
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
];

// Service budget mapping
const SERVICE_BUDGETS = {
  'AI': { daily: 50, monthly: 1500 },
  'Storage': { daily: 5, monthly: 150 },
  'Data': { daily: 20, monthly: 600 },
  'Research': { daily: 10, monthly: 300 },
  'Quality': { daily: 5, monthly: 150 },
  'Design': { daily: 15, monthly: 450 },
  'Backup': { daily: 2, monthly: 60 },
  'Notifications': { daily: 1, monthly: 30 }
};

async function readCostTrackingJsonl() {
  try {
    const jsonlPath = path.join(__dirname, '../cost-tracking.jsonl');
    const content = await fs.readFile(jsonlPath, 'utf8');
    
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  } catch (error) {
    console.warn('Could not read cost-tracking.jsonl:', error.message);
    return [];
  }
}

async function readCostTrackingJson() {
  try {
    const jsonPath = path.join(__dirname, '../cost-tracking.json');
    const content = await fs.readFile(jsonPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Could not read cost-tracking.json:', error.message);
    return {
      daily: 0,
      monthly: 0,
      daily_breakdown: {},
      per_api: {},
      test_runs: [],
      budgets: { daily: 10.00, per_test: 0.50, monthly: 200.00 }
    };
  }
}

function mapOperationToService(operation) {
  // Map operation names to services
  const operationMap = {
    'spell-check': 'textgears',
    'contrast': 'openai_vision',
    'readability': 'openai_chat',
    'mockup': 'media_modifier',
    'openai': 'openai_chat',
    'replicate': 'replicate',
    'perplexity': 'perplexity',
    'firecrawl': 'firecrawl',
    'scrapehero': 'scrapehero',
    'youtube': 'youtube',
    'newsapi': 'newsapi',
    'google': 'google_keywords',
    'uspto': 'uspto',
    'eu_trademark': 'eu_trademark',
    'textgears': 'textgears',
    'grammarly': 'textgears',
    'notion': 'notion',
    'slack': 'slack'
  };

  for (const [key, service] of Object.entries(operationMap)) {
    if (operation.toLowerCase().includes(key)) {
      return ATT_SERVICES.find(s => s.key === service);
    }
  }
  
  return { name: 'Unknown Service', key: 'unknown', category: 'Other' };
}

async function getBudgetMetrics() {
  try {
    const jsonlEntries = await readCostTrackingJsonl();
    const jsonData = await readCostTrackingJson();
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Process JSONL entries for detailed breakdown
    const serviceMetrics = {};
    
    jsonlEntries.forEach(entry => {
      const service = mapOperationToService(entry.operation || '');
      const serviceKey = service.key;
      
      if (!serviceMetrics[serviceKey]) {
        serviceMetrics[serviceKey] = {
          service: service.name,
          dailySpend: 0,
          monthlySpend: 0,
          totalCalls: 0,
          dailyCalls: 0,
          monthlyCalls: 0,
          category: service.category
        };
      }
      
      serviceMetrics[serviceKey].totalCalls++;
      serviceMetrics[serviceKey].monthlyCalls++;
      serviceMetrics[serviceKey].monthlySpend += entry.cost || 0;
      
      if (entry.date === today) {
        serviceMetrics[serviceKey].dailySpend += entry.cost || 0;
        serviceMetrics[serviceKey].dailyCalls++;
      }
    });
    
    // Generate BudgetMetrics array matching TypeScript interface
    return ATT_SERVICES.map(service => {
      const metrics = serviceMetrics[service.key] || {
        service: service.name,
        dailySpend: 0,
        monthlySpend: 0,
        totalCalls: 0,
        dailyCalls: 0,
        monthlyCalls: 0,
        category: service.category
      };
      
      const budget = SERVICE_BUDGETS[service.category] || { daily: 10, monthly: 300 };
      const costPerCall = metrics.totalCalls > 0 ? metrics.monthlySpend / metrics.totalCalls : 0;
      
      return {
        service: service.name,
        dailySpend: parseFloat(metrics.dailySpend.toFixed(4)),
        monthlySpend: parseFloat(metrics.monthlySpend.toFixed(4)),
        dailyBudget: budget.daily,
        monthlyBudget: budget.monthly,
        costPerCall: parseFloat(costPerCall.toFixed(6)),
        projectedMonthlySpend: parseFloat((metrics.dailySpend * 30).toFixed(4)),
        alertThreshold: 80,
        currency: 'USD'
      };
    });
    
  } catch (error) {
    console.error('Error processing budget metrics:', error);
    
    // Return fallback data
    return ATT_SERVICES.map(service => ({
      service: service.name,
      dailySpend: 0,
      monthlySpend: 0,
      dailyBudget: 10,
      monthlyBudget: 300,
      costPerCall: 0,
      projectedMonthlySpend: 0,
      alertThreshold: 80,
      currency: 'USD'
    }));
  }
}

module.exports = {
  getBudgetMetrics
};