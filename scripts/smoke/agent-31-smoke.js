/**
 * Agent #31 Smoke Test - Mockup Client
 */

const { MockupClient } = require('../../clients/mockup-client');
const { trackCost, checkDailyBudget } = require('../../shared/cost-tracker');

async function testMockupAgent() {
  const startTime = Date.now();
  
  // Check daily budget before proceeding
  const budgetCheck = await checkDailyBudget();
  if (!budgetCheck.withinBudget) {
    console.log(`⚠️ Budget limit reached - skipping Agent #31 (Mockup). Daily spend: $${budgetCheck.dailySpend}, Limit: $${budgetCheck.budgetLimit}`);
    
    // Track zero-cost heartbeat to show workflow fired
    await trackCost('mockup-generator-31', 0, 'Budget limit reached - skipped execution');
    
    return {
      name: 'agent-31-mockup',
      status: 'skipped',
      responseTime: Date.now() - startTime,
      cost: 0,
      details: {
        budget_exceeded: true,
        daily_spend: budgetCheck.dailySpend,
        budget_limit: budgetCheck.budgetLimit,
        remaining: budgetCheck.remaining
      },
      agent_id: 'mockup-generator-31'
    };
  }
  
  try {
    const client = new MockupClient();
    
    // Test with placeholder design URL (in mock mode this won't be called)
    const testDesignUrl = 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Test+Design';
    const result = await client.generateMockups(testDesignUrl);
    
    // Validate result structure
    const isValid = validateMockupResult(result);
    
    if (!isValid.valid) {
      throw new Error(`Invalid result structure: ${isValid.reason}`);
    }
    
    return {
      name: 'agent-31-mockup',
      status: result.status || 'pass',
      responseTime: Date.now() - startTime,
      cost: result.estimated_cost || result.cost || 0.01,
      details: {
        mock: result.mock,
        mockups_generated: result.mockups_generated,
        total_variations: result.total_variations,
        quality_score: result.quality_score,
        mockup_types: (result.mockup_urls || []).map(m => m.type),
        design_url: result.design_url,
        mockup_id: result.mockup_id
      },
      agent_id: result.agent || 'mockup-generator-31'
    };
    
  } catch (error) {
    await trackCost('mockup-generator-31', 0, `Smoke test error: ${error.message}`);
    
    return {
      name: 'agent-31-mockup',
      status: 'error',
      responseTime: Date.now() - startTime,
      cost: 0,
      error: error.message,
      agent_id: 'mockup-generator-31'
    };
  }
}

function validateMockupResult(result) {
  // Check required fields
  if (!result.agent) {
    return { valid: false, reason: 'Missing agent field' };
  }
  
  if (!result.status) {
    return { valid: false, reason: 'Missing status field' };
  }
  
  if (typeof result.mockups_generated !== 'number') {
    return { valid: false, reason: 'Missing or invalid mockups_generated field' };
  }
  
  if (!Array.isArray(result.mockup_urls)) {
    return { valid: false, reason: 'Missing or invalid mockup_urls array' };
  }
  
  if (typeof result.quality_score !== 'number') {
    return { valid: false, reason: 'Missing or invalid quality_score field' };
  }
  
  // Validate status values
  const validStatuses = ['pass', 'fail', 'warning', 'error'];
  if (!validStatuses.includes(result.status)) {
    return { valid: false, reason: `Invalid status: ${result.status}` };
  }
  
  // Validate mockup count consistency
  if (result.mockups_generated !== result.mockup_urls.length) {
    return { valid: false, reason: `Mockup count mismatch: generated=${result.mockups_generated}, urls=${result.mockup_urls.length}` };
  }
  
  // Validate quality score range (0-10)
  if (result.quality_score < 0 || result.quality_score > 10) {
    return { valid: false, reason: `Quality score out of range: ${result.quality_score}` };
  }
  
  // Validate mockup URL structure
  for (const mockup of result.mockup_urls) {
    if (!mockup.type) {
      return { valid: false, reason: 'Mockup missing type field' };
    }
    if (!mockup.url) {
      return { valid: false, reason: 'Mockup missing url field' };
    }
    if (!mockup.url.startsWith('http')) {
      return { valid: false, reason: 'Invalid mockup URL format' };
    }
  }
  
  // Validate expected mockup count (should generate at least 1, typically 3)
  if (result.mockups_generated < 1) {
    return { valid: false, reason: 'No mockups generated' };
  }
  
  return { valid: true };
}

module.exports = { testMockupAgent };