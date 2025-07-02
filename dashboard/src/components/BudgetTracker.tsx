import React from 'react';
import { BudgetMetrics, DashboardConfig } from '../types/dashboard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface BudgetTrackerProps {
  budgetMetrics: BudgetMetrics[];
  config: DashboardConfig;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ budgetMetrics, config }) => {
  // Calculate totals
  const totalSpent = budgetMetrics.reduce((sum, metric) => sum + metric.monthlySpend, 0);
  const totalBudget = budgetMetrics.reduce((sum, metric) => sum + metric.monthlyBudget, 0);
  const projectedSpend = budgetMetrics.reduce((sum, metric) => sum + metric.projectedMonthlySpend, 0);
  const utilizationRate = (totalSpent / totalBudget) * 100;

  // Prepare chart data
  const budgetComparisonData = budgetMetrics.map(metric => ({
    name: metric.service.split(' ')[0],
    spent: metric.monthlySpend,
    budget: metric.monthlyBudget,
    projected: metric.projectedMonthlySpend,
    utilization: (metric.monthlySpend / metric.monthlyBudget) * 100
  })).sort((a, b) => b.spent - a.spent);

  // Services over budget threshold
  const overBudgetServices = budgetMetrics.filter(
    metric => (metric.monthlySpend / metric.monthlyBudget) * 100 > config.budgetThresholds.warning
  );

  // Cost per call data for efficiency analysis
  const efficiencyData = budgetMetrics.map(metric => ({
    name: metric.service.split(' ')[0],
    costPerCall: metric.costPerCall,
    calls: Math.floor(metric.monthlySpend / metric.costPerCall)
  })).sort((a, b) => b.costPerCall - a.costPerCall);

  // Pie chart data for spending distribution
  const spendingDistribution = budgetMetrics
    .filter(metric => metric.monthlySpend > 0)
    .map(metric => ({
      name: metric.service.split(' ')[0],
      value: metric.monthlySpend
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 services

  const COLORS = [
    '#3b82f6', '#ef4444', '#f59e0b', '#10b981', 
    '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
  ];

  const getBudgetStatusColor = (utilization: number) => {
    if (utilization >= config.budgetThresholds.critical) return 'text-red-600';
    if (utilization >= config.budgetThresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBudgetStatusBg = (utilization: number) => {
    if (utilization >= config.budgetThresholds.critical) return 'bg-red-50 border-red-200';
    if (utilization >= config.budgetThresholds.warning) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Tracking & Cost Analysis</h2>
          <p className="text-gray-600">Real-time spend monitoring and budget forecasting</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">📊 Export Report</button>
          <button className="btn-primary">⚙️ Adjust Budgets</button>
        </div>
      </div>

      {/* Budget Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Monthly Spend
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${totalSpent.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Budget
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${totalBudget.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                utilizationRate > config.budgetThresholds.critical ? 'bg-red-500' :
                utilizationRate > config.budgetThresholds.warning ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                <span className="text-white text-sm">📊</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Budget Utilization
                </dt>
                <dd className={`text-lg font-medium ${getBudgetStatusColor(utilizationRate)}`}>
                  {utilizationRate.toFixed(1)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">📈</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Projected Spend
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  ${projectedSpend.toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards for Over-Budget Services */}
      {overBudgetServices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Budget Threshold Exceeded
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>The following services have exceeded budget thresholds:</p>
                <ul className="mt-1 space-y-1">
                  {overBudgetServices.map(service => (
                    <li key={service.service}>
                      • <strong>{service.service}</strong>: ${service.monthlySpend.toFixed(2)} 
                      ({((service.monthlySpend / service.monthlyBudget) * 100).toFixed(1)}% of budget)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Spend Comparison */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Budget vs Actual Spend</h3>
            <span className="text-sm text-gray-500">Monthly comparison</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetComparisonData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Bar dataKey="budget" fill="#e5e7eb" name="Budget" />
              <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
              <Bar dataKey="projected" fill="#f59e0b" name="Projected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Spending Distribution</h3>
            <span className="text-sm text-gray-500">Top services by cost</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {spendingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Spend']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Efficiency Analysis */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Cost Per Call Analysis</h3>
          <span className="text-sm text-gray-500">API efficiency metrics</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={efficiencyData.slice(0, 12)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${value.toFixed(4)}`} />
            <Tooltip formatter={(value) => [`$${value.toFixed(4)}`, 'Cost per Call']} />
            <Bar dataKey="costPerCall" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Budget Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Detailed Budget Breakdown</h3>
          <span className="text-sm text-gray-500">Complete financial overview</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost per Call
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projected
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetMetrics.map((metric) => {
                const utilization = (metric.monthlySpend / metric.monthlyBudget) * 100;
                return (
                  <tr key={metric.service} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{metric.service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${metric.monthlySpend.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${metric.monthlyBudget.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getBudgetStatusColor(utilization)}`}>
                        {utilization.toFixed(1)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            utilization >= config.budgetThresholds.critical ? 'bg-red-500' :
                            utilization >= config.budgetThresholds.warning ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${metric.costPerCall.toFixed(4)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${metric.projectedMonthlySpend.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        utilization >= config.budgetThresholds.critical 
                          ? 'bg-red-100 text-red-800'
                          : utilization >= config.budgetThresholds.warning 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {utilization >= config.budgetThresholds.critical ? 'Over Budget' :
                         utilization >= config.budgetThresholds.warning ? 'At Risk' : 'On Track'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;