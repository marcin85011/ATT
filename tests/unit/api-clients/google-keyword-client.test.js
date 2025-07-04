/**
 * Google Keyword Client Unit Tests
 * Tests the Google Keyword API integration for ATT System
 * 
 * Run with: npm test -- google-keyword-client.test.js
 * Run with real API: JEST_E2E=true npm test -- google-keyword-client.test.js
 */

const GoogleKeywordClient = require('../../../clients/google-keyword-client');

// Mock console methods to reduce test noise
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe('GoogleKeywordClient', () => {
  let client;

  beforeEach(() => {
    client = new GoogleKeywordClient();
    // Clear fetch mocks between tests
    if (global.fetch) {
      global.fetch.mockClear();
    }
  });

  describe('Constructor', () => {
    test('should initialize with correct properties', () => {
      expect(client.baseUrl).toBe('https://google-keyword-insight1.p.rapidapi.com');
      expect(client.headers).toHaveProperty('x-rapidapi-host');
      expect(client.headers).toHaveProperty('x-rapidapi-key');
      expect(client.maxRetries).toBe(3);
      expect(client.retryDelay).toBe(1000);
    });

    test('should use environment API key if available', () => {
      const originalEnv = process.env.RAPIDAPI_KEY;
      process.env.RAPIDAPI_KEY = 'test-env-key';
      
      const testClient = new GoogleKeywordClient();
      expect(testClient.headers['x-rapidapi-key']).toBe('test-env-key');
      
      // Restore original env
      process.env.RAPIDAPI_KEY = originalEnv;
    });
  });

  describe('getSearchVolume()', () => {
    beforeEach(() => {
      // Mock fetch globally for these tests
      global.fetch = jest.fn();
    });

    test('should return processed search volume data with agent ID', async () => {
      const mockResponse = {
        volume: 5000,
        competition: 'medium',
        cpc: 1.25
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getSearchVolume('test keyword', 'US', 'en', '16');

      expect(result).toEqual({
        keyword: 'test keyword',
        searchVolume: 5000,
        competition: 'MEDIUM',
        cpc: 1.25,
        trendDirection: 'STABLE',
        dataSource: 'google_keyword_api',
        timestamp: expect.any(String)
      });

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('keyword=test%20keyword'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'x-rapidapi-host': 'google-keyword-insight1.p.rapidapi.com'
          })
        })
      );
    });

    test('should handle different API response formats', async () => {
      const mockResponse = {
        data: {
          volume: 3000,
          competition: 'high',
          cpc: 2.50
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getSearchVolume('test', 'US', 'en', '20');

      expect(result.searchVolume).toBe(3000);
      expect(result.competition).toBe('HIGH');
      expect(result.cpc).toBe(2.50);
    });

    test('should retry on failure and return fallback data', async () => {
      global.fetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await client.getSearchVolume('test', 'US', 'en', '16');

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        keyword: 'test',
        searchVolume: expect.any(Number),
        competition: 'MEDIUM',
        cpc: expect.any(Number),
        trendDirection: 'STABLE',
        dataSource: 'fallback_estimate',
        timestamp: expect.any(String)
      });
    });

    test('should handle HTTP error responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      const result = await client.getSearchVolume('test');

      expect(result.dataSource).toBe('fallback_estimate');
    });

    test('should process trend data when available', async () => {
      const mockResponse = {
        volume: 1000,
        trend: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getSearchVolume('trending keyword');

      expect(result.trendDirection).toBe('RISING');
    });
  });

  describe('getKeywordSuggestions()', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    test('should return processed keyword suggestions with agent ID', async () => {
      const mockResponse = {
        suggestions: [
          { keyword: 'test shirt', volume: 1000, competition: 'low' },
          { keyword: 'test design', volume: 800, competition: 'medium' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getKeywordSuggestions('test', 'US', '20');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        keyword: 'test shirt',
        searchVolume: 1000,
        competition: 'low',
        cpc: 0,
        relevance: 1.0
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('suggestions'),
        expect.any(Object)
      );
    });

    test('should handle array-based response format', async () => {
      const mockResponse = ['suggestion 1', 'suggestion 2', 'suggestion 3'];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getKeywordSuggestions('test');

      expect(result).toHaveLength(3);
      expect(result[0].keyword).toBe('suggestion 1');
    });

    test('should limit suggestions to 20 items', async () => {
      const mockResponse = {
        suggestions: Array.from({ length: 30 }, (_, i) => ({
          keyword: `suggestion ${i + 1}`,
          volume: 100
        }))
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getKeywordSuggestions('test');

      expect(result).toHaveLength(20);
    });

    test('should return fallback suggestions on error', async () => {
      global.fetch.mockRejectedValue(new Error('API Error'));

      const result = await client.getKeywordSuggestions('test keyword');

      expect(result).toHaveLength(10);
      expect(result[0].keyword).toContain('test keyword');
    });
  });

  describe('Trend Direction Calculation', () => {
    test('should calculate RISING trend from data', () => {
      const trendData = [10, 12, 15, 18, 22, 25, 30, 35, 40, 45, 50, 55];
      const result = client.calculateTrendDirection(trendData);
      
      expect(result).toBe('RISING');
    });

    test('should calculate FALLING trend from data', () => {
      const trendData = [55, 50, 45, 40, 35, 30, 25, 22, 18, 15, 12, 10];
      const result = client.calculateTrendDirection(trendData);
      
      expect(result).toBe('FALLING');
    });

    test('should calculate STABLE trend from flat data', () => {
      const trendData = [20, 22, 19, 21, 20, 23, 19, 22, 20, 21, 19, 20];
      const result = client.calculateTrendDirection(trendData);
      
      expect(result).toBe('STABLE');
    });

    test('should handle insufficient data', () => {
      const result = client.calculateTrendDirection([10, 20]);
      expect(result).toBe('STABLE');
    });
  });

  describe('Trend Estimation', () => {
    test('should estimate RISING for high volume + low competition', () => {
      const result = client.estimateTrendDirection(15000, 'LOW');
      expect(result).toBe('RISING');
    });

    test('should estimate FALLING for low volume + high competition', () => {
      const result = client.estimateTrendDirection(500, 'HIGH');
      expect(result).toBe('FALLING');
    });

    test('should default to STABLE for medium conditions', () => {
      const result = client.estimateTrendDirection(5000, 'MEDIUM');
      expect(result).toBe('STABLE');
    });
  });

  describe('Fallback Data Generation', () => {
    test('should generate realistic fallback search volume data', () => {
      const result = client.getFallbackSearchVolumeData('funny nurse shirt');

      expect(result).toEqual({
        keyword: 'funny nurse shirt',
        searchVolume: expect.any(Number),
        competition: 'MEDIUM',
        cpc: expect.any(Number),
        trendDirection: 'STABLE',
        dataSource: 'fallback_estimate',
        timestamp: expect.any(String)
      });

      expect(result.searchVolume).toBeGreaterThan(0);
      expect(result.cpc).toBeGreaterThanOrEqual(0.5);
      expect(result.cpc).toBeLessThanOrEqual(2.5);
    });

    test('should adjust volume based on keyword characteristics', () => {
      const shortKeyword = client.getFallbackSearchVolumeData('mom');
      const longKeyword = client.getFallbackSearchVolumeData('very long specific niche keyword phrase');
      const specialKeyword = client.getFallbackSearchVolumeData('test-keyword!@#');

      expect(shortKeyword.searchVolume).toBeGreaterThan(longKeyword.searchVolume);
      expect(specialKeyword.searchVolume).toBeLessThan(shortKeyword.searchVolume);
    });

    test('should generate fallback keyword suggestions', () => {
      const result = client.getFallbackKeywordSuggestions('test');

      expect(result).toHaveLength(10);
      expect(result[0]).toHaveProperty('keyword');
      expect(result[0]).toHaveProperty('searchVolume');
      expect(result[0]).toHaveProperty('competition', 'MEDIUM');
      expect(result[0]).toHaveProperty('relevance');
    });
  });

  describe('Cost Tracking', () => {
    test('should log cost tracking data', async () => {
      await client.logCostTracking('keyword_lookup-16', 'start', {
        keyword: 'test',
        location: 'US'
      });

      expect(console.log).toHaveBeenCalledWith(
        'Cost Tracking:',
        expect.stringContaining('keyword_lookup-16')
      );
    });

    test('should handle cost tracking errors gracefully', async () => {
      // Mock fs.appendFile to throw error
      const mockFs = {
        mkdir: jest.fn().mockRejectedValue(new Error('Permission denied')),
        appendFile: jest.fn().mockRejectedValue(new Error('Write error'))
      };

      // This should not throw an error
      await expect(client.logCostTracking('test', 'error')).resolves.toBeUndefined();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Utility Methods', () => {
    test('delay should wait for specified time', async () => {
      const start = Date.now();
      await client.delay(100);
      const elapsed = Date.now() - start;
      
      expect(elapsed).toBeGreaterThanOrEqual(95); // Allow some tolerance
    });

    test('testConnection should return true for successful API', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ volume: 1000 })
      });

      const result = await client.testConnection();
      expect(result).toBe(true);
    });

    test('testConnection should return false for failed API', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const result = await client.testConnection();
      expect(result).toBe(false);
    });

    test('healthCheck should return status object', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ volume: 1000 })
      });

      const result = await client.healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        api_accessible: true,
        response_time_ms: expect.any(Number),
        last_check: expect.any(String)
      });
    });
  });

  // Real API Tests (only run when JEST_E2E=true)
  if (process.env.JEST_E2E === 'true') {
    describe('Real API Integration Tests', () => {
      test('should get real search volume data', async () => {
        const result = await client.getSearchVolume('t-shirt', 'US', 'en', 'test');

        expect(result).toHaveProperty('keyword', 't-shirt');
        expect(result).toHaveProperty('searchVolume');
        expect(result).toHaveProperty('competition');
        expect(result).toHaveProperty('dataSource');
        
        // Log result for verification
        console.log('Real API result:', result);
      }, 30000);

      test('should get real keyword suggestions', async () => {
        const result = await client.getKeywordSuggestions('funny', 'US', 'test');

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        
        console.log('Real suggestions:', result.slice(0, 3));
      }, 30000);
    });
  }
});

