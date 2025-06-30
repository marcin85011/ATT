# ATT System - Automated Trend-to-Tee v1.0

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

#### Cost Estimates (Production)

| Agent | API | Cost per Operation | Daily Limit ($5) |
|-------|-----|-------------------|------------------|
| #05 | Firecrawl | $0.002 | 2,500 SERPs |
| #06 | ScrapeHero | $0.005 | 1,000 products |
| #07 | Perplexity | $0.001 | 5,000 requests |
| #09 | Trademark | Free | Unlimited* |
| #10 | Replicate | $0.005 | 1,000 images |
| #11 | Vision | $0.01 | 500 analyses |

*Rate limited by APIs

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