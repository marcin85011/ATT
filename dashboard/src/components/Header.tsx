import React from 'react';
import { SystemMetrics } from '../types/dashboard';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
  systemMetrics: SystemMetrics;
  lastUpdated: Date;
  mockMode: boolean;
  onToggleMockMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  systemMetrics, 
  lastUpdated, 
  mockMode, 
  onToggleMockMode 
}) => {
  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600';
    if (health >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">
                🎯 ATT System Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                MBA Intelligence Engine v3.0 - Real-time Monitoring
              </p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div className="flex items-center space-x-6">
            {/* System Health */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthColor(systemMetrics.avgSystemHealth)}`}>
                {systemMetrics.avgSystemHealth.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">System Health</div>
            </div>

            {/* Uptime */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemMetrics.uptime.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">Uptime</div>
            </div>

            {/* Active Alerts */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                systemMetrics.activeAlerts > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {systemMetrics.activeAlerts}
              </div>
              <div className="text-xs text-gray-500">Active Alerts</div>
            </div>

            {/* Total Spend */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${systemMetrics.totalSpend.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Monthly Spend</div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Mock Mode</span>
              <button
                onClick={onToggleMockMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  mockMode ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    mockMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Last Updated */}
            <div className="text-center">
              <div className="text-sm text-gray-900">
                {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </div>
              <div className="text-xs text-gray-500">Last Updated</div>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;