# MBA Intelligence Engine - Testing Infrastructure

This comprehensive testing suite provides end-to-end validation for all 15 API integrations in the MBA Intelligence Engine with budget controls and cost monitoring.

## 🎯 Overview

### Test Types
- **Unit Tests**: Individual API client testing with mocks (no cost)
- **Integration Tests (Mock)**: Workflow testing with mock server (minimal cost)
- **Integration Tests (Real)**: Real API validation (budget-controlled)
- **E2E Tests**: Complete pipeline testing (highest cost tier)

### Cost Management
- Daily budget limit: $10.00
- Per-test budget limit: $0.50
- Monthly budget cap: $200.00
- Automatic budget enforcement with graceful degradation

## 🏗️ Directory Structure

```
tests/
├── unit/
│   └── api-clients/           # Individual API client tests
│       ├── openai.test.js     # OpenAI Chat & Vision API tests
│       ├── replicate.test.js  # Imagen-4-Ultra generation tests
│       ├── scrapehero.test.js # Amazon product scraping tests
│       └── ...                # All 15 API clients
├── integration/
│   ├── mock/                  # Integration tests with mock server
│   │   ├── research-workflow.test.js    # Research pipeline tests
│   │   ├── creative-workflow.test.js    # Creative generation tests
│   │   ├── quality-workflow.test.js     # Quality control tests
│   │   └── strategy-workflow.test.js    # Strategy optimization tests
│   └── real/                  # Real API integration tests
│       ├── openai-real.test.js          # Real OpenAI API tests
│       ├── replicate-real.test.js       # Real Replicate API tests
│       └── ...                          # Real API validations
├── e2e/                       # End-to-end workflow tests
│   ├── complete-pipeline.test.js        # Full design pipeline
│   ├── batch-processing.test.js         # Batch design processing
│   └── error-recovery.test.js           # Error handling tests
├── mock-server/
│   └── api-mocks.js           # Mock server for all 15 APIs
├── utils/
│   ├── test-helpers.js        # Cost tracking & utilities
│   └── cost-reporter.js       # Jest cost reporting
├── fixtures/
│   ├── cost-tracking.json     # Cost tracking data
│   └── test-data.json         # Sample test data
└── setup/
    └── jest.setup.js          # Global test configuration
```

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Install dev dependencies for testing
npm install --save-dev jest @jest/globals jest-junit nock supertest express cors
```

### Basic Usage
```bash
# Run all unit tests (no API costs)
npm run test:unit

# Run integration tests with mocks (minimal cost)
npm run test:integration

# Run real API tests (budget-controlled)
npm run test:integration:real

# Run full end-to-end tests (highest cost)
npm run test:e2e

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Environment Setup
```bash
# Create .env file
TEST_MODE=mock
TEST_DAILY_BUDGET=10.00
TEST_MONTHLY_BUDGET=200.00
BUDGET_ENFORCEMENT=true

# For real API testing, add API keys:
OPENAI_API_KEY=your_openai_key
REPLICATE_API_TOKEN=your_replicate_token
SCRAPEHERO_API_KEY=your_scrapehero_key
# ... all 15 API keys
```

## 📊 Cost Management

### Budget Controls
The testing infrastructure includes sophisticated budget controls:

```javascript
// Check current budget status
npm run test:budget-check

// View cost summary
npm run test:cost-report

// Track costs for specific test
const testCost = APITestHelpers.calculateAPICosts('openai', 1000); // 1000 tokens
await global.testUtils.trackAPICost('openai_test', testCost, 1000);
```

### Cost Calculation Examples
```javascript
// OpenAI GPT-4o: $0.03 per 1K tokens
const openaiCost = APITestHelpers.calculateAPICosts('openai', 1500); // $0.045

// Replicate Imagen-4-Ultra: $0.08 per image
const replicateCost = APITestHelpers.calculateAPICosts('replicate', 0, 2); // $0.16

// ScrapeHero: $0.01 per product
const scrapeCost = APITestHelpers.calculateAPICosts('scrapehero', 0, 0); // $0.01
```

### Budget Enforcement
```bash
# Strict budget enforcement (default)
BUDGET_ENFORCEMENT=true npm test

# Disable budget enforcement for development
BUDGET_ENFORCEMENT=false npm test

# Override budget for special tests
TEST_PER_TEST_BUDGET=1.00 npm run test:integration:real
```

## 🎭 Mock Server

### Starting the Mock Server
```bash
# Start mock server on port 3001
npm run test:mock-server

# Health check
curl http://localhost:3001/health

# View request logs
curl http://localhost:3001/logs
```

### Mock Server Features
- Simulates all 15 external APIs
- Configurable response scenarios (success, rate limits, errors)
- Request logging and analytics
- Realistic response structures with test data

### Using Mock Responses
```javascript
// In tests, the mock server provides realistic responses:
const response = await fetch('http://localhost:3001/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Test compliance check' }]
  })
});

const data = await response.json();
// Returns mock compliance analysis with realistic structure
```

## 🧪 API Testing Matrix

### 15 API Integrations Tested

| API | Unit Tests | Mock Integration | Real Integration | Cost/Test |
|-----|------------|------------------|------------------|-----------|
| OpenAI GPT-4o | ✅ | ✅ | ✅ | $0.001-0.05 |
| OpenAI Vision | ✅ | ✅ | ✅ | $0.001-0.05 |
| Replicate Imagen-4-Ultra | ✅ | ✅ | ✅ | $0.08/image |
| ScrapeHero | ✅ | ✅ | ✅ | $0.01/product |
| YouTube Data API | ✅ | ✅ | ✅ | Free tier |
| NewsAPI | ✅ | ✅ | ✅ | Free tier |
| Perplexity AI | ✅ | ✅ | ✅ | $0.001/1K tokens |
| Google Keywords | ✅ | ✅ | ✅ | $0.002/keyword |
| Firecrawl | ✅ | ✅ | ✅ | $0.003/page |
| TextGears | ✅ | ✅ | ✅ | $0.0001/check |
| Trademark Lookup | ✅ | ✅ | ✅ | $0.005/search |
| EU Trademarks | ✅ | ✅ | ✅ | $0.005/search |
| Media Modifier | ✅ | ✅ | ✅ | $0.02/mockup |
| Notion API | ✅ | ✅ | ✅ | Free tier |
| Google Sheets | ✅ | ✅ | ✅ | Free tier |

