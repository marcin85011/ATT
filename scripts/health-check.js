#!/usr/bin/env node

/**
 * ATT System Health Check Script
 * Tests connectivity to all production APIs
 */

require('dotenv').config();

const { FirecrawlClient } = require('../clients/firecrawl-client');
const { ScrapeHeroClient } = require('../clients/scrapehero-client');
const { PerplexityClient } = require('../clients/perplexity-client');
const { TrademarkClient } = require('../clients/trademark-client');
const { ReplicateClient } = require('../clients/replicate-client');
const { OpenAIVisionClient } = require('../clients/openai-vision-client');

async function healthCheck() {
  console.log('🔍 ATT System Health Check - Production APIs\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    overall: 'unknown',
    apis: {}
  };

  // Test Firecrawl API (Agent #05)
  console.log('Testing Firecrawl API...');
  try {
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY not set');
    }
    const firecrawl = new FirecrawlClient(process.env.FIRECRAWL_API_KEY);
    const health = await firecrawl.healthCheck();
    results.apis.firecrawl = health;
    console.log(`✅ Firecrawl: ${health.status}`);
  } catch (error) {
    results.apis.firecrawl = { status: 'unhealthy', error: error.message };
    console.log(`❌ Firecrawl: ${error.message}`);
  }

  // Test ScrapeHero API (Agent #06)
  console.log('Testing ScrapeHero API...');
  try {
    if (!process.env.SCRAPEHERO_API_KEY) {
      throw new Error('SCRAPEHERO_API_KEY not set');
    }
    const scrapehero = new ScrapeHeroClient(process.env.SCRAPEHERO_API_KEY);
    const health = await scrapehero.healthCheck();
    results.apis.scrapehero = health;
    console.log(`✅ ScrapeHero: ${health.status}`);
  } catch (error) {
    results.apis.scrapehero = { status: 'unhealthy', error: error.message };
    console.log(`❌ ScrapeHero: ${error.message}`);
  }

  // Test Perplexity API (Agent #07)
  console.log('Testing Perplexity API...');
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not set');
    }
    const perplexity = new PerplexityClient(process.env.PERPLEXITY_API_KEY);
    const health = await perplexity.healthCheck();
    results.apis.perplexity = health;
    console.log(`✅ Perplexity: ${health.status}`);
  } catch (error) {
    results.apis.perplexity = { status: 'unhealthy', error: error.message };
    console.log(`❌ Perplexity: ${error.message}`);
  }

  // Test Trademark APIs (Agent #09)
  console.log('Testing Trademark APIs...');
  try {
    if (!process.env.USPTO_API_KEY || !process.env.EUIPO_API_KEY) {
      throw new Error('USPTO_API_KEY or EUIPO_API_KEY not set');
    }
    const trademark = new TrademarkClient(process.env.USPTO_API_KEY, process.env.EUIPO_API_KEY);
    const health = await trademark.healthCheck();
    results.apis.trademark = health;
    console.log(`✅ Trademark: ${health.overall}`);
  } catch (error) {
    results.apis.trademark = { overall: 'unhealthy', error: error.message };
    console.log(`❌ Trademark: ${error.message}`);
  }

  // Test Replicate API (Agent #10)
  console.log('Testing Replicate API...');
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not set');
    }
    const replicate = new ReplicateClient(process.env.REPLICATE_API_TOKEN);
    const health = await replicate.healthCheck();
    results.apis.replicate = health;
    console.log(`✅ Replicate: ${health.status}`);
  } catch (error) {
    results.apis.replicate = { status: 'unhealthy', error: error.message };
    console.log(`❌ Replicate: ${error.message}`);
  }

  // Test OpenAI Vision API (Agent #11)
  console.log('Testing OpenAI Vision API...');
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set');
    }
    const openai = new OpenAIVisionClient(process.env.OPENAI_API_KEY);
    const health = await openai.healthCheck();
    results.apis.openai = health;
    console.log(`✅ OpenAI: ${health.status}`);
  } catch (error) {
    results.apis.openai = { status: 'unhealthy', error: error.message };
    console.log(`❌ OpenAI: ${error.message}`);
  }

  // Calculate overall status
  const healthyCount = Object.values(results.apis).filter(api => 
    api.status === 'healthy' || api.overall === 'healthy'
  ).length;
  const totalApis = Object.keys(results.apis).length;
  
  if (healthyCount === totalApis) {
    results.overall = 'healthy';
  } else if (healthyCount >= totalApis * 0.7) {
    results.overall = 'warning';
  } else {
    results.overall = 'critical';
  }

  console.log(`\n📊 Health Check Summary:`);
  console.log(`Overall Status: ${results.overall.toUpperCase()}`);
  console.log(`Healthy APIs: ${healthyCount}/${totalApis}`);
  console.log(`Success Rate: ${(healthyCount/totalApis*100).toFixed(1)}%`);

  // Write results to file
  const fs = require('fs').promises;
  await fs.writeFile('./health-check-results.json', JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to health-check-results.json`);

  return results.overall === 'healthy' ? 0 : 1;
}

if (require.main === module) {
  healthCheck().then(process.exit).catch(err => {
    console.error('❌ Health check failed:', err);
    process.exit(1);
  });
}

module.exports = { healthCheck };