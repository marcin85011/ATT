# ATT System - Automated Trend-to-Tee v1.0

[![QC Smoke Tests](https://github.com/marcin85011/ATT/actions/workflows/qc-smoke-tests.yml/badge.svg?branch=main)](https://github.com/marcin85011/ATT/actions/workflows/qc-smoke-tests.yml)

## Overview
The ATT System is a comprehensive n8n-based workflow automation platform for generating trending t-shirt designs with market validation and cost optimization.

## Week 3 - Niche Discovery System

### Agents Overview
| Agent | File | Purpose |
|-------|------|---------|
| #16 | 16-niche-generator.json | Generate 50 keyword combinations from PRD lists |
| #17 | 17-mba-scraper.json | Puppeteer scrape Amazon MBA for competition data |
| #18 | 18-niche-analyzer.json | Calculate opportunity scores, trigger deep analysis |
| #19 | 19-deep-analyzer.json | GPT-4o Vision analysis of top-3 competing designs |
| #20 | 20-search-validator.json | Google Trends validation with trend direction |

### Setup Instructions

1. **Environment Configuration**
   ```bash
   cp Template.env .env
   # Edit .env with your actual API keys
   ```

2. **Required APIs**
   - OpenAI API (GPT-4o Vision)
   - Notion API + Database
   - Google Trends (optional cookie)
   - OPPORTUNITY_SCORE_THRESHOLD (configurable analyzer threshold, default: 70)
     *Note: Lowering far below 60 may push Priority scores to 100 (they're clamped)*

3. **n8n Import**
   ```bash
   # Import workflows in order
   n8n import workflows/16-niche-generator.json
   n8n import workflows/17-mba-scraper.json
   n8n import workflows/18-niche-analyzer.json  
   n8n import workflows/19-deep-analyzer.json
   n8n import workflows/20-search-validator.json
   ```

### Workflow Pipeline
```
Niche Generator → MBA Scraper → Niche Analyzer
        ↓              ↓            ↓ (score >70)
   [NicheDB]     [Competition]  → Deep Analyzer
                                      ↓
                              Search Validator
```

### Cost Optimization
- Daily budget: $5.00
- Per-niche cost: ~$0.16-0.33
- Daily capacity: 15-30 niches
- Auto-cost tracking with alerts

### Database Schema
**NicheDB Fields:**
- Topic (Title)
- Market Score (Number)
- Competition Data (Text)
- Opportunity Score (Number)
- TrendDirection (Select: rising/flat/falling)
- Status (Select)
- Agent Source (Select)

## Week 4 - Intelligence Layer System

### Agents Overview
| Agent | File | Purpose |
|-------|------|---------|
| #04 | 04-priority-scorer.json | GPT-4o priority scoring |
| #05 | 05-competitor-serp.json | Firecrawl SERP scrape → CompetitorsDB |
| #06 | 06-deep-competitor.json | ScrapeHero deep competitor fetch |
| #07 | 07-perplexity-synthesis.json | Perplexity Sonar cultural insights |
| #08 | 08-prompt-builder.json | GPT-4o → Imagen prompt builder |

### Run Order
**Pipeline**: Priority → SERP → Deep → Cultural → Prompt

### Cost Optimization
- Cost per niche: ≈ $0.29-0.59
- Cycle capacity: ≈ 8-12 niches/day under $5 budget

## Week 5 - Design Pipeline System

### Agents Overview
| Agent | File | Purpose |
|-------|------|---------|
| #09 | 09-ip-checker.json | Real USPTO + EUIPO trademark checking |
| #10 | 10-image-generator.json | Real Replicate Imagen 4 Pro generation |
| #11 | 11-vision-guard.json | Real OpenAI Vision similarity detection |
| #27 | 27-variant-generator.json | Generate 3 style variants from base design |

### Production API Prerequisites

#### Required API Keys & Services

1. **Firecrawl API** (Agent #05)
   - Website: https://firecrawl.dev
   - Cost: $0.002 per SERP scrape
   - Rate limits: 1000 requests/hour
   - Setup: Sign up → Get API key → Add to `FIRECRAWL_API_KEY`

2. **ScrapeHero API** (Agent #06)
   - Website: https://scrapehero.com
   - Cost: $0.005 per product scrape
   - Rate limits: 100 requests/minute
   - Setup: Contact sales → Get API key → Add to `SCRAPEHERO_API_KEY`

3. **Perplexity API** (Agent #07)
   - Website: https://perplexity.ai/api
   - Cost: $0.001 per request (Sonar model)
   - Rate limits: 60 requests/minute
   - Setup: Subscribe to Pro → Get API key → Add to `PERPLEXITY_API_KEY`

4. **USPTO API** (Agent #09)
   - Website: https://developer.uspto.gov
   - Cost: Free (rate limited)
   - Rate limits: 100 requests/hour
   - Setup: Register → Get API key → Add to `USPTO_API_KEY`

5. **EUIPO API** (Agent #09)
   - Website: https://euipo.europa.eu/copla
   - Cost: Free (rate limited)
   - Rate limits: 50 requests/hour
   - Setup: Register → Get API key → Add to `EUIPO_API_KEY`

6. **Replicate API** (Agent #10)
   - Website: https://replicate.com
   - Cost: $0.005 per image (Imagen 4 Pro)
   - Rate limits: 100 requests/minute
   - Setup: Sign up → Get token → Add to `REPLICATE_API_TOKEN`

7. **OpenAI API** (Agent #11)
   - Website: https://platform.openai.com
   - Cost: $0.01 per 1K tokens (GPT-4o Vision)
   - Rate limits: 10,000 requests/minute
   - Setup: Account → API keys → Add to `OPENAI_API_KEY`

#### Authentication Setup

```bash
# Copy template and add real API keys
cp Template.env .env

# Edit .env with your actual credentials:
FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxx
SCRAPEHERO_API_KEY=sh_xxxxxxxxxxxxx
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxx
USPTO_API_KEY=uspto_xxxxxxxxxxxxx
EUIPO_API_KEY=euipo_xxxxxxxxxxxxx
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

#### Cost Estimates (Real Production Benchmarks - from Smoke Tests)

| Agent | API Service | Cost per Operation | Avg Response Time | Daily Limit ($5) |
|-------|-------------|-------------------|------------------|------------------|
| #05 | Firecrawl | $0.002 | 2.3s | 2,500 SERPs |
| #06 | ScrapeHero | $0.005 | 4.1s | 1,000 products |
| #07 | Perplexity | $0.001 | 1.8s | 5,000 requests |
| #09 | USPTO/EUIPO | Free | 3.0s avg | Unlimited* |
| #10 | Replicate | $0.0025** | 15.2s | 2,000 images |
| #11 | OpenAI Vision | $0.004 | 3.7s | 1,250 analyses |

*Rate limited by API providers  
**512x512 resolution, production may vary

#### Rate Limiting

The system implements automatic rate limiting:
- Firecrawl: 1 second between requests
- ScrapeHero: 1 second between requests  
- Perplexity: 2 seconds between requests
- Trademark: 2 seconds between requests
- Replicate: 3 seconds between requests
- OpenAI Vision: 2 seconds between requests

#### Health Monitoring

Production APIs include health checks:
```bash
# Check API connectivity
node scripts/health-check.js

# Monitor costs
node scripts/cost-monitor.js
```

### Pipeline Flow (Production)
```
Niche Input → IP Check (USPTO/EUIPO) → Image Gen (Replicate)
     ↓              ↓                        ↓
Cultural Analysis  IP Status             Vision Guard
(Perplexity)      (approved/flagged)     (OpenAI GPT-4o)
     ↓              ↓                        ↓
SERP Analysis → Deep Analysis → Prompt → Final Output
(Firecrawl)    (ScrapeHero)    Build    (Approved/Rejected)
```

## Live-API Smoke Testing

### Running Smoke Tests
Execute the complete smoke test suite to validate all production APIs:

```bash
# Run full smoke test suite
node scripts/smoke/smoke-test-runner.js

# Run individual agent smoke tests
node scripts/smoke/agent-05-firecrawl-smoke.js
node scripts/smoke/agent-06-scrapehero-smoke.js  
node scripts/smoke/agent-07-perplexity-smoke.js
node scripts/smoke/agent-09-trademark-smoke.js
node scripts/smoke/agent-10-replicate-smoke.js
node scripts/smoke/agent-11-openai-smoke.js

# Test retry logic and rate limiting
node scripts/smoke/429-retry-simulator.js
```

### Smoke Test Coverage
- ✅ **Agent #05**: Firecrawl SERP scraping (minimal 5 results)
- ✅ **Agent #06**: ScrapeHero product analysis (single ASIN)
- ✅ **Agent #07**: Perplexity cultural insights (basic query)
- ✅ **Agent #09**: USPTO/EUIPO trademark search (known term)
- ✅ **Agent #10**: Replicate image generation (512x512, 10 steps)
- ✅ **Agent #11**: OpenAI Vision analysis (sample image)
- ✅ **Rate Limiting**: 429 response handling and retry logic

### Cost Monitoring Integration
All smoke tests integrate with the existing cost tracking system:
- Real-time cost logging to `scripts/cost-tracking.json`
- Budget impact analysis and projections
- Daily spend tracking and alert thresholds
- Performance metrics collection

### Notion Schema Validation
```bash
# Validate all Notion database schemas
node scripts/validate-notion-schema.js
```

The validator compares live Notion database structures against `config/notion-schemas.json` and:
- Auto-patches trivial issues (missing properties, select options)
- Reports schema mismatches requiring manual intervention
- Generates `NOTION_SCHEMA_DIFF.md` with detailed results

## 🧪 Quality Control Smoke Tests

### Quick Start
```bash
npm run smoke-test        # Safe mock mode (free)
npm run smoke-test:real   # Real APIs ($0.01-0.02 cost)
npm test                  # Runs smoke tests in mock mode
```

### What Gets Tested
- **Agent #28 (Grammarly)**: Spell/grammar detection accuracy
- **Agent #29 (Contrast)**: WCAG compliance analysis  
- **Agent #30 (Readability)**: Flesch-Kincaid scoring
- **Agent #31 (Mockup)**: Placeit mockup generation

### Results & Monitoring
- **Results**: Auto-saved to `SMOKE_TEST_RESULTS.md`
- **Costs**: Tracked in `cost-tracking.json`
- **Errors**: Logged to `error-log.jsonl`
- **CI**: Runs automatically on every push/PR

### Cost Management
```bash
export SMOKE_TEST_COST_THRESHOLD=0.10  # Alert if exceeded
npm run smoke-test:real                 # Monitor real API costs
```

## Week-6 Quality Control Agents (Alpha)

### QC Pipeline Overview
Quality control agents validate designs before final approval:

| Agent | Purpose | API/Method | Cost | Processing Time |
|-------|---------|------------|------|----------------|
| #28 | Spell/Grammar Check | Grammarly Business | $0.001 | <2s |
| #29 | Color Contrast Analysis | Local WCAG calculation | Free | <1s |
| #30 | Readability Scoring | Local Flesch-Kincaid | Free | <0.5s |
| #31 | Mockup Generation | Placeit API | $0.01 | <10s |

### QC Workflow Integration
```
Design Approval → QC Gate → Final Output
                    ↓
    [#28] → [#29] → [#30] → [#31] 
   Spell   Contrast  Read-   Mockup
   Check   Analysis  ability  Generator
```

### QC Quality Thresholds
- **Spelling**: 0 errors allowed, 99.9% accuracy
- **Grammar**: ≥95 Grammarly score
- **Contrast**: WCAG AA (4.5:1) minimum, AAA (7:1) preferred  
- **Readability**: 6th-8th grade level (Flesch-Kincaid)
- **Mockups**: 1200x1200px, 300 DPI, 3 variations

### Implementation Status
- ✅ **Specification**: Complete (see `docs/week6-qc-spec.md`)
- ✅ **Workflow Stubs**: Created (agents #28-31)
- ✅ **Client Modules**: Stubbed (Grammarly, contrast, readability, mockup)
- 🔄 **Implementation**: Next phase (integration with live system)

### Environment Variables for QC
Add to your `.env` file:
```bash
# QC Agents (Week 6)
GRAMMARLY_API_KEY=your_grammarly_business_key
PLACEIT_API_KEY=your_placeit_api_key  
NOTION_QC_DATABASE_ID=your_qc_database_id
```