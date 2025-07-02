import React from 'react';
import { 
  SystemMetrics, 
  ApiHealthStatus, 
  BudgetMetrics, 
  AlertNotification 
} from '../types/dashboard';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SystemOverviewProps {
  systemMetrics: SystemMetrics;
  apiHealth: ApiHealthStatus[];
  budgetMetrics: BudgetMetrics[];
  alerts: AlertNotification[];
}

const SystemOverview: React.FC<SystemOverviewProps> = ({
  systemMetrics,
  apiHealth,
  budgetMetrics,
  alerts
}) => {
  // Prepare data for charts
  const healthData = apiHealth.map(api => ({
    name: api.service.split(' ')[0], // Shorten names
    health: api.successRate,
    latency: api.avgLatency
  }));

  const budgetData = budgetMetrics.slice(0, 10).map(budget => ({
    name: budget.service.split(' ')[0],
    spent: budget.monthlySpend,
    budget: budget.monthlyBudget,
    percentage: (budget.monthlySpend / budget.monthlyBudget) * 100
  }));

  const alertsByType = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alertsData = Object.entries(alertsByType).map(([type, count]) => ({
    name: type.replace('_', ' ').toUpperCase(),
    value: count
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  System Health
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {systemMetrics.avgSystemHealth.toFixed(1)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">📞</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total API Calls
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {systemMetrics.totalApiCalls.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Monthly Spend
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${systemMetrics.totalSpend.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                systemMetrics.activeAlerts > 0 ? 'bg-red-500' : 'bg-green-500'
              }`}>
                <span className="text-white text-sm">🚨</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Alerts
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {systemMetrics.activeAlerts}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Health Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">API Health Status</h3>
            <span className="text-sm text-gray-500">Success Rate %</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
              <Bar dataKey="health" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Utilization */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Budget Utilization</h3>
            <span className="text-sm text-gray-500">Monthly Spend vs Budget</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Bar dataKey="spent" fill="#f59e0b" name="Spent" />
              <Bar dataKey="budget" fill="#e5e7eb" name="Budget" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Alert Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={alertsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {alertsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Unacknowledged Alerts</h3>
            <span className="text-sm text-gray-500">{recentAlerts.length} active</span>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`alert alert-${alert.severity} animate-slide-up`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-lg">
                        {alert.type === 'budget' ? '💰' : 
                         alert.type === 'api_failure' ? '🔴' : 
                         alert.type === 'test_failure' ? '🧪' : '⚠️'}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">
                        {alert.message}
                      </p>
                      <p className="text-xs mt-1 opacity-75">
                        {alert.timestamp.toLocaleTimeString()} 
                        {alert.service && ` • ${alert.service}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">✅</span>
                <p>No active alerts</p>
                <p className="text-xs">System is operating normally</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{apiHealth.filter(a => a.status === 'healthy').length}</div>
          <div className="text-sm opacity-90">Healthy APIs</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{systemMetrics.testPassRate.toFixed(0)}%</div>
          <div className="text-sm opacity-90">Test Pass Rate</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{budgetMetrics.filter(b => b.monthlySpend < b.monthlyBudget * 0.8).length}</div>
          <div className="text-sm opacity-90">Under Budget</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="text-2xl font-bold">{systemMetrics.uptime.toFixed(1)}%</div>
          <div className="text-sm opacity-90">Uptime</div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;