/**
 * QC Agents Smoke Tests - Week 6β Production Validation
 * Tests for agents #28-31 to ensure production readiness
 */

const { GrammarlyClient } = require('../clients/grammarly-client');
const { ContrastClient } = require('../clients/contrast-client');
const { ReadabilityClient } = require('../clients/readability-client');
const { MockupClient } = require('../clients/mockup-client');
const { getDailySummary } = require('../shared/cost-tracker');
const { wrap, getErrorStats } = require('../shared/error-handler');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds
  sample_text: "This is an awesome t-shirt design that's perfect for summer!",
  sample_image_url: "https://via.placeholder.com/4500x5400/000000/FFFFFF?text=Test+Design",
  sample_image_data: Buffer.from('test-image-data').toString('base64')
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: []
};

// Utility functions
function logTest(testName, status, message = '') {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${statusIcon} [${timestamp}] ${testName}: ${status} ${message}`);
  
  if (status === 'PASS') testResults.passed++;
  else if (status === 'FAIL') testResults.failed++;
  else testResults.skipped++;
}

function addError(testName, error) {
  testResults.errors.push({
    test: testName,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}

// Test Agent #28 - Spell Check
async function testSpellCheckAgent() {
  console.log('\n🔤 Testing Agent #28 - Spell Check');
  
  try {
    const client = new GrammarlyClient();
    
    // Test health check
    const health = await client.healthCheck();
    if (health.status === 'healthy') {
      logTest('Agent 28 Health Check', 'PASS', `Mode: ${health.mode}`);
    } else {
      logTest('Agent 28 Health Check', 'FAIL', health.error || 'Unknown error');
    }
    
    // Test text checking
    const result = await client.checkText(TEST_CONFIG.sample_text);
    if (result && result.agent === 'spell-check-28') {
      logTest('Agent 28 Text Analysis', 'PASS', `Status: ${result.status}, Score: ${result.grammar_score}`);
    } else {
      logTest('Agent 28 Text Analysis', 'FAIL', 'Invalid response format');
    }
    
    // Test error handling
    try {
      await client.checkText('');
      logTest('Agent 28 Error Handling', 'FAIL', 'Should have thrown error for empty text');
    } catch (error) {
      logTest('Agent 28 Error Handling', 'PASS', 'Correctly rejected empty text');
    }
    
  } catch (error) {
    logTest('Agent 28 Overall', 'FAIL', error.message);
    addError('Agent 28', error);
  }
}

// Test Agent #29 - Contrast Analysis
async function testContrastAgent() {
  console.log('\n🎨 Testing Agent #29 - Contrast Analysis');
  
  try {
    const client = new ContrastClient();
    
    // Test health check
    const health = await client.healthCheck();
    if (health.status === 'healthy') {
      logTest('Agent 29 Health Check', 'PASS', `Mode: ${health.mode}`);
    } else {
      logTest('Agent 29 Health Check', 'FAIL', health.error || 'Unknown error');
    }
    
    // Test contrast analysis with mock data
    const result = await client.analyzeContrast(TEST_CONFIG.sample_image_data);
    if (result && result.agent === 'contrast-analyzer-29') {
      logTest('Agent 29 Contrast Analysis', 'PASS', 
        `Status: ${result.status}, Ratio: ${result.contrast_ratio}:1, WCAG AA: ${result.wcag_aa_compliant}`);
    } else {
      logTest('Agent 29 Contrast Analysis', 'FAIL', 'Invalid response format');
    }
    
    // Test WCAG calculation utilities
    const testColors = [255, 255, 255]; // White
    const luminance = client._relativeLuminance(testColors);
    if (luminance >= 0 && luminance <= 1) {
      logTest('Agent 29 WCAG Calculations', 'PASS', `Luminance: ${luminance.toFixed(3)}`);
    } else {
      logTest('Agent 29 WCAG Calculations', 'FAIL', 'Invalid luminance calculation');
    }
    
  } catch (error) {
    logTest('Agent 29 Overall', 'FAIL', error.message);
    addError('Agent 29', error);
  }
}

// Test Agent #30 - Readability Analysis
async function testReadabilityAgent() {
  console.log('\n📖 Testing Agent #30 - Readability Analysis');
  
  try {
    const client = new ReadabilityClient();
    
    // Test health check
    const health = await client.healthCheck();
    if (health.status === 'healthy') {
      logTest('Agent 30 Health Check', 'PASS', `Mode: ${health.mode}`);
    } else {
      logTest('Agent 30 Health Check', 'FAIL', health.error || 'Unknown error');
    }
    
    // Test readability scoring
    const result = await client.scoreReadability(TEST_CONFIG.sample_text);
    if (result && result.agent === 'readability-scorer-30') {
      logTest('Agent 30 Readability Analysis', 'PASS', 
        `Status: ${result.status}, Reading Ease: ${result.flesch_reading_ease}, Grade: ${result.flesch_kincaid_grade}`);
    } else {
      logTest('Agent 30 Readability Analysis', 'FAIL', 'Invalid response format');
    }
    
    // Test syllable counting
    const syllableCount = client._countSyllables('readability');
    if (syllableCount > 0) {
      logTest('Agent 30 Syllable Counting', 'PASS', `"readability" = ${syllableCount} syllables`);
    } else {
      logTest('Agent 30 Syllable Counting', 'FAIL', 'Invalid syllable count');
    }
    
    // Test target audience detection
    const shortText = "Fun shirt!";
    const shortResult = await client.scoreReadability(shortText);
    if (shortResult.target_audience) {
      logTest('Agent 30 Target Audience', 'PASS', `Short text audience: ${shortResult.target_audience}`);
    } else {
      logTest('Agent 30 Target Audience', 'FAIL', 'No target audience detected');
    }
    
  } catch (error) {
    logTest('Agent 30 Overall', 'FAIL', error.message);
    addError('Agent 30', error);
  }
}

// Test Agent #31 - Mockup Generation
async function testMockupAgent() {
  console.log('\n🎨 Testing Agent #31 - Mockup Generation');
  
  try {
    const client = new MockupClient();
    
    // Test health check
    const health = await client.healthCheck();
    if (health.status === 'healthy') {
      logTest('Agent 31 Health Check', 'PASS', `Mode: ${health.mode}`);
    } else {
      logTest('Agent 31 Health Check', 'FAIL', health.error || 'Unknown error');
    }
    
    // Test template fetching
    const templates = await client.getAvailableTemplates();
    if (templates && templates.templates && templates.templates.length > 0) {
      logTest('Agent 31 Template Fetching', 'PASS', `Found ${templates.total} templates`);
    } else {
      logTest('Agent 31 Template Fetching', 'FAIL', 'No templates available');
    }
    
    // Test mockup generation
    const result = await client.generateMockups(TEST_CONFIG.sample_image_url);
    if (result && result.agent === 'mockup-generator-31') {
      logTest('Agent 31 Mockup Generation', 'PASS', 
        `Status: ${result.status}, Generated: ${result.mockups_generated}, Cost: $${result.estimated_cost}`);
    } else {
      logTest('Agent 31 Mockup Generation', 'FAIL', 'Invalid response format');
    }
    
    // Test single mockup generation
    const singleResult = await client.generateSingleMockup(TEST_CONFIG.sample_image_url, 'front_view');
    if (singleResult && singleResult.agent === 'mockup-generator-31') {
      logTest('Agent 31 Single Mockup', 'PASS', `Type: ${singleResult.mockup_type}`);
    } else {
      logTest('Agent 31 Single Mockup', 'FAIL', 'Invalid single mockup response');
    }
    
  } catch (error) {
    logTest('Agent 31 Overall', 'FAIL', error.message);
    addError('Agent 31', error);
  }
}

// Test Shared Modules
async function testSharedModules() {
  console.log('\n🔧 Testing Shared Modules');
  
  try {
    // Test cost tracking
    const dailySummary = await getDailySummary();
    if (dailySummary && typeof dailySummary.total_cost === 'number') {
      logTest('Cost Tracker getDailySummary', 'PASS', `Total cost: $${dailySummary.total_cost}`);
    } else {
      logTest('Cost Tracker getDailySummary', 'FAIL', 'Invalid daily summary format');
    }
    
    // Test error handler wrap function
    const testFunction = async (input) => {
      if (input === 'error') throw new Error('Test error');
      return 'success';
    };
    
    const wrappedFunction = wrap(testFunction, 'test-agent');
    
    // Test successful execution
    const successResult = await wrappedFunction('success');
    if (successResult === 'success') {
      logTest('Error Handler Wrap Success', 'PASS', 'Function executed correctly');
    } else {
      logTest('Error Handler Wrap Success', 'FAIL', 'Unexpected result');
    }
    
    // Test error handling
    try {
      await wrappedFunction('error');
      logTest('Error Handler Wrap Error', 'FAIL', 'Should have thrown error');
    } catch (error) {
      logTest('Error Handler Wrap Error', 'PASS', 'Error correctly propagated');
    }
    
    // Test error statistics
    const errorStats = await getErrorStats(null, 1); // Last hour
    if (errorStats && typeof errorStats.total === 'number') {
      logTest('Error Statistics', 'PASS', `Total errors: ${errorStats.total}`);
    } else {
      logTest('Error Statistics', 'FAIL', 'Invalid error stats format');
    }
    
  } catch (error) {
    logTest('Shared Modules Overall', 'FAIL', error.message);
    addError('Shared Modules', error);
  }
}

// Test Integration
async function testIntegration() {
  console.log('\n🔗 Testing QC Pipeline Integration');
  
  try {
    // Simulate a complete QC pipeline run
    const testDesign = {
      design_id: 'test-design-001',
      text: 'Best Dad Ever - Father\'s Day Gift',
      image_url: TEST_CONFIG.sample_image_url
    };
    
    // Step 1: Spell check
    const grammarlyClient = new GrammarlyClient();
    const spellResult = await grammarlyClient.checkText(testDesign.text);
    
    // Step 2: Readability analysis
    const readabilityClient = new ReadabilityClient();
    const readabilityResult = await readabilityClient.scoreReadability(testDesign.text);
    
    // Step 3: Contrast analysis (mock)
    const contrastClient = new ContrastClient();
    const contrastResult = await contrastClient.analyzeContrast(TEST_CONFIG.sample_image_data);
    
    // Step 4: Mockup generation
    const mockupClient = new MockupClient();
    const mockupResult = await mockupClient.generateMockups(testDesign.image_url);
    
    // Validate pipeline results
    const allPassed = [spellResult, readabilityResult, contrastResult, mockupResult]
      .every(result => result && result.agent && result.status);
    
    if (allPassed) {
      logTest('QC Pipeline Integration', 'PASS', 'All agents executed successfully');
    } else {
      logTest('QC Pipeline Integration', 'FAIL', 'One or more agents failed');
    }
    
    // Test cost accumulation
    const finalSummary = await getDailySummary();
    if (finalSummary.qc_operations > 0) {
      logTest('QC Cost Tracking', 'PASS', `QC operations: ${finalSummary.qc_operations}, QC cost: $${finalSummary.qc_cost}`);
    } else {
      logTest('QC Cost Tracking', 'SKIP', 'No QC operations tracked (mock mode)');
    }
    
  } catch (error) {
    logTest('Integration Test Overall', 'FAIL', error.message);
    addError('Integration', error);
  }
}

// Main test runner
async function runSmokeTests() {
  console.log('🧪 Starting QC Agents Smoke Tests - Week 6β');
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  // Set timeout for entire test suite
  const timeout = setTimeout(() => {
    console.error('❌ Test suite timed out after 5 minutes');
    process.exit(1);
  }, 300000); // 5 minutes
  
  try {
    // Run all tests
    await testSpellCheckAgent();
    await testContrastAgent();
    await testReadabilityAgent();
    await testMockupAgent();
    await testSharedModules();
    await testIntegration();
    
    // Clear timeout
    clearTimeout(timeout);
    
    // Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⏭️ Skipped: ${testResults.skipped}`);
    console.log(`⏱️ Duration: ${duration}s`);
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ Error Details:');
      testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.test}: ${error.error}`);
      });
    }
    
    // Exit with appropriate code
    if (testResults.failed > 0) {
      console.log('\n❌ Some tests failed - Week 6β QC agents need attention');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed - Week 6β QC agents are production ready!');
      process.exit(0);
    }
    
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ Test suite error:', error.message);
    process.exit(1);
  }
}

// Export for external use
module.exports = {
  runSmokeTests,
  testSpellCheckAgent,
  testContrastAgent,
  testReadabilityAgent,
  testMockupAgent,
  testSharedModules,
  testIntegration
};

// Run tests if called directly
if (require.main === module) {
  runSmokeTests().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}