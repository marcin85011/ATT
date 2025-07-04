/**
 * Agent #20 Search Validator Integration Tests
 * Tests the complete trend validation flow with Google Keyword API
 * 
 * Run with: npm test -- search-validator-20.test.js
 * Run with real API: JEST_E2E=true npm test -- search-validator-20.test.js
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

describe('Agent #20 - Search Validator Integration', () => {
  let client;

  beforeEach(() => {
    client = new GoogleKeywordClient();
    if (global.fetch) {
      global.fetch.mockClear();
    }
  });

  describe('Trend Validation Flow', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    test('should get real trend data for Agent #20', async () => {
      const mockSearchResponse = {
        volume: 3500,
        competition: 'medium',
        cpc: 1.75,
        trend: 'rising'
      };

      const mockSuggestionsResponse = {
        suggestions: [
          { keyword: 'test shirt', volume: 800 },
          { keyword: 'test design', volume: 600 },
          { keyword: 'test funny', volume: 400 }
        ]
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSearchResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuggestionsResponse
        });

      const searchResult = await client.getSearchVolume('test niche', 'US', 'en', '20');
      const suggestions = await client.getKeywordSuggestions('test niche', 'US', '20');

      expect(searchResult).toEqual({
        keyword: 'test niche',
        searchVolume: 3500,
        competition: 'MEDIUM',
        cpc: 1.75,
        trendDirection: 'RISING',
        dataSource: 'google_keyword_api',
        timestamp: expect.any(String)
      });

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0].keyword).toBe('test shirt');

      // Verify Agent #20 cost tracking format
      expect(console.log).toHaveBeenCalledWith(
        'Cost Tracking:',
        expect.stringContaining('keyword_lookup-20')
      );
      expect(console.log).toHaveBeenCalledWith(
        'Cost Tracking:',
        expect.stringContaining('keyword_suggestions-20')
      );
    });

    test('should process trend direction from Google data', async () => {
      const trendCases = [
        { trend: 'rising', expected: 'RISING' },
        { trend: 'falling', expected: 'FALLING' },
        { trend: 'stable', expected: 'STABLE' }
      ];

      for (const testCase of trendCases) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            volume: 2000,
            trend: testCase.trend
          })
        });

        const result = await client.getSearchVolume('test', 'US', 'en', '20');
        expect(result.trendDirection).toBe(testCase.expected);
      }
    });

    test('should handle keyword suggestions integration', async () => {
      const mockSuggestionsResponse = {
        suggestions: [
          { keyword: 'funny nurse shirt', volume: 1200, competition: 'medium' },
          { keyword: 'nurse humor gift', volume: 800, competition: 'low' },
          { keyword: 'nursing student funny', volume: 600, competition: 'high' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestionsResponse
      });

      const result = await client.getKeywordSuggestions('funny nurse', 'US', '20');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        keyword: 'funny nurse shirt',
        searchVolume: 1200,
        competition: 'medium',
        cpc: 0,
        relevance: 1.0
      });
    });

    test('should fallback when trend API fails', async () => {
      global.fetch.mockRejectedValue(new Error('API Timeout'));

      const result = await client.getSearchVolume('test niche', 'US', 'en', '20');

      expect(result.dataSource).toBe('fallback_estimate');
      expect(result.trendDirection).toBe('STABLE');
      expect(result.keyword).toBe('test niche');
    });
  });

  describe('Trend Direction Analysis', () => {
    test('should analyze rising trends', async () => {
      const mockResponse = {
        volume: 8000,
        competition: 'low',
        trend: 'rising'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getSearchVolume('trending topic', 'US', 'en', '20');

      expect(result.trendDirection).toBe('RISING');
      expect(result.searchVolume).toBe(8000);
      expect(result.competition).toBe('LOW');
    });

    test('should identify declining trends', async () => {
      const mockResponse = {
        volume: 1200,
        competition: 'high',
        trend: 'falling'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getSearchVolume('declining topic', 'US', 'en', '20');

      expect(result.trendDirection).toBe('FALLING');
      expect(result.searchVolume).toBe(1200);
      expect(result.competition).toBe('HIGH');
    });

    test('should handle stable trends', async () => {
      const mockResponse = {
        volume: 3000,
        competition: 'medium',
        trend: 'stable'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getSearchVolume('stable topic', 'US', 'en', '20');

      expect(result.trendDirection).toBe('STABLE');
      expect(result.searchVolume).toBe(3000);
    });
  });

  describe('Related Queries Generation', () => {
    test('should generate expanded keyword lists', async () => {
      const mockSuggestionsResponse = {
        suggestions: [
          { keyword: 'funny nurse meme', volume: 500 },
          { keyword: 'nurse appreciation', volume: 800 },
          { keyword: 'healthcare humor', volume: 300 },
          { keyword: 'medical professional', volume: 1000 }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuggestionsResponse
      });

      const result = await client.getKeywordSuggestions('nurse humor', 'US', '20');

      expect(result).toHaveLength(4);
      
      // Should include original concepts plus API suggestions
      const keywords = result.map(r => r.keyword);
      expect(keywords).toContain('funny nurse meme');
      expect(keywords).toContain('nurse appreciation');
    });

    test('should handle empty suggestions gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: [] })
      });

      const result = await client.getKeywordSuggestions('very specific niche', 'US', '20');

      // Should return fallback suggestions
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].keyword).toContain('very specific niche');
    });
  });

  describe('Cost Tracking Verification', () => {
    test('should log proper cost tracking for Agent #20 operations', async () => {
      const logSpy = jest.spyOn(client, 'logCostTracking');

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ volume: 2000, trend: 'rising' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ suggestions: [] })
        });

      await client.getSearchVolume('test keyword', 'US', 'en', '20');
      await client.getKeywordSuggestions('test keyword', 'US', '20');

      // Verify search volume tracking
      expect(logSpy).toHaveBeenCalledWith(
        'keyword_lookup-20',
        'start',
        expect.objectContaining({
          keyword: 'test keyword',
          location: 'US',
          language: 'en'
        })
      );

      // Verify suggestions tracking
      expect(logSpy).toHaveBeenCalledWith(
        'keyword_suggestions-20',
        'start',
        expect.objectContaining({
          keyword: 'test keyword',
          location: 'US'
        })
      );
    });

    test('should log error tracking for failed operations', async () => {
      const logSpy = jest.spyOn(client, 'logCostTracking');

      global.fetch.mockRejectedValue(new Error('Rate Limited'));

      await client.getSearchVolume('test', 'US', 'en', '20');

      expect(logSpy).toHaveBeenCalledWith(
        'keyword_lookup-20',
        'error',
        expect.objectContaining({
          keyword: 'test',
          error: 'Rate Limited'
        })
      );
    });
  });

  describe('Search Volume Analysis', () => {
    test('should categorize high-volume opportunities', async () => {
      const mockResponse = {
        volume: 25000,
        competition: 'medium',
        trend: 'rising'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getSearchVolume('popular trend', 'US', 'en', '20');

      expect(result.searchVolume).toBe(25000);
      expect(result.trendDirection).toBe('RISING');
      // High volume + rising trend = excellent opportunity for Agent #20
    });

    test('should identify low-volume niche opportunities', async () => {
      const mockResponse = {
        volume: 800,
        competition: 'low',
        trend: 'stable'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getSearchVolume('niche market', 'US', 'en', '20');

      expect(result.searchVolume).toBe(800);
      expect(result.competition).toBe('LOW');
      // Low volume + low competition = potential niche opportunity
    });
  });

  describe('Validation Workflow', () => {
    test('should simulate complete Agent #20 validation workflow', async () => {
      // Mock input from Agent #16
      const nicheInput = {
        niche: 'funny nurse',
        opportunity_score: 85,
        competitive_advantage_score: 75
      };

      const mockSearchData = {
        volume: 4500,
        competition: 'medium',
        cpc: 2.00,
        trend: 'rising'
      };

      const mockSuggestions = {
        suggestions: [
          { keyword: 'funny nurse shirt', volume: 1000 },
          { keyword: 'nurse humor gift', volume: 600 }
        ]
      };

      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockSearchData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockSuggestions });

      const searchResult = await client.getSearchVolume(nicheInput.niche, 'US', 'en', '20');
      const suggestions = await client.getKeywordSuggestions(nicheInput.niche, 'US', '20');

      // Simulate Agent #20's validation logic
      const validation = {
        niche: nicheInput.niche,
        search_validation: {
          current_volume: searchResult.searchVolume,
          trend_direction: searchResult.trendDirection,
          is_declining: searchResult.trendDirection === 'FALLING',
          related_queries: suggestions.map(s => s.keyword)
        },
        final_recommendation: {
          proceed: searchResult.trendDirection !== 'FALLING' && nicheInput.opportunity_score > 70,
          priority: searchResult.trendDirection === 'RISING' ? 'high' : 'medium'
        }
      };

      expect(validation.search_validation.current_volume).toBe(4500);
      expect(validation.search_validation.trend_direction).toBe('RISING');
      expect(validation.search_validation.is_declining).toBe(false);
      expect(validation.final_recommendation.proceed).toBe(true);
      expect(validation.final_recommendation.priority).toBe('high');
    });
  });

  // Real API Tests (only run when JEST_E2E=true)
  if (process.env.JEST_E2E === 'true') {
    describe('Real API Integration Tests', () => {
      test('should validate trends with real Google Keyword API for Agent #20', async () => {
        const result = await client.getSearchVolume('teacher tired shirt', 'US', 'en', '20');

        expect(result.keyword).toBe('teacher tired shirt');
        expect(result.dataSource).toBe('google_keyword_api');
        expect(typeof result.searchVolume).toBe('number');
        expect(['RISING', 'FALLING', 'STABLE']).toContain(result.trendDirection);
        expect(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']).toContain(result.competition);

        console.log('Agent #20 Real API Test Result:', {
          keyword: result.keyword,
          volume: result.searchVolume,
          trend: result.trendDirection,
          competition: result.competition,
          cpc: result.cpc
        });
      }, 30000);

      test('should get real keyword suggestions for trend analysis', async () => {
        const result = await client.getKeywordSuggestions('nurse humor', 'US', '20');

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        
        result.forEach(suggestion => {
          expect(suggestion).toHaveProperty('keyword');
          expect(suggestion).toHaveProperty('searchVolume');
          expect(suggestion).toHaveProperty('competition');
        });

        console.log('Agent #20 Real Suggestions:', result.slice(0, 5).map(s => ({
          keyword: s.keyword,
          volume: s.searchVolume
        })));
      }, 30000);

      test('should handle complete validation workflow with real data', async () => {
        const testNiche = 'funny mom coffee';
        
        const [searchResult, suggestions] = await Promise.all([
          client.getSearchVolume(testNiche, 'US', 'en', '20'),
          client.getKeywordSuggestions(testNiche, 'US', '20')
        ]);

        expect(searchResult.dataSource).toBe('google_keyword_api');
        expect(Array.isArray(suggestions)).toBe(true);

        // Simulate complete validation
        const validation = {
          niche: testNiche,
          search_data: {
            volume: searchResult.searchVolume,
            trend: searchResult.trendDirection,
            competition: searchResult.competition,
            related_count: suggestions.length
          },
          recommendation: {
            proceed: searchResult.trendDirection !== 'FALLING',
            confidence: searchResult.searchVolume > 1000 ? 'high' : 'medium'
          }
        };

        console.log('Agent #20 Complete Validation:', validation);

        expect(validation.recommendation).toHaveProperty('proceed');
        expect(validation.recommendation).toHaveProperty('confidence');
      }, 45000);
    });
  }
});

describe('Agent #20 Performance Scenarios', () => {
  let client;

  beforeEach(() => {
    client = new GoogleKeywordClient();
    global.fetch = jest.fn();
  });

  test('should handle high-opportunity validation', async () => {
    const mockData = {
      volume: 15000,
      competition: 'low',
      trend: 'rising',
      cpc: 2.50
    };

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockData })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ suggestions: [] }) });

    const searchResult = await client.getSearchVolume('high opportunity niche', 'US', 'en', '20');
    
    // High volume + low competition + rising trend = excellent opportunity
    expect(searchResult.searchVolume).toBe(15000);
    expect(searchResult.competition).toBe('LOW');
    expect(searchResult.trendDirection).toBe('RISING');
    expect(searchResult.cpc).toBe(2.50);
  });

  test('should handle declining trend validation', async () => {
    const mockData = {
      volume: 3000,
      competition: 'high',
      trend: 'falling',
      cpc: 0.50
    };

    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

    const result = await client.getSearchVolume('declining trend', 'US', 'en', '20');

    // Agent #20 should flag this as declining
    expect(result.trendDirection).toBe('FALLING');
    expect(result.competition).toBe('HIGH');
    // This would result in recommendation: do not proceed
  });

  test('should validate emerging trends', async () => {
    const mockData = {
      volume: 2500,
      competition: 'medium',
      trend: 'rising',
      cpc: 1.75
    };

    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

    const result = await client.getSearchVolume('emerging trend', 'US', 'en', '20');

    // Moderate volume + rising trend = emerging opportunity
    expect(result.searchVolume).toBe(2500);
    expect(result.trendDirection).toBe('RISING');
    expect(result.competition).toBe('MEDIUM');
  });

  test('should handle batch validation for multiple niches', async () => {
    const testNiches = [
      { name: 'nurse humor', expected: 'RISING' },
      { name: 'teacher tired', expected: 'STABLE' },
      { name: 'outdated trend', expected: 'FALLING' }
    ];

    testNiches.forEach(niche => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          volume: 2000,
          trend: niche.expected.toLowerCase()
        })
      });
    });

    const results = [];
    for (const niche of testNiches) {
      const result = await client.getSearchVolume(niche.name, 'US', 'en', '20');
      results.push({
        niche: niche.name,
        trend: result.trendDirection,
        expected: niche.expected
      });
    }

    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(result.trend).toBe(result.expected);
    });
  });
});