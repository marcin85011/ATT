# ATT System Dashboard

A comprehensive real-time health and metrics dashboard for the ATT System (MBA Intelligence Engine v3.0).

## 🎯 Features

### 📊 System Overview
- Real-time KPI monitoring
- System health aggregation
- Quick performance insights
- Alert summaries

### 🔍 API Health Monitoring
- Individual service health status
- Success rate and latency tracking
- Error count and failure analysis
- Detailed service metrics

### 💰 Budget Tracking
- Monthly spend vs budget analysis
- Cost per call efficiency metrics
- Budget utilization alerts
- Spending distribution visualization

### 🧪 Test Results Analytics
- Test performance trends over time
- Pass/fail rate analysis by test type
- Cost tracking for test runs
- Failed test identification

### 🚨 Real-time Alerts
- Live notification feed
- Severity-based filtering
- Alert acknowledgment system
- Historical alert analysis

### ⚙️ Configuration Management
- Budget threshold settings
- Service enable/disable controls
- Alert preferences
- System parameters

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- **Metrics API Server** - For real data (optional - falls back to mock data if unavailable)

### Installation & Running Locally

#### Option 1: With Real API Data (Recommended)

```bash
# 1. Start the Metrics API Server (from project root)
npm run start:api
# API will run on http://localhost:4000

# 2. In a new terminal, start the Dashboard (from project root)
cd dashboard
npm install
npm run dev
# Dashboard will run on http://localhost:3000
```

#### Option 2: Mock Data Only (Development/Testing)

```bash
# Navigate to dashboard directory
cd dashboard

# Install dependencies
npm install

# Create environment file for mock mode
cp .env.example .env
# Edit .env and set: VITE_USE_MOCKS=true

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`

**Note:** The dashboard automatically detects if the API server is running and gracefully falls back to mock data if it's not available.

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling  
- **Recharts** - Data visualization
- **Vite** - Build tool and dev server
- **date-fns** - Date manipulation

### Project Structure

```
dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Main header with system status
│   │   ├── SystemOverview.tsx # Overview dashboard
│   │   ├── ApiHealthGrid.tsx  # API health monitoring
│   │   ├── BudgetTracker.tsx  # Budget and cost tracking
│   │   ├── TestResultsChart.tsx # Test analytics
│   │   ├── AlertsPanel.tsx    # Alert management
│   │   └── ConfigPanel.tsx    # Configuration settings
│   ├── services/            # Data services
│   │   └── mockData.ts      # Mock data generation
│   ├── types/               # TypeScript definitions
│   │   └── dashboard.ts     # Type definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

### Data Models

#### API Health Status
- Service name and endpoint
- Success rate and latency metrics
- Daily/monthly call counts
- Error tracking

#### Budget Metrics
- Daily and monthly spend tracking
- Budget limits and utilization
- Cost per call analysis
- Projected spending

#### Test Results
- Test type categorization (unit, mock, real, e2e)
- Pass/fail counts and rates
- Duration and cost tracking
- Failed test identification

#### Alert Notifications
- Severity levels (low, medium, high, critical)
- Alert types (budget, API failure, test failure, system)
- Acknowledgment status
- Resolution tracking

## 🔧 Configuration

### Environment Variables

Copy the example environment file and customize for your setup:

```bash
cp .env.example .env
```

#### Core Configuration
- **`VITE_USE_MOCKS`** - Toggle between mock and real API data
  - `true` = Use mock data (development/testing)
  - `false` = Use real metrics API (requires api-server.js running)
  - Default: `false`

- **`VITE_API_BASE_URL`** - Base URL for the metrics API server
  - Should match where api-server.js is running
  - Default: `http://localhost:4000`

#### API Behavior
- **`VITE_API_TIMEOUT`** - API request timeout in milliseconds
  - How long to wait before falling back to mock data
  - Default: `5000` (5 seconds)

- **`VITE_API_RETRY_ATTEMPTS`** - Number of retry attempts for failed API calls
  - Default: `2`

- **`VITE_POLLING_INTERVAL`** - Dashboard refresh interval in milliseconds
  - How often to fetch new data from the API
  - Default: `30000` (30 seconds)

#### Development Features
- **`VITE_DEBUG_MODE`** - Enable detailed console logging
  - Shows API calls, errors, and performance metrics
  - Default: `true` for development

- **`VITE_TOAST_DURATION`** - Toast notification display time
  - Default: `4000` (4 seconds)

#### Feature Flags
- **`VITE_SHOW_FILE_WATCH_STATUS`** - Display file watching indicators
  - Shows when the API is processing file changes
  - Default: `true`

- **`VITE_SHOW_PERFORMANCE_METRICS`** - Log performance data to console
  - Useful for debugging API response times
  - Default: `false`

### Mock Data Service
The dashboard includes a comprehensive mock data service for development and testing:

- **Real-time updates** - Simulates live data changes every 5 seconds
- **Realistic metrics** - API health, budget, and test data with proper relationships
- **Alert generation** - Simulates various alert types and severities
- **Performance simulation** - Mimics actual API response times and costs

### Dashboard Configuration
Access the Configuration panel in the dashboard to adjust:

- **Refresh intervals** - How often data updates (5-300 seconds)
- **Budget thresholds** - Warning and critical alert levels
- **Service management** - Enable/disable individual services
- **Alert settings** - Notification preferences

## 🔧 Troubleshooting

### Common Issues

#### Dashboard Shows Mock Data Instead of Real API Data
**Symptoms:** Dashboard displays "MOCK DATA" indicators or placeholder data

