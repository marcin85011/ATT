# ATT System Metrics API

A real-time metrics API server that processes file-based data sources to provide dashboard metrics for the ATT System.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the API server:
```bash
npm run start:api
# or
npm run api
# or
node api-server.js
```

The server will start on **http://localhost:4000** and automatically watch for file changes.

## 📊 API Endpoints

### GET /api/status
Health check and server status information.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-02T15:30:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "cache": {
    "lastUpdated": "2025-07-02T15:25:00.000Z",
    "entriesLoaded": {
      "budget": 17,
      "health": 17,
      "tests": 120,
      "alerts": 50
    }
  },
  "fileWatcher": {
    "isWatching": true,
    "pendingChanges": 0
  }
}
```

### GET /api/health
API service health metrics and success rates.

**Response:**
```json
[
  {
    "service": "OpenAI Chat",
    "endpoint": "api.openai_chat.com",
    "status": "healthy",
    "successRate": 98.5,
    "avgLatency": 245,
    "lastCheck": "2025-07-02T15:30:00.000Z",
    "dailyCalls": 150,
    "monthlyCalls": 4500,
    "errorCount": 2,
    "lastError": null
  }
]
```

### GET /api/budget
Budget and spend metrics per service.

**Response:**
```json
[
  {
    "service": "OpenAI Chat",
    "dailySpend": 12.50,
    "monthlySpend": 387.25,
    "dailyBudget": 50.00,
    "monthlyBudget": 1500.00,
    "costPerCall": 0.002,
    "projectedMonthlySpend": 387.50,
    "alertThreshold": 80,
    "currency": "USD"
  }
]
```

### GET /api/tests
Test results aggregated by type and time.

**Response:**
```json
[
  {
    "timestamp": "2025-07-02T15:30:00.000Z",
    "testType": "unit",
    "passed": 145,
    "failed": 5,
    "total": 150,
    "duration": 120,
    "cost": 0,
    "failedTests": ["test_auth_validation"]
  }
]
```

### GET /api/alerts
System alerts for budget overruns, failures, and issues.

**Response:**
```json
[
  {
    "id": "alert_1234567890",
    "timestamp": "2025-07-02T15:30:00.000Z",
    "type": "budget",
    "severity": "high",
    "service": "OpenAI Chat",
    "message": "Daily budget threshold exceeded (85%)",
    "details": {
      "currentSpend": 42.50,
      "limit": 50.00
    },
    "acknowledged": false,
    "resolvedAt": null
  }
]
```

### POST /api/refresh
Force refresh all cached metrics.

**Response:**
```json
{
  "success": true,
  "message": "Cache refreshed successfully",
  "timestamp": "2025-07-02T15:30:00.000Z",
  "lastUpdated": "2025-07-02T15:30:00.000Z"
}
```

## 📁 Data Sources

The API monitors these files for changes:

- **cost-tracking.json** - Current cost summary
- **cost-tracking.jsonl** - Historical cost entries
- **error-log.jsonl** - Error logs with service mapping
- **SMOKE_TEST_RESULTS.md** - Latest API test results
- **tests/**/*.json** - Test result files

## 🔧 Configuration

### Environment Variables

No environment variables are required. The API uses default values:

- **Port:** 4000
- **CORS Origin:** http://localhost:3000
- **File Watch Debounce:** 500ms

### Service Budgets

Budget limits are configured in `metrics/budget-processor.js`:

```javascript
const SERVICE_BUDGETS = {
  'AI': { daily: 50, monthly: 1500 },
  'Storage': { daily: 5, monthly: 150 },
  'Data': { daily: 20, monthly: 600 },
  'Research': { daily: 10, monthly: 300 },
  'Quality': { daily: 5, monthly: 150 },
  'Design': { daily: 15, monthly: 450 },
  'Backup': { daily: 2, monthly: 60 },
  'Notifications': { daily: 1, monthly: 30 }
};
```

## 🧪 Testing with cURL

### Check server status
```bash
curl http://localhost:4000/api/status
```

### Get API health metrics
```bash
curl http://localhost:4000/api/health | jq '.[0]'
```

### Get budget information
```bash
curl http://localhost:4000/api/budget | jq 'map(select(.service == "OpenAI Chat"))'
```

### Get recent test results
```bash
curl http://localhost:4000/api/tests | jq 'map(select(.testType == "unit")) | .[0:5]'
```

### Get unacknowledged alerts
```bash
curl http://localhost:4000/api/alerts | jq 'map(select(.acknowledged == false))'
```

### Force cache refresh
```bash
curl -X POST http://localhost:4000/api/refresh
```

### Filter high-severity alerts
```bash
curl http://localhost:4000/api/alerts | jq 'map(select(.severity == "high" or .severity == "critical"))'
```

### Get budget warnings
```bash
curl http://localhost:4000/api/budget | jq 'map(select((.dailySpend / .dailyBudget) > 0.8))'
```

### Check services with errors
```bash
curl http://localhost:4000/api/health | jq 'map(select(.errorCount > 0))'
```

## 🔄 Real-time Updates

The API automatically:

1. **Watches files** for changes using chokidar
2. **Debounces updates** (500ms) to prevent excessive reloading
3. **Invalidates cache** selectively based on changed files
4. **Reloads metrics** automatically when data changes

### Cache Invalidation Logic

- `cost-tracking.*` changes → Budget + Alert cache cleared
- `error-log.jsonl` changes → Health + Alert cache cleared  
- `SMOKE_TEST_RESULTS.md` changes → Health cache cleared
- `tests/**/*.json` changes → Test + Alert cache cleared

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port 4000 is in use
lsof -i :4000

# Kill process using port 4000
kill -9 $(lsof -t -i:4000)

# Start server with debug output
DEBUG=* npm run start:api
```

