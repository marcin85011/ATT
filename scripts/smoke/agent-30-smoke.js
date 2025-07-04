/**
 * Agent #30 Smoke Test - Readability Client
 */

const { ReadabilityClient } = require('../../clients/readability-client');
const { trackCost, checkDailyBudget } = require('../../shared/cost-tracker');

async function testReadabilityAgent() {
  const startTime = Date.now();
  
  // Check daily budget before proceeding
  const budgetCheck = await checkDailyBudget();
  if (!budgetCheck.withinBudget) {
    console.log(`⚠️ Budget limit reached - skipping Agent #30 (Readability). Daily spend: $${budgetCheck.dailySpend}, Limit: $${budgetCheck.budgetLimit}`);
    
    // Track zero-cost heartbeat to show workflow fired
    await trackCost('readability-scorer-30', 0, 'Budget limit reached - skipped execution');
    
    return {
      name: 'agent-30-readability',
      status: 'skipped',
      responseTime: Date.now() - startTime,
      cost: 0,
      details: {
        budget_exceeded: true,
        daily_spend: budgetCheck.dailySpend,
        budget_limit: budgetCheck.budgetLimit,
        remaining: budgetCheck.remaining
      },
      agent_id: 'readability-scorer-30'
    };
  }
  
  try {
    const client = new ReadabilityClient();
    
    // Test with sample text optimized for t-shirt design readability
    const testText = "Keep it simple. Easy words work best.";
    const result = await client.scoreReadability(testText);
    
    // Validate result structure
    const isValid = validateReadabilityResult(result);
    
    if (!isValid.valid) {
      throw new Error(`Invalid result structure: ${isValid.reason}`);
    }
    
    return {
      name: 'agent-30-readability',
      status: result.status || 'pass',
      responseTime: Date.now() - startTime,
      cost: result.cost || 0.000,
      details: {
        mock: result.mock,
        flesch_reading_ease: result.flesch_reading_ease,
        flesch_kincaid_grade: result.flesch_kincaid_grade,
        average_sentence_length: result.average_sentence_length,
        syllables_per_word: result.syllables_per_word,
        readability_score: result.readability_score,
        target_audience: result.target_audience,
        recommendations_count: (result.recommendations || []).length
      },
      agent_id: result.agent || 'readability-scorer-30'
    };
    
  } catch (error) {
    await trackCost('readability-scorer-30', 0, `Smoke test error: ${error.message}`);
    
    return {
      name: 'agent-30-readability',
      status: 'error',
      responseTime: Date.now() - startTime,
      cost: 0,
      error: error.message,
      agent_id: 'readability-scorer-30'
    };
  }
}

function validateReadabilityResult(result) {
  // Check required fields
  if (!result.agent) {
    return { valid: false, reason: 'Missing agent field' };
  }
  
  if (!result.status) {
    return { valid: false, reason: 'Missing status field' };
  }
  
  if (typeof result.flesch_reading_ease !== 'number') {
    return { valid: false, reason: 'Missing or invalid flesch_reading_ease field' };
  }
  
  if (typeof result.flesch_kincaid_grade !== 'number') {
    return { valid: false, reason: 'Missing or invalid flesch_kincaid_grade field' };
  }
  
  if (typeof result.readability_score !== 'number') {
    return { valid: false, reason: 'Missing or invalid readability_score field' };
  }
  
  // Validate status values
  const validStatuses = ['pass', 'fail', 'warning', 'error'];
  if (!validStatuses.includes(result.status)) {
    return { valid: false, reason: `Invalid status: ${result.status}` };
  }
  
  // Validate Flesch Reading Ease range (typically 0-100, but can go negative)
  if (result.flesch_reading_ease < -50 || result.flesch_reading_ease > 150) {
    return { valid: false, reason: `Flesch Reading Ease out of reasonable range: ${result.flesch_reading_ease}` };
  }
  
  // Validate grade level (should be reasonable, typically 0-20)
  if (result.flesch_kincaid_grade < 0 || result.flesch_kincaid_grade > 25) {
    return { valid: false, reason: `Grade level out of reasonable range: ${result.flesch_kincaid_grade}` };
  }
  
  // Validate readability score (0-10 scale according to client)
  if (result.readability_score < 0 || result.readability_score > 10) {
    return { valid: false, reason: `Readability score out of range: ${result.readability_score}` };
  }
  
  // Validate target audience field exists
  if (!result.target_audience) {
    return { valid: false, reason: 'Missing target_audience field' };
  }
  
  return { valid: true };
}

module.exports = { testReadabilityAgent };