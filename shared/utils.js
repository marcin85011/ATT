/**
 * ATT System Utilities - Shared Module
 * Common utility functions for all agents
 */

async function isDuplicateTopic(topic) {
  try {
    // TODO: Implement full duplicate detection in Phase 6-β
    // For now, always return false (no duplicates)
    console.log(`🔍 Checking duplicate for: ${topic}`);
    
    // Basic stub implementation
    const duplicateCache = new Set();
    const isDuplicate = duplicateCache.has(topic);
    if (!isDuplicate) {
      duplicateCache.add(topic);
    }
    
    return isDuplicate;
  } catch (error) {
    console.error('❌ Duplicate check failed:', error.message);
    return false;
  }
}

function generateId(prefix = 'att') {
  // TODO: Enhance ID generation in Phase 6-β
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

function validateEnvironment(requiredVars) {
  // TODO: Implement comprehensive environment validation in Phase 6-β
  const missing = requiredVars.filter(varName => !process.env[varName]);
  const warnings = [];
  
  // Check for mock mode warnings
  if (process.env.MOCK_MODE === 'true') {
    warnings.push('Running in MOCK_MODE - some APIs will return dummy data');
  }
  
  return { 
    valid: missing.length === 0, 
    missing, 
    warnings,
    mockMode: process.env.MOCK_MODE === 'true'
  };
}

function sanitizeText(text, options = {}) {
  // TODO: Implement comprehensive text sanitization in Phase 6-β
  const { maxLength = 1000, removeHtml = true, removeEmojis = false } = options;
  
  let cleaned = text || '';
  
  if (removeHtml) {
    cleaned = cleaned.replace(/<[^>]*>/g, '');
  }
  
  if (removeEmojis) {
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '');
  }
  
  return cleaned.substring(0, maxLength).trim();
}

function calculateProgress(current, total) {
  // TODO: Enhance progress calculation in Phase 6-β
  if (total <= 0) return 0;
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  return {
    percentage: Math.round(percentage),
    current,
    total,
    remaining: total - current,
    completed: current >= total
  };
}

module.exports = { 
  isDuplicateTopic, 
  generateId, 
  validateEnvironment, 
  sanitizeText, 
  calculateProgress 
};