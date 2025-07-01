/**
 * Agent #29 Smoke Test - Contrast Client
 */

const { ContrastClient } = require('../../clients/contrast-client');
const { trackCost } = require('../../shared/cost-tracker');

async function testContrastAgent() {
  const startTime = Date.now();
  
  try {
    const client = new ContrastClient();
    
    // Create minimal test image (1x1 black pixel base64)
    const testImage = createTestImage();
    const result = await client.analyzeContrast(testImage);
    
    // Validate result structure
    const isValid = validateContrastResult(result);
    
    if (!isValid.valid) {
      throw new Error(`Invalid result structure: ${isValid.reason}`);
    }
    
    return {
      name: 'agent-29-contrast',
      status: result.status || 'pass',
      responseTime: Date.now() - startTime,
      cost: result.cost || 0.000,
      details: {
        mock: result.mock,
        wcag_aa_compliant: result.wcag_aa_compliant,
        wcag_aaa_compliant: result.wcag_aaa_compliant,
        contrast_ratio: result.contrast_ratio,
        accessibility_score: result.accessibility_score,
        colorblind_friendly: result.colorblind_friendly,
        primary_text_color: result.primary_text_color,
        background_color: result.background_color
      },
      agent_id: result.agent || 'contrast-analyzer-29'
    };
    
  } catch (error) {
    await trackCost('contrast-analyzer-29', 0, `Smoke test error: ${error.message}`);
    
    return {
      name: 'agent-29-contrast',
      status: 'error',
      responseTime: Date.now() - startTime,
      cost: 0,
      error: error.message,
      agent_id: 'contrast-analyzer-29'
    };
  }
}

function createTestImage() {
  // Create a simple 1x1 black pixel PNG in base64
  // This is a minimal valid PNG that will trigger the contrast analysis
  const blackPixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hzyku1AAAAABJRU5ErkJggg==';
  return blackPixelPng;
}

function validateContrastResult(result) {
  // Check required fields
  if (!result.agent) {
    return { valid: false, reason: 'Missing agent field' };
  }
  
  if (!result.status) {
    return { valid: false, reason: 'Missing status field' };
  }
  
  if (typeof result.wcag_aa_compliant !== 'boolean') {
    return { valid: false, reason: 'Missing or invalid wcag_aa_compliant field' };
  }
  
  if (typeof result.wcag_aaa_compliant !== 'boolean') {
    return { valid: false, reason: 'Missing or invalid wcag_aaa_compliant field' };
  }
  
  if (typeof result.contrast_ratio !== 'number') {
    return { valid: false, reason: 'Missing or invalid contrast_ratio field' };
  }
  
  if (typeof result.accessibility_score !== 'number') {
    return { valid: false, reason: 'Missing or invalid accessibility_score field' };
  }
  
  // Validate status values
  const validStatuses = ['pass', 'fail', 'warning', 'error'];
  if (!validStatuses.includes(result.status)) {
    return { valid: false, reason: `Invalid status: ${result.status}` };
  }
  
  // Validate contrast ratio range (should be >= 1.0)
  if (result.contrast_ratio < 1.0) {
    return { valid: false, reason: `Invalid contrast ratio: ${result.contrast_ratio}` };
  }
  
  // Validate accessibility score range (0-10)
  if (result.accessibility_score < 0 || result.accessibility_score > 10) {
    return { valid: false, reason: `Accessibility score out of range: ${result.accessibility_score}` };
  }
  
  return { valid: true };
}

module.exports = { testContrastAgent };