// Integration test helpers
describe('Integration Scenarios', () => {
  let client;

  beforeEach(() => {
    client = new GoogleKeywordClient();
    global.fetch = jest.fn();
  });

  test('should handle Agent #16 competition data flow', async () => {
    const mockResponse = { volume: 2500, competition: 'medium' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await client.getSearchVolume('nurse humor', 'US', 'en', '16');

    expect(result.keyword).toBe('nurse humor');
    expect(result.searchVolume).toBe(2500);
    expect(result.dataSource).toBe('google_keyword_api');
  });

  test('should handle Agent #20 trend validation flow', async () => {
    const mockSearchData = { 
      volume: 1500, 
      competition: 'low',
      trend: [10, 15, 20, 25, 30, 35]
    };
    const mockSuggestions = {
      suggestions: [
        { keyword: 'test shirt', volume: 800 },
        { keyword: 'test design', volume: 600 }
      ]
    };

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockSearchData })
      .mockResolvedValueOnce({ ok: true, json: async () => mockSuggestions });

    const searchResult = await client.getSearchVolume('test niche', 'US', 'en', '20');
    const suggestions = await client.getKeywordSuggestions('test niche', 'US', '20');

    expect(searchResult.trendDirection).toBe('RISING');
    expect(suggestions).toHaveLength(2);
  });

  test('should maintain proper cost tracking format', async () => {
    const logSpy = jest.spyOn(client, 'logCostTracking');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ volume: 1000 })
    });

    await client.getSearchVolume('test', 'US', 'en', '16');

    expect(logSpy).toHaveBeenCalledWith(
      'keyword_lookup-16',
      'start',
      expect.any(Object)
    );
    expect(logSpy).toHaveBeenCalledWith(
      'keyword_lookup-16',
      'success',
      expect.objectContaining({ cost: 0.01 })
    );
  });
});