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