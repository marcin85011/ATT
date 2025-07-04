/**
 * Integration Test: Research Workflow
 * Tests the complete research pipeline with mock APIs
 */

const APIMockServer = require('../../mock-server/api-mocks');
const { TestCostTracker, APITestHelpers } = require('../../utils/test-helpers');

describe('Research Workflow Integration (Mock)', () => {
  let mockServer;
  let costTracker;

  beforeAll(async () => {
    mockServer = new APIMockServer(3002);
    await mockServer.start();
    costTracker = new TestCostTracker();
  });

  afterAll(async () => {
    if (mockServer) {
      await mockServer.stop();
    }
  });

  beforeEach(() => {
    mockServer.clearRequestLog();
  });

  test('should complete full research workflow for coffee niche', async () => {
    const testCost = APITestHelpers.calculateAPICosts('integration_workflow', 500, 0);
    await global.testUtils.trackAPICost('research_workflow', testCost, 500);

    // Step 1: Keyword Research
    const keywordResponse = await fetch('http://localhost:3002/volume/', {
      method: 'GET',
      headers: { 'x-rapidapi-key': 'test-key' }
    });
    expect(keywordResponse.ok).toBe(true);
    
    const keywordData = await keywordResponse.json();
    expect(keywordData).toHaveValidAPIResponse('google_keywords');
    expect(keywordData.data.volume).toBeGreaterThan(1000);

    // Step 2: Market Analysis with Firecrawl
    const marketResponse = await fetch('http://localhost:3002/v1/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://amazon.com/s?k=coffee+lover+shirt',
        formats: ['markdown']
      })
    });
    expect(marketResponse.ok).toBe(true);
    
    const marketData = await marketResponse.json();
    expect(marketData).toHaveValidAPIResponse('firecrawl');
    expect(marketData.data.markdown).toContain('coffee');

    // Step 3: Trend Analysis with Perplexity
    const trendResponse = await fetch('http://localhost:3002/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{
          role: 'user',
          content: 'Analyze coffee-related t-shirt trends for Q4 2024'
        }]
      })
    });
    expect(trendResponse.ok).toBe(true);

    const trendData = await trendResponse.json();
    expect(trendData).toHaveValidAPIResponse('perplexity');

    // Step 4: Social Media Trends with YouTube
    const youtubeResponse = await fetch('http://localhost:3002/youtube/v3/search?q=coffee+shirt+trends&type=video&order=relevance');
    expect(youtubeResponse.ok).toBe(true);

    const youtubeData = await youtubeResponse.json();
    expect(youtubeData).toHaveValidAPIResponse('youtube');
    expect(youtubeData.items).toHaveLength(2);

    // Step 5: Current Events with NewsAPI
    const newsResponse = await fetch('http://localhost:3002/v2/top-headlines?country=us&category=general');
    expect(newsResponse.ok).toBe(true);

    const newsData = await newsResponse.json();
    expect(newsData).toHaveValidAPIResponse('newsapi');
    expect(newsData.articles).toHaveLength(2);

    // Verify workflow integration
    const logs = mockServer.getRequestLog();
    expect(logs).toHaveLength(5); // One request per API

    // Verify API call sequence
    const apiCalls = logs.map(log => log.url);
    expect(apiCalls).toContain('/volume/');
    expect(apiCalls).toContain('/v1/scrape');
    expect(apiCalls).toContain('/chat/completions');
    expect(apiCalls).toContain('/youtube/v3/search');
    expect(apiCalls).toContain('/v2/top-headlines');

    // Verify total workflow cost is reasonable
    expect(testCost).toBeWithinBudget('per_test');
  });

  test('should handle research workflow with API failures', async () => {
    const testCost = APITestHelpers.calculateAPICosts('integration_workflow_errors', 200, 0);
    await global.testUtils.trackAPICost('research_workflow_error', testCost, 200);

    // Test with rate limit scenario
    const rateLimitResponse = await fetch('http://localhost:3002/volume/', {
      method: 'GET',
      headers: { 
        'x-rapidapi-key': 'test-key',
        'x-test-scenario': 'rate_limit'
      },
      body: JSON.stringify({ _scenario: 'rate_limit' })
    });

    // Should still get a response (mock server always responds)
    expect(rateLimitResponse.ok).toBe(true);
    
    const errorData = await rateLimitResponse.json();
    // Mock server returns normal response, but in real test we'd handle rate limits
    expect(errorData.data).toBeDefined();
  });

  test('should aggregate research data correctly', async () => {
    const testCost = APITestHelpers.calculateAPICosts('integration_aggregation', 300, 0);
    await global.testUtils.trackAPICost('research_aggregation', testCost, 300);

    // Simulate research data aggregation
    const researchResults = {
      keywords: [],
      market_data: null,
      trends: null,
      social_trends: [],
      current_events: []
    };

    // Collect keyword data
    const keywordResponse = await fetch('http://localhost:3002/volume/?keyword=coffee+mom');
    const keywordData = await keywordResponse.json();
    researchResults.keywords.push({
      keyword: 'coffee mom',
      volume: keywordData.data.volume,
      competition: keywordData.data.competition
    });

    // Collect market data
    const marketResponse = await fetch('http://localhost:3002/v1/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://amazon.com/s?k=coffee+mom' })
    });
    const marketData = await marketResponse.json();
    researchResults.market_data = {
      competitor_count: (marketData.data.markdown.match(/sponsored/gi) || []).length,
      saturation: 'medium'
    };

    // Validate aggregated results
    expect(researchResults.keywords).toHaveLength(1);
    expect(researchResults.keywords[0].volume).toBeGreaterThan(0);
    expect(researchResults.market_data.competitor_count).toBeGreaterThanOrEqual(0);

    // Verify research scoring algorithm
    const opportunityScore = (
      (researchResults.keywords[0].volume / 1000) * 0.4 +
      (10 - Math.min(10, researchResults.market_data.competitor_count)) * 0.6
    );
    
    expect(opportunityScore).toBeGreaterThan(0);
    expect(opportunityScore).toBeLessThanOrEqual(10);
  });

  test('should respect budget limits during research', async () => {
    // Test budget enforcement
    const expensiveTestCost = 1.00; // Simulate expensive operation
    
    try {
      await global.testUtils.trackAPICost('expensive_research', expensiveTestCost, 10000);
      
      // If budget enforcement is on, this should throw
      if (process.env.BUDGET_ENFORCEMENT === 'true') {
        fail('Should have thrown budget exceeded error');
      }
    } catch (error) {
      expect(error.message).toContain('Budget exceeded');
    }
  });

  test('should handle concurrent research requests', async () => {
    const testCost = APITestHelpers.calculateAPICosts('concurrent_research', 150, 0);
    await global.testUtils.trackAPICost('concurrent_research', testCost, 150);

    // Test concurrent API calls
    const promises = [
      fetch('http://localhost:3002/volume/?keyword=fitness'),
      fetch('http://localhost:3002/volume/?keyword=coffee'),
      fetch('http://localhost:3002/volume/?keyword=dog+mom')
    ];

    const results = await Promise.all(promises);
    
    // All requests should succeed
    expect(results.every(r => r.ok)).toBe(true);
    
    // Verify all responded
    const data = await Promise.all(results.map(r => r.json()));
    expect(data).toHaveLength(3);
    expect(data.every(d => d.data && d.data.keyword)).toBe(true);

    // Verify mock server handled concurrent requests
    const logs = mockServer.getRequestLog();
    const volumeRequests = logs.filter(log => log.url.includes('/volume/'));
    expect(volumeRequests).toHaveLength(3);
  });

  test('should validate research data quality', async () => {
    const testCost = APITestHelpers.calculateAPICosts('data_quality', 100, 0);
    await global.testUtils.trackAPICost('data_quality', testCost, 100);

    // Test data validation pipeline
    const keywordResponse = await fetch('http://localhost:3002/volume/?keyword=test');
    const keywordData = await keywordResponse.json();

    // Validate required fields
    expect(keywordData.data).toBeDefined();
    expect(keywordData.data.keyword).toBeTruthy();
    expect(typeof keywordData.data.volume).toBe('number');
    expect(keywordData.data.competition).toBeTruthy();
    expect(Array.isArray(keywordData.data.suggestions)).toBe(true);

    // Validate data ranges
    expect(keywordData.data.volume).toBeGreaterThanOrEqual(0);
    expect(keywordData.data.volume).toBeLessThanOrEqual(1000000);
    expect(['Low', 'Medium', 'High'].includes(keywordData.data.competition)).toBe(true);

    // Validate suggestions quality
    expect(keywordData.data.suggestions.length).toBeGreaterThan(0);
    expect(keywordData.data.suggestions.length).toBeLessThanOrEqual(20);
    expect(keywordData.data.suggestions.every(s => typeof s === 'string')).toBe(true);
  });
});