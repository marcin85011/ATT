import React, { useState } from 'react';
import { TestResultMetrics } from '../types/dashboard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays } from 'date-fns';

interface TestResultsChartProps {
  testResults: TestResultMetrics[];
}

const TestResultsChart: React.FC<TestResultsChartProps> = ({ testResults }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [selectedTestType, setSelectedTestType] = useState<'all' | 'unit' | 'mock' | 'real' | 'e2e'>('all');

  // Filter data based on selections
  const getTimeRangeData = () => {
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '14d' ? 14 : 30;
    const cutoffDate = subDays(new Date(), days);
    return testResults.filter(result => result.timestamp >= cutoffDate);
  };

  const filteredData = getTimeRangeData().filter(
    result => selectedTestType === 'all' || result.testType === selectedTestType
  );

  // Aggregate data by date for trend analysis
  const aggregateByDate = (data: TestResultMetrics[]) => {
    const grouped = data.reduce((acc, result) => {
      const dateKey = format(result.timestamp, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          total: 0,
          passed: 0,
          failed: 0,
          duration: 0,
          cost: 0,
          count: 0
        };
      }
      acc[dateKey].total += result.total;
      acc[dateKey].passed += result.passed;
      acc[dateKey].failed += result.failed;
      acc[dateKey].duration += result.duration;
      acc[dateKey].cost += result.cost;
      acc[dateKey].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).map((item: any) => ({
      ...item,
      passRate: (item.passed / item.total) * 100,
      avgDuration: item.duration / item.count,
      avgCost: item.cost / item.count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const trendData = aggregateByDate(filteredData);

  // Calculate summary statistics
  const totalTests = filteredData.reduce((sum, result) => sum + result.total, 0);
  const totalPassed = filteredData.reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = filteredData.reduce((sum, result) => sum + result.failed, 0);
  const totalCost = filteredData.reduce((sum, result) => sum + result.cost, 0);
  const avgDuration = filteredData.length > 0 
    ? filteredData.reduce((sum, result) => sum + result.duration, 0) / filteredData.length 
    : 0;
  const overallPassRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

  // Test type breakdown
  const testTypeBreakdown = ['unit', 'mock', 'real', 'e2e'].map(type => {
    const typeResults = testResults.filter(r => r.testType === type);
    const typePassed = typeResults.reduce((sum, r) => sum + r.passed, 0);
    const typeTotal = typeResults.reduce((sum, r) => sum + r.total, 0);
    const typeCost = typeResults.reduce((sum, r) => sum + r.cost, 0);
    
    return {
      type,
      passRate: typeTotal > 0 ? (typePassed / typeTotal) * 100 : 0,
      totalTests: typeTotal,
      totalCost: typeCost,
      avgDuration: typeResults.length > 0 
        ? typeResults.reduce((sum, r) => sum + r.duration, 0) / typeResults.length 
        : 0
    };
  });

  const getPassRateColor = (passRate: number) => {
    if (passRate >= 95) return 'text-green-600';
    if (passRate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'unit': return '🧪';
      case 'mock': return '🎭';
      case 'real': return '🌐';
      case 'e2e': return '🔄';
      default: return '📊';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Results Analytics</h2>
          <p className="text-gray-600">Comprehensive testing performance and cost analysis</p>
        </div>
        <div className="flex space-x-4">
          {/* Time Range Selector */}
          <div className="flex rounded-md shadow-sm">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium ${
                  selectedTimeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 ${
                  range === '7d' ? 'rounded-l-md' : range === '30d' ? 'rounded-r-md' : ''
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Test Type Filter */}
          <select
            value={selectedTestType}
            onChange={(e) => setSelectedTestType(e.target.value as any)}
            className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="all">All Tests</option>
            <option value="unit">Unit</option>
            <option value="mock">Mock</option>
            <option value="real">Real API</option>
            <option value="e2e">E2E</option>
          </select>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalTests}</div>
            <div className="text-sm text-gray-500">Total Tests</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getPassRateColor(overallPassRate)}`}>
              {overallPassRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Pass Rate</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalPassed}</div>
            <div className="text-sm text-gray-500">Passed</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{totalFailed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">${totalCost.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Test Cost</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass Rate Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Pass Rate Trend</h3>
            <span className="text-sm text-gray-500">Daily success rates</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MM/dd')}
              />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                formatter={(value) => [`${value.toFixed(1)}%`, 'Pass Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="passRate" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Test Volume */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Test Volume</h3>
            <span className="text-sm text-gray-500">Daily test counts</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MM/dd')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
              />
              <Area 
                type="monotone" 
                dataKey="passed" 
                stackId="1" 
                stroke="#10b981" 
                fill="#10b981" 
                name="Passed"
              />
              <Area 
                type="monotone" 
                dataKey="failed" 
                stackId="1" 
                stroke="#ef4444" 
                fill="#ef4444" 
                name="Failed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test Type Performance */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Test Type Performance</h3>
          <span className="text-sm text-gray-500">Breakdown by test category</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {testTypeBreakdown.map((type) => (
            <div key={type.type} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{getTestTypeIcon(type.type)}</span>
                <span className="text-sm font-medium text-gray-500 uppercase">
                  {type.type}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pass Rate</span>
                  <span className={`text-sm font-medium ${getPassRateColor(type.passRate)}`}>
                    {type.passRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tests</span>
                  <span className="text-sm font-medium text-gray-900">
                    {type.totalTests}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${type.totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Duration</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(type.avgDuration)}s
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={testTypeBreakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Pass Rate']} />
            <Bar dataKey="passRate" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Test Failures */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Test Failures</h3>
          <span className="text-sm text-gray-500">Failed tests requiring attention</span>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {filteredData
            .filter(result => result.failed > 0 && result.failedTests)
            .slice(0, 10)
            .map((result, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTestTypeIcon(result.testType)}</span>
                      <span className="font-medium text-red-800 capitalize">
                        {result.testType} Tests
                      </span>
                      <span className="text-sm text-red-600">
                        {format(result.timestamp, 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-red-700">
                        <strong>{result.failed}</strong> of <strong>{result.total}</strong> tests failed
                        ({((result.failed / result.total) * 100).toFixed(1)}% failure rate)
                      </div>
                      {result.failedTests && (
                        <div className="mt-1">
                          <span className="text-xs text-red-600">Failed tests:</span>
                          <div className="text-xs text-red-700 mt-1">
                            {result.failedTests.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-600">
                      Duration: {Math.round(result.duration)}s
                    </div>
                    {result.cost > 0 && (
                      <div className="text-sm text-red-600">
                        Cost: ${result.cost.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          {filteredData.filter(result => result.failed > 0).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">✅</span>
              <p>No test failures in selected time range</p>
              <p className="text-sm">All tests are passing successfully</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResultsChart;