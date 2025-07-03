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

#### Daily Budget Protection
The system includes automatic budget protection to prevent cost overruns:

```bash
# Set daily spending limit (default: $5.00)
export DAILY_BUDGET_LIMIT=5.00

# Budget guard automatically checks before each QC operation
npm run smoke-test:real  # Skips tests if budget exceeded
```

**Budget Guard Features:**
- ✅ **Automatic Protection**: QC agents (#28-31) check budget before execution
- ✅ **Graceful Skipping**: Operations skip with clear logging when budget exceeded  
- ✅ **Zero-Cost Heartbeats**: Tracks workflow execution even when skipped
- ✅ **Daily Reset**: Budget resets automatically at midnight UTC
- ✅ **Real-Time Tracking**: Monitors spending in `cost-tracking.json`

**Environment Variable:**
```bash
DAILY_BUDGET_LIMIT=5.00  # Default: $5.00, prevents runaway costs
```

**Testing Budget Guard:**
```bash
# Run budget guard unit tests
node tests/budget-guard-test.js

# Test with different budget limits
DAILY_BUDGET_LIMIT=1.00 npm run smoke-test:real
```

#### Cost Thresholds
```bash
export SMOKE_TEST_COST_THRESHOLD=0.10  # Alert if exceeded
npm run smoke-test:real                 # Monitor real API costs
```

### 🔔 Notifications
CI workflows send alerts on test failures and cost overruns.

| Secret | Purpose | Example |
|--------|---------|---------|
| `SLACK_WEBHOOK_URL` | Slack notifications | `https://hooks.slack.com/services/...` |
| `EMAIL_TO` | Notification recipient | `ops@company.com` |
| `EMAIL_FROM` | Gmail sender address | `alerts@company.com` |
| `EMAIL_PASSWORD` | Gmail app password | `abcd efgh ijkl mnop` |

**Setup**: Add these to [Repository Secrets](https://github.com/marcin85011/ATT/settings/secrets/actions).

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

## 🐳 Docker Deployment

### Quick Start
```bash
# Production deployment
docker-compose up -d

# Development mode with live reloading
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f
```

### Services Overview
| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| `metrics-api` | 4000 | API server for dashboard metrics | `/api/status` |
| `dashboard` | 3000 | React dashboard with nginx | `/health` |

### Architecture
```
┌─────────────────┐    ┌──────────────────┐
│   Dashboard     │    │   Metrics API    │
│   (nginx:alpine)│◄──►│   (node:18-alpine)│
│   Port: 3000    │    │   Port: 4000     │
└─────────────────┘    └──────────────────┘
         │                       │
         └───────────────────────┘
              docker network
                   │
           ┌───────▼────────┐
           │ Mounted Files  │
           │ - cost-tracking│
           │ - error-logs   │
           │ - smoke-tests  │
           └────────────────┘
```

### Production Deployment

#### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Data files: `cost-tracking.json`, `error-log.jsonl`, `SMOKE_TEST_RESULTS.md`

#### Build and Deploy
```bash
# Clone and navigate to project
git clone <repository-url> att-system
cd att-system

# Create required data files if they don't exist
touch cost-tracking.json cost-tracking.jsonl error-log.json error-log.jsonl
echo "# Smoke Test Results" > SMOKE_TEST_RESULTS.md

# Build and start services
docker-compose up -d

# Verify deployment
curl http://localhost:4000/api/status
curl http://localhost:3000/health
```

#### Service Configuration

**Metrics API** (`metrics-api` service):
- **Base Image**: `node:18-alpine` (multi-stage build)
- **User**: Non-root user `attapi` (uid: 1001)
- **Health Check**: Calls `/api/status` every 30s
- **Data Mounts**: Read-only access to cost/error/test files
- **Security**: dumb-init for signal handling

**Dashboard** (`dashboard` service):
- **Build Stage**: Node.js build with Vite
- **Runtime**: `nginx:alpine` serving static files
- **User**: Non-root user `attdash` (uid: 1001)
- **API Proxy**: Nginx proxies `/api/*` to metrics-api:4000
- **SPA Routing**: Fallback to `index.html` for React Router

### Development Mode

#### Live Reloading Setup
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View development logs
docker-compose logs -f metrics-api dashboard

# Debugging ports
# API: http://localhost:4000 (+ debugger on 9229)
# Dashboard: http://localhost:3000 (+ HMR on 3001)
```

#### Development Features
- **Live Code Reloading**: Source files mounted for instant updates
- **Debug Support**: Node.js debugger on port 9229
- **HMR**: Vite Hot Module Replacement on port 3001
- **Volume Caching**: Node modules cached in Docker volumes
- **Writeable Mounts**: Data files can be modified for testing

#### File Watching
Development mode includes enhanced file watching:
```bash
# API changes auto-restart server
echo "console.log('updated');" >> api-server.js

# Dashboard changes trigger HMR
echo "/* updated */" >> dashboard/src/App.tsx
```

### Data File Management

#### Required Files
The system expects these files to be present and readable:
```bash
# Cost tracking
./cost-tracking.json       # Current cost data
./cost-tracking.jsonl      # Historical cost logs

# Error monitoring  
./error-log.json          # Current error state
./error-log.jsonl         # Historical error logs

# Test results
./SMOKE_TEST_RESULTS.md   # Latest test outcomes
./tests/fixtures/         # Test data directory
```

#### File Permissions
```bash
# Ensure Docker can read data files
chmod 644 cost-tracking.json cost-tracking.jsonl
chmod 644 error-log.json error-log.jsonl  
chmod 644 SMOKE_TEST_RESULTS.md
chmod -R 755 tests/fixtures/
```

### Monitoring and Maintenance

#### Health Checks
```bash
# Check service health
docker-compose ps
docker health inspect att-metrics-api
docker health inspect att-dashboard

# Manual health check
curl -f http://localhost:4000/api/status || echo "API unhealthy"
curl -f http://localhost:3000/health || echo "Dashboard unhealthy"
```

#### Logs and Debugging
```bash
# View real-time logs
docker-compose logs -f --tail=50

# Check specific service
docker-compose logs metrics-api
docker-compose logs dashboard

# Debug container issues
docker-compose exec metrics-api sh
docker-compose exec dashboard sh
```

#### Performance Monitoring
```bash
# Container resource usage
docker stats att-metrics-api att-dashboard

# Network inspection
docker network inspect att-system-network

# Volume usage
docker volume ls | grep att-
```

### Security Considerations

#### Container Security
- ✅ **Non-root users**: Both containers run as unprivileged users
- ✅ **Read-only mounts**: Data files mounted read-only in production
- ✅ **Security headers**: Nginx configured with security headers
- ✅ **Process management**: dumb-init for proper signal handling
- ✅ **Minimal attack surface**: Alpine images with minimal packages

#### Network Security
- ✅ **Internal network**: Services communicate via Docker network
- ✅ **Rate limiting**: Nginx rate limiting for API endpoints
- ✅ **CORS protection**: API configured for dashboard origin only

### Troubleshooting

#### Common Issues

**Dashboard shows "API temporarily unavailable"**:
```bash
# Check API service
docker-compose logs metrics-api
curl http://localhost:4000/api/status

# Restart API service
docker-compose restart metrics-api
```

**File mount permission errors**:
```bash
# Fix file ownership (Linux/macOS)
sudo chown $USER:$USER cost-tracking.json error-log.jsonl
chmod 644 cost-tracking.json error-log.jsonl

# Windows (run as administrator)
icacls cost-tracking.json /grant Users:R
```

**Build failures**:
```bash
# Clear Docker build cache
docker system prune -f
docker-compose build --no-cache

# Check .dockerignore files
cat .dockerignore
cat dashboard/.dockerignore
```

**Memory/resource issues**:
```bash
# Increase Docker memory limit (Docker Desktop)
# Settings > Resources > Advanced > Memory: 4GB+

# Monitor resource usage
docker stats --no-stream
```

#### Debug Commands
```bash
# Rebuild specific service
docker-compose build metrics-api
docker-compose up -d metrics-api

# Access container shell
docker-compose exec metrics-api sh
docker-compose exec dashboard sh

# View container filesystem
docker-compose exec metrics-api ls -la /app
docker-compose exec dashboard ls -la /usr/share/nginx/html

# Test API from container
docker-compose exec metrics-api wget -qO- http://localhost:4000/api/status
```

### Environment Variables

#### Production Environment
```bash
# API Configuration
NODE_ENV=production
PORT=4000

# Dashboard Configuration
NODE_ENV=production
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:4000
```

#### Development Environment
```bash
# Enable development features
NODE_ENV=development
DEBUG=att:*
VITE_USE_MOCKS=false
VITE_DEBUG_MODE=true
VITE_HMR_PORT=3001
```

For complete Docker documentation including dashboard-specific instructions, see `dashboard/README.md`.

## 🏗 Production

### PM2 Cluster Mode Setup

For production deployment with PM2 process manager:

```bash
# Quick start - run the production script
./scripts/start-production.sh
```

#### Manual Setup
```bash
# Install PM2 globally
npm install -g pm2

# Start in cluster mode with all CPU cores
pm2 start pm2.config.js

# Save configuration for restart on boot  
pm2 save && pm2 startup
```

#### Production Management

**Check Status:**
```bash
pm2 list                    # Show all processes
pm2 show metrics-api        # Detailed info
pm2 monit                   # Real-time monitoring
```

**Process Control:**
```bash
pm2 restart metrics-api     # Restart application
pm2 reload metrics-api      # Zero-downtime reload
pm2 stop metrics-api        # Stop application
pm2 delete metrics-api      # Remove from PM2
```

**Log Management:**
```bash
pm2 logs metrics-api        # View real-time logs
pm2 logs metrics-api --lines 100  # Last 100 lines
pm2 flush metrics-api       # Clear logs
```

#### Log Locations
- **Output logs**: `./logs/api-out.log`
- **Error logs**: `./logs/api-error.log` 
- **Combined logs**: `./logs/api-combined.log`
- **Retention**: 7-day automatic rotation via PM2
- **Format**: JSON with timestamps (YYYY-MM-DD HH:mm:ss)

#### Configuration
- **Cluster mode**: Utilizes all available CPU cores (`instances: "max"`)
- **Memory limit**: 250MB per instance (auto-restart on exceed)
- **Auto-restart**: Enabled with 5 max restarts, 10s minimum uptime
- **Environment**: `NODE_ENV=production`, `PORT=4000`

#### Performance Benefits
- **Load balancing**: Requests distributed across CPU cores
- **Zero-downtime**: Hot reloads without dropping connections
- **Memory management**: Automatic restart on memory leaks
- **Fault tolerance**: Process monitoring and auto-recovery