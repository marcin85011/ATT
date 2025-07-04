/**
 * Jest Setup for MBA Intelligence Engine
 * Global test configuration, mocks, and utilities
 */

const { TestCostTracker, TestEnvironment } = require('../utils/test-helpers');
const APIMockServer = require('../mock-server/api-mocks');

// Global test configuration
global.testConfig = TestEnvironment.getTestConfig();
global.testCostTracker = new TestCostTracker();

// Mock server instance
let mockServer;

// Setup before all tests
beforeAll(async () => {
  // Validate test environment
  const env = TestEnvironment.validateEnvironment();
  console.log('🧪 Test Environment:', env);
  
  // Start mock server if in mock mode
  if (env.use_mocks) {
    mockServer = new APIMockServer(3001);
    await mockServer.start();
    console.log('🎭 Mock server started for testing');
  }
  
  // Reset daily cost tracking if it's a new day
  const today = new Date().toISOString().split('T')[0];
  const lastReset = global.testCostTracker.costs.last_reset?.split('T')[0];
  if (lastReset !== today) {
    global.testCostTracker.resetDailyTracking();
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Stop mock server
  if (mockServer) {
    await mockServer.stop();
  }
  
  // Save final cost data
  await global.testCostTracker.saveCostData();
  
  // Print cost summary
  const costSummary = global.testCostTracker.getCostSummary();
  console.log('\n💰 Test Cost Summary:');
  console.log(`   Daily spend: $${costSummary.daily_spend.toFixed(4)}`);
  console.log(`   Monthly spend: $${costSummary.monthly_spend.toFixed(2)}`);
  console.log(`   Total test runs: ${costSummary.total_test_runs}`);
  
  // Warn if approaching budget limits
  if (costSummary.daily_spend > costSummary.budgets.daily * 0.8) {
    console.warn(`⚠️  Daily spend approaching limit: $${costSummary.daily_spend.toFixed(4)} / $${costSummary.budgets.daily}`);
  }
  
  if (costSummary.monthly_spend > costSummary.budgets.monthly * 0.8) {
    console.warn(`⚠️  Monthly spend approaching limit: $${costSummary.monthly_spend.toFixed(2)} / $${costSummary.budgets.monthly}`);
  }
});

// Enhanced expect matchers for API testing
expect.extend({
  toBeWithinBudget(received, budgetType = 'per_test') {
    const budget = global.testConfig.budgets[budgetType];
    const pass = received <= budget;
    
    if (pass) {
      return {
        message: () => `Expected ${received} to exceed budget ${budget}`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected ${received} to be within budget ${budget}`,
        pass: false
      };
    }
  },
  
  toHaveValidAPIResponse(received, apiName) {
    const { APITestHelpers } = require('../utils/test-helpers');
    const isValid = APITestHelpers.validateAPIResponse(received, apiName);
    
    if (isValid) {
      return {
        message: () => `Expected API response to be invalid for ${apiName}`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected valid API response for ${apiName}, but got: ${JSON.stringify(received)}`,
        pass: false
      };
    }
  },
  
  toCompleteWithinTimeout(received, timeoutMs) {
    // This would be used with async operations
    const pass = received <= timeoutMs;
    
    if (pass) {
      return {
        message: () => `Expected operation to take longer than ${timeoutMs}ms`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected operation to complete within ${timeoutMs}ms, but took ${received}ms`,
        pass: false
      };
    }
  }
});

// Global test utilities
global.testUtils = {
  async trackAPICost(apiName, cost, tokens = 0) {
    const budgetCheck = global.testCostTracker.trackAPICall(apiName, cost, tokens);
    
    if (!budgetCheck.within_budget && process.env.BUDGET_ENFORCEMENT !== 'false') {
      throw new Error(`Budget exceeded: ${budgetCheck.warnings.join(', ')}`);
    }
    
    return budgetCheck;
  },
  
  async waitForMockServer() {
    if (!mockServer) return;
    
    // Wait for mock server to be ready
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) return;
      } catch (error) {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Mock server not ready after 1 second');
  },
  
  getMockServerLogs() {
    return mockServer ? mockServer.getRequestLog() : [];
  },
  
  clearMockServerLogs() {
    if (mockServer) {
      mockServer.clearRequestLog();
    }
  },
  
  // Helper to skip tests based on environment
  skipIfNoRealAPIs() {
    if (process.env.TEST_REAL_APIS !== 'true') {
      return test.skip;
    }
    return test;
  },
  
  skipIfNoBudget() {
    const costSummary = global.testCostTracker.getCostSummary();
    const remainingBudget = global.testConfig.budgets.daily - costSummary.daily_spend;
    
    if (remainingBudget < 0.10) { // Less than 10 cents remaining
      return test.skip;
    }
    return test;
  }
};

// Console log interception for cost tracking
const originalConsoleLog = console.log;
console.log = (...args) => {
  // Track any cost-related logs
  const message = args.join(' ');
  if (message.includes('API Cost:') || message.includes('Budget:')) {
    // Could save these to cost tracking if needed
  }
  originalConsoleLog.apply(console, args);
};

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in tests, just log
});

// Increase timeout for slow operations
jest.setTimeout(global.testConfig.timeouts.integration);

console.log('✅ Jest setup complete - MBA Intelligence Engine test environment ready');