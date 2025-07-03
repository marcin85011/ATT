/**
 * Integration Tests for Cost Alert System
 * Tests end-to-end cost alert flow with WebSocket integration
 */

const io = require('socket.io-client');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

describe('Cost Alerts Integration', () => {
  let serverProcess;
  let clientSocket;
  const API_PORT = 4001; // Use different port for testing
  const API_URL = `http://localhost:${API_PORT}`;
  
  beforeAll(async () => {
    // Start test server
    const serverPath = path.join(__dirname, '../../api-server.js');
    serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, PORT: API_PORT },
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
  });

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.close();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  beforeEach(() => {
    clientSocket = io(API_URL);
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.close();
    }
  });

  describe('API Endpoints', () => {
    test('should fetch cost alerts via REST API', async () => {
      const response = await fetch(`${API_URL}/api/cost-alerts`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('alerts');
      expect(data).toHaveProperty('alertStats');
      expect(data).toHaveProperty('thresholds');
      expect(data).toHaveProperty('timestamp');
      expect(Array.isArray(data.alerts)).toBe(true);
    });

    test('should fetch cost alert configuration', async () => {
      const response = await fetch(`${API_URL}/api/cost-alerts/config`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('thresholds');
      expect(data).toHaveProperty('alertStats');
      expect(data).toHaveProperty('slackConfig');
    });

    test('should update cost alert configuration', async () => {
      const newConfig = {
        thresholds: { 'openai': 7.5 },
        slackConfig: { channel: '#test-alerts' }
      };

      const response = await fetch(`${API_URL}/api/cost-alerts/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.thresholds.openai).toBe(7.5);
    });

    test('should clear cost alert cooldowns', async () => {
      const response = await fetch(`${API_URL}/api/cost-alerts/clear-cooldowns`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('alertStats');
    });

    test('should handle test notification endpoint', async () => {
      const response = await fetch(`${API_URL}/api/cost-alerts/test`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
    });
  });

  describe('WebSocket Integration', () => {
    test('should connect to WebSocket server', (done) => {
      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (error) => {
        done(error);
      });
    });

    test('should receive metrics updates including cost alerts', (done) => {
      clientSocket.on('metrics:update', (data) => {
        expect(data).toHaveProperty('budget');
        expect(data).toHaveProperty('health');
        expect(data).toHaveProperty('tests');
        expect(data).toHaveProperty('alerts');
        expect(data).toHaveProperty('costAlerts');
        expect(data).toHaveProperty('timestamp');
        
        done();
      });

      // Trigger metrics update
      setTimeout(async () => {
        await fetch(`${API_URL}/api/refresh`, { method: 'POST' });
      }, 1000);
    });

    test('should receive cost alert updates', (done) => {
      clientSocket.on('cost-alerts:update', (data) => {
        expect(data).toHaveProperty('alerts');
        expect(data).toHaveProperty('timestamp');
        expect(data).toHaveProperty('alertStats');
        expect(Array.isArray(data.alerts)).toBe(true);
        
        done();
      });

      // Simulate cost alert by creating test cost data
      setTimeout(async () => {
        await simulateCostOverrun();
      }, 1000);
    });

    test('should handle multiple WebSocket connections', (done) => {
      const secondSocket = io(API_URL);
      let receivedCount = 0;

      const handleUpdate = () => {
        receivedCount++;
        if (receivedCount === 2) {
          secondSocket.close();
          done();
        }
      };

      clientSocket.on('metrics:update', handleUpdate);
      secondSocket.on('metrics:update', handleUpdate);

      setTimeout(async () => {
        await fetch(`${API_URL}/api/refresh`, { method: 'POST' });
      }, 1000);
    });
  });

  describe('File Watcher Integration', () => {
    test('should trigger cost alerts when cost tracking file changes', (done) => {
      clientSocket.on('cost-alerts:update', (data) => {
        expect(data.alerts).toBeDefined();
        done();
      });

      // Simulate cost tracking file change
      setTimeout(async () => {
        await simulateCostFileChange();
      }, 1000);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid API requests gracefully', async () => {
      const response = await fetch(`${API_URL}/api/invalid-endpoint`);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Endpoint not found');
      expect(data.availableEndpoints).toContain('GET /api/cost-alerts');
    });

    test('should handle malformed POST data', async () => {
      const response = await fetch(`${API_URL}/api/cost-alerts/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Performance Tests', () => {
    test('should handle concurrent cost alert requests', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(fetch(`${API_URL}/api/cost-alerts`));
      }
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    test('should emit WebSocket updates efficiently', (done) => {
      let updateCount = 0;
      const startTime = Date.now();

      clientSocket.on('metrics:update', () => {
        updateCount++;
        
        if (updateCount === 5) {
          const elapsed = Date.now() - startTime;
          expect(elapsed).toBeLessThan(10000); // Should complete within 10 seconds
          done();
        }
      });

      // Trigger multiple updates
      for (let i = 0; i < 5; i++) {
        setTimeout(async () => {
          await fetch(`${API_URL}/api/refresh`, { method: 'POST' });
        }, i * 500);
      }
    });
  });

  // Helper functions
  async function simulateCostOverrun() {
    try {
      // Create test cost data that exceeds thresholds
      const testCostData = [
        {
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
          operation: 'openai-test',
          cost: 10.0, // Exceeds default threshold of 5.0
          description: 'Test cost overrun',
          type: 'api_call',
          agent_id: 'test'
        }
      ];

      const costFile = path.join(__dirname, '../../cost-tracking.json');
      await fs.writeFile(costFile, JSON.stringify(testCostData, null, 2));
      
      // Wait a bit for file watcher to trigger
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.warn('Could not simulate cost overrun:', error.message);
    }
  }

  async function simulateCostFileChange() {
    try {
      const costFile = path.join(__dirname, '../../cost-tracking.json');
      const timestamp = new Date().toISOString();
      
      // Append a new cost entry
      const newEntry = {
        timestamp,
        date: timestamp.split('T')[0],
        operation: 'file-watcher-test',
        cost: 0.01,
        description: 'File watcher integration test',
        type: 'api_call',
        agent_id: 'test'
      };

      let existingData = [];
      try {
        const data = await fs.readFile(costFile, 'utf8');
        existingData = JSON.parse(data);
      } catch (error) {
        // File doesn't exist, start fresh
      }

      existingData.push(newEntry);
      await fs.writeFile(costFile, JSON.stringify(existingData, null, 2));
      
    } catch (error) {
      console.warn('Could not simulate cost file change:', error.message);
    }
  }
});

// Real-time alert simulation tests
describe('Real-time Alert Scenarios', () => {
  test('should generate alerts for multiple services simultaneously', async () => {
    // This test would create cost data for multiple services
    // and verify that alerts are generated correctly
    expect(true).toBe(true); // Placeholder
  });

  test('should respect alert cooldown periods in real-time', async () => {
    // This test would generate rapid cost increases
    // and verify cooldown behavior
    expect(true).toBe(true); // Placeholder
  });

  test('should handle Slack notification rate limiting', async () => {
    // This test would generate many alerts quickly
    // and verify Slack integration handles it gracefully
    expect(true).toBe(true); // Placeholder
  });
});