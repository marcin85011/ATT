#!/usr/bin/env node

/**
 * ATT System Client Validation Script
 * Tests basic functionality of all API clients without making real API calls
 */

require('dotenv').config();

async function validateClients() {
  console.log('🧪 ATT System Client Validation - Unit Tests\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests_run: 0,
    tests_passed: 0,
    tests_failed: 0,
    failures: []
  };

  function runTest(testName, testFn) {
    results.tests_run++;
    try {
      const result = testFn();
      if (result === true || (typeof result === 'object' && result.success !== false)) {
        console.log(`✅ ${testName}`);
        results.tests_passed++;
        return true;
      } else {
        throw new Error('Test returned false or failed result');
      }
    } catch (error) {
      console.log(`❌ ${testName}: ${error.message}`);
      results.tests_failed++;
      results.failures.push({ test: testName, error: error.message });
      return false;
    }
  }

  // Test Firecrawl Client
  console.log('Testing Firecrawl Client...');
  const { FirecrawlClient } = require('../clients/firecrawl-client');
  
  runTest('FirecrawlClient - Constructor', () => {
    const client = new FirecrawlClient('test-key');
    return client.apiKey === 'test-key' && client.baseUrl === 'https://api.firecrawl.dev/v1';
  });

  runTest('FirecrawlClient - extractDomain', () => {
    const client = new FirecrawlClient('test-key');
    return client.extractDomain('https://amazon.com/test') === 'amazon.com';
  });

  runTest('FirecrawlClient - calculateRelevance', () => {
    const client = new FirecrawlClient('test-key');
    const relevance = client.calculateRelevance('gaming t-shirt', 'gaming');
    return relevance > 0 && relevance <= 1;
  });

  // Test ScrapeHero Client
  console.log('\nTesting ScrapeHero Client...');
  const { ScrapeHeroClient } = require('../clients/scrapehero-client');
  
  runTest('ScrapeHeroClient - Constructor', () => {
    const client = new ScrapeHeroClient('test-key');
    return client.apiKey === 'test-key' && client.baseUrl === 'https://api.scrapehero.com/v1';
  });

  runTest('ScrapeHeroClient - extractPrice', () => {
    const client = new ScrapeHeroClient('test-key');
    return client.extractPrice('$19.99') === 19.99 && client.extractPrice('invalid') === 0;
  });

  runTest('ScrapeHeroClient - calculateRelevance', () => {
    const client = new ScrapeHeroClient('test-key');
    const relevance = client.calculateRelevance('funny cat shirt', 'cat shirt');
    return relevance > 0 && relevance <= 1;
  });

  // Test Perplexity Client
  console.log('\nTesting Perplexity Client...');
  const { PerplexityClient } = require('../clients/perplexity-client');
  
  runTest('PerplexityClient - Constructor', () => {
    const client = new PerplexityClient('test-key');
    return client.apiKey === 'test-key' && client.model === 'llama-3.1-sonar-small-128k-online';
  });

  runTest('PerplexityClient - calculateCulturalScore', () => {
    const client = new PerplexityClient('test-key');
    const score = client.calculateCulturalScore('trending popular growing opportunity');
    return score >= 0 && score <= 100;
  });

  runTest('PerplexityClient - extractHashtags', () => {
    const client = new PerplexityClient('test-key');
    const hashtags = client.extractHashtags('Check out #trending #viral #content');
    return Array.isArray(hashtags) && hashtags.includes('#trending');
  });

  // Test Trademark Client
  console.log('\nTesting Trademark Client...');
  const { TrademarkClient } = require('../clients/trademark-client');
  
  runTest('TrademarkClient - Constructor', () => {
    const client = new TrademarkClient('uspto-key', 'euipo-key');
    return client.usptoApiKey === 'uspto-key' && client.euipoApiKey === 'euipo-key';
  });

  runTest('TrademarkClient - calculateSimilarity', () => {
    const client = new TrademarkClient('test1', 'test2');
    const similarity = client.calculateSimilarity('test', 'test');
    return similarity === 1.0;
  });

  runTest('TrademarkClient - levenshteinDistance', () => {
    const client = new TrademarkClient('test1', 'test2');
    const distance = client.levenshteinDistance('cat', 'bat');
    return distance === 1;
  });

  // Test Replicate Client
  console.log('\nTesting Replicate Client...');
  const { ReplicateClient } = require('../clients/replicate-client');
  
  runTest('ReplicateClient - Constructor', () => {
    const client = new ReplicateClient('test-token');
    return client.apiToken === 'test-token' && client.baseUrl === 'https://api.replicate.com/v1';
  });

  runTest('ReplicateClient - validateImageGenOptions', () => {
    const client = new ReplicateClient('test-token');
    const options = client.validateImageGenOptions({ aspectRatio: '1:1', width: 512, height: 512 });
    return options.aspectRatio === '1:1' && options.width === options.height;
  });

  runTest('ReplicateClient - optimizePrompt', () => {
    const client = new ReplicateClient('test-token');
    const optimized = client.optimizePrompt('simple design');
    return optimized.includes('high quality') && optimized.includes('detailed');
  });

  runTest('ReplicateClient - calculateCost', () => {
    const client = new ReplicateClient('test-token');
    const cost = client.calculateCost({ numImages: 1, width: 1024, height: 1024 });
    return cost > 0 && cost < 1.0;
  });

  // Test OpenAI Vision Client
  console.log('\nTesting OpenAI Vision Client...');
  const { OpenAIVisionClient } = require('../clients/openai-vision-client');
  
  runTest('OpenAIVisionClient - Constructor', () => {
    const client = new OpenAIVisionClient('test-key');
    return client.apiKey === 'test-key' && client.model === 'gpt-4o';
  });

  runTest('OpenAIVisionClient - calculateCost', () => {
    const client = new OpenAIVisionClient('test-key');
    const cost = client.calculateCost(5);
    return cost > 0 && cost < 1.0;
  });

  runTest('OpenAIVisionClient - parseSimilarityAnalysis', () => {
    const client = new OpenAIVisionClient('test-key');
    const analysis = client.parseSimilarityAnalysis('{"comparisons": [{"similarityScore": 0.5}], "maxSimilarity": 0.5}', 0.7);
    return analysis.maxSimilarity === 0.5;
  });

  // Summary
  console.log(`\n📊 Validation Summary:`);
  console.log(`Total Tests: ${results.tests_run}`);
  console.log(`Passed: ${results.tests_passed}`);
  console.log(`Failed: ${results.tests_failed}`);
  console.log(`Success Rate: ${(results.tests_passed/results.tests_run*100).toFixed(1)}%`);

  if (results.failures.length > 0) {
    console.log(`\n❌ Failed Tests:`);
    results.failures.forEach(failure => {
      console.log(`  - ${failure.test}: ${failure.error}`);
    });
  }

  // Write results to file
  const fs = require('fs').promises;
  await fs.writeFile('./client-validation-results.json', JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to client-validation-results.json`);

  return results.tests_failed === 0 ? 0 : 1;
}

if (require.main === module) {
  validateClients().then(process.exit).catch(err => {
    console.error('❌ Client validation failed:', err);
    process.exit(1);
  });
}

module.exports = { validateClients };