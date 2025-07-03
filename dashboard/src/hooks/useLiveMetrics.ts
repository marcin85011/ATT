import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface MetricsData {
  budget: any;
  health: any;
  tests: any;
  alerts: any;
  timestamp: string;
}

export const useLiveMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [fallbackToPolling, setFallbackToPolling] = useState(false);

  useEffect(() => {
    const shouldUseMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (shouldUseMocks) {
      setFallbackToPolling(true);
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('📡 WebSocket connected');
      setIsConnected(true);
      setFallbackToPolling(false);
    });

    newSocket.on('metrics:update', (data: MetricsData) => {
      console.log('📊 Received metrics update:', data.timestamp);
      setMetrics(data);
    });

    newSocket.on('disconnect', () => {
      console.log('📡 WebSocket disconnected');
      setIsConnected(false);
      
      // Start 15s timer for fallback to polling
      setTimeout(() => {
        if (!newSocket.connected) {
          console.log('⏰ WebSocket timeout - falling back to REST polling');
          setFallbackToPolling(true);
        }
      }, 15000);
    });

    newSocket.on('connect_error', (error) => {
      console.error('📡 WebSocket connection error:', error);
      setFallbackToPolling(true);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Fallback REST API polling logic
  useEffect(() => {
    if (!fallbackToPolling) return;

    console.log('🔄 Starting REST polling fallback');
    const fetchMetrics = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
        
        const [budget, health, tests, alerts] = await Promise.all([
          fetch(`${apiBaseUrl}/api/budget`).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/health`).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/tests`).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/alerts`).then(r => r.json())
        ]);

        setMetrics({
          budget,
          health,
          tests,
          alerts,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ REST polling failed:', error);
      }
    };

    // Initial fetch
    fetchMetrics();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [fallbackToPolling]);

  return {
    metrics,
    isConnected,
    fallbackToPolling,
    socket
  };
};