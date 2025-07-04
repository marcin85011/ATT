/**
 * Grammarly Business API Client - Agent #28
 * Comprehensive grammar and spelling validation
 */

const fetch = require('node-fetch');
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

      // Call Grammarly Business API
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
    const requestBody = {
      text: text,
      dialect: options.dialect || 'american',
      domain: options.domain || 'creative',
      audience: options.audience || 'general',
      goals: options.goals || ['clarity', 'engagement'],
      clientType: 'business-api',
      suggestions: true
    };

    const response = await fetch(`${this.baseUrl}/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ATT-System-QC-Agent/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Grammarly API error ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    
    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 60;
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    }

    return result;
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
    // Format the Grammarly API response to our standard format
    const processingTime = Date.now() - startTime;
    
    // Extract corrections from Grammarly response
    const corrections = (apiResult.alerts || []).map(alert => ({
      type: alert.category === 'Spelling' ? 'spelling' : 'grammar',
      original: alert.text,
      suggested: alert.replacements?.[0] || '',
      confidence: alert.impact === 'high' ? 0.99 : alert.impact === 'medium' ? 0.85 : 0.70,
      position: {
        start: alert.begin,
        end: alert.end
      },
      description: alert.explanation
    }));

    // Calculate scores based on Grammarly response
    const spellingErrors = corrections.filter(c => c.type === 'spelling').length;
    const grammarScore = Math.max(0, 100 - (corrections.length * 3)); // Penalize each issue
    const clarityScore = apiResult.scores?.clarity || 90;
    const engagementScore = apiResult.scores?.engagement || 85;
    
    const formatted = {
      agent: this.agentId,
      status: this._determineStatus({
        spelling_errors: spellingErrors,
        grammar_score: grammarScore,
        clarity_score: clarityScore,
        engagement_score: engagementScore
      }),
      spelling_errors: spellingErrors,
      grammar_score: grammarScore,
      clarity_score: clarityScore,
      engagement_score: engagementScore,
      corrections: corrections,
      processing_time_ms: processingTime,
      cost: 0.001,
      mock: false
    };

    return formatted;
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
      
      // Test API connectivity with minimal request
      const testResponse = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'ATT-System-QC-Agent/1.0'
        },
        timeout: 5000
      });

      if (testResponse.ok) {
        return { 
          status: 'healthy', 
          mode: 'production',
          api_status: 'connected',
          rate_limit_remaining: testResponse.headers.get('X-RateLimit-Remaining') || 'unknown'
        };
      } else {
        return { 
          status: 'degraded', 
          mode: 'production',
          api_status: 'error',
          error: `HTTP ${testResponse.status}`
        };
      }
      
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message,
        mode: 'production'
      };
    }
  }
}

module.exports = { GrammarlyClient };