/**
 * Test Utilities for MBA Intelligence Engine
 * Cost tracking, budget controls, and helper functions
 */

const fs = require('fs').promises;
const path = require('path');

class TestCostTracker {
  constructor() {
    this.costs = {};
    this.budgets = {
      daily: parseFloat(process.env.TEST_DAILY_BUDGET) || 10.00,
      per_test: parseFloat(process.env.TEST_PER_TEST_BUDGET) || 0.50,
      monthly: parseFloat(process.env.TEST_MONTHLY_BUDGET) || 200.00
    };
    this.loadCostData();
  }

  async loadCostData() {
    try {
      const costFile = path.join(__dirname, '../fixtures/cost-tracking.json');
      const data = await fs.readFile(costFile, 'utf8');
      this.costs = JSON.parse(data);
    } catch (error) {
      this.costs = {
        daily: 0,
        monthly: 0,
        per_api: {},
        test_runs: []
      };
    }
  }

  async saveCostData() {
    try {
      const costFile = path.join(__dirname, '../fixtures/cost-tracking.json');
      await fs.writeFile(costFile, JSON.stringify(this.costs, null, 2));
    } catch (error) {
      console.error('Failed to save cost data:', error);
    }
  }

  trackAPICall(apiName, estimatedCost, actualTokens = 0) {
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize daily tracking
    if (!this.costs.daily_breakdown) {
      this.costs.daily_breakdown = {};
    }
    if (!this.costs.daily_breakdown[today]) {
      this.costs.daily_breakdown[today] = 0;
    }
    
    // Track cost
    this.costs.daily_breakdown[today] += estimatedCost;
    this.costs.daily = this.costs.daily_breakdown[today];
    
    // Track per API
    if (!this.costs.per_api[apiName]) {
      this.costs.per_api[apiName] = { calls: 0, total_cost: 0, tokens: 0 };
    }
    this.costs.per_api[apiName].calls += 1;
    this.costs.per_api[apiName].total_cost += estimatedCost;
    this.costs.per_api[apiName].tokens += actualTokens;
    
    // Log test run
    this.costs.test_runs.push({
      timestamp: new Date().toISOString(),
      api: apiName,
      cost: estimatedCost,
      tokens: actualTokens,
      test_type: process.env.JEST_TEST_TYPE || 'unit'
    });
    
    // Keep only last 1000 test runs
    if (this.costs.test_runs.length > 1000) {
      this.costs.test_runs = this.costs.test_runs.slice(-1000);
    }
    
    this.saveCostData();
    return this.checkBudgetLimits(estimatedCost);
  }

  checkBudgetLimits(requestCost) {
    const warnings = [];
    
    // Daily budget check
    if (this.costs.daily + requestCost > this.budgets.daily) {
      warnings.push(`Daily budget exceeded: $${(this.costs.daily + requestCost).toFixed(4)} > $${this.budgets.daily}`);
    }
    
    // Per-test budget check
    if (requestCost > this.budgets.per_test) {
      warnings.push(`Per-test budget exceeded: $${requestCost.toFixed(4)} > $${this.budgets.per_test}`);
    }
    
    // Monthly budget check (estimate)
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlySpend = Object.entries(this.costs.daily_breakdown || {})
      .filter(([date]) => date.startsWith(currentMonth))
      .reduce((sum, [, cost]) => sum + cost, 0);
    
    if (monthlySpend + requestCost > this.budgets.monthly) {
      warnings.push(`Monthly budget exceeded: $${(monthlySpend + requestCost).toFixed(2)} > $${this.budgets.monthly}`);
    }
    
    return {
      within_budget: warnings.length === 0,
      warnings,
      current_daily: this.costs.daily,
      current_monthly: monthlySpend,
      request_cost: requestCost
    };
  }

  getCostSummary() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    const monthlySpend = Object.entries(this.costs.daily_breakdown || {})
      .filter(([date]) => date.startsWith(currentMonth))
      .reduce((sum, [, cost]) => sum + cost, 0);
    
    return {
      daily_spend: this.costs.daily || 0,
      monthly_spend: monthlySpend,
      budgets: this.budgets,
      api_breakdown: this.costs.per_api || {},
      total_test_runs: this.costs.test_runs?.length || 0,
      last_updated: new Date().toISOString()
    };
  }

  resetDailyTracking() {
    const today = new Date().toISOString().split('T')[0];
    if (this.costs.daily_breakdown) {
      this.costs.daily_breakdown[today] = 0;
    }
    this.costs.daily = 0;
    this.saveCostData();
  }
}

