/**
 * WebSocket Real-time Metrics Tests
 * Tests Socket.IO integration and metrics emission
 */

const { describe, it, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
const { createServer } = require('http');
const { Server } = require('socket.io');
const ioc = require('socket.io-client');

describe('WebSocket Metrics Integration', () => {
  let httpServer;
  let io;
  let clientSocket;
  let serverSocket;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = ioc(`http://localhost:${port}`);
      
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  beforeEach(() => {
    // Clear any previous listeners
    if (clientSocket) {
      clientSocket.removeAllListeners('metrics:update');
    }
  });

  it('should establish WebSocket connection', (done) => {
    expect(clientSocket.connected).toBe(true);
    expect(serverSocket).toBeDefined();
    done();
  });

  it('should emit metrics:update event with correct structure', (done) => {
    const mockMetrics = {
      budget: [{ service: 'test', cost: 1.50 }],
      health: [{ service: 'test', status: 'healthy' }],
      tests: [{ name: 'test', result: 'passed' }],
      alerts: [{ type: 'info', message: 'test alert' }],
      timestamp: new Date().toISOString()
    };

    clientSocket.on('metrics:update', (data) => {
      expect(data).toEqual(mockMetrics);
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(Array.isArray(data.budget)).toBe(true);
      expect(Array.isArray(data.health)).toBe(true);
      expect(Array.isArray(data.tests)).toBe(true);
      expect(Array.isArray(data.alerts)).toBe(true);
      done();
    });

    // Simulate server emitting metrics update
    io.emit('metrics:update', mockMetrics);
  });

  it('should handle multiple connected clients', (done) => {
    const secondClient = ioc(`http://localhost:${httpServer.address().port}`);
    let receivedCount = 0;
    
    const mockMetrics = {
      budget: [],
      health: [],
      tests: [],
      alerts: [],
      timestamp: new Date().toISOString()
    };

    const checkCompletion = () => {
      receivedCount++;
      if (receivedCount === 2) {
        secondClient.close();
        done();
      }
    };

    clientSocket.on('metrics:update', checkCompletion);
    secondClient.on('metrics:update', checkCompletion);

    secondClient.on('connect', () => {
      io.emit('metrics:update', mockMetrics);
    });
  });

  it('should handle connection and disconnection events', (done) => {
    let connectionCount = 0;
    let disconnectionCount = 0;

    io.on('connection', () => {
      connectionCount++;
    });

    io.on('disconnect', () => {
      disconnectionCount++;
    });

    const tempClient = ioc(`http://localhost:${httpServer.address().port}`);
    
    tempClient.on('connect', () => {
      expect(connectionCount).toBeGreaterThan(0);
      tempClient.close();
      
      setTimeout(() => {
        expect(disconnectionCount).toBeGreaterThan(0);
        done();
      }, 100);
    });
  });
});