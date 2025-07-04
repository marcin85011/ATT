import React, { useState, useEffect } from 'react';
import { AlertTriangle, DollarSign, Clock, Settings, Send, X, CheckCircle, AlertCircle } from 'lucide-react';
import { CostAlertsData } from '../types';

interface CostAlertsProps {
  data: CostAlertsData | null;
  isLive: boolean;
}

const CostAlerts: React.FC<CostAlertsProps> = ({ data, isLive }) => {
  const [showConfig, setShowConfig] = useState(false);
  const [thresholds, setThresholds] = useState<Record<string, number>>({});
  const [slackConfig, setSlackConfig] = useState({
    webhookUrl: '',
    channel: '#att-system-alerts',
    username: 'ATT Cost Monitor'
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (data?.thresholds) {
      setThresholds(data.thresholds);
    }
  }, [data]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const updateConfig = async () => {
    try {
      const response = await fetch('/api/cost-alerts/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholds, slackConfig })
      });
      
      if (response.ok) {
        setTestResult({ success: true, message: 'Configuration updated successfully' });
        setTimeout(() => setTestResult(null), 3000);
      } else {
        throw new Error('Failed to update configuration');
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to update configuration' });
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/cost-alerts/test', { method: 'POST' });
      const result = await response.json();
      
      setTestResult({ 
        success: result.success, 
        message: result.message 
      });
      setTimeout(() => setTestResult(null), 5000);
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to send test notification' });
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  const clearCooldowns = async () => {
    try {
      const response = await fetch('/api/cost-alerts/clear-cooldowns', { method: 'POST' });
      
      if (response.ok) {
        setTestResult({ success: true, message: 'Alert cooldowns cleared successfully' });
        setTimeout(() => setTestResult(null), 3000);
      } else {
        throw new Error('Failed to clear cooldowns');
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to clear cooldowns' });
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-xl font-semibold">Cost Alerts</h2>
        </div>
        <p className="text-gray-500">Loading cost alert data...</p>
      </div>
    );
  }

  const criticalAlerts = data.alerts.filter(alert => alert.severity === 'critical');
  const highAlerts = data.alerts.filter(alert => alert.severity === 'high');

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-xl font-semibold">Cost Alerts</h2>
            {isLive && (
              <span className="ml-2 flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                Live
              </span>
            )}
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4 mr-1" />
            Config
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{highAlerts.length}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.alertStats.totalThresholds}</div>
            <div className="text-sm text-gray-600">Thresholds</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{data.alertStats.activeCooldowns}</div>
            <div className="text-sm text-gray-600">Cooldowns</div>
          </div>
        </div>
      </div>

      {showConfig && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threshold Configuration */}
            <div>
              <h3 className="text-lg font-medium mb-4">Cost Thresholds</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(thresholds).map(([service, threshold]) => (
                  <div key={service} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex-1">
                      {service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                      <input
                        type="number"
                        step="0.01"
                        value={threshold}
                        onChange={(e) => setThresholds({
                          ...thresholds,
                          [service]: parseFloat(e.target.value) || 0
                        })}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slack Configuration */}
            <div>
              <h3 className="text-lg font-medium mb-4">Slack Notifications</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Webhook URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackConfig.webhookUrl}
                    onChange={(e) => setSlackConfig({
                      ...slackConfig,
                      webhookUrl: e.target.value
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel
                  </label>
                  <input
                    type="text"
                    value={slackConfig.channel}
                    onChange={(e) => setSlackConfig({
                      ...slackConfig,
                      channel: e.target.value
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={slackConfig.username}
                    onChange={(e) => setSlackConfig({
                      ...slackConfig,
                      username: e.target.value
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={updateConfig}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Update
                </button>
                <button
                  onClick={sendTestNotification}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Test
                </button>
                <button
                  onClick={clearCooldowns}
                  className="flex items-center px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Clear Cooldowns
                </button>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`mt-3 p-3 rounded-md flex items-center ${
                  testResult.success 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {data.alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
            <p className="text-gray-600">No cost alerts detected. All services are within budget.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.alerts.map((alert) => (
              <div
                key={alert.alertId}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {getSeverityIcon(alert.severity)}
                    <div className="ml-3">
                      <h4 className="font-medium">
                        {alert.service} - {alert.severity.toUpperCase()} Overrun
                      </h4>
                      <p className="text-sm mt-1">
                        {alert.period === 'daily' ? 'Daily' : 'Monthly'} cost of{' '}
                        <span className="font-semibold">${alert.currentCost.toFixed(4)}</span>{' '}
                        exceeds threshold of{' '}
                        <span className="font-semibold">${alert.threshold.toFixed(4)}</span>
                      </p>
                      <div className="flex items-center mt-2 text-sm">
                        <span className="font-medium">Overrun:</span>
                        <span className="ml-1 font-semibold">
                          ${alert.overrun.toFixed(4)} ({alert.percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{new Date(alert.timestamp).toLocaleTimeString()}</div>
                    <div className="mt-1 text-xs">
                      {alert.period.charAt(0).toUpperCase() + alert.period.slice(1)} Budget
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.alerts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>Total overrun: ${data.alerts.reduce((sum, alert) => sum + alert.overrun, 0).toFixed(4)}</span>
                <span>Last updated: {new Date(data.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostAlerts;