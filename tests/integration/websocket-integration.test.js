/**
 * WebSocket Integration Test
 * Tests full end-to-end WebSocket metrics flow with API server
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const { spawn } = require('child_process');
const ioc = require('socket.io-client');
const fs = require('fs').promises;
const path = require('path');

describe('WebSocket Metrics Integration (E2E)', () => {
  let apiServer;
  let clientSocket;
  const testPort = 4001; // Use different port to avoid conflicts

  beforeAll(async () => {
    // Create a test version of api-server with different port
    const testServerCode = `
      const express = require('express');
      const cors = require('cors');
      const { createServer } = require('http');
      const { Server } = require('socket.io');

      const app = express();
      const PORT = ${testPort};
      
      const httpServer = createServer(app);
      const io = new Server(httpServer, {
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "POST"]
        }
      });

      app.use(cors({ origin: 'http://localhost:3000' }));
      app.use(express.json());

      let metricsCache = {
        budget: [{ service: 'test-service', cost: 2.50 }],
        health: [{ service: 'test-service', status: 'healthy' }],
        tests: [{ name: 'test-integration', result: 'passed' }],
        alerts: [{ type: 'info', message: 'test integration alert' }],
        lastUpdated: new Date().toISOString()
      };

      io.on('connection', (socket) => {
        console.log('📡 Test client connected:', socket.id);
        
        // Emit initial metrics
        socket.emit('metrics:update', {
          budget: metricsCache.budget,
          health: metricsCache.health,
          tests: metricsCache.tests,
          alerts: metricsCache.alerts,
          timestamp: metricsCache.lastUpdated
        });
      });

      app.get('/api/trigger-update', (req, res) => {
        metricsCache.lastUpdated = new Date().toISOString();
        metricsCache.budget.push({ service: 'new-service', cost: 1.00 });
        
        io.emit('metrics:update', {
          budget: metricsCache.budget,
          health: metricsCache.health,
          tests: metricsCache.tests,
          alerts: metricsCache.alerts,
          timestamp: metricsCache.lastUpdated
        });
        
        res.json({ success: true, timestamp: metricsCache.lastUpdated });
      });

      httpServer.listen(PORT, () => {
        console.log(\`🚀 Test WebSocket server running on port \${PORT}\`);
      });
    `;

    // Write test server to temp file
    await fs.writeFile(path.join(__dirname, 'temp-test-server.js'), testServerCode);

    // Start test server
    apiServer = spawn('node', [path.join(__dirname, 'temp-test-server.js')], {
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }, 10000);

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.close();
    }
    
    if (apiServer) {
      apiServer.kill();
    }

    // Clean up temp file
    try {
      await fs.unlink(path.join(__dirname, 'temp-test-server.js'));
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should connect to WebSocket server and receive initial metrics', (done) => {
    clientSocket = ioc(`http://localhost:${testPort}`);

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
    });

    clientSocket.on('metrics:update', (data) => {
      expect(data).toHaveProperty('budget');
      expect(data).toHaveProperty('health');
      expect(data).toHaveProperty('tests');
      expect(data).toHaveProperty('alerts');
      expect(data).toHaveProperty('timestamp');
      expect(Array.isArray(data.budget)).toBe(true);
      expect(data.budget.length).toBeGreaterThan(0);
      done();
    });

    clientSocket.on('connect_error', (error) => {
      done(error);
    });
  }, 8000);

  it('should receive real-time updates when metrics change', (done) => {
    let updateCount = 0;
    
    clientSocket.on('metrics:update', (data) => {
      updateCount++;
      
      if (updateCount === 2) { // Second update after trigger
        expect(data.budget.length).toBe(2); // Should have new service
        expect(data.budget.some(item => item.service === 'new-service')).toBe(true);
        done();
      }
    });

    // Trigger metrics update
    setTimeout(() => {
      fetch(`http://localhost:${testPort}/api/trigger-update`)
        .catch(error => {
          console.error('Failed to trigger update:', error);
          done(error);
        });
    }, 1000);
  }, 8000);

  it('should handle reconnection after disconnection', (done) => {
    let reconnected = false;
    
    clientSocket.on('disconnect', () => {
      // Attempt to reconnect
      setTimeout(() => {
        clientSocket.connect();
      }, 500);
    });

    clientSocket.on('connect', () => {
      if (reconnected) {
        done(); // Successfully reconnected
      } else {
        reconnected = true;
        // Simulate disconnection
        clientSocket.disconnect();
      }
    });

    if (!reconnected) {
      clientSocket.disconnect();
    }
  }, 8000);
});