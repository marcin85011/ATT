# Week-6 Quality Control Agents Specification v1.0-week6-alpha

## System Overview
Four quality control agents that validate t-shirt designs before final approval, ensuring professional quality and compliance with industry standards.

## Integration Architecture
```
Design Pipeline → QC Gate → Approved Designs
                    ↓
     [#28] → [#29] → [#30] → [#31] → Final Output
   Spell    Contrast  Read-    Mockup
   Check    Analysis  ability   Generator
```

## Agent #28 - Spell-Check Agent

### Purpose
Comprehensive grammar and spelling validation using Grammarly Business API integration.

### Technical Specifications
- **Input**: Design text, title, description, keywords
- **API**: Grammarly Business API (Premium tier)
- **Cost**: $0.001 per text block (~500 words)
- **Rate Limit**: 60 requests/minute
- **Processing Time**: <2 seconds average
- **Mock Mode**: Returns deterministic results for development

### Implementation Details
```javascript
// Example client usage
const { GrammarlyClient } = require('../clients/grammarly-client');
const client = new GrammarlyClient(process.env.GRAMMARLY_API_KEY);

const result = await client.checkText(designText, {
  tone: 'casual',
  audience: 'general',
  domain: 'creative',
  goals: ['clarity', 'engagement']
});
```

### Quality Thresholds
- **Spelling Accuracy**: 99.9% (0 spelling errors allowed)
- **Grammar Score**: ≥95 (Grammarly scoring scale)
- **Clarity Score**: ≥90 (readability metric)
- **Engagement Score**: ≥80 (audience appeal)

### Output Format
```json
{
  "agent": "spell-check-28",
  "status": "pass|fail|warning",
  "spelling_errors": 0,
  "grammar_score": 98,
  "clarity_score": 92,
  "engagement_score": 85,
  "corrections": [
    {
      "type": "grammar",
      "original": "Your awesome!",
      "suggested": "You're awesome!",
      "confidence": 0.99
    }
  ],
  "processing_time_ms": 1245,
  "cost": 0.001
}
```

## Agent #29 - Contrast-Analyzer Agent

### Purpose  
WCAG 2.1 AA/AAA color contrast validation for accessibility compliance.

### Technical Specifications
- **Input**: Design image (PNG/JPG), base64 or URL
- **Processing**: Local color analysis (no external API)
- **Cost**: $0.000 (computational only)
- **Processing Time**: <1 second
- **Standards**: WCAG 2.1 Level AA (4.5:1) and AAA (7:1)

### Implementation Algorithm
```javascript
// Color contrast calculation using WCAG formula
const calculateContrast = (color1, color2) => {
  const l1 = relativeLuminance(color1);
  const l2 = relativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};
```

### Quality Thresholds
- **WCAG AA Compliance**: Contrast ratio ≥ 4.5:1 (required)
- **WCAG AAA Compliance**: Contrast ratio ≥ 7:1 (preferred) 
- **Text Size Consideration**: Large text (≥18pt) requires ≥3:1
- **Color Blind Friendly**: Deuteranopia and Protanopia simulation

### Output Format
```json
{
  "agent": "contrast-analyzer-29",
  "status": "pass|fail|warning",
  "wcag_aa_compliant": true,
  "wcag_aaa_compliant": false,
  "contrast_ratio": 6.24,
  "primary_text_color": "#FFFFFF",
  "background_color": "#2E3440", 
  "accessibility_score": 8.5,
  "colorblind_friendly": true,
  "processing_time_ms": 432,
  "cost": 0.000
}
```

## Agent #30 - Readability-Scorer Agent

### Purpose
Flesch-Kincaid readability analysis optimized for t-shirt design audiences.

### Technical Specifications
- **Input**: Design text content (title, slogan, description)
- **Processing**: Local F-K algorithm implementation
- **Cost**: $0.000 (computational only)
- **Processing Time**: <0.5 seconds
- **Target Audience**: General public (6th-8th grade level)

### Readability Metrics
- **Flesch Reading Ease**: 60-80 (Standard to Easy)
- **Flesch-Kincaid Grade Level**: 6-8 (optimal for t-shirts)
- **Average Sentence Length**: <15 words (punchy messaging)
- **Syllable Complexity**: <2.5 syllables per word average

