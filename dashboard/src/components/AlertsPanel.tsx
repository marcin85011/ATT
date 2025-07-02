import React, { useState, useMemo } from 'react';
import { AlertNotification, DashboardConfig } from '../types/dashboard';
import { formatDistanceToNow, format } from 'date-fns';

interface AlertsPanelProps {
  alerts: AlertNotification[];
  onAcknowledge: (alertId: string) => void;
  config: DashboardConfig;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAcknowledge, config }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'budget' | 'api_failure' | 'test_failure' | 'system'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  // Filter alerts based on selections
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const typeMatch = selectedType === 'all' || alert.type === selectedType;
      const acknowledgedMatch = showAcknowledged || !alert.acknowledged;
      
      return severityMatch && typeMatch && acknowledgedMatch;
    });
  }, [alerts, selectedSeverity, selectedType, showAcknowledged]);

  // Group alerts by severity for statistics
  const alertStats = useMemo(() => {
    const stats = {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      byType: {
        budget: alerts.filter(a => a.type === 'budget').length,
        api_failure: alerts.filter(a => a.type === 'api_failure').length,
        test_failure: alerts.filter(a => a.type === 'test_failure').length,
        system: alerts.filter(a => a.type === 'system').length
      }
    };
    return stats;
  }, [alerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return '💰';
      case 'api_failure': return '🔌';
      case 'test_failure': return '🧪';
      case 'system': return '⚙️';
      default: return '📋';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleBulkAcknowledge = () => {
    filteredAlerts
      .filter(alert => !alert.acknowledged)
      .forEach(alert => onAcknowledge(alert.id));
  };

  // Recent critical alerts for quick overview
  const criticalAlerts = alerts
    .filter(alert => alert.severity === 'critical' && !alert.acknowledged)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Alerts</h2>
          <p className="text-gray-600">Real-time notifications and alert management</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleBulkAcknowledge}
            className="btn-secondary"
            disabled={filteredAlerts.filter(a => !a.acknowledged).length === 0}
          >
            ✓ Acknowledge All
          </button>
          <button className="btn-primary">📤 Export Alerts</button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-3">🚨</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">
                Critical Alerts Require Immediate Attention
              </h3>
              <div className="mt-2 space-y-1">
                {criticalAlerts.map(alert => (
                  <div key={alert.id} className="text-sm text-red-700">
                    • {alert.message} ({formatDistanceToNow(alert.timestamp, { addSuffix: true })})
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => criticalAlerts.forEach(alert => onAcknowledge(alert.id))}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
            >
              Acknowledge Critical
            </button>
          </div>
        </div>
      )}

      {/* Alert Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{alertStats.total}</div>
          <div className="text-sm text-gray-500">Total Alerts</div>
        </div>
        <div className="card text-center">
          <div className={`text-2xl font-bold ${alertStats.unacknowledged > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {alertStats.unacknowledged}
          </div>
          <div className="text-sm text-gray-500">Unacknowledged</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">{alertStats.critical}</div>
          <div className="text-sm text-gray-500">Critical</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">{alertStats.high}</div>
          <div className="text-sm text-gray-500">High</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{alertStats.medium}</div>
          <div className="text-sm text-gray-500">Medium</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{alertStats.low}</div>
          <div className="text-sm text-gray-500">Low</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card">
        <div className="flex flex-wrap items-center space-x-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="budget">Budget</option>
              <option value="api_failure">API Failure</option>
              <option value="test_failure">Test Failure</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-acknowledged"
              checked={showAcknowledged}
              onChange={(e) => setShowAcknowledged(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="show-acknowledged" className="ml-2 block text-sm text-gray-700">
              Show acknowledged alerts
            </label>
          </div>

          <div className="flex-1"></div>

          <div className="text-sm text-gray-500">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Alert Feed</h3>
          <span className="text-sm text-gray-500">Live notification stream</span>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} ${
                  alert.acknowledged ? 'opacity-60' : ''
                } transition-opacity animate-slide-up`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <span className="text-lg">
                        {getTypeIcon(alert.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                        <span className="text-sm font-medium capitalize">
                          {alert.severity} {alert.type.replace('_', ' ')}
                        </span>
                        {alert.service && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {alert.service}
                          </span>
                        )}
                        {alert.acknowledged && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Acknowledged
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium">{alert.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{format(alert.timestamp, 'MMM dd, yyyy HH:mm:ss')}</span>
                        <span>({formatDistanceToNow(alert.timestamp, { addSuffix: true })})</span>
                        {alert.resolvedAt && (
                          <span className="text-green-600">
                            Resolved {formatDistanceToNow(alert.resolvedAt, { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {alert.details && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                          <strong>Details:</strong> {JSON.stringify(alert.details, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700">
                        ✓ Done
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl mb-4 block">🔔</span>
              <h3 className="text-lg font-medium mb-2">No alerts match your filters</h3>
              <p className="text-sm">
                {alerts.length === 0 
                  ? "No alerts have been generated yet. System is operating normally."
                  : "Try adjusting your filter criteria to see more alerts."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alert Summary by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(alertStats.byType).map(([type, count]) => (
          <div key={type} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">{getTypeIcon(type)}</span>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-lg font-semibold text-gray-900">{count}</div>
                <div className="text-sm text-gray-500 capitalize">
                  {type.replace('_', ' ')} Alerts
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Alert Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Alerts Enabled</label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                config.alertsEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {config.alertsEnabled ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget Warning Threshold</label>
            <div className="mt-1 text-sm text-gray-900">
              {config.budgetThresholds.warning}%
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget Critical Threshold</label>
            <div className="mt-1 text-sm text-gray-900">
              {config.budgetThresholds.critical}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;