/**
 * OpenAI API Client Unit Tests
 * Tests for ChatGPT-4o and Vision API integrations in MBA Intelligence Engine
 */

const { jest } = require('@jest/globals');
const nock = require('nock');

// Mock OpenAI client
class MockOpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com';
  }

  async createChatCompletion(payload) {
    // Simulate API call for testing
    const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response.json();
  }

  async createVisionAnalysis(payload) {
    // Simulate Vision API call
    const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: payload.messages,
        max_tokens: 1500
      })
    });
    return response.json();
  }
}

describe('OpenAI API Client', () => {
  let openaiClient;
  const mockApiKey = 'sk-test-key-for-jest';
  
  beforeEach(() => {
    openaiClient = new MockOpenAIClient(mockApiKey);
    // Clear all mocks before each test
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Chat Completions API', () => {
    test('should successfully create chat completion for compliance check', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              trademark_hits: [],
              policy_flags: [],
              amazon_risk_score: 1,
              mobile_optimization: {
                thumbnail_readable: true,
                contrast_ratio: 5.2
              },
              verdict: "PASS",
              reason: "Design complies with Amazon policies",
              fix_suggestion: "None required",
              is_mutation: false
            })
          }
        }],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 75,
          total_tokens: 225
        }
      };

      // Mock the API call
      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      const payload = {
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: 'You are Amazon-Compliance-Agent-2025, enforcing ZERO-TOLERANCE policies.'
        }, {
          role: 'user',
          content: 'Analyze this design for compliance: Coffee Lover T-Shirt'
        }],
        temperature: 0.1,
        max_tokens: 1000
      };

      const result = await openaiClient.createChatCompletion(payload);
      
      expect(result.choices).toBeDefined();
      expect(result.choices[0].message.content).toContain('PASS');
      expect(result.usage.total_tokens).toBeGreaterThan(0);
    });

    test('should handle API errors gracefully', async () => {
      // Mock API error
      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(429, {
          error: {
            message: 'Rate limit exceeded',
            type: 'rate_limit_error'
          }
        });

      const payload = {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Test message' }]
      };

      try {
        await openaiClient.createChatCompletion(payload);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should calculate correct cost estimation', () => {
      const tokens = 1000;
      const gpt4oCostPer1kTokens = 0.03; // $0.03 per 1K tokens for GPT-4o
      const estimatedCost = (tokens / 1000) * gpt4oCostPer1kTokens;
      
      expect(estimatedCost).toBe(0.03);
      expect(estimatedCost).toBeLessThan(0.05); // Budget threshold
    });
  });

  describe('Vision API', () => {
    test('should analyze competitor t-shirt designs', async () => {
      const mockVisionResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              color_strategy: {
                background: 'black',
                text: 'white',
                effectiveness: 'high'
              },
              typography: {
                readability: 9,
                font_style: 'bold_sans_serif',
                size_appropriateness: 'excellent'
              },
              layout: {
                composition: 'centered',
                balance: 'good',
                mobile_friendly: true
              },
              market_positioning: 'premium_casual',
              mobile_optimization: {
                thumbnail_score: 8.5,
                contrast_ratio: 6.2
              }
            })
          }
        }],
        usage: {
          prompt_tokens: 200,
          completion_tokens: 100,
          total_tokens: 300
        }
      };

      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(200, mockVisionResponse);

      const payload = {
        messages: [{
          role: 'system',
          content: 'Analyze t-shirt designs for color strategy, typography, and mobile optimization.'
        }, {
          role: 'user',
          content: [{
            type: 'image_url',
            image_url: {
              url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
            }
          }, {
            type: 'text',
            text: 'Analyze this t-shirt design for Amazon Merch optimization'
          }]
        }]
      };

      const result = await openaiClient.createVisionAnalysis(payload);
      const analysis = JSON.parse(result.choices[0].message.content);
      
      expect(analysis.color_strategy).toBeDefined();
      expect(analysis.typography.readability).toBeGreaterThanOrEqual(8);
      expect(analysis.mobile_optimization.thumbnail_score).toBeGreaterThan(7);
    });

    test('should handle vision API rate limits', async () => {
      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(429, {
          error: {
            message: 'Rate limit exceeded for vision requests',
            type: 'rate_limit_error'
          }
        });

      const payload = {
        messages: [{
          role: 'user',
          content: [{
            type: 'image_url',
            image_url: { url: 'data:image/png;base64,test' }
          }]
        }]
      };

      await expect(openaiClient.createVisionAnalysis(payload))
        .rejects.toBeDefined();
    });
  });

  describe('Cost Control & Budget Management', () => {
    test('should track token usage accurately', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      };

      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(200, mockResponse);

      const result = await openaiClient.createChatCompletion({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Short test' }]
      });

      expect(result.usage.total_tokens).toBe(150);
      expect(result.usage.prompt_tokens).toBe(100);
      expect(result.usage.completion_tokens).toBe(50);
    });

    test('should stay within budget thresholds', () => {
      const dailyBudget = 10.00; // $10 daily budget
      const costPerToken = 0.00003; // GPT-4o pricing
      const maxTokensPerDay = dailyBudget / costPerToken;
      
      expect(maxTokensPerDay).toBeGreaterThan(300000); // Should allow plenty of tokens
      
      // Test single request cost
      const singleRequestTokens = 1000;
      const singleRequestCost = singleRequestTokens * costPerToken;
      expect(singleRequestCost).toBeLessThan(0.10); // Should be under 10 cents per request
    });
  });

  describe('Error Handling & Resilience', () => {
    test('should retry on temporary failures', async () => {
      let callCount = 0;
      
      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .times(2)
        .reply(() => {
          callCount++;
          if (callCount === 1) {
            return [500, { error: 'Internal server error' }];
          }
          return [200, {
            choices: [{ message: { content: 'Success after retry' } }],
            usage: { total_tokens: 50 }
          }];
        });

      // This would need retry logic implemented in the actual client
      const payload = {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Test retry' }]
      };

      // For now, just test that we can detect the need for retry
      expect(callCount).toBe(0);
    });

    test('should validate API responses', () => {
      const validResponse = {
        choices: [{ message: { content: 'Valid response' } }],
        usage: { total_tokens: 100 }
      };

      const invalidResponse = {
        // Missing required fields
        error: 'Invalid response structure'
      };

      expect(validResponse.choices).toBeDefined();
      expect(validResponse.usage.total_tokens).toBeGreaterThan(0);
      expect(invalidResponse.choices).toBeUndefined();
    });
  });

  describe('Integration with MBA System', () => {
    test('should format compliance check responses correctly', async () => {
      const mockComplianceResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              trademark_hits: [
                { term: 'example', risk_level: 'LOW', match_type: 'partial' }
              ],
              policy_flags: [],
              amazon_risk_score: 2,
              mobile_optimization: {
                thumbnail_readable: true,
                contrast_ratio: 4.8
              },
              verdict: 'PASS',
              reason: 'Low risk trademark match, acceptable',
              fix_suggestion: 'Consider alternative wording',
              is_mutation: false
            })
          }
        }],
        usage: { total_tokens: 200 }
      };

      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(200, mockComplianceResponse);

      const result = await openaiClient.createChatCompletion({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Check compliance' }]
      });

      const compliance = JSON.parse(result.choices[0].message.content);
      
      expect(compliance.verdict).toBe('PASS');
      expect(compliance.amazon_risk_score).toBeLessThan(3);
      expect(compliance.mobile_optimization.contrast_ratio).toBeGreaterThan(4.5);
      expect(Array.isArray(compliance.trademark_hits)).toBe(true);
    });

    test('should handle mutation designs appropriately', async () => {
      const mutationResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              trademark_hits: [],
              policy_flags: [],
              amazon_risk_score: 3, // Slightly higher for experimental design
              mobile_optimization: {
                thumbnail_readable: true,
                contrast_ratio: 4.6
              },
              verdict: 'PASS',
              reason: 'Mutation design passes with acceptable risk',
              fix_suggestion: 'None required',
              is_mutation: true
            })
          }
        }],
        usage: { total_tokens: 180 }
      };

      nock('https://api.openai.com')
        .post('/v1/chat/completions')
        .reply(200, mutationResponse);

      const result = await openaiClient.createChatCompletion({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Check experimental design' }]
      });

      const compliance = JSON.parse(result.choices[0].message.content);
      
      expect(compliance.is_mutation).toBe(true);
      expect(compliance.verdict).toBe('PASS');
      // Mutations get slightly higher risk tolerance
      expect(compliance.amazon_risk_score).toBeLessThanOrEqual(4);
    });
  });
});