### Implementation Formula
```javascript
// Flesch-Kincaid Grade Level
const gradeLevel = 0.39 * (totalWords / totalSentences) + 
                   11.8 * (totalSyllables / totalWords) - 15.59;

// Flesch Reading Ease  
const readingEase = 206.835 - 1.015 * (totalWords / totalSentences) - 
                    84.6 * (totalSyllables / totalWords);
```

### Output Format
```json
{
  "agent": "readability-scorer-30",
  "status": "pass|fail|warning", 
  "flesch_reading_ease": 72.5,
  "flesch_kincaid_grade": 7.2,
  "average_sentence_length": 12.4,
  "syllables_per_word": 1.8,
  "readability_score": 8.1,
  "target_audience": "general_public",
  "recommendations": [
    "Consider shorter sentences for better impact",
    "Good vocabulary level for target audience"
  ],
  "processing_time_ms": 89,
  "cost": 0.000
}
```

## Agent #31 - Mock-up-Generator Agent

### Purpose
Generate realistic t-shirt mockups for marketing and preview purposes.

### Technical Specifications
- **Input**: Approved design image (4500x5400px)
- **API**: Placeit API or similar mockup service
- **Cost**: $0.01 per mockup set (3 variations)
- **Rate Limit**: 30 requests/minute
- **Processing Time**: <10 seconds per set
- **Output**: High-quality mockup images
- **Mock Mode**: Returns placeholder mockup URLs

### Mockup Variations
1. **Front View**: Classic t-shirt on white background
2. **Lifestyle**: Person wearing the design in natural setting
3. **Flat Lay**: Product photography style on textured surface

### Implementation Specs
```javascript
const mockupOptions = {
  garment_type: 'unisex_tshirt',
  colors: ['black', 'white', 'heather_gray'],
  sizes: ['M', 'L'], 
  backgrounds: ['white', 'lifestyle', 'flat_lay'],
  resolution: '1200x1200',
  format: 'PNG',
  quality: 'high'
};
```

### Quality Standards
- **Resolution**: 1200x1200px minimum
- **Image Quality**: 300 DPI for print-ready
- **Background Options**: White, lifestyle, flat lay
- **File Formats**: PNG (with transparency), JPG
- **Brand Consistency**: Consistent lighting and positioning

### Output Format
```json
{
  "agent": "mockup-generator-31",
  "status": "pass|fail|warning",
  "mockups_generated": 3,
  "mockup_urls": [
    {
      "type": "front_view",
      "url": "https://mockup-cdn.com/design_123_front.png",
      "resolution": "1200x1200"
    },
    {
      "type": "lifestyle",
      "url": "https://mockup-cdn.com/design_123_lifestyle.png", 
      "resolution": "1200x1200"
    },
    {
      "type": "flat_lay",
      "url": "https://mockup-cdn.com/design_123_flat.png",
      "resolution": "1200x1200"
    }
  ],
  "processing_time_ms": 7800,
  "estimated_cost": 0.01
}
```

## Integration Workflow

### QC Pipeline Sequence
```
1. Design Approval → 
2. Agent #28 (Spell Check) → 
3. Agent #29 (Contrast Analysis) → 
4. Agent #30 (Readability Score) → 
5. Agent #31 (Mockup Generation) → 
6. Final Quality Report
```

### Quality Gate Logic
- **All Pass**: Proceed to next agent
- **Any Fail**: Return to design revision
- **Warning**: Human review required
- **Critical Fail**: Immediate rejection

### Performance Targets
- **Total QC Time**: <15 seconds end-to-end
- **Pass Rate**: ≥85% on first attempt
- **Cost per Design**: ≤$0.012 (excluding mockups)
- **Accuracy**: 99%+ precision on quality issues

## Cost Analysis

| Agent | Cost per Design | Processing Time | Monthly Volume (1000 designs) |
|-------|----------------|-----------------|-------------------------------|
| #28 | $0.001 | 2s | $1.00 |
| #29 | $0.000 | 1s | $0.00 |
| #30 | $0.000 | 0.5s | $0.00 |
| #31 | $0.010 | 10s | $10.00 |
| **Total** | **$0.011** | **13.5s** | **$11.00** |

## Error Handling & Fallbacks

