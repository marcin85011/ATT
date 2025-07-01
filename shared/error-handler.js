/**
 * ATT System Error Handler - Shared Module
 * Centralized error handling for all agents with function wrapping
 */

const fs = require('fs').promises;
const path = require('path');

async function errorHandler(agentId, error, context = {}) {
  try {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      agent: agentId,
      error: error.message,
      stack: error.stack,
      context,
      severity: determineSeverity(error),
      retryable: isRetryableError(error),
      error_type: classifyErrorType(error),
      error_hash: generateErrorHash(error, agentId)
    };

    console.error(`❌ Agent ${agentId} error [${errorEntry.severity}]:`, error.message);
    if (Object.keys(context).length > 0) {
      console.error('Context:', context);
    }
    
    // Enhanced error logging with JSONL format for better performance
    const errorFile = path.join(__dirname, '../error-log.jsonl');
    const logLine = JSON.stringify(errorEntry) + '\n';
    
    await fs.appendFile(errorFile, logLine);
    
    // Also maintain JSON file for compatibility
    const jsonFile = path.join(__dirname, '../error-log.json');
    let existingErrors = [];
    
    try {
      const data = await fs.readFile(jsonFile, 'utf8');
      existingErrors = JSON.parse(data);
    } catch (err) {
      // File doesn't exist, start fresh
    }
    
    existingErrors.push(errorEntry);
    
    // Keep only last 500 errors in JSON file to prevent bloat
    if (existingErrors.length > 500) {
      existingErrors = existingErrors.slice(-500);
    }
    
    await fs.writeFile(jsonFile, JSON.stringify(existingErrors, null, 2));
    
    return errorEntry;
  } catch (handlerError) {
    console.error('❌ Error handler failed:', handlerError.message);
    return false;
  }
}

function createErrorResponse(agentId, error, context) {
  const errorType = classifyErrorType(error);
  const severity = determineSeverity(error);
  const retryable = isRetryableError(error);
  
  return {
    success: false,
    agent: agentId,
    error: error.message,
    error_type: errorType,
    severity,
    context,
    timestamp: new Date().toISOString(),
    retry_suggested: retryable,
    retry_delay: retryable ? getRetryDelay(error) : null,
    error_hash: generateErrorHash(error, agentId)
  };
}

function determineSeverity(error) {
  const message = error.message.toLowerCase();
  
  // Critical - system cannot function
  if (message.includes('api key') || 
      message.includes('authentication') || 
      message.includes('unauthorized') ||
      message.includes('forbidden')) {
    return 'critical';
  }
  
  // High - significant functionality impact
  if (message.includes('file not found') ||
      message.includes('permission denied') ||
      message.includes('invalid request') ||
      message.includes('400')) {
    return 'high';
  }
  
  // Warning - temporary/recoverable issues
  if (message.includes('timeout') || 
      message.includes('network') ||
      message.includes('429') || 
      message.includes('503') ||
      message.includes('502')) {
    return 'warning';
  }
  
  // Low - minor issues
  if (message.includes('validation') ||
      message.includes('format')) {
    return 'low';
  }
  
  return 'error'; // Default
}

function isRetryableError(error) {
  const retryableMessages = [
    'timeout', 'network', 'connection',
    '429', '503', '502', '504', // HTTP status codes
    'rate limit', 'temporary', 'retry',
    'socket', 'econnreset', 'enotfound'
  ];
  
  const message = error.message.toLowerCase();
  return retryableMessages.some(msg => message.includes(msg));
}

function classifyErrorType(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('connection') || message.includes('socket')) {
    return 'network';
  }
  if (message.includes('timeout')) {
    return 'timeout';
  }
  if (message.includes('auth') || message.includes('api key') || message.includes('unauthorized')) {
    return 'authentication';
  }
  if (message.includes('validation') || message.includes('format') || message.includes('invalid')) {
    return 'validation';
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return 'rate_limit';
  }
  if (message.includes('file') || message.includes('path')) {
    return 'file_system';
  }
  
  return 'application';
}

function generateErrorHash(error, agentId) {
  // Create a simple hash for error deduplication
  const hashContent = `${agentId}-${error.name}-${error.message.substring(0, 100)}`;
  let hash = 0;
  for (let i = 0; i < hashContent.length; i++) {
    const char = hashContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

function getRetryDelay(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('429') || message.includes('rate limit')) {
    return 60000; // 1 minute for rate limits
  }
  if (message.includes('timeout')) {
    return 5000; // 5 seconds for timeouts
  }
  if (message.includes('network') || message.includes('connection')) {
    return 10000; // 10 seconds for network issues
  }
  
  return 3000; // Default 3 seconds
}

// Function wrapper for automatic error handling
function wrap(fn, agentId) {
  return async function(...args) {
    try {
      const result = await fn.apply(this, args);
      return result;
    } catch (error) {
      // Log the error
      await errorHandler(agentId, error, {
        function_name: fn.name,
        arguments_count: args.length,
        wrapped: true
      });
      
      // Re-throw the error so calling code can handle it
      throw error;
    }
  };
}

// Get error statistics for monitoring
async function getErrorStats(agentId = null, hours = 24) {
  try {
    const jsonFile = path.join(__dirname, '../error-log.json');
    let errors = [];
    
    try {
      const data = await fs.readFile(jsonFile, 'utf8');
      errors = JSON.parse(data);
    } catch (err) {
      return { total: 0, by_severity: {}, by_type: {}, by_agent: {} };
    }
    
    // Filter by time and agent
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const filteredErrors = errors.filter(e => {
      const errorTime = new Date(e.timestamp);
      const timeMatch = errorTime >= cutoffTime;
      const agentMatch = !agentId || e.agent === agentId;
      return timeMatch && agentMatch;
    });
    
    // Group by severity, type, and agent
    const bySeverity = {};
    const byType = {};
    const byAgent = {};
    
    filteredErrors.forEach(error => {
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
      byType[error.error_type] = (byType[error.error_type] || 0) + 1;
      byAgent[error.agent] = (byAgent[error.agent] || 0) + 1;
    });
    
    return {
      total: filteredErrors.length,
      hours_analyzed: hours,
      target_agent: agentId,
      by_severity: bySeverity,
      by_type: byType,
      by_agent: byAgent,
      most_common_error: Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none'
    };
  } catch (error) {
    console.error('❌ Error stats failed:', error.message);
    return { error: error.message };
  }
}

module.exports = { 
  errorHandler, 
  createErrorResponse, 
  determineSeverity, 
  isRetryableError,
  classifyErrorType,
  generateErrorHash,
  getRetryDelay,
  wrap,
  getErrorStats
};