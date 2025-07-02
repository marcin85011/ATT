/**
 * Agent #28 Smoke Test - Grammarly Client
 */

const { GrammarlyClient } = require('../../clients/grammarly-client');
const { trackCost, checkDailyBudget } = require('../../shared/cost-tracker');

async function testGrammarlyAgent() {
  const startTime = Date.now();
  
  // Check daily budget before proceeding
  const budgetCheck = await checkDailyBudget();
  if (!budgetCheck.withinBudget) {
    console.log(`⚠️ Budget limit reached - skipping Agent #28 (Grammarly). Daily spend: $${budgetCheck.dailySpend}, Limit: $${budgetCheck.budgetLimit}`);
    
    // Track zero-cost heartbeat to show workflow fired
    await trackCost('spell-check-28', 0, 'Budget limit reached - skipped execution');
    
    return {
      name: 'agent-28-grammarly',
      status: 'skipped',
      responseTime: Date.now() - startTime,
      cost: 0,
      details: {
        budget_exceeded: true,
        daily_spend: budgetCheck.dailySpend,
        budget_limit: budgetCheck.budgetLimit,
        remaining: budgetCheck.remaining
      },
      agent_id: 'spell-check-28'
    };
  }
  
  try {
    const client = new GrammarlyClient();
    
    // Test with sample text containing known issues for validation
    const testText = "This is a test sentance with teh word misspelled.";
    const result = await client.checkText(testText);
    
    // Validate result structure
    const isValid = validateGrammarlyResult(result);
    
    if (!isValid.valid) {
      throw new Error(`Invalid result structure: ${isValid.reason}`);
    }
    
    return {
      name: 'agent-28-grammarly',
      status: validateAgentWorking(result),
      responseTime: Date.now() - startTime,
      cost: result.cost || 0.001,
      details: {
        mock: result.mock,
        spelling_errors: result.spelling_errors,
        grammar_score: result.grammar_score,
        clarity_score: result.clarity_score,
        engagement_score: result.engagement_score,
        corrections_count: (result.corrections || []).length
      },
      agent_id: result.agent || 'spell-check-28'
    };
    
  } catch (error) {
    await trackCost('spell-check-28', 0, `Smoke test error: ${error.message}`);
    
    return {
      name: 'agent-28-grammarly',
      status: 'error',
      responseTime: Date.now() - startTime,
      cost: 0,
      error: error.message,
      agent_id: 'spell-check-28'
    };
  }
}

function validateGrammarlyResult(result) {
  // Check required fields
  if (!result.agent) {
    return { valid: false, reason: 'Missing agent field' };
  }
  
  if (!result.status) {
    return { valid: false, reason: 'Missing status field' };
  }
  
  if (typeof result.spelling_errors !== 'number') {
    return { valid: false, reason: 'Missing or invalid spelling_errors field' };
  }
  
  if (typeof result.grammar_score !== 'number') {
    return { valid: false, reason: 'Missing or invalid grammar_score field' };
  }
  
  if (!Array.isArray(result.corrections)) {
    return { valid: false, reason: 'Missing or invalid corrections array' };
  }
  
  // Validate status values
  const validStatuses = ['pass', 'fail', 'warning', 'error'];
  if (!validStatuses.includes(result.status)) {
    return { valid: false, reason: `Invalid status: ${result.status}` };
  }
  
  // Validate score ranges
  if (result.grammar_score < 0 || result.grammar_score > 100) {
    return { valid: false, reason: `Grammar score out of range: ${result.grammar_score}` };
  }
  
  if (result.clarity_score && (result.clarity_score < 0 || result.clarity_score > 100)) {
    return { valid: false, reason: `Clarity score out of range: ${result.clarity_score}` };
  }
  
  return { valid: true };
}

function validateAgentWorking(result) {
  // Agent is working correctly if it detects the deliberate spelling errors
  // Test text: "This is a test sentance with teh word misspelled."
  // Expected: spelling_errors > 0 AND corrections array has entries
  
  if (result.mock) {
    // In mock mode, check if it detected our deliberate errors
    return result.spelling_errors > 0 && result.corrections && result.corrections.length > 0 ? 'pass' : 'fail';
  } else {
    // In real mode, same logic
    return result.spelling_errors > 0 && result.corrections && result.corrections.length > 0 ? 'pass' : 'fail';
  }
}

module.exports = { testGrammarlyAgent };