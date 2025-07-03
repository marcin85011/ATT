# ATT System Dashboard

A React-based dashboard for monitoring ATT System metrics with real-time API integration.

## Overview

The ATT Dashboard provides a comprehensive view of system performance, cost tracking, and operational metrics. It connects to the Metrics API to display real-time data with fallback to mock data for development.

## Quick Start

### Development (Local)
```bash
# Install dependencies
npm ci

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Docker Development
```bash
# From project root
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d dashboard

# View logs
docker-compose logs -f dashboard

# Access shell
docker-compose exec dashboard sh
```

### Production Docker
```bash
# From project root
docker-compose up -d dashboard

# Check health
curl http://localhost:3000/health
```

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules + Tailwind CSS
- **State Management**: React Hooks + Context
- **HTTP Client**: Fetch API with retry logic
- **Production Server**: Nginx (Docker)

### Service Integration
```
┌─────────────────┐    ┌──────────────────┐
│   Dashboard     │    │   Metrics API    │
│   React/Vite    │◄──►│   Express Server │
│   Port: 3000    │    │   Port: 4000     │
└─────────────────┘    └──────────────────┘
         │                       │
    ┌────▼────┐              ┌───▼───┐
    │ Mock    │              │ Real  │
    │ Data    │              │ Files │
    └─────────┘              └───────┘
```

## Environment Configuration

### Environment Variables
Create `.env` file with:
```bash
# API Configuration
VITE_USE_MOCKS=false                    # Use real API vs mock data
VITE_API_BASE_URL=http://localhost:4000 # Metrics API endpoint
VITE_API_TIMEOUT=5000                   # Request timeout (ms)
VITE_API_RETRY_ATTEMPTS=2               # Retry failed requests
VITE_POLLING_INTERVAL=30000             # Auto-refresh interval (ms)

# Development Features
VITE_DEBUG_MODE=true                    # Enable debug logging
VITE_TOAST_DURATION=4000                # Error notification duration
VITE_SHOW_FILE_WATCH_STATUS=true        # Show file watching status
VITE_SHOW_PERFORMANCE_METRICS=false     # Display perf metrics

# Hot Module Replacement (Development)
VITE_HMR_PORT=3001                      # HMR port for Docker
```

### Configuration Modes

**Mock Mode** (`VITE_USE_MOCKS=true`):
- Uses static mock data from `src/services/mockData.ts`
- No external dependencies
- Ideal for UI development and testing
- Zero API costs

**Real Mode** (`VITE_USE_MOCKS=false`):
- Connects to Metrics API on port 4000
- Live data from cost tracking, error logs, test results
- Graceful fallback to mock data if API unavailable
- Real-time file watching updates

## Development Workflow

### Local Development

#### Prerequisites
- Node.js 18+
- npm 8+
- Metrics API running on port 4000 (for real mode)

#### Setup
```bash
# Navigate to dashboard directory
cd dashboard

# Install dependencies
npm ci

# Copy environment template
cp .env.example .env

# Edit configuration
nano .env

# Start development server
npm run dev
```

#### Available Scripts
```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint + TypeScript checking
npm run type-check   # TypeScript compilation check
npm test             # Run unit tests (Jest)
npm run test:watch   # Watch mode testing
npm run coverage     # Test coverage report
```

### Docker Development

#### Development Mode Features
- **Live Reloading**: Source code changes trigger automatic rebuild
- **Volume Mounts**: `src/`, `public/`, config files mounted
- **HMR Support**: Vite Hot Module Replacement
- **Debug Access**: Container shell access for debugging
- **Fast Rebuilds**: Node modules cached in Docker volumes

#### Docker Development Commands
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View dashboard logs
docker-compose logs -f dashboard

# Monitor dashboard only
docker-compose logs -f --tail=20 dashboard

# Rebuild dashboard (after package.json changes)
docker-compose build dashboard
docker-compose up -d dashboard

# Access container shell
docker-compose exec dashboard sh

# Debug build issues
docker-compose build --no-cache dashboard
```

#### File Watching in Docker
The development setup includes live file watching:
```bash
# These changes will trigger automatic reload:
src/           # React components and hooks
public/        # Static assets
index.html     # Main HTML template
vite.config.ts # Vite configuration
package.json   # Dependencies (requires rebuild)
.env           # Environment variables
```

#### Debugging Development Issues
```bash
# Check container status
docker-compose ps dashboard

# View Vite dev server logs
docker-compose logs dashboard | grep -i vite

# Check file permissions (if mounts fail)
ls -la src/ public/

# Test API connectivity from container
docker-compose exec dashboard wget -qO- http://metrics-api:4000/api/status

# Check network connectivity
docker-compose exec dashboard nslookup metrics-api
```

## Production Deployment

### Build Process
The production build uses a multi-stage Docker process:

1. **Build Stage** (`node:18-alpine`):
   - Installs dependencies with `npm ci`
   - Runs `npm run build` with production optimizations
   - Generates optimized static files in `/dist`

2. **Runtime Stage** (`nginx:alpine`):
   - Copies built files to nginx document root
   - Configures nginx for SPA routing and API proxy
   - Runs as non-root user for security

