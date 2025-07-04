import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { MetricsData, CostAlertsData } from '../types';

export const useLiveMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [costAlerts, setCostAlerts] = useState<CostAlertsData | null>(null);
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
      
      // Update cost alerts if included in metrics
      if (data.costAlerts) {
        setCostAlerts({
          alerts: data.costAlerts,
          timestamp: data.timestamp,
          alertStats: {
            totalThresholds: 0,
            activeCooldowns: 0,
            cooldownPeriod: 3600000,
            lastUpdate: data.timestamp
          },
          thresholds: {}
        });
      }
    });

    newSocket.on('cost-alerts:update', (data: CostAlertsData) => {
      console.log('🚨 Received cost alerts update:', data.timestamp);
      setCostAlerts(data);
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
        
        const [budget, health, tests, alerts, costAlertsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/budget`).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/health`).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/tests`).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/alerts`).then(r => r.json()),
          fetch(`${apiBaseUrl}/api/cost-alerts`).then(r => r.json())
        ]);

        setMetrics({
          budget,
          health,
          tests,
          alerts,
          costAlerts: costAlertsResponse.alerts,
          timestamp: new Date().toISOString()
        });

        setCostAlerts({
          alerts: costAlertsResponse.alerts || [],
          timestamp: costAlertsResponse.timestamp || new Date().toISOString(),
          alertStats: costAlertsResponse.alertStats || {
            totalThresholds: 0,
            activeCooldowns: 0,
            cooldownPeriod: 3600000,
            lastUpdate: new Date().toISOString()
          },
          thresholds: costAlertsResponse.thresholds || {}
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
    costAlerts,
    isConnected,
    fallbackToPolling,
    socket
  };
};