class APITestHelpers {
  static calculateAPICosts(apiName, tokens = 0, imageCount = 0, requestType = 'standard') {
    const costs = {
      openai: {
        'gpt-4o': 0.03 / 1000, // $0.03 per 1K tokens
        'gpt-4o-vision': 0.03 / 1000 // Same as GPT-4o
      },
      replicate: {
        'imagen-4-ultra': 0.08, // $0.08 per image
        'base_cost': 0.001 // Base processing cost
      },
      perplexity: {
        'llama-3.1-sonar': 0.001 / 1000 // $0.001 per 1K tokens
      },
      scrapehero: {
        'product_scrape': 0.01 // $0.01 per product
      },
      youtube: {
        'search': 0, // Free tier
        'quota_unit': 100 // 100 quota units per search
      },
      newsapi: {
        'headlines': 0, // Free tier up to 1000 requests/day
        'everything': 0.0001 // $0.0001 per request on paid
      },
      google_keywords: {
        'volume_check': 0.002 // $0.002 per keyword
      },
      firecrawl: {
        'scrape': 0.003 // $0.003 per page
      },
      textgears: {
        'spelling_check': 0.0001 // $0.0001 per check
      },
      trademark_apis: {
        'search': 0.005 // $0.005 per search
      },
      media_modifier: {
        'mockup_generation': 0.02 // $0.02 per mockup
      },
      notion: {
        'api_call': 0 // Free tier
      }
    };

    switch (apiName) {
      case 'openai':
        return tokens * costs.openai['gpt-4o'];
      case 'openai_vision':
        return tokens * costs.openai['gpt-4o-vision'];
      case 'replicate':
        return costs.replicate['base_cost'] + (imageCount * costs.replicate['imagen-4-ultra']);
      case 'perplexity':
        return tokens * costs.perplexity['llama-3.1-sonar'];
      case 'scrapehero':
        return costs.scrapehero.product_scrape;
      case 'youtube':
        return costs.youtube.search;
      case 'newsapi':
        return costs.newsapi.headlines;
      case 'google_keywords':
        return costs.google_keywords.volume_check;
      case 'firecrawl':
        return costs.firecrawl.scrape;
      case 'textgears':
        return costs.textgears.spelling_check;
      case 'trademark_lookup':
      case 'eu_trademarks':
        return costs.trademark_apis.search;
      case 'media_modifier':
        return costs.media_modifier.mockup_generation;
      case 'notion':
        return costs.notion.api_call;
      default:
        return 0.001; // Default small cost
    }
  }

  static async waitForCondition(condition, maxWaitMs = 30000, intervalMs = 1000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    throw new Error(`Condition not met within ${maxWaitMs}ms`);
  }

  static async retryAPICall(apiCall, maxRetries = 3, baseDelayMs = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain error types
        if (error.message?.includes('budget') || error.message?.includes('quota')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  static validateAPIResponse(response, apiName) {
    const validations = {
      openai: (resp) => resp.choices && resp.usage && resp.usage.total_tokens > 0,
      replicate: (resp) => resp.id && resp.status,
      scrapehero: (resp) => resp.asin || resp.title,
      youtube: (resp) => resp.items && Array.isArray(resp.items),
      newsapi: (resp) => resp.status === 'ok' && resp.articles,
      perplexity: (resp) => resp.choices && resp.choices[0]?.message,
      google_keywords: (resp) => resp.data && resp.data.keyword,
      firecrawl: (resp) => resp.success && resp.data,
      textgears: (resp) => resp.response,
      trademark_lookup: (resp) => typeof resp.total === 'number',
      eu_trademarks: (resp) => typeof resp.total === 'number',
      media_modifier: (resp) => resp.success || resp.mockup_url,
      notion: (resp) => resp.object === 'page' && resp.id
    };

    const validator = validations[apiName];
    if (!validator) {
      console.warn(`No validator found for API: ${apiName}`);
      return true;
    }

    return validator(response);
  }

  static generateTestFixtures() {
    return {
      design_concepts: [
        {
          theme: "Coffee Lover Paradise",
          text_content: "But First Coffee",
          keywords: ["coffee", "morning", "caffeine", "java"],
          niche: "coffee_enthusiasts",
          target_audience: "coffee_lovers"
        },
        {
          theme: "Fitness Motivation",
          text_content: "Stronger Every Day",
          keywords: ["fitness", "gym", "workout", "motivation"],
          niche: "fitness_community",
          target_audience: "fitness_enthusiasts"
        },
        {
          theme: "Dog Mom Life",
          text_content: "Dog Hair Don't Care",
          keywords: ["dog", "pet", "mom", "love"],
          niche: "pet_owners",
          target_audience: "dog_parents"
        }
      ],
      
      competitor_images: [
        {
          name: "coffee_shirt_competitor",
          base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          description: "Black t-shirt with white 'Coffee First' text"
        },
        {
          name: "fitness_shirt_competitor", 
          base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          description: "Navy t-shirt with bold 'No Excuses' text"
        }
      ],

      test_keywords: [
        "coffee lover",
        "fitness motivation", 
        "dog mom",
        "funny sayings",
        "workout gear"
      ],

      amazon_products: [
        {
          asin: "B08N5WRWNW",
          category: "T-Shirts",
          expected_bsr_range: [40000, 60000]
        },
        {
          asin: "B07XYZ123A",
          category: "Hoodies",
          expected_bsr_range: [80000, 120000]
        }
      ]
    };
  }
}

// Environment validation
class TestEnvironment {
  static validateEnvironment() {
    const required = [
      'NODE_ENV',
      'TEST_MODE'
    ];

    const optional = [
      'TEST_DAILY_BUDGET',
      'TEST_MONTHLY_BUDGET',
      'OPENAI_API_KEY',
      'REPLICATE_API_TOKEN'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Warn about missing optional variables
    const missingOptional = optional.filter(key => !process.env[key]);
    if (missingOptional.length > 0) {
      console.warn(`⚠️  Missing optional environment variables: ${missingOptional.join(', ')}`);
    }

    return {
      test_mode: process.env.TEST_MODE,
      use_mocks: process.env.TEST_MODE === 'mock' || process.env.NODE_ENV === 'test',
      budget_enforcement: process.env.BUDGET_ENFORCEMENT !== 'false',
      cost_tracking: process.env.COST_TRACKING !== 'false'
    };
  }

  static getTestConfig() {
    return {
      timeouts: {
        unit: 5000,
        integration: 15000,
        e2e: 60000
      },
      retries: {
        unit: 1,
        integration: 2,
        e2e: 3
      },
      budgets: {
        daily: parseFloat(process.env.TEST_DAILY_BUDGET) || 10.00,
        per_test: parseFloat(process.env.TEST_PER_TEST_BUDGET) || 0.50,
        monthly: parseFloat(process.env.TEST_MONTHLY_BUDGET) || 200.00
      }
    };
  }
}

module.exports = {
  TestCostTracker,
  APITestHelpers,
  TestEnvironment
};