#!/usr/bin/env node

/**
 * QC Smoke Test Runner - Week 6β
 * Orchestrates smoke tests for agents #28-31
 */

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const { testGrammarlyAgent } = require('./agent-28-smoke');
const { testContrastAgent } = require('./agent-29-smoke');
const { testReadabilityAgent } = require('./agent-30-smoke');
const { testMockupAgent } = require('./agent-31-smoke');

async function runSmokeTests() {
  const startTime = Date.now();
  console.log('🧪 ATT System QC Smoke Tests - Starting...\n');
  
  // Set to mock mode for safety
  process.env.MOCK_MODE = 'true';
  
  const testRunners = [
    { name: 'agent-28-grammarly', fn: testGrammarlyAgent },
    { name: 'agent-29-contrast', fn: testContrastAgent },
    { name: 'agent-30-readability', fn: testReadabilityAgent },
    { name: 'agent-31-mockup', fn: testMockupAgent }
  ];
  
  const results = {
    timestamp: new Date().toISOString(),
    mode: 'MOCK_MODE',
    total_tests: testRunners.length,
    passed: 0,
    failed: 0,
    total_cost: 0,
    total_duration: 0,
    test_results: []
  };
  
  // Run tests in parallel with timeout
  const testPromises = testRunners.map(async (testRunner) => {
    try {
      console.log(`🔍 Testing ${testRunner.name}...`);
      
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout after 30s')), 30000)
      );
      
      const result = await Promise.race([
        testRunner.fn(),
        timeoutPromise
      ]);
      
      console.log(`✅ ${testRunner.name}: ${result.status.toUpperCase()} (${result.responseTime}ms, $${result.cost})`);
      
      results.passed++;
      results.total_cost += parseFloat(result.cost || 0);
      results.test_results.push(result);
      
      return result;
      
    } catch (error) {
      console.log(`❌ ${testRunner.name}: ERROR - ${error.message}`);
      
      const errorResult = {
        name: testRunner.name,
        status: 'error',
        responseTime: 0,
        cost: 0,
        error: error.message
      };
      
      results.failed++;
      results.test_results.push(errorResult);
      
      return errorResult;
    }
  });
  
  // Wait for all tests to complete
  await Promise.all(testPromises);
  
  results.total_duration = Date.now() - startTime;
  results.overall_status = results.failed === 0 ? 'PASS' : 'FAIL';
  
  // Generate summary
  console.log('\n📊 Smoke Test Summary:');
  console.log(`Overall Status: ${results.overall_status}`);
  console.log(`Tests Passed: ${results.passed}/${results.total_tests}`);
  console.log(`Total Cost: $${results.total_cost.toFixed(3)}`);
  console.log(`Duration: ${results.total_duration}ms`);
  
  // Generate markdown report
  await generateReport(results);
  
  return results.overall_status === 'PASS' ? 0 : 1;
}

async function generateReport(results) {
  const timestamp = new Date().toISOString();
  const passEmoji = results.overall_status === 'PASS' ? '✅' : '❌';
  
  let report = `# QC Smoke Test Results

**Run Date**: ${timestamp}  
**Mode**: ${results.mode}  
**Total Cost**: $${results.total_cost.toFixed(3)}  
**Duration**: ${results.total_duration}ms

## Results Summary
`;

  // Add test results
  results.test_results.forEach(test => {
    const emoji = test.status === 'pass' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
    const cost = test.cost ? `$${parseFloat(test.cost).toFixed(3)}` : '$0.000';
    report += `- ${emoji} ${test.name}: ${test.status.toUpperCase()} (${test.responseTime}ms, ${cost})\n`;
  });
  
  report += `\n**Overall Status**: ${passEmoji} ${results.overall_status} (${results.passed}/${results.total_tests})\n\n`;
  
  // Add detailed results
  report += `## Detailed Results\n\n`;
  report += '```json\n';
  report += JSON.stringify(results, null, 2);
  report += '\n```\n\n';
  
  // Add timestamp to existing results if file exists
  try {
    const existingReport = await fs.readFile('SMOKE_TEST_RESULTS.md', 'utf8');
    report = report + '\n---\n\n## Previous Results\n\n' + existingReport.split('## Previous Results')[1] || '';
  } catch (error) {
    // File doesn't exist, this is the first run
  }
  
  await fs.writeFile('SMOKE_TEST_RESULTS.md', report);
  console.log('\n💾 Results saved to SMOKE_TEST_RESULTS.md');
}

if (require.main === module) {
  runSmokeTests().then(process.exit).catch(err => {
    console.error('❌ Smoke test runner failed:', err);
    process.exit(1);
  });
}

module.exports = { runSmokeTests };