/**
 * Jest Cost Reporter for MBA Intelligence Engine
 * Tracks and reports API costs during test execution
 */

const fs = require('fs').promises;
const path = require('path');

class CostReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
    this.testResults = [];
    this.totalCost = 0;
    this.apiCosts = {};
    this.startTime = Date.now();
  }

  onRunStart(results, options) {
    console.log('\n💰 Starting cost tracking for API tests...\n');
  }

  onTestStart(test) {
    // Mark test start time for individual test cost tracking
    test.startTime = Date.now();
  }

  onTestResult(test, testResult, aggregatedResult) {
    // Extract cost information from test output
    const duration = Date.now() - test.startTime;
    
    // Parse console output for cost information
    const costInfo = this.extractCostFromTest(testResult);
    
    const testCostData = {
      testPath: testResult.testFilePath,
      testName: testResult.testResults.map(t => t.fullName).join(', '),
      duration: duration,
      passed: testResult.numPassingTests,
      failed: testResult.numFailingTests,
      skipped: testResult.numPendingTests,
      estimatedCost: costInfo.cost,
      apiCalls: costInfo.apiCalls,
      budgetStatus: costInfo.budgetStatus,
      timestamp: new Date().toISOString()
    };

    this.testResults.push(testCostData);
    this.totalCost += costInfo.cost;
    
    // Aggregate API costs
    Object.entries(costInfo.apiCalls).forEach(([api, data]) => {
      if (!this.apiCosts[api]) {
        this.apiCosts[api] = { calls: 0, cost: 0 };
      }
      this.apiCosts[api].calls += data.calls;
      this.apiCosts[api].cost += data.cost;
    });
  }

  async onRunComplete(contexts, results) {
    const duration = Date.now() - this.startTime;
    
    const report = {
      summary: {
        totalTests: results.numTotalTests,
        passedTests: results.numPassedTests,
        failedTests: results.numFailedTests,
        skippedTests: results.numPendingTests,
        duration: duration,
        totalCost: this.totalCost,
        averageCostPerTest: this.totalCost / (results.numTotalTests || 1),
        timestamp: new Date().toISOString()
      },
      
      budgetAnalysis: {
        dailyBudget: 10.00,
        monthlyBudget: 200.00,
        currentSpend: this.totalCost,
        dailyRemaining: Math.max(0, 10.00 - this.totalCost),
        budgetUtilization: (this.totalCost / 10.00 * 100).toFixed(2) + '%',
        projectedMonthlySpend: this.totalCost * 30, // Rough projection
        budgetStatus: this.totalCost > 10.00 ? 'EXCEEDED' : this.totalCost > 8.00 ? 'WARNING' : 'OK'
      },
      
      apiBreakdown: Object.entries(this.apiCosts).map(([api, data]) => ({
        api: api,
        totalCalls: data.calls,
        totalCost: data.cost,
        averageCostPerCall: data.cost / (data.calls || 1),
        percentage: (data.cost / this.totalCost * 100).toFixed(2) + '%'
      })).sort((a, b) => b.totalCost - a.totalCost),
      
      testDetails: this.testResults,
      
      recommendations: this.generateRecommendations(),
      
      costProjections: {
        dailyRunCost: this.totalCost,
        weeklyProjection: this.totalCost * 7,
        monthlyProjection: this.totalCost * 30,
        yearlyProjection: this.totalCost * 365
      }
    };

    // Save detailed report
    if (this.options.outputFile) {
      await this.saveReport(report);
    }
    
    // Print summary to console
    this.printSummary(report);
  }

  extractCostFromTest(testResult) {
    // Default cost structure
    let costInfo = {
      cost: 0,
      apiCalls: {},
      budgetStatus: 'OK'
    };

    // Try to extract cost information from console messages or test data
    if (testResult.console && testResult.console.length > 0) {
      testResult.console.forEach(msg => {
        const message = msg.message;
        
        // Look for cost tracking messages
        const costMatch = message.match(/API Cost: \$?([\d.]+)/);
        if (costMatch) {
          costInfo.cost += parseFloat(costMatch[1]);
        }
        
        // Look for API call information
        const apiMatch = message.match(/API Call: (\w+) - \$?([\d.]+)/);
        if (apiMatch) {
          const api = apiMatch[1];
          const cost = parseFloat(apiMatch[2]);
          
          if (!costInfo.apiCalls[api]) {
            costInfo.apiCalls[api] = { calls: 0, cost: 0 };
          }
          costInfo.apiCalls[api].calls += 1;
          costInfo.apiCalls[api].cost += cost;
        }
      });
    }

    // Estimate costs based on test file names if no explicit tracking
    if (costInfo.cost === 0) {
      costInfo = this.estimateCostFromTestPath(testResult.testFilePath);
    }

    return costInfo;
  }

  estimateCostFromTestPath(testPath) {
    // Estimate costs based on which APIs the test file likely uses
    const apiEstimates = {
      'openai': 0.001,
      'replicate': 0.08,
      'scrapehero': 0.01,
      'youtube': 0,
      'newsapi': 0,
      'perplexity': 0.001,
      'google-keywords': 0.002,
      'firecrawl': 0.003,
      'textgears': 0.0001,
      'trademark': 0.005,
      'media-modifier': 0.02,
      'notion': 0
    };

    let estimatedCost = 0;
    let apiCalls = {};

    Object.entries(apiEstimates).forEach(([api, cost]) => {
      if (testPath.includes(api)) {
        estimatedCost += cost;
        apiCalls[api] = { calls: 1, cost: cost };
      }
    });

    return {
      cost: estimatedCost,
      apiCalls: apiCalls,
      budgetStatus: estimatedCost > 0.50 ? 'WARNING' : 'OK'
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.totalCost > 8.00) {
      recommendations.push('Consider reducing test frequency or using more mocks to stay within daily budget');
    }
    
    const expensiveAPIs = Object.entries(this.apiCosts)
      .filter(([api, data]) => data.cost > this.totalCost * 0.3)
      .map(([api]) => api);
    
    if (expensiveAPIs.length > 0) {
      recommendations.push(`Consider mocking high-cost APIs in frequent tests: ${expensiveAPIs.join(', ')}`);
    }
    
    if (this.totalCost > 0 && this.testResults.length > 100) {
      recommendations.push('Consider running expensive API tests less frequently or in nightly builds only');
    }
    
    const failedTests = this.testResults.filter(t => t.failed > 0);
    if (failedTests.length > 0) {
      const wastedCost = failedTests.reduce((sum, t) => sum + t.estimatedCost, 0);
      if (wastedCost > 0.01) {
        recommendations.push(`Failed tests wasted $${wastedCost.toFixed(4)} - fix tests to avoid unnecessary costs`);
      }
    }
    
    return recommendations;
  }

  async saveReport(report) {
    try {
      const outputDir = path.dirname(this.options.outputFile);
      await fs.mkdir(outputDir, { recursive: true });
      
      await fs.writeFile(
        this.options.outputFile, 
        JSON.stringify(report, null, 2)
      );
      
      // Also save a CSV summary for easy analysis
      const csvPath = this.options.outputFile.replace('.json', '.csv');
      const csvContent = this.generateCSV(report);
      await fs.writeFile(csvPath, csvContent);
      
    } catch (error) {
      console.error('Failed to save cost report:', error);
    }
  }

  generateCSV(report) {
    const headers = ['Test Path', 'Duration (ms)', 'Passed', 'Failed', 'Cost', 'Budget Status'];
    const rows = report.testDetails.map(test => [
      test.testPath,
      test.duration,
      test.passed,
      test.failed,
      test.estimatedCost.toFixed(4),
      test.budgetStatus
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  printSummary(report) {
    console.log('\n📊 MBA Intelligence Engine - Test Cost Report');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Total Cost: $${report.summary.totalCost.toFixed(4)}`);
    console.log(`Average Cost/Test: $${report.summary.averageCostPerTest.toFixed(4)}`);
    console.log(`Budget Status: ${report.budgetAnalysis.budgetStatus}`);
    console.log(`Budget Utilization: ${report.budgetAnalysis.budgetUtilization}`);
    
    if (report.apiBreakdown.length > 0) {
      console.log('\n💸 Most Expensive APIs:');
      report.apiBreakdown.slice(0, 5).forEach(api => {
        console.log(`  ${api.api}: $${api.totalCost.toFixed(4)} (${api.percentage})`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
    
    console.log(`\n📈 Monthly Projection: $${report.costProjections.monthlyProjection.toFixed(2)}`);
    console.log('='.repeat(60));
  }
}

module.exports = CostReporter;