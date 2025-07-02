import React, { useState, useEffect } from 'react';
import { DashboardState } from './types/dashboard';

// Import components
import Header from './components/Header';
import SystemOverview from './components/SystemOverview';
import ApiHealthGrid from './components/ApiHealthGrid';
import BudgetTracker from './components/BudgetTracker';
import TestResultsChart from './components/TestResultsChart';
import AlertsPanel from './components/AlertsPanel';
import ConfigPanel from './components/ConfigPanel';
import Toast from './components/Toast';

// Environment flag for conditional data service loading
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Data service interface for type safety
interface DataService {
  fetchApiHealthData?: () => Promise<any[]>;
  fetchBudgetData?: () => Promise<any[]>;
  fetchTestResults?: () => Promise<any[]>;
  fetchAlerts?: () => Promise<any[]>;
  generateSystemMetrics?: () => Promise<any> | any;
  generateDashboardConfig?: () => any;
  realDataService?: any;
  mockDataService?: any;
}

function App() {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    apiHealth: [],
    budgetMetrics: [],
    testResults: [],
    alerts: [],
    systemMetrics: {
      totalApiCalls: 0,
      totalSpend: 0,
      avgSystemHealth: 0,
      activeAlerts: 0,
      testPassRate: 0,
      uptime: 0,
      lastDeployment: new Date()
    },
    config: {
      budgetThresholds: { warning: 80, critical: 95 },
      refreshInterval: 30,
      mockMode: USE_MOCKS,
      alertsEnabled: true,
      services: {}
    },
    isLoading: true,
    lastUpdated: new Date()
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'budget' | 'tests' | 'alerts' | 'config'>('overview');
  const [dataService, setDataService] = useState<DataService>({});
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'warning' | 'success' | 'info' } | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean>(true);

  // Show toast notification
  const showToast = (message: string, type: 'error' | 'warning' | 'success' | 'info' = 'error') => {
    setToast({ message, type });
  };

  // Handle API errors with graceful fallback
  const handleApiError = (error: Error, operation: string) => {
    console.warn(`API Error in ${operation}:`, error);
    
    if (!apiConnected) return; // Don't spam toasts
    
    setApiConnected(false);
    showToast(
      `API connection failed. Using ${USE_MOCKS ? 'mock' : 'cached'} data. Check if metrics API is running on port 4000.`,
      'warning'
    );
    
    // Attempt to reconnect after 30 seconds
    setTimeout(() => {
      setApiConnected(true);
    }, 30000);
  };

  // Dynamically load data service based on environment
  useEffect(() => {
    const loadDataService = async () => {
      try {
        if (USE_MOCKS) {
          console.log('🎭 Loading mock data service');
          const mockService = await import('./services/mockData');
          setDataService(mockService);
          setDashboardState(prev => ({
            ...prev,
            config: { ...prev.config, mockMode: true }
          }));
        } else {
          console.log('🔗 Loading real data service');
          const realService = await import('./services/realData');
          
          // Test API connection
          try {
            await realService.fetchApiStatus();
            setDataService(realService);
            setApiConnected(true);
            setDashboardState(prev => ({
              ...prev,
              config: { ...prev.config, mockMode: false }
            }));
          } catch (error) {
            console.warn('Real API not available, falling back to mock data');
            handleApiError(error instanceof Error ? error : new Error('API connection failed'), 'initial connection');
            
            // Fallback to mock data
            const mockService = await import('./services/mockData');
            setDataService(mockService);
            setDashboardState(prev => ({
              ...prev,
              config: { ...prev.config, mockMode: true }
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load data service:', error);
        showToast('Failed to initialize data service', 'error');
      }
    };

    loadDataService();
  }, []);

  // Initialize dashboard data
  useEffect(() => {
    if (!dataService.fetchApiHealthData && !dataService.generateApiHealthData) return;

    const loadInitialData = async () => {
      setDashboardState(prev => ({ ...prev, isLoading: true }));
      
      try {
        let newState: Partial<DashboardState>;
        
        if (USE_MOCKS || dashboardState.config.mockMode) {
          // Mock data mode
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
          
          newState = {
            apiHealth: dataService.generateApiHealthData ? dataService.generateApiHealthData() : [],
            budgetMetrics: dataService.generateBudgetData ? dataService.generateBudgetData() : [],
            testResults: dataService.generateTestResults ? dataService.generateTestResults() : [],
            alerts: dataService.generateAlerts ? dataService.generateAlerts() : [],
            systemMetrics: dataService.generateSystemMetrics ? dataService.generateSystemMetrics() : dashboardState.systemMetrics,
            config: dataService.generateDashboardConfig ? dataService.generateDashboardConfig() : dashboardState.config,
            isLoading: false,
            lastUpdated: new Date()
          };
        } else {
          // Real API mode
          const [apiHealth, budgetMetrics, testResults, alerts] = await Promise.all([
            dataService.fetchApiHealthData ? dataService.fetchApiHealthData() : Promise.resolve([]),
            dataService.fetchBudgetData ? dataService.fetchBudgetData() : Promise.resolve([]),
            dataService.fetchTestResults ? dataService.fetchTestResults() : Promise.resolve([]),
            dataService.fetchAlerts ? dataService.fetchAlerts() : Promise.resolve([])
          ]);

          const systemMetrics = dataService.generateSystemMetrics 
            ? await dataService.generateSystemMetrics()
            : dashboardState.systemMetrics;

          newState = {
            apiHealth,
            budgetMetrics,
            testResults,
            alerts,
            systemMetrics,
            config: dataService.generateDashboardConfig ? dataService.generateDashboardConfig() : dashboardState.config,
            isLoading: false,
            lastUpdated: new Date()
          };
        }
        
        setDashboardState(prev => ({ ...prev, ...newState }));
        
      } catch (error) {
        console.error('Error loading initial data:', error);
        handleApiError(error instanceof Error ? error : new Error('Data loading failed'), 'initial data load');
        
        setDashboardState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadInitialData();
  }, [dataService, USE_MOCKS]);

  // Start real-time updates
  useEffect(() => {
    if (!dataService.mockDataService && !dataService.realDataService) return;

    const currentService = dashboardState.config.mockMode 
      ? dataService.mockDataService 
      : dataService.realDataService;
    
    if (currentService) {
      currentService.startRealTimeUpdates();
      
      const unsubscribe = currentService.subscribe((updates: any) => {
        setDashboardState(prev => ({
          ...prev,
          apiHealth: updates.apiHealth || prev.apiHealth,
          budgetMetrics: updates.budgetMetrics || prev.budgetMetrics,
          systemMetrics: updates.systemMetrics || prev.systemMetrics,
          lastUpdated: updates.timestamp || new Date()
        }));
      });

      return () => {
        unsubscribe();
        currentService.stopRealTimeUpdates();
      };
    }
  }, [dataService, dashboardState.config.mockMode]);

  const updateConfig = (newConfig: any) => {
    setDashboardState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }));
  };

  const acknowledgeAlert = (alertId: string) => {
    setDashboardState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    }));
  };

  // Manual refresh function for real API mode
  const refreshData = async () => {
    if (dashboardState.config.mockMode || !dataService.fetchApiHealthData) {
      // Mock mode refresh
      setDashboardState(prev => ({
        ...prev,
        apiHealth: dataService.generateApiHealthData ? dataService.generateApiHealthData() : prev.apiHealth,
        lastUpdated: new Date()
      }));
      return;
    }

    // Real API refresh
    try {
      const apiHealth = await dataService.fetchApiHealthData();
      setDashboardState(prev => ({
        ...prev,
        apiHealth,
        lastUpdated: new Date()
      }));
    } catch (error) {
      handleApiError(error instanceof Error ? error : new Error('Refresh failed'), 'manual refresh');
    }
  };

  if (dashboardState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading ATT System Dashboard...</h2>
          <p className="text-gray-600">
            {USE_MOCKS ? 'Loading mock data...' : 'Connecting to metrics API...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <Header 
        systemMetrics={dashboardState.systemMetrics}
        lastUpdated={dashboardState.lastUpdated}
        mockMode={dashboardState.config.mockMode}
        onToggleMockMode={() => updateConfig({ mockMode: !dashboardState.config.mockMode })}
      />

      {/* API Connection Status */}
      {!USE_MOCKS && !apiConnected && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Metrics API disconnected. Ensure API server is running on port 4000.
                  <code className="ml-2 text-xs bg-yellow-200 px-1 rounded">npm run start:api</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'System Overview', icon: '📊' },
              { key: 'health', label: 'API Health', icon: '🔍' },
              { key: 'budget', label: 'Budget Tracking', icon: '💰' },
              { key: 'tests', label: 'Test Results', icon: '🧪' },
              { key: 'alerts', label: 'Alerts', icon: '🚨', badge: dashboardState.alerts.filter(a => !a.acknowledged).length },
              { key: 'config', label: 'Configuration', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <SystemOverview 
              systemMetrics={dashboardState.systemMetrics}
              apiHealth={dashboardState.apiHealth}
              budgetMetrics={dashboardState.budgetMetrics}
              alerts={dashboardState.alerts}
            />
          )}
          
          {activeTab === 'health' && (
            <ApiHealthGrid 
              apiHealth={dashboardState.apiHealth}
              onRefresh={refreshData}
            />
          )}
          
          {activeTab === 'budget' && (
            <BudgetTracker 
              budgetMetrics={dashboardState.budgetMetrics}
              config={dashboardState.config}
            />
          )}
          
          {activeTab === 'tests' && (
            <TestResultsChart 
              testResults={dashboardState.testResults}
            />
          )}
          
          {activeTab === 'alerts' && (
            <AlertsPanel 
              alerts={dashboardState.alerts}
              onAcknowledge={acknowledgeAlert}
              config={dashboardState.config}
            />
          )}
          
          {activeTab === 'config' && (
            <ConfigPanel 
              config={dashboardState.config}
              onUpdateConfig={updateConfig}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;