/**
 * Jest Configuration for MBA Intelligence Engine
 * Supports unit, integration, and e2e testing with cost controls
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory
  rootDir: './',
  
  // Test directories
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'tests/**/*.js',
    '!tests/mock-server/**',
    '!tests/fixtures/**',
    '!tests/utils/**',
    '!tests/**/*.config.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js'
  ],
  
  // Test timeout (default 5s, but some integration tests need more)
  testTimeout: 30000,
  
  // Module paths
  modulePaths: ['<rootDir>/node_modules', '<rootDir>/tests'],
  
  // Transform configuration (if needed for ES6+ modules)
  transform: {},
  
  // Test environment variables
  testEnvironment: 'node',
  
  // Global variables available in tests
  globals: {
    TEST_MODE: process.env.TEST_MODE || 'mock',
    BUDGET_ENFORCEMENT: process.env.BUDGET_ENFORCEMENT !== 'false',
    API_TIMEOUT: 30000
  },
  
  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testTimeout: 5000
    },
    {
      displayName: 'integration-mock',
      testMatch: ['<rootDir>/tests/integration/mock/**/*.test.js'],
      testTimeout: 15000
    },
    {
      displayName: 'integration-real',
      testMatch: ['<rootDir>/tests/integration/real/**/*.test.js'],
      testTimeout: 30000,
      // Only run if explicitly requested
      testPathIgnorePatterns: process.env.TEST_REAL_APIS !== 'true' ? ['.*'] : []
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
      testTimeout: 120000,
      // Only run if explicitly requested
      testPathIgnorePatterns: process.env.TEST_E2E !== 'true' ? ['.*'] : []
    }
  ],
  
  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }],
    ['<rootDir>/tests/utils/cost-reporter.js', {
      outputFile: '<rootDir>/test-results/cost-report.json'
    }]
  ],
  
  // Verbose output for debugging
  verbose: process.env.JEST_VERBOSE === 'true',
  
  // Bail after first test failure in CI
  bail: process.env.CI === 'true' ? 1 : 0,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after tests
  restoreMocks: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Max worker processes
  maxWorkers: process.env.CI === 'true' ? 2 : '50%'
};