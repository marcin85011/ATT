#!/usr/bin/env node
/**
 * ATT System Metrics API Server
 * Serves real-time metrics from file-based data sources
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import metrics processors
const budgetProcessor = require('./metrics/budget-processor');
const healthProcessor = require('./metrics/health-processor');
const testProcessor = require('./metrics/test-processor');
const alertProcessor = require('./metrics/alert-processor');
const fileWatcher = require('./metrics/file-watcher');

// Import cost alert system
const { CostAlertProcessor } = require('./metrics/cost-alert-processor');
const { SlackNotifier } = require('./shared/slack-notifier');

const app = express();
const PORT = 4000;
const startTime = Date.now();

// Initialize cost alert system
const costAlertProcessor = new CostAlertProcessor();
const slackNotifier = new SlackNotifier();

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('📡 Dashboard connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('📡 Dashboard disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// In-memory cache
let metricsCache = {
  budget: null,
  health: null,
  tests: null,
  alerts: null,
  costAlerts: [],
  lastUpdated: null
};

// Initialize file watcher
fileWatcher.initialize((changedFile) => {
  console.log(`📁 File changed: ${changedFile}`);
  invalidateCache(changedFile);
  loadMetrics();
});

// Cache invalidation logic
function invalidateCache(changedFile) {
  if (changedFile.includes('cost-tracking')) {
    metricsCache.budget = null;
    metricsCache.alerts = null; // Budget alerts depend on budget data
    console.log('💾 Budget cache invalidated');
    
    // Cost alerts depend on budget data - trigger cost alert check
    processCostAlerts();
  }
  if (changedFile.includes('error-log')) {
    metricsCache.health = null;
    metricsCache.alerts = null; // Error alerts depend on health data
    console.log('💾 Health cache invalidated');
  }
  if (changedFile.includes('SMOKE_TEST_RESULTS')) {
    metricsCache.health = null;
    console.log('💾 Health cache invalidated (smoke tests)');
  }
  if (changedFile.includes('tests/') && changedFile.endsWith('.json')) {
    metricsCache.tests = null;
    metricsCache.alerts = null; // Test failure alerts depend on test data
    console.log('💾 Test cache invalidated');
  }
}

// Cost alert processing function
async function processCostAlerts() {
  try {
    console.log('🚨 Checking for cost alerts...');
    
    // Get fresh budget data for alert processing
    const budgetData = await budgetProcessor.getBudgetMetrics();
    const costAlerts = costAlertProcessor.checkCostOverruns(budgetData);
    
    if (costAlerts.length > 0) {
      console.log(`🚨 ${costAlerts.length} cost alert(s) detected`);
      
      // Update cache
      metricsCache.costAlerts = costAlerts;
      
      // Emit real-time cost alerts to connected clients
      io.emit('cost-alerts:update', {
        alerts: costAlerts,
        timestamp: new Date().toISOString(),
        alertStats: costAlertProcessor.getAlertStats()
      });
      console.log('📡 Cost alerts emitted to connected clients');
      
      // Send individual alerts to Slack
      for (const alert of costAlerts) {
        if (alert.severity === 'critical' || alert.severity === 'high') {
          await slackNotifier.sendAlert(alert);
        }
      }
      
      // Send system alert if multiple critical alerts
      const criticalAlerts = costAlerts.filter(a => a.severity === 'critical');
      if (criticalAlerts.length >= 2) {
        await slackNotifier.sendMultipleAlertsNotification(criticalAlerts);
      }
      
    } else {
      console.log('✅ No cost alerts detected');
    }
    
  } catch (error) {
    console.error('❌ Error processing cost alerts:', error);
  }
}

// Load all metrics into cache
async function loadMetrics() {
  try {
    console.log('🔄 Loading metrics into cache...');
    
    // Load budget metrics if not cached
    if (!metricsCache.budget) {
      console.log('📊 Loading budget metrics...');
      metricsCache.budget = await budgetProcessor.getBudgetMetrics();
      console.log(`✅ Budget metrics loaded (${metricsCache.budget.length} services)`);
    }
    
    // Load health metrics if not cached
    if (!metricsCache.health) {
      console.log('📊 Loading health metrics...');
      metricsCache.health = await healthProcessor.getHealthMetrics();
      console.log(`✅ Health metrics loaded (${metricsCache.health.length} services)`);
    }
    
    // Load test metrics if not cached
    if (!metricsCache.tests) {
      console.log('📊 Loading test metrics...');
      metricsCache.tests = await testProcessor.getTestMetrics();
      console.log(`✅ Test metrics loaded (${metricsCache.tests.length} test results)`);
    }
    
    // Load alerts if not cached (depends on other metrics)
    if (!metricsCache.alerts) {
      console.log('📊 Loading alerts...');
      metricsCache.alerts = await alertProcessor.getAlerts(
        metricsCache.budget,
        metricsCache.health,
        metricsCache.tests
      );
      console.log(`✅ Alerts loaded (${metricsCache.alerts.length} alerts)`);
    }
    
    metricsCache.lastUpdated = new Date().toISOString();
    console.log('✅ Metrics cache updated successfully');
    
    // Process cost alerts after budget data is loaded
    if (metricsCache.budget) {
      await processCostAlerts();
    }
    
    // Emit real-time metrics update to connected clients
    io.emit('metrics:update', {
      budget: metricsCache.budget,
      health: metricsCache.health,
      tests: metricsCache.tests,
      alerts: metricsCache.alerts,
      costAlerts: metricsCache.costAlerts,
      timestamp: metricsCache.lastUpdated
    });
    console.log('📡 Metrics update emitted to connected clients');
    
  } catch (error) {
    console.error('❌ Error loading metrics:', error);
  }
}

// API Routes

// Health check endpoint
app.get('/api/status', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const watcherStatus = fileWatcher.getStatus();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime,
    cache: {
      lastUpdated: metricsCache.lastUpdated,
      entriesLoaded: {
        budget: metricsCache.budget?.length || 0,
        health: metricsCache.health?.length || 0,
        tests: metricsCache.tests?.length || 0,
        alerts: metricsCache.alerts?.length || 0,
        costAlerts: metricsCache.costAlerts?.length || 0
      }
    },
    fileWatcher: {
      isWatching: watcherStatus.isWatching,
      pendingChanges: watcherStatus.pendingChanges
    }
  });
});

// API health metrics endpoint
app.get('/api/health', async (req, res) => {
  try {
    if (!metricsCache.health) {
      console.log('🔄 Cache miss - loading health metrics...');
      metricsCache.health = await healthProcessor.getHealthMetrics();
    }
    
    res.json(metricsCache.health);
  } catch (error) {
    console.error('❌ Error fetching health metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch health metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Budget metrics endpoint
app.get('/api/budget', async (req, res) => {
  try {
    if (!metricsCache.budget) {
      console.log('🔄 Cache miss - loading budget metrics...');
      metricsCache.budget = await budgetProcessor.getBudgetMetrics();
    }
    
    res.json(metricsCache.budget);
  } catch (error) {
    console.error('❌ Error fetching budget metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch budget metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test metrics endpoint
app.get('/api/tests', async (req, res) => {
  try {
    if (!metricsCache.tests) {
      console.log('🔄 Cache miss - loading test metrics...');
      metricsCache.tests = await testProcessor.getTestMetrics();
    }
    
    res.json(metricsCache.tests);
  } catch (error) {
    console.error('❌ Error fetching test metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch test metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Alerts endpoint
app.get('/api/alerts', async (req, res) => {
  try {
    if (!metricsCache.alerts) {
      console.log('🔄 Cache miss - loading alerts...');
      
      // Ensure we have the dependent data first
      if (!metricsCache.budget) {
        metricsCache.budget = await budgetProcessor.getBudgetMetrics();
      }
      if (!metricsCache.health) {
        metricsCache.health = await healthProcessor.getHealthMetrics();
      }
      if (!metricsCache.tests) {
        metricsCache.tests = await testProcessor.getTestMetrics();
      }
      
      metricsCache.alerts = await alertProcessor.getAlerts(
        metricsCache.budget,
        metricsCache.health,
        metricsCache.tests
      );
    }
    
    res.json(metricsCache.alerts);
  } catch (error) {
    console.error('❌ Error fetching alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch alerts',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Cost alerts endpoint
app.get('/api/cost-alerts', async (req, res) => {
  try {
    // Always return fresh cost alerts to ensure real-time data
    if (!metricsCache.budget) {
      metricsCache.budget = await budgetProcessor.getBudgetMetrics();
    }
    
    const costAlerts = costAlertProcessor.checkCostOverruns(metricsCache.budget);
    metricsCache.costAlerts = costAlerts;
    
    res.json({
      alerts: costAlerts,
      alertStats: costAlertProcessor.getAlertStats(),
      thresholds: costAlertProcessor.getThresholds(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching cost alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch cost alerts',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Cost alert configuration endpoints
app.get('/api/cost-alerts/config', (req, res) => {
  try {
    res.json({
      thresholds: costAlertProcessor.getThresholds(),
      alertStats: costAlertProcessor.getAlertStats(),
      slackConfig: slackNotifier.getConfig(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching cost alert config:', error);
    res.status(500).json({ 
      error: 'Failed to fetch cost alert configuration',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/cost-alerts/config', (req, res) => {
  try {
    const { thresholds, slackConfig } = req.body;
    
    if (thresholds) {
      costAlertProcessor.updateThresholds(thresholds);
    }
    
    if (slackConfig) {
      slackNotifier.updateConfig(slackConfig);
    }
    
    res.json({
      success: true,
      message: 'Cost alert configuration updated',
      thresholds: costAlertProcessor.getThresholds(),
      slackConfig: slackNotifier.getConfig(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating cost alert config:', error);
    res.status(500).json({ 
      error: 'Failed to update cost alert configuration',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/cost-alerts/test', async (req, res) => {
  try {
    const result = await slackNotifier.sendTestNotification();
    
    res.json({
      success: result.success,
      message: result.success ? 'Test notification sent successfully' : 'Test notification failed',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({ 
      error: 'Failed to send test notification',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/cost-alerts/clear-cooldowns', (req, res) => {
  try {
    costAlertProcessor.clearCooldowns();
    
    res.json({
      success: true,
      message: 'Cost alert cooldowns cleared successfully',
      alertStats: costAlertProcessor.getAlertStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error clearing cost alert cooldowns:', error);
    res.status(500).json({ 
      error: 'Failed to clear cost alert cooldowns',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Force refresh endpoint (useful for testing)
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('🔄 Forcing cache refresh...');
    
    // Clear all cache
    metricsCache.budget = null;
    metricsCache.health = null;
    metricsCache.tests = null;
    metricsCache.alerts = null;
    metricsCache.costAlerts = [];
    
    // Reload all metrics
    await loadMetrics();
    
    res.json({
      success: true,
      message: 'Cache refreshed successfully',
      timestamp: new Date().toISOString(),
      lastUpdated: metricsCache.lastUpdated
    });
  } catch (error) {
    console.error('❌ Error refreshing cache:', error);
    res.status(500).json({ 
      error: 'Failed to refresh cache',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/status',
      'GET /api/health',
      'GET /api/budget',
      'GET /api/tests',
      'GET /api/alerts',
      'GET /api/cost-alerts',
      'GET /api/cost-alerts/config',
      'POST /api/cost-alerts/config',
      'POST /api/cost-alerts/test',
      'POST /api/cost-alerts/clear-cooldowns',
      'POST /api/refresh'
    ],
    timestamp: new Date().toISOString()
  });
});

// Start server
httpServer.listen(PORT, async () => {
  console.log('\n🚀 ATT System Metrics API Server with WebSocket Support');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for http://localhost:3000`);
  console.log(`📊 Serving metrics for React dashboard`);
  console.log(`🔄 WebSocket live updates enabled\n`);
  
  console.log('📋 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/budget`);
  console.log(`   GET  http://localhost:${PORT}/api/tests`);
  console.log(`   GET  http://localhost:${PORT}/api/alerts`);
  console.log(`   GET  http://localhost:${PORT}/api/cost-alerts`);
  console.log(`   GET  http://localhost:${PORT}/api/cost-alerts/config`);
  console.log(`   POST http://localhost:${PORT}/api/cost-alerts/config`);
  console.log(`   POST http://localhost:${PORT}/api/cost-alerts/test`);
  console.log(`   POST http://localhost:${PORT}/api/cost-alerts/clear-cooldowns`);
  console.log(`   POST http://localhost:${PORT}/api/refresh\n`);
  
  // Initial cache load
  await loadMetrics();
  
  console.log('✅ Server ready with cached metrics\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down ATT Metrics API server...');
  fileWatcher.cleanup();
  console.log('👋 Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  fileWatcher.cleanup();
  process.exit(0);
});