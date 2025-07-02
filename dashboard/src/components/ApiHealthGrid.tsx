import React from 'react';
import { ApiHealthStatus } from '../types/dashboard';
import { formatDistanceToNow } from 'date-fns';

interface ApiHealthGridProps {
  apiHealth: ApiHealthStatus[];
  onRefresh: () => void;
}

const ApiHealthGrid: React.FC<ApiHealthGridProps> = ({ apiHealth, onRefresh }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'degraded': return 'Degraded';
      case 'down': return 'Down';
      default: return 'Unknown';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 300) return 'text-green-600';
    if (latency < 600) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedApis = [...apiHealth].sort((a, b) => {
    // Sort by status (healthy first), then by success rate
    const statusOrder = { 'healthy': 0, 'degraded': 1, 'down': 2 };
    const statusComparison = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    if (statusComparison !== 0) return statusComparison;
    return b.successRate - a.successRate;
  });

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Health Monitoring</h2>
          <p className="text-gray-600">Real-time status and performance metrics for all integrations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onRefresh}
            className="btn-secondary"
          >
            🔄 Refresh
          </button>
          <button className="btn-primary">
            📊 Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {apiHealth.filter(api => api.status === 'healthy').length}
            </div>
            <div className="text-sm text-gray-500">Healthy APIs</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {apiHealth.filter(api => api.status === 'degraded').length}
            </div>
            <div className="text-sm text-gray-500">Degraded APIs</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {apiHealth.filter(api => api.status === 'down').length}
            </div>
            <div className="text-sm text-gray-500">Down APIs</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {(apiHealth.reduce((sum, api) => sum + api.avgLatency, 0) / apiHealth.length).toFixed(0)}ms
            </div>
            <div className="text-sm text-gray-500">Avg Latency</div>
          </div>
        </div>
      </div>

      {/* API Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedApis.map((api) => (
          <div key={api.service} className={`card hover:shadow-md transition-shadow ${
            api.status === 'down' ? 'border-red-200 bg-red-50' : 
            api.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' : ''
          }`}>
            {/* Service Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`status-dot ${getStatusColor(api.status)}`}></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{api.service}</h3>
                  <p className="text-sm text-gray-500">{api.endpoint}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                api.status === 'healthy' ? 'bg-green-100 text-green-800' :
                api.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {getStatusText(api.status)}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Success Rate</div>
                <div className={`text-2xl font-bold ${getSuccessRateColor(api.successRate)}`}>
                  {api.successRate.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Avg Latency</div>
                <div className={`text-2xl font-bold ${getLatencyColor(api.avgLatency)}`}>
                  {api.avgLatency.toFixed(0)}ms
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Daily Calls</div>
                <div className="text-lg font-medium text-gray-900">
                  {api.dailyCalls.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Error Count</div>
                <div className={`text-lg font-medium ${
                  api.errorCount > 10 ? 'text-red-600' : 
                  api.errorCount > 5 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {api.errorCount}
                </div>
              </div>
            </div>

            {/* Status Details */}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last Check:</span>
                <span className="text-gray-900">
                  {formatDistanceToNow(api.lastCheck, { addSuffix: true })}
                </span>
              </div>
              {api.lastError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <div className="text-red-800 font-medium">Last Error:</div>
                  <div className="text-red-700">{api.lastError}</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                Test Connection
              </button>
              <button className="flex-1 text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors">
                View Logs
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table View */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Detailed API Metrics</h3>
          <span className="text-sm text-gray-500">Complete performance overview</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Daily Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Errors
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedApis.map((api) => (
                <tr key={api.service} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`status-dot ${getStatusColor(api.status)}`}></div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{api.service}</div>
                        <div className="text-sm text-gray-500">{api.endpoint}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      api.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      api.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(api.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getSuccessRateColor(api.successRate)}`}>
                      {api.successRate.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getLatencyColor(api.avgLatency)}`}>
                      {api.avgLatency.toFixed(0)}ms
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {api.dailyCalls.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {api.monthlyCalls.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${
                      api.errorCount > 10 ? 'text-red-600' : 
                      api.errorCount > 5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {api.errorCount}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApiHealthGrid;