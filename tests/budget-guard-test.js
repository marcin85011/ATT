/**
 * Budget Guard Unit Test
 * Tests the checkDailyBudget() function with mock data
 */

const fs = require('fs').promises;
const path = require('path');
const { checkDailyBudget } = require('../shared/cost-tracker');

// Test configuration
const TEST_CONFIG = {
  mockCostFile: path.join(__dirname, '../cost-tracking-test.json'),
  originalEnv: process.env.DAILY_BUDGET_LIMIT
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Utility functions
function logTest(testName, status, message = '') {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : '❌';
  console.log(`${statusIcon} [${timestamp}] ${testName}: ${status} ${message}`);
  
  if (status === 'PASS') testResults.passed++;
  else testResults.failed++;
}

function addError(testName, error) {
  testResults.errors.push({
    test: testName,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}

// Create mock cost data
async function createMockCostData(dailySpend = 0) {
  const today = new Date().toISOString().split('T')[0];
  const mockData = [];
  
  if (dailySpend > 0) {
    // Add mock cost entries for today
    const costPerEntry = dailySpend / 3; // Split across 3 entries
    for (let i = 0; i < 3; i++) {
      mockData.push({
        timestamp: new Date().toISOString(),
        date: today,
        operation: `test-operation-${i}`,
        cost: costPerEntry,
        description: `Mock test cost ${i}`,
        type: 'api_call',
        agent_id: '28'
      });
    }
  }
  
  await fs.writeFile(TEST_CONFIG.mockCostFile, JSON.stringify(mockData, null, 2));
}

// Clean up mock files
async function cleanup() {
  try {
    await fs.unlink(TEST_CONFIG.mockCostFile);
  } catch (error) {
    // File might not exist, that's ok
  }
  
  // Restore original environment
  if (TEST_CONFIG.originalEnv) {
    process.env.DAILY_BUDGET_LIMIT = TEST_CONFIG.originalEnv;
  } else {
    delete process.env.DAILY_BUDGET_LIMIT;
  }
}

// Test 1: Budget within limits
async function testBudgetWithinLimits() {
  try {
    // Set budget limit and create mock data below it
    process.env.DAILY_BUDGET_LIMIT = '5.00';
    await createMockCostData(2.50); // Spend $2.50, limit $5.00
    
    // Temporarily point to test file
    const originalPath = path.join(__dirname, '../cost-tracking.json');
    await fs.copyFile(TEST_CONFIG.mockCostFile, originalPath + '.backup');
    await fs.copyFile(TEST_CONFIG.mockCostFile, originalPath);
    
    const result = await checkDailyBudget();
    
    // Restore original file
    try {
      await fs.copyFile(originalPath + '.backup', originalPath);
      await fs.unlink(originalPath + '.backup');
    } catch (e) {
      // If backup doesn't exist, just remove the test file
      await fs.unlink(originalPath);
    }
    
    if (result.withinBudget === true && 
        result.remaining === 2.50 && 
        result.dailySpend === 2.50 && 
        result.budgetLimit === 5.00) {
      logTest('Budget Within Limits', 'PASS', `Remaining: $${result.remaining}`);
    } else {
      logTest('Budget Within Limits', 'FAIL', `Expected withinBudget=true, remaining=2.50, got: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    logTest('Budget Within Limits', 'FAIL', error.message);
    addError('Budget Within Limits', error);
  }
}

// Test 2: Budget exceeded
async function testBudgetExceeded() {
  try {
    // Set budget limit and create mock data above it
    process.env.DAILY_BUDGET_LIMIT = '5.00';
    await createMockCostData(6.50); // Spend $6.50, limit $5.00
    
    // Temporarily point to test file
    const originalPath = path.join(__dirname, '../cost-tracking.json');
    await fs.copyFile(TEST_CONFIG.mockCostFile, originalPath + '.backup');
    await fs.copyFile(TEST_CONFIG.mockCostFile, originalPath);
    
    const result = await checkDailyBudget();
    
    // Restore original file
    try {
      await fs.copyFile(originalPath + '.backup', originalPath);
      await fs.unlink(originalPath + '.backup');
    } catch (e) {
      await fs.unlink(originalPath);
    }
    
    if (result.withinBudget === false && 
        result.remaining === 0 && 
        result.dailySpend === 6.50 && 
        result.budgetLimit === 5.00) {
      logTest('Budget Exceeded', 'PASS', `Daily spend: $${result.dailySpend}, Limit: $${result.budgetLimit}`);
    } else {
      logTest('Budget Exceeded', 'FAIL', `Expected withinBudget=false, remaining=0, got: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    logTest('Budget Exceeded', 'FAIL', error.message);
    addError('Budget Exceeded', error);
  }
}

// Test 3: No cost data (fresh start)
async function testNoCostData() {
  try {
    // Set budget limit but no cost data
    process.env.DAILY_BUDGET_LIMIT = '5.00';
    
    // Temporarily remove cost file
    const originalPath = path.join(__dirname, '../cost-tracking.json');
    let hasOriginal = false;
    
    try {
      await fs.access(originalPath);
      hasOriginal = true;
      await fs.rename(originalPath, originalPath + '.backup');
    } catch (e) {
      // File doesn't exist, that's what we want
    }
    
    const result = await checkDailyBudget();
    
    // Restore original file if it existed
    if (hasOriginal) {
      await fs.rename(originalPath + '.backup', originalPath);
    }
    
    if (result.withinBudget === true && 
        result.remaining === 5.00 && 
        result.dailySpend === 0 && 
        result.budgetLimit === 5.00) {
      logTest('No Cost Data', 'PASS', `Fresh start - Full budget available: $${result.remaining}`);
    } else {
      logTest('No Cost Data', 'FAIL', `Expected fresh start state, got: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    logTest('No Cost Data', 'FAIL', error.message);
    addError('No Cost Data', error);
  }
}

// Test 4: Default budget limit
async function testDefaultBudgetLimit() {
  try {
    // Remove DAILY_BUDGET_LIMIT env var to test default
    delete process.env.DAILY_BUDGET_LIMIT;
    await createMockCostData(0); // No spending
    
    // Temporarily point to test file
    const originalPath = path.join(__dirname, '../cost-tracking.json');
    await fs.copyFile(TEST_CONFIG.mockCostFile, originalPath + '.backup');
    await fs.copyFile(TEST_CONFIG.mockCostFile, originalPath);
    
    const result = await checkDailyBudget();
    
    // Restore original file
    try {
      await fs.copyFile(originalPath + '.backup', originalPath);
      await fs.unlink(originalPath + '.backup');
    } catch (e) {
      await fs.unlink(originalPath);
    }
    
    if (result.budgetLimit === 5.00 && result.withinBudget === true) {
      logTest('Default Budget Limit', 'PASS', `Default limit: $${result.budgetLimit}`);
    } else {
      logTest('Default Budget Limit', 'FAIL', `Expected default limit $5.00, got: $${result.budgetLimit}`);
    }
    
  } catch (error) {
    logTest('Default Budget Limit', 'FAIL', error.message);
    addError('Default Budget Limit', error);
  }
}

// Test 5: Error handling (malformed cost file)
async function testErrorHandling() {
  try {
    // Create malformed JSON file
    const originalPath = path.join(__dirname, '../cost-tracking.json');
    const malformedData = '{ "invalid": json malformed }';
    
    await fs.writeFile(originalPath + '.backup', malformedData);
    await fs.copyFile(originalPath + '.backup', originalPath);
    
    const result = await checkDailyBudget();
    
    // Clean up
    try {
      await fs.unlink(originalPath);
      await fs.unlink(originalPath + '.backup');
    } catch (e) {
      // Cleanup best effort
    }
    
    // Should gracefully handle errors and default to budget available
    if (result.withinBudget === true && result.budgetLimit === 5.00 && result.dailySpend === 0) {
      logTest('Error Handling', 'PASS', `Gracefully handled malformed data - defaulted to budget available`);
    } else {
      logTest('Error Handling', 'FAIL', `Should handle errors gracefully, got: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    logTest('Error Handling', 'FAIL', error.message);
    addError('Error Handling', error);
  }
}

// Main test runner
async function runBudgetGuardTests() {
  console.log('🛡️ Starting Budget Guard Unit Tests');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  
  try {
    await testBudgetWithinLimits();
    await testBudgetExceeded();
    await testNoCostData();
    await testDefaultBudgetLimit();
    await testErrorHandling();
    
    // Clean up
    await cleanup();
    
    // Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(50));
    console.log('📊 Budget Guard Test Results');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⏱️ Duration: ${duration}s`);
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ Error Details:');
      testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.test}: ${error.error}`);
      });
    }
    
    // Exit with appropriate code
    if (testResults.failed > 0) {
      console.log('\n❌ Budget guard tests failed');
      return false;
    } else {
      console.log('\n✅ All budget guard tests passed!');
      return true;
    }
    
  } catch (error) {
    await cleanup();
    console.error('❌ Test suite error:', error.message);
    return false;
  }
}

// Export for external use
module.exports = {
  runBudgetGuardTests,
  testBudgetWithinLimits,
  testBudgetExceeded,
  testNoCostData,
  testDefaultBudgetLimit,
  testErrorHandling
};

// Run tests if called directly
if (require.main === module) {
  runBudgetGuardTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}