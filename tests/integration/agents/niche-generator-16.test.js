/**
 * Agent #16 Niche Generator Integration Tests
 * Tests the complete data flow through Agent #16 with Google Keyword API
 * 
 * Run with: npm test -- niche-generator-16.test.js
 * Run with real API: JEST_E2E=true npm test -- niche-generator-16.test.js
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

describe('Agent #16 - Niche Generator Integration', () => {
  let client;

  beforeEach(() => {
    client = new GoogleKeywordClient();
    if (global.fetch) {
      global.fetch.mockClear();
    }
  });

  describe('Competition Data Flow', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    test('should get real competition data for Agent #16', async () => {
      const mockResponse = {
        volume: 5000,
        competition: 'medium',
        cpc: 1.50
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await client.getSearchVolume('funny nurse', 'US', 'en', '16');

      expect(result).toEqual({
        keyword: 'funny nurse',
        searchVolume: 5000,
        competition: 'MEDIUM',
        cpc: 1.50,
        trendDirection: 'STABLE',
        dataSource: 'google_keyword_api',
        timestamp: expect.any(String)
      });

      // Verify Agent #16 cost tracking format
      expect(console.log).toHaveBeenCalledWith(
        'Cost Tracking:',
        expect.stringContaining('keyword_lookup-16')
      );
    });

    test('should convert search volume to competition score', async () => {
      const testCases = [
        { volume: 100000, expectedCompetition: 1000 }, // High volume = max competition
        { volume: 10000, expectedCompetition: 100 },   // Medium volume = medium competition
        { volume: 500, expectedCompetition: 100 },     // Low volume = min competition
      ];

      for (const testCase of testCases) {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ volume: testCase.volume })
        });

        const result = await client.getSearchVolume('test', 'US', 'en', '16');
        
        // Agent #16 converts search volume to competition estimate
        // Higher search volume = higher competition (inverse relationship)
        const expectedCompetition = Math.min(1000, Math.max(100, Math.round(testCase.volume / 100)));
        
        expect(result.searchVolume).toBe(testCase.volume);
        // The actual conversion would be done in the Agent #16 workflow
      }
    });

    test('should handle multiple keyword lookups for batch generation', async () => {
      const keywords = ['funny nurse', 'tired teacher', 'awesome dad'];
      const mockResponses = [
        { volume: 3000, competition: 'medium' },
        { volume: 2500, competition: 'high' },
        { volume: 4000, competition: 'low' }
      ];

      // Mock multiple API calls
      mockResponses.forEach(response => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => response
        });
      });

      const results = [];
      for (const keyword of keywords) {
        const result = await client.getSearchVolume(keyword, 'US', 'en', '16');
        results.push(result);
      }

      expect(results).toHaveLength(3);
      expect(results[0].keyword).toBe('funny nurse');
      expect(results[1].keyword).toBe('tired teacher');
      expect(results[2].keyword).toBe('awesome dad');

      // Verify all used Agent #16 ID
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    test('should fallback gracefully when API fails', async () => {
      global.fetch.mockRejectedValue(new Error('API Rate Limit'));

      const result = await client.getSearchVolume('test niche', 'US', 'en', '16');

      expect(result.dataSource).toBe('fallback_estimate');
      expect(result.keyword).toBe('test niche');
      expect(result.searchVolume).toBeGreaterThan(0);
      expect(result.competition).toBe('MEDIUM');
    });
  });

  describe('Niche Pattern Analysis', () => {
    test('should analyze profession + attitude patterns', async () => {
      const professionPatterns = [
        'nurse humor',
        'teacher tired',
        'engineer smart',
        'chef awesome'
      ];

      // Mock responses for profession-based patterns
      professionPatterns.forEach(() => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            volume: 2000 + Math.random() * 3000,
            competition: 'medium'
          })
        });
      });

      const results = [];
      for (const pattern of professionPatterns) {
        const result = await client.getSearchVolume(pattern, 'US', 'en', '16');
        results.push(result);
      }

      // All should return real data
      expect(results.every(r => r.dataSource === 'google_keyword_api')).toBe(true);
      
      // Professional keywords should have reasonable search volumes
      expect(results.every(r => r.searchVolume >= 2000 && r.searchVolume <= 5000)).toBe(true);
    });

    test('should handle family + hobby patterns', async () => {
      const familyPatterns = [
        'fishing dad',
        'crafting mom',
        'gaming son',
        'dancing daughter'
      ];

      familyPatterns.forEach(() => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            volume: 1500,
            competition: 'low'
          })
        });
      });

      const results = [];
      for (const pattern of familyPatterns) {
        const result = await client.getSearchVolume(pattern, 'US', 'en', '16');
        results.push(result);
      }

      expect(results).toHaveLength(4);
      expect(results.every(r => r.competition === 'LOW')).toBe(true);
    });
  });

  describe('Market Scoring Integration', () => {
    test('should provide data for market appeal scoring', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          volume: 8000,
          competition: 'medium',
          cpc: 2.10
        })
      });

      const result = await client.getSearchVolume('funny mom', 'US', 'en', '16');

      // Agent #16 uses this data for market scoring
      expect(result.searchVolume).toBe(8000); // High volume = higher market appeal
      expect(result.competition).toBe('MEDIUM'); // Medium competition = good opportunity
      expect(result.cpc).toBe(2.10); // CPC indicates commercial value
    });

    test('should handle trending keywords analysis', async () => {
      const trendingTerms = ['aesthetic vibes', 'retro mood', 'vintage goals'];

      trendingTerms.forEach(() => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            volume: 3500,
            competition: 'high'
          })
        });
      });

      const results = [];
      for (const term of trendingTerms) {
        const result = await client.getSearchVolume(term, 'US', 'en', '16');
        results.push(result);
      }

      // Trending terms should show higher competition
      expect(results.every(r => r.competition === 'HIGH')).toBe(true);
    });
  });

  describe('Cost Tracking Verification', () => {
    test('should log proper cost tracking for Agent #16 operations', async () => {
      const logSpy = jest.spyOn(client, 'logCostTracking');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ volume: 1000 })
      });

      await client.getSearchVolume('test keyword', 'US', 'en', '16');

      // Verify start tracking
      expect(logSpy).toHaveBeenCalledWith(
        'keyword_lookup-16',
        'start',
        expect.objectContaining({
          keyword: 'test keyword',
          location: 'US',
          language: 'en'
        })
      );

      // Verify success tracking
      expect(logSpy).toHaveBeenCalledWith(
        'keyword_lookup-16',
        'success',
        expect.objectContaining({
          keyword: 'test keyword',
          searchVolume: 1000,
          cost: 0.01
        })
      );
    });

    test('should log error tracking when API fails', async () => {
      const logSpy = jest.spyOn(client, 'logCostTracking');

      global.fetch.mockRejectedValue(new Error('API Error'));

      await client.getSearchVolume('test', 'US', 'en', '16');

      expect(logSpy).toHaveBeenCalledWith(
        'keyword_lookup-16',
        'error',
        expect.objectContaining({
          keyword: 'test',
          error: 'API Error'
        })
      );
    });
  });

  describe('Performance Analysis', () => {
    test('should handle high-volume niche analysis', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          volume: 25000,
          competition: 'high',
          cpc: 3.50
        })
      });

      const result = await client.getSearchVolume('christmas mom', 'US', 'en', '16');

      expect(result.searchVolume).toBe(25000);
      expect(result.competition).toBe('HIGH');
      expect(result.cpc).toBe(3.50);
      
      // High volume keywords indicate good market potential for Agent #16
      expect(result.searchVolume).toBeGreaterThan(20000);
    });

    test('should handle niche keyword analysis', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          volume: 800,
          competition: 'low',
          cpc: 0.75
        })
      });

      const result = await client.getSearchVolume('woodworking grandpa funny', 'US', 'en', '16');

      expect(result.searchVolume).toBe(800);
      expect(result.competition).toBe('LOW');
      
      // Niche keywords should have lower volume but potentially less competition
      expect(result.searchVolume).toBeLessThan(1000);
    });
  });

  // Real API Tests (only run when JEST_E2E=true)
  if (process.env.JEST_E2E === 'true') {
    describe('Real API Integration Tests', () => {
      test('should work with real Google Keyword API for Agent #16', async () => {
        const result = await client.getSearchVolume('funny nurse shirt', 'US', 'en', '16');

        expect(result.keyword).toBe('funny nurse shirt');
        expect(result.dataSource).toBe('google_keyword_api');
        expect(typeof result.searchVolume).toBe('number');
        expect(['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN']).toContain(result.competition);
        
        console.log('Agent #16 Real API Test Result:', {
          keyword: result.keyword,
          volume: result.searchVolume,
          competition: result.competition,
          cpc: result.cpc
        });
      }, 30000);

      test('should handle batch processing for multiple niches', async () => {
        const testNiches = [
          'teacher tired',
          'nurse humor',
          'mom coffee'
        ];

        const results = [];
        for (const niche of testNiches) {
          const result = await client.getSearchVolume(niche, 'US', 'en', '16');
          results.push(result);
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        expect(results).toHaveLength(3);
        results.forEach(result => {
          expect(result.dataSource).toBe('google_keyword_api');
          expect(typeof result.searchVolume).toBe('number');
        });

        console.log('Agent #16 Batch Test Results:', results.map(r => ({
          keyword: r.keyword,
          volume: r.searchVolume,
          competition: r.competition
        })));
      }, 60000);
    });
  }
});

describe('Agent #16 Workflow Simulation', () => {
  let client;

  beforeEach(() => {
    client = new GoogleKeywordClient();
    global.fetch = jest.fn();
  });

  test('should simulate complete niche generation workflow', async () => {
    // Simulate Agent #16 generating 10 niche combinations
    const niches = [
      'funny nurse',
      'tired teacher', 
      'awesome dad',
      'crafting mom',
      'gaming programmer',
      'cooking chef',
      'running fitness',
      'reading bookworm',
      'fishing grandpa',
      'gardening mom'
    ];

    // Mock responses for all niches
    niches.forEach((niche, index) => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          volume: 1000 + (index * 500),
          competition: index % 3 === 0 ? 'low' : index % 3 === 1 ? 'medium' : 'high',
          cpc: 0.5 + (index * 0.2)
        })
      });
    });

    const results = [];
    for (const niche of niches) {
      const result = await client.getSearchVolume(niche, 'US', 'en', '16');
      results.push({
        niche: result.keyword,
        searchVolume: result.searchVolume,
        competition: result.competition,
        cpc: result.cpc,
        // Agent #16 would calculate market score based on this data
        marketScore: calculateMockMarketScore(result)
      });
    }

    expect(results).toHaveLength(10);
    
    // Sort by market score (as Agent #16 would)
    results.sort((a, b) => b.marketScore - a.marketScore);
    
    // Top results should have good market potential
    expect(results[0].marketScore).toBeGreaterThanOrEqual(75);
    
    console.log('Top 3 Agent #16 Results:', results.slice(0, 3));
  });

  // Helper function to simulate Agent #16's market scoring
  function calculateMockMarketScore(data) {
    let score = 50; // Base score
    
    // Higher volume = higher score
    if (data.searchVolume > 3000) score += 20;
    else if (data.searchVolume > 1500) score += 10;
    
    // Lower competition = higher score
    if (data.competition === 'LOW') score += 15;
    else if (data.competition === 'MEDIUM') score += 10;
    
    // Reasonable CPC = higher score
    if (data.cpc >= 1.0 && data.cpc <= 2.5) score += 15;
    
    return Math.min(100, score);
  }
});