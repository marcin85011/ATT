/**
 * Grammarly Business API Client - Agent #28
 * Comprehensive grammar and spelling validation
 */

const { trackCost } = require('../shared/cost-tracker');
const { errorHandler } = require('../shared/error-handler');
const { validateEnvironment, sanitizeText } = require('../shared/utils');

class GrammarlyClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.GRAMMARLY_API_KEY;
    this.baseUrl = 'https://api.grammarly.com/v1';
    this.mockMode = process.env.MOCK_MODE === 'true';
    this.agentId = 'spell-check-28';
  }

  async checkText(text, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate environment
      const envCheck = validateEnvironment(['GRAMMARLY_API_KEY']);
      if (!envCheck.valid && !this.mockMode) {
        throw new Error(`Missing required environment variables: ${envCheck.missing.join(', ')}`);
      }

      // Sanitize input text
      const cleanText = sanitizeText(text, { maxLength: 5000 });
      
      if (this.mockMode) {
        return this._getMockResult(cleanText, startTime);
      }

      // TODO: Implement actual Grammarly API integration in Phase 6-β
      const result = await this._callGrammarlyAPI(cleanText, options);
      
      // Track cost
      await trackCost(this.agentId, 0.001, `Spell check for ${cleanText.length} characters`);
      
      return this._formatResult(result, startTime);
      
    } catch (error) {
      await errorHandler(this.agentId, error, { text: text.substring(0, 100) });
      throw error;
    }
  }

  async _callGrammarlyAPI(text, options) {
    // TODO: Implement in Phase 6-β
    // This is a stub for the actual Grammarly Business API integration
    const requestBody = {
      text: text,
      dialect: options.dialect || 'american',
      domain: options.domain || 'creative',
      audience: options.audience || 'general',
      goals: options.goals || ['clarity', 'engagement']
    };

    // Placeholder for actual API call
    throw new Error('Grammarly API integration not implemented in Phase 6-α');
  }

  _getMockResult(text, startTime) {
    // Mock response for development/testing
    const processingTime = Date.now() - startTime;
    
    // Simulate different quality levels based on text content
    const hasTypos = /\b(teh|recieve|seperate|accomodate|occured)\b/i.test(text);
    const hasGrammarIssues = /\b(your awesome|its working|there house)\b/i.test(text);
    
    const result = {
      agent: this.agentId,
      status: (!hasTypos && !hasGrammarIssues) ? 'pass' : 'fail',
      spelling_errors: hasTypos ? 1 : 0,
      grammar_score: hasGrammarIssues ? 85 : 98,
      clarity_score: 92,
      engagement_score: 88,
      corrections: [],
      processing_time_ms: processingTime,
      cost: 0.001,
      mock: true
    };

    // Add mock corrections if issues found
    if (hasTypos) {
      result.corrections.push({
        type: 'spelling',
        original: 'teh',
        suggested: 'the',
        confidence: 0.99
      });
    }

    if (hasGrammarIssues) {
      result.corrections.push({
        type: 'grammar',
        original: "your awesome",
        suggested: "you're awesome",
        confidence: 0.95
      });
    }

    return result;
  }

  _formatResult(apiResult, startTime) {
    // TODO: Implement in Phase 6-β
    // Format the actual Grammarly API response
    const processingTime = Date.now() - startTime;
    
    return {
      agent: this.agentId,
      status: this._determineStatus(apiResult),
      spelling_errors: apiResult.spelling_errors || 0,
      grammar_score: apiResult.grammar_score || 0,
      clarity_score: apiResult.clarity_score || 0,
      engagement_score: apiResult.engagement_score || 0,
      corrections: apiResult.corrections || [],
      processing_time_ms: processingTime,
      cost: 0.001,
      mock: false
    };
  }

  _determineStatus(result) {
    // Quality thresholds from specification
    if (result.spelling_errors > 0) return 'fail';
    if (result.grammar_score < 95) return 'fail';
    if (result.clarity_score < 90) return 'warning';
    if (result.engagement_score < 80) return 'warning';
    return 'pass';
  }

  // Health check method
  async healthCheck() {
    try {
      if (this.mockMode) {
        return { status: 'healthy', mode: 'mock' };
      }
      
      // TODO: Implement actual health check in Phase 6-β
      return { status: 'healthy', mode: 'production' };
      
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = { GrammarlyClient };