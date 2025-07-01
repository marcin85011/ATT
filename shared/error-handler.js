/**
 * ATT System Error Handler - Shared Module
 * Centralized error handling for all agents
 */

async function errorHandler(agentId, error, context = {}) {
  try {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      agent: agentId,
      error: error.message,
      stack: error.stack,
      context,
      severity: determineSeverity(error)
    };

    // TODO: Implement full error tracking in Phase 6-β
    // For now, just log the error with context
    console.error(`❌ Agent ${agentId} error:`, error.message);
    console.error('Context:', context);
    console.error('Severity:', errorEntry.severity);
    
    // Basic error logging for development
    const fs = require('fs').promises;
    const path = require('path');
    const errorFile = path.join(__dirname, '../error-log.json');
    let existingErrors = [];
    
    try {
      const data = await fs.readFile(errorFile, 'utf8');
      existingErrors = JSON.parse(data);
    } catch (err) {
      // File doesn't exist, start fresh
    }
    
    existingErrors.push(errorEntry);
    await fs.writeFile(errorFile, JSON.stringify(existingErrors, null, 2));
    
    return false;
  } catch (handlerError) {
    console.error('❌ Error handler failed:', handlerError.message);
    return false;
  }
}

function createErrorResponse(agentId, error, context) {
  // TODO: Enhance error response format in Phase 6-β
  return {
    success: false,
    agent: agentId,
    error: error.message,
    context,
    timestamp: new Date().toISOString(),
    retry_suggested: isRetryableError(error)
  };
}

function determineSeverity(error) {
  // TODO: Implement sophisticated severity classification in Phase 6-β
  if (error.message.includes('API key') || error.message.includes('authentication')) {
    return 'critical';
  }
  if (error.message.includes('timeout') || error.message.includes('network')) {
    return 'warning';
  }
  return 'error';
}

function isRetryableError(error) {
  // TODO: Implement retry logic classification in Phase 6-β
  const retryableMessages = ['timeout', 'network', '429', '503', '502'];
  return retryableMessages.some(msg => error.message.toLowerCase().includes(msg));
}

module.exports = { errorHandler, createErrorResponse, determineSeverity, isRetryableError };