## 🔧 Test Configuration

### Jest Configuration
The project uses Jest with custom configurations for different test types:

```javascript
// jest.config.js includes:
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testTimeout: 5000
    },
    {
      displayName: 'integration-mock',
      testMatch: ['<rootDir>/tests/integration/mock/**/*.test.js'],
      testTimeout: 15000
    },
    {
      displayName: 'integration-real',
      testMatch: ['<rootDir>/tests/integration/real/**/*.test.js'],
      testTimeout: 30000
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
      testTimeout: 120000
    }
  ]
};
```

### Custom Jest Matchers
```javascript
// Enhanced matchers for API testing
expect(cost).toBeWithinBudget('daily');
expect(response).toHaveValidAPIResponse('openai');
expect(duration).toCompleteWithinTimeout(5000);
```

## 🔄 CI/CD Integration

### GitHub Actions Workflows
The testing infrastructure includes comprehensive CI/CD with matrix jobs:

```yaml
# .github/workflows/mba-engine-ci.yml
strategy:
  matrix:
    test-group: ['openai', 'replicate', 'scrapehero', ...]
    node-version: ['18', '20']
```

### CI Test Tiers

1. **Pull Request**: Unit + Integration (Mock) tests
2. **Push to Main**: All tests except E2E
3. **Nightly Schedule**: Real API integration tests
4. **Manual Dispatch**: Full E2E testing with budget override

### Budget Gating
```bash
# CI automatically checks budget before expensive tests
if [[ "$BUDGET_OK" == "true" ]]; then
  npm run test:integration:real
else
  echo "Skipping real API tests - budget exceeded"
fi
```

## 📈 Monitoring & Reporting

### Cost Reporting
```bash
# Generate comprehensive cost report
npm run test:cost-report

# View daily cost summary
npm run cost-summary

# Check budget status
npm run test:budget-check
```

### Test Reports
- JUnit XML output for CI integration
- Coverage reports in multiple formats
- Cost analysis with budget projections
- API performance metrics

### Example Cost Report
```json
{
  "summary": {
    "totalTests": 156,
    "totalCost": 8.47,
    "averageCostPerTest": 0.054,
    "budgetUtilization": "84.7%"
  },
  "apiBreakdown": [
    { "api": "replicate", "totalCost": 4.80, "percentage": "56.7%" },
    { "api": "openai", "totalCost": 2.34, "percentage": "27.6%" },
    { "api": "scrapehero", "totalCost": 0.89, "percentage": "10.5%" }
  ],
  "recommendations": [
    "Consider mocking Replicate API in frequent tests",
    "Batch OpenAI requests to reduce per-call overhead"
  ]
}
```

## 🛠️ Development Workflows

### Adding New API Tests
1. Create unit test in `tests/unit/api-clients/`
2. Add API mock to `tests/mock-server/api-mocks.js`
3. Create integration test in `tests/integration/mock/`
4. Add real API test in `tests/integration/real/`
5. Update cost calculation in `tests/utils/test-helpers.js`

### Running Specific Test Suites
```bash
# Test specific API
npm test -- --testNamePattern="openai"

# Test specific workflow
npm test -- --testNamePattern="research-workflow"

# Test with specific budget
TEST_PER_TEST_BUDGET=0.10 npm test

# Debug mode with verbose output
JEST_VERBOSE=true npm test
```

### Local Development
```bash
# Start mock server in background
npm run test:mock-server &

# Run tests in watch mode
npm run test:watch

# Stop mock server
pkill -f "test:mock-server"
```

## 🔒 Security & Best Practices

### API Key Management
- Store API keys in environment variables
- Use GitHub Secrets for CI/CD
- Rotate keys regularly
- Monitor API usage and costs

### Budget Safety
- Set conservative daily/monthly limits
- Use graduated test tiers (unit → mock → real → e2e)
- Implement automatic budget enforcement
- Monitor costs in real-time

### Test Isolation
- Each test is independent and atomic
- Mock server provides consistent responses
- Cost tracking prevents runaway expenses
- Error handling prevents cascade failures

## 📞 Support & Troubleshooting

### Common Issues

**Budget Exceeded Error**
```bash
# Check current budget status
npm run test:budget-check

# Reset daily tracking (new day)
node -e "require('./tests/utils/test-helpers.js').TestCostTracker.prototype.resetDailyTracking()"
```

**Mock Server Not Starting**
```bash
# Check if port 3001 is available
lsof -i :3001

# Start with different port
PORT=3002 npm run test:mock-server
```

**Real API Tests Failing**
```bash
# Verify API keys are set
echo $OPENAI_API_KEY

# Test with single API
TEST_REAL_APIS=true npm test -- --testNamePattern="openai-real"
```

### Performance Optimization
- Use parallel test execution with `--maxWorkers`
- Cache expensive operations between tests
- Batch API calls when possible
- Monitor test execution times

### Contact
- GitHub Issues: Report bugs and feature requests
- Slack: #mba-engine-testing (internal)
- Email: dev-team@mba-intelligence.com

---

🎯 **Ready to test your MBA Intelligence Engine!** Start with `npm run test:unit` and work your way up to the full test suite.