### Nginx Configuration
The production nginx setup includes:
- **SPA Routing**: Fallback to `index.html` for React Router
- **API Proxy**: `/api/*` requests proxied to `metrics-api:4000`
- **Static Caching**: Long-term caching for assets (1 year)
- **Security Headers**: XSS protection, content type sniffing prevention
- **Gzip Compression**: Optimized asset delivery
- **Rate Limiting**: API endpoint protection

### Health Monitoring
```bash
# Check service health
curl http://localhost:3000/health

# Monitor nginx status
docker-compose exec dashboard nginx -s reload

# View nginx access logs
docker-compose logs dashboard | grep access

# Performance monitoring
docker stats att-dashboard
```

## API Integration

### Service Architecture
The dashboard integrates with the Metrics API through a service layer:

```typescript
// src/services/realData.ts
export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  source: 'api' | 'mock';
}

// Automatic fallback logic
const response = await fetchWithRetry('/api/status')
  .catch(() => getMockData('status'));
```

### Endpoints Used
| Endpoint | Purpose | Refresh Rate |
|----------|---------|--------------|
| `/api/status` | System health and uptime | 30s |
| `/api/health` | Service health metrics | 30s |
| `/api/budget` | Cost tracking and alerts | 60s |
| `/api/tests` | Test results and coverage | 120s |
| `/api/alerts` | System alerts and warnings | 30s |

### Error Handling
- **Network Errors**: Automatic retry with exponential backoff
- **API Unavailable**: Graceful fallback to mock data
- **User Notifications**: Toast notifications for errors
- **Status Indicators**: Visual indication of API vs mock mode

### Retry Logic
```typescript
const fetchWithRetry = async (url: string, attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, { timeout: 5000 });
      if (response.ok) return response.json();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};
```

## Testing

### Test Structure
```
tests/
├── components/          # Component unit tests
├── services/           # API service tests
├── hooks/              # Custom hook tests
├── integration/        # API integration tests
└── e2e/               # End-to-end tests (Cypress)
```

### Running Tests
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run coverage

# Integration tests (requires API)
npm run test:integration

# E2E tests
npm run test:e2e
```

### Docker Testing
```bash
# Run tests in container
docker-compose exec dashboard npm test

# Coverage in container
docker-compose exec dashboard npm run coverage

# Integration tests with API
docker-compose exec dashboard npm run test:integration
```

## Performance Optimization

### Build Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image compression and lazy loading
- **Bundle Analysis**: Webpack bundle analyzer integration

### Runtime Optimizations
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large data lists
- **Image Lazy Loading**: Intersection Observer API
- **Service Worker**: Offline capability and caching

### Docker Optimizations
- **Multi-stage Builds**: Smaller production images
- **Layer Caching**: Optimized Dockerfile for build speed
- **Static Asset Caching**: Nginx long-term caching
- **Gzip Compression**: Reduced transfer sizes

## Troubleshooting

### Common Development Issues

**Dashboard shows blank screen:**
```bash
# Check console for errors
open http://localhost:3000
# F12 > Console

# Check API connectivity
curl http://localhost:4000/api/status

# Verify environment
cat .env | grep VITE_
```

**API data not loading:**
```bash
# Check API service
curl http://localhost:4000/api/status

# Check CORS configuration
curl -H "Origin: http://localhost:3000" http://localhost:4000/api/status

# Verify environment variables
echo $VITE_API_BASE_URL
```

**Docker build failures:**
```bash
# Clear build cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache dashboard

# Check node_modules mounting
docker-compose exec dashboard ls -la node_modules
```

**HMR not working in Docker:**
```bash
# Check file permissions
ls -la src/

# Verify volume mounts
docker inspect att-dashboard | grep -A 20 Mounts

# Restart development container
docker-compose restart dashboard
```

### Performance Issues

**Slow initial load:**
```bash
# Check bundle size
npm run build && du -sh dist/

# Analyze bundle
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/

# Enable build compression
VITE_BUILD_GZIP=true npm run build
```

**Memory leaks:**
```bash
# Monitor memory usage
docker stats att-dashboard

# Check for memory leaks in dev tools
# F12 > Memory > Take heap snapshot
```

## Security Considerations

### Development Security
- **Environment Variables**: Never commit `.env` files
- **API Keys**: Use environment variables only
- **CORS**: Configured for localhost development
- **Content Security Policy**: Restrictive CSP headers

### Production Security
- **Nginx Security**: Security headers, rate limiting
- **Non-root Containers**: Unprivileged user execution
- **Asset Integrity**: Subresource integrity checking
- **HTTPS**: SSL/TLS in production environments

### Secure Configuration
```bash
# Secure environment setup
chmod 600 .env
echo ".env" >> .gitignore

# Container security
docker run --user 1001:1001 att-system/dashboard

# Nginx security headers
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
```

## Contributing

### Development Guidelines
1. **Code Style**: ESLint + Prettier configuration
2. **TypeScript**: Strict type checking enabled
3. **Testing**: Unit tests required for new features
4. **Documentation**: Update README for new features

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation
4. Submit PR with description
5. Address review feedback

### Code Quality Tools
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format

# Pre-commit hooks
npm run pre-commit
```

## Support

### Getting Help
- **Documentation**: See main project README.md
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions

### Debug Information
When reporting issues, include:
```bash
# System information
node --version
npm --version
docker --version

# Environment
cat .env | grep -v API_KEY

# Logs
docker-compose logs dashboard --tail=50
```