**Solutions:**
1. Check if the API server is running: `curl http://localhost:4000/api/health`
2. Verify `.env` file has `VITE_USE_MOCKS=false`
3. Ensure API server is on the correct port (default: 4000)
4. Check browser console for API connection errors

#### API Server Won't Start
**Symptoms:** `npm run start:api` fails or exits immediately

**Solutions:**
1. Verify you're in the project root directory (not `/dashboard`)
2. Check if port 4000 is already in use: `lsof -i :4000`
3. Install dependencies: `npm install`
4. Check for Node.js version compatibility (requires 18+)

#### Dashboard Shows "Connection Failed" Toast Notifications
**Symptoms:** Red error toasts appear when API calls fail

**Solutions:**
1. Increase `VITE_API_TIMEOUT` in `.env` file
2. Check API server logs for errors
3. Verify CORS is configured correctly (should allow localhost:3000)
4. Test API endpoints manually: `curl http://localhost:4000/api/budget`

#### Real-time Updates Not Working
**Symptoms:** Data doesn't refresh automatically

**Solutions:**
1. Check `VITE_POLLING_INTERVAL` setting (default: 30 seconds)
2. Verify file watching is working: check API server console logs
3. Manually refresh browser to confirm API connectivity
4. Enable debug mode: set `VITE_DEBUG_MODE=true`

#### Performance Issues
**Symptoms:** Dashboard loading slowly or consuming high CPU

**Solutions:**
1. Reduce `VITE_POLLING_INTERVAL` (increase the number for less frequent updates)
2. Disable performance logging: `VITE_SHOW_PERFORMANCE_METRICS=false`
3. Check browser developer tools for memory leaks
4. Restart both API server and dashboard

### Debug Mode

Enable detailed logging by setting `VITE_DEBUG_MODE=true` in your `.env` file. This will show:
- API request/response details
- Service loading information
- Error stack traces
- Performance timing data

### Getting Help

1. **Check the browser console** - Most issues show detailed error messages
2. **Review API server logs** - The terminal running `npm run start:api`
3. **Test API endpoints manually** - Use curl or Postman to verify API responses
4. **Verify file permissions** - Ensure the API can read data files like `cost-tracking.json`

## 📈 Monitoring 15 ATT System Services

The dashboard monitors these integrated services:

### AI Services
- **OpenAI Chat** - Language model API
- **OpenAI Vision** - Image analysis API
- **Replicate Imagen** - Image generation API
- **Perplexity** - Research and analysis API

### Data Services
- **Firecrawl** - Web scraping API
- **ScrapeHero** - Amazon data extraction
- **YouTube API** - Video content analysis
- **NewsAPI** - Current events monitoring

### Research Services
- **Google Keywords** - Search volume analysis
- **USPTO Trademark** - Trademark verification
- **EU Trademark** - European trademark checks
- **TextGears** - Grammar and spell checking

### Storage & Infrastructure
- **Google Sheets** - Data storage
- **Google Drive** - File management
- **Media Modifier** - Design mockups
- **Notion** - Project documentation
- **Slack** - Team notifications

## 🎨 Customization

### Styling
The dashboard uses Tailwind CSS with custom theme extensions:

```css
/* Custom colors and animations in tailwind.config.js */
primary: { /* Blue color palette */ }
success: { /* Green color palette */ }
warning: { /* Yellow color palette */ }
danger: { /* Red color palette */ }
```

### Adding New Components
1. Create component in `src/components/`
2. Define types in `src/types/dashboard.ts`
3. Add mock data in `src/services/mockData.ts`
4. Import and use in `App.tsx`

### Data Integration
Replace mock data service with real API calls:

1. Create API client services
2. Update component data fetching
3. Configure environment variables
4. Handle loading and error states

## 🚨 Alert System

### Alert Types
- **Budget Alerts** - Spending threshold violations
- **API Failure Alerts** - Service degradation or outages
- **Test Failure Alerts** - CI/CD pipeline issues
- **System Alerts** - Overall health problems

### Severity Levels
- **Low** - Informational notifications
- **Medium** - Issues requiring attention
- **High** - Problems affecting performance
- **Critical** - Immediate action required

### Alert Management
- **Real-time feed** - Live notification stream
- **Acknowledgment** - Mark alerts as handled
- **Filtering** - View by type, severity, service
- **Historical view** - Review past alerts

## 📊 Performance Metrics

### Key Performance Indicators
- **System Health** - Overall service availability
- **API Success Rate** - Individual service reliability
- **Budget Utilization** - Cost management efficiency
- **Test Pass Rate** - Code quality metrics
- **Alert Response** - Issue resolution tracking

### Cost Tracking
- **Real-time spend** - Current monthly costs
- **Budget vs actual** - Variance analysis
- **Cost per call** - API efficiency metrics
- **Projected spend** - Month-end forecasting

## 🔒 Security Considerations

- **No API keys in frontend** - All credentials server-side
- **Mock mode by default** - Safe development environment
- **HTTPS only** - Secure data transmission
- **Input validation** - Prevent XSS and injection attacks

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📝 License

Private project for ATT System / MBA Intelligence Engine v3.0

## 🤝 Support

For issues and questions:
1. Check the Configuration panel for settings
2. Review mock data service logs
3. Verify API connectivity
4. Contact system administrator

---

**ATT System Dashboard v1.0.0**  
*Real-time Health & Metrics Monitoring*  
*MBA Intelligence Engine v3.0*