### Retry Logic
- **Network Errors**: 3 retries with exponential backoff
- **API Rate Limits**: Automatic queue management
- **Service Degradation**: Graceful fallback to manual review

### Quality Assurance
- **Daily Accuracy Monitoring**: Track false positives/negatives
- **Performance Benchmarking**: Response time and success rate tracking
- **Cost Optimization**: Automatic cost alerts and budget management

## Database Schema

### QualityControlDB Fields
- **Design ID**: Primary identifier (title field)
- **Agent**: Which QC agent processed (select: 28, 29, 30, 31)
- **Status**: QC result (select: pass, fail, warning, pending)
- **Score**: Quality score 0-100 (number)
- **Results**: Detailed analysis JSON (text)
- **Issues**: Problems found (text)
- **Recommendations**: Improvement suggestions (text)
- **Processing Time**: Duration in milliseconds (number)
- **Cost**: API cost for check (number)
- **Created At**: Timestamp (created_time)

## Environment Configuration

### Required Environment Variables
```bash
# QC Agent API Keys
GRAMMARLY_API_KEY=your_grammarly_business_key
PLACEIT_API_KEY=your_placeit_api_key

# Notion Database
NOTION_QC_DATABASE_ID=your_qc_notion_database_id

# Development Configuration
MOCK_MODE=true  # set to false after real keys are added
QC_COST_LIMIT=0.012

# Budget Monitoring
DAILY_BUDGET_LIMIT=5.00
COST_ALERT_THRESHOLD=4.00
```

## Development & Testing

### Mock Mode Operation
When `MOCK_MODE=true`:
- **Grammarly Client**: Returns deterministic spell check results
- **Contrast Client**: Returns WCAG compliant mock analysis
- **Readability Client**: Returns optimal readability scores  
- **Mockup Client**: Returns placeholder mockup URLs

### Unit Testing
Each client includes built-in mock functionality for development:
```javascript
// Example test usage
process.env.MOCK_MODE = 'true';
const client = new GrammarlyClient();
const result = await client.checkText('Test text');
console.log(result.mock); // true
```

### Integration Testing
- **Smoke Tests**: Individual client validation
- **End-to-End**: Complete QC pipeline testing
- **Performance**: Response time and accuracy benchmarks
- **Cost Validation**: Budget compliance verification

## Security & Compliance

### API Security
- **Key Rotation**: Support for API key updates
- **Rate Limiting**: Respect provider limits
- **Error Sanitization**: No sensitive data in logs
- **Audit Trail**: Complete QC decision tracking

### Data Privacy
- **Text Content**: Processed through secure APIs only
- **Image Analysis**: Local processing for contrast (no external)
- **Retention**: QC results stored in Notion only
- **Compliance**: GDPR and privacy law adherent

## Monitoring & Metrics

### Key Performance Indicators
- **QC Pass Rate**: Percentage of designs passing all checks
- **Processing Time**: Average time per QC pipeline
- **Cost Efficiency**: Cost per successful QC validation
- **Error Rate**: Failed QC checks due to system errors

### Alerting Thresholds
- **Cost Overrun**: >$0.012 per design (excluding mockups)
- **Processing Delay**: >15 seconds total pipeline time
- **High Failure Rate**: <80% pass rate
- **API Errors**: >5% error rate

## Deployment & Rollout

### Phase 6-α (Foundation)
- ✅ Shared modules and infrastructure
- ✅ Complete specification documentation
- ✅ Client and workflow stubs
- ✅ Database schema and environment setup

### Phase 6-β (Full Implementation)
- 🔄 Complete client implementations
- 🔄 Full workflow logic and integration
- 🔄 Comprehensive testing suite
- 🔄 Production deployment ready

### Production Readiness Checklist
- [ ] All API keys provisioned and tested
- [ ] QualityControlDB created in Notion
- [ ] Smoke tests passing on all agents
- [ ] Cost monitoring active and validated
- [ ] Error handling tested with failure scenarios
- [ ] Performance benchmarks established

---

## Changelog

### v1.0-week6-alpha (2024-12-30)
- **Foundation Phase**: Complete QC system specification
- **Infrastructure**: Shared modules, client stubs, workflow stubs
- **Configuration**: Database schema, environment variables
- **Documentation**: Comprehensive agent specifications and integration plan
- **Next Phase**: 6-β full implementation with complete runtime logic