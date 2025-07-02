import React, { useState } from 'react';
import { DashboardConfig } from '../types/dashboard';
import { ATT_SERVICES } from '../types/dashboard';

interface ConfigPanelProps {
  config: DashboardConfig;
  onUpdateConfig: (newConfig: Partial<DashboardConfig>) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onUpdateConfig }) => {
  const [activeSection, setActiveSection] = useState<'general' | 'budgets' | 'services' | 'alerts'>('general');
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (path: string, value: any) => {
    const newConfig = { ...localConfig };
    const keys = path.split('.');
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateConfig(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  const getServiceCategoryColor = (category: string) => {
    switch (category) {
      case 'AI': return 'bg-purple-100 text-purple-800';
      case 'Storage': return 'bg-blue-100 text-blue-800';
      case 'Data': return 'bg-green-100 text-green-800';
      case 'Research': return 'bg-yellow-100 text-yellow-800';
      case 'Quality': return 'bg-orange-100 text-orange-800';
      case 'Design': return 'bg-pink-100 text-pink-800';
      case 'Backup': return 'bg-gray-100 text-gray-800';
      case 'Notifications': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBudget = Object.values(localConfig.services).reduce(
    (sum, service) => sum + service.budgetLimit, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
          <p className="text-gray-600">Configure dashboard settings, budgets, and service parameters</p>
        </div>
        <div className="flex space-x-3">
          {hasChanges && (
            <>
              <button onClick={handleReset} className="btn-secondary">
                Reset Changes
              </button>
              <button onClick={handleSave} className="btn-primary">
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Configuration Tabs */}
      <div className="bg-white border-b border-gray-200 rounded-t-lg">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'general', label: 'General', icon: '⚙️' },
            { key: 'budgets', label: 'Budget Thresholds', icon: '💰' },
            { key: 'services', label: 'Service Management', icon: '🔧' },
            { key: 'alerts', label: 'Alert Settings', icon: '🚨' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Configuration Content */}
      <div className="card">
        {activeSection === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={localConfig.refreshInterval}
                  onChange={(e) => handleConfigChange('refreshInterval', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  How often the dashboard updates data (5-300 seconds)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mock Mode
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localConfig.mockMode}
                    onChange={(e) => handleConfigChange('mockMode', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Use mock data for testing
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enable mock mode to use simulated data instead of real API calls
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">System Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Dashboard Version:</span>
                  <span className="ml-2 font-medium">v1.0.0</span>
                </div>
                <div>
                  <span className="text-gray-500">ATT System:</span>
                  <span className="ml-2 font-medium">MBA Intelligence Engine v3.0</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 font-medium">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'budgets' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Budget Threshold Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warning Threshold (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={localConfig.budgetThresholds.warning}
                  onChange={(e) => handleConfigChange('budgetThresholds.warning', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Trigger warning alerts when budget utilization exceeds this percentage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Critical Threshold (%)
                </label>
                <input
                  type="number"
                  min="80"
                  max="100"
                  value={localConfig.budgetThresholds.critical}
                  onChange={(e) => handleConfigChange('budgetThresholds.critical', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Trigger critical alerts when budget utilization exceeds this percentage
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400 text-xl">💡</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Budget Threshold Guidelines</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Warning (80%):</strong> Early notification to monitor spending</li>
                      <li><strong>Critical (95%):</strong> Immediate action required to prevent overruns</li>
                      <li>Set thresholds based on your risk tolerance and budget flexibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Current Budget Overview</h4>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Monthly Budget:</span>
                  <span className="font-medium">${totalBudget.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Warning Triggers At:</span>
                  <span className="font-medium text-yellow-600">
                    ${(totalBudget * localConfig.budgetThresholds.warning / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Critical Triggers At:</span>
                  <span className="font-medium text-red-600">
                    ${(totalBudget * localConfig.budgetThresholds.critical / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'services' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Service Configuration</h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Service Management</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    Configure individual service settings including budget limits, priorities, and enable/disable status.
                    Changes affect monitoring and alerting behavior.
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {ATT_SERVICES.map((service) => {
                const serviceConfig = localConfig.services[service.key] || {
                  enabled: true,
                  priority: 'medium',
                  budgetLimit: 10
                };

                return (
                  <div key={service.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={serviceConfig.enabled}
                          onChange={(e) => 
                            handleConfigChange(`services.${service.key}.enabled`, e.target.checked)
                          }
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceCategoryColor(service.category)}`}>
                            {service.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Priority
                          </label>
                          <select
                            value={serviceConfig.priority}
                            onChange={(e) => 
                              handleConfigChange(`services.${service.key}.priority`, e.target.value)
                            }
                            className="block w-20 px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            disabled={!serviceConfig.enabled}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Budget Limit ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            value={serviceConfig.budgetLimit}
                            onChange={(e) => 
                              handleConfigChange(`services.${service.key}.budgetLimit`, parseFloat(e.target.value))
                            }
                            className="block w-20 px-2 py-1 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            disabled={!serviceConfig.enabled}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Service Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Enabled Services:</span>
                  <span className="ml-2 font-medium">
                    {Object.values(localConfig.services).filter(s => s.enabled).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Total Budget:</span>
                  <span className="ml-2 font-medium">${totalBudget.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">High Priority:</span>
                  <span className="ml-2 font-medium">
                    {Object.values(localConfig.services).filter(s => s.priority === 'high' && s.enabled).length}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Average Budget:</span>
                  <span className="ml-2 font-medium">
                    ${(totalBudget / Object.values(localConfig.services).filter(s => s.enabled).length).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'alerts' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Alert Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localConfig.alertsEnabled}
                  onChange={(e) => handleConfigChange('alertsEnabled', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">
                  Enable Alert Notifications
                </label>
              </div>

              {localConfig.alertsEnabled && (
                <div className="ml-6 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Alert Types</h4>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-green-600" />
                        <span className="ml-2">💰 Budget threshold exceeded</span>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-green-600" />
                        <span className="ml-2">🔌 API service failures</span>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-green-600" />
                        <span className="ml-2">🧪 Test failures</span>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-green-600" />
                        <span className="ml-2">⚙️ System health degradation</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Notification Channels</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                        <span className="ml-2">📧 Email notifications</span>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
                        <span className="ml-2">💬 Slack notifications</span>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600" />
                        <span className="ml-2">📱 SMS notifications (Premium)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Alert Frequency Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check Interval (minutes)
                  </label>
                  <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    <option value={1}>1 minute</option>
                    <option value={5} selected>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limiting
                  </label>
                  <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    <option value="none">No limit</option>
                    <option value="hourly" selected>Max 1 per hour per type</option>
                    <option value="daily">Max 3 per day per type</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save/Reset Actions */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-400 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Unsaved Changes</h3>
                <p className="text-sm text-yellow-700">
                  You have unsaved configuration changes. Save your changes to apply them to the system.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleReset} className="btn-secondary">
                Discard Changes
              </button>
              <button onClick={handleSave} className="btn-primary">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;