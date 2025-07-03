import React from 'react';
import { useLiveMetrics } from './hooks/useLiveMetrics';
import './App.css';

const App: React.FC = () => {
  const { metrics, isConnected, fallbackToPolling } = useLiveMetrics();

  const LiveIndicator = () => (
    <div className={`live-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
      <span className="indicator-dot" />
      {isConnected ? 'Live' : fallbackToPolling ? 'Polling' : 'Connecting...'}
    </div>
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>ATT System Dashboard</h1>
        <LiveIndicator />
      </header>
      
      <main className="app-main">
        {metrics ? (
          <div className="metrics-grid">
            <div className="metric-card">
              <h2>Budget</h2>
              <p>Services: {metrics.budget?.length || 0}</p>
              <p className="timestamp">Updated: {new Date(metrics.timestamp).toLocaleTimeString()}</p>
            </div>
            
            <div className="metric-card">
              <h2>Health</h2>
              <p>Services: {metrics.health?.length || 0}</p>
              <p className="timestamp">Updated: {new Date(metrics.timestamp).toLocaleTimeString()}</p>
            </div>
            
            <div className="metric-card">
              <h2>Tests</h2>
              <p>Results: {metrics.tests?.length || 0}</p>
              <p className="timestamp">Updated: {new Date(metrics.timestamp).toLocaleTimeString()}</p>
            </div>
            
            <div className="metric-card">
              <h2>Alerts</h2>
              <p>Active: {metrics.alerts?.length || 0}</p>
              <p className="timestamp">Updated: {new Date(metrics.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ) : (
          <div className="loading">
            <p>Loading metrics...</p>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>
          Connection: {isConnected ? '🟢 WebSocket' : fallbackToPolling ? '🟠 REST Polling' : '🔴 Connecting'}
        </p>
      </footer>
    </div>
  );
};

export default App;