### Missing data files
The API gracefully handles missing files with fallback data. Check console output for warnings:
```
Could not read cost-tracking.jsonl: ENOENT: no such file or directory
```

### Cache issues
Force refresh the cache:
```bash
curl -X POST http://localhost:4000/api/refresh
```

### CORS errors
Ensure your React app is running on `http://localhost:3000`. To change the CORS origin, edit `api-server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:YOUR_PORT',
  credentials: true
}));
```

## 🔌 Dashboard Integration

### React App Setup

Update your React app to use the real API instead of mock data:

```typescript
// Replace mockData service calls with:
const API_BASE = 'http://localhost:4000/api';

const fetchMetrics = async () => {
  const [health, budget, tests, alerts] = await Promise.all([
    fetch(`${API_BASE}/health`).then(r => r.json()),
    fetch(`${API_BASE}/budget`).then(r => r.json()),
    fetch(`${API_BASE}/tests`).then(r => r.json()),
    fetch(`${API_BASE}/alerts`).then(r => r.json())
  ]);
  
  return { health, budget, tests, alerts };
};
```

### Polling for Updates

```typescript
useEffect(() => {
  const interval = setInterval(fetchMetrics, 30000); // 30 seconds
  return () => clearInterval(interval);
}, []);
```

## 📦 Project Structure

```
/
├── api-server.js              # Main Express server
├── api-README.md              # This documentation
├── metrics/                   # Data processors
│   ├── budget-processor.js    # Cost tracking analysis
│   ├── health-processor.js    # API health monitoring  
│   ├── test-processor.js      # Test results aggregation
│   ├── alert-processor.js     # Alert generation
│   └── file-watcher.js        # File monitoring system
├── cost-tracking.json         # Current cost summary
├── cost-tracking.jsonl        # Historical cost entries
├── error-log.jsonl            # Error logs
├── SMOKE_TEST_RESULTS.md      # Latest test results
└── tests/                     # Test result files
```

## 🚀 Production Deployment

For production use:

1. **Use PM2** for process management:
```bash
npm install -g pm2
pm2 start api-server.js --name "att-metrics-api"
pm2 save
pm2 startup
```

2. **Enable logging**:
```bash
pm2 logs att-metrics-api
```

3. **Monitor performance**:
```bash
pm2 monit
```

4. **Configure reverse proxy** (nginx):
```nginx
location /api/ {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 📝 License

PROPRIETARY - ATT System Week 6β QC Agents