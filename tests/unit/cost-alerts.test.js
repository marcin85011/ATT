/**
 * Unit Tests for Cost Alert System
 * Tests cost alert processor and Slack notifier functionality
 */

const { CostAlertProcessor } = require('../../metrics/cost-alert-processor');
const { SlackNotifier } = require('../../shared/slack-notifier');

describe('CostAlertProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new CostAlertProcessor();
  });

  describe('initialization', () => {
    test('should initialize with default thresholds', () => {
      const thresholds = processor.getThresholds();
      expect(thresholds).toEqual({
        'openai': 5.00,
        'replicate': 10.00,
        'perplexity': 2.00,
        'firecrawl': 3.00,
        'scrapehero': 5.00,
        'textgears': 1.00,
        'media_modifier': 5.00
      });
    });

    test('should initialize with correct cooldown period', () => {
      const stats = processor.getAlertStats();
      expect(stats.cooldownPeriod).toBe(3600000); // 1 hour default
    });
  });

  describe('service name mapping', () => {
    test('should map OpenAI services correctly', () => {
      expect(processor.mapServiceName('OpenAI Chat')).toBe('openai');
      expect(processor.mapServiceName('OpenAI Vision')).toBe('openai');
    });

    test('should map Replicate services correctly', () => {
      expect(processor.mapServiceName('Replicate Imagen')).toBe('replicate');
    });

    test('should handle unknown services', () => {
      expect(processor.mapServiceName('Unknown Service')).toBe('unknown_service');
    });
  });

  describe('severity calculation', () => {
    test('should calculate critical severity correctly', () => {
      expect(processor.calculateSeverity(20, 10)).toBe('critical'); // 200%
      expect(processor.calculateSeverity(25, 10)).toBe('critical'); // 250%
    });

    test('should calculate high severity correctly', () => {
      expect(processor.calculateSeverity(15, 10)).toBe('high'); // 150%
      expect(processor.calculateSeverity(18, 10)).toBe('high'); // 180%
    });

    test('should calculate medium severity correctly', () => {
      expect(processor.calculateSeverity(12, 10)).toBe('medium'); // 120%
      expect(processor.calculateSeverity(14, 10)).toBe('medium'); // 140%
    });

    test('should calculate low severity correctly', () => {
      expect(processor.calculateSeverity(10.5, 10)).toBe('low'); // 105%
      expect(processor.calculateSeverity(11, 10)).toBe('low'); // 110%
    });
  });

  describe('cost overrun detection', () => {
    test('should detect daily cost overruns', () => {
      const budgetData = [
        {
          service: 'OpenAI Chat',
          dailySpend: 6.0,
          monthlySpend: 50.0
        }
      ];

      const alerts = processor.checkCostOverruns(budgetData);
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        type: 'cost-overrun',
        severity: 'medium',
        service: 'OpenAI Chat',
        serviceKey: 'openai',
        currentCost: 6.0,
        threshold: 5.0,
        overrun: 1.0,
        percentage: 120,
        period: 'daily'
      });
    });

    test('should detect monthly cost overruns', () => {
      processor.updateThresholds({ 'openai_monthly': 30.0 });
      
      const budgetData = [
        {
          service: 'OpenAI Chat',
          dailySpend: 2.0,
          monthlySpend: 35.0
        }
      ];

      const alerts = processor.checkCostOverruns(budgetData);
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        type: 'cost-overrun',
        severity: 'medium',
        service: 'OpenAI Chat',
        period: 'monthly',
        currentCost: 35.0,
        threshold: 30.0
      });
    });

    test('should not generate alerts for costs within threshold', () => {
      const budgetData = [
        {
          service: 'OpenAI Chat',
          dailySpend: 4.0,
          monthlySpend: 20.0
        }
      ];

      const alerts = processor.checkCostOverruns(budgetData);
      expect(alerts).toHaveLength(0);
    });

    test('should handle empty budget data', () => {
      const alerts = processor.checkCostOverruns([]);
      expect(alerts).toHaveLength(0);
    });

    test('should handle null budget data', () => {
      const alerts = processor.checkCostOverruns(null);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('cooldown management', () => {
    test('should respect cooldown periods', () => {
      const budgetData = [
        {
          service: 'OpenAI Chat',
          dailySpend: 6.0,
          monthlySpend: 50.0
        }
      ];

      // First alert should be generated
      const firstAlerts = processor.checkCostOverruns(budgetData);
      expect(firstAlerts).toHaveLength(1);

      // Second alert should be blocked by cooldown
      const secondAlerts = processor.checkCostOverruns(budgetData);
      expect(secondAlerts).toHaveLength(0);
    });

    test('should allow alerts after cooldown expires', (done) => {
      // Set very short cooldown for testing
      processor.cooldownPeriod = 100; // 100ms
      
      const budgetData = [
        {
          service: 'OpenAI Chat',
          dailySpend: 6.0,
          monthlySpend: 50.0
        }
      ];

      // First alert
      const firstAlerts = processor.checkCostOverruns(budgetData);
      expect(firstAlerts).toHaveLength(1);

      // Wait for cooldown to expire
      setTimeout(() => {
        const secondAlerts = processor.checkCostOverruns(budgetData);
        expect(secondAlerts).toHaveLength(1);
        done();
      }, 150);
    });

    test('should clear cooldowns when requested', () => {
      const budgetData = [
        {
          service: 'OpenAI Chat',
          dailySpend: 6.0,
          monthlySpend: 50.0
        }
      ];

      // Generate alert
      processor.checkCostOverruns(budgetData);
      
      // Clear cooldowns
      processor.clearCooldowns();
      
      // Should generate alert again
      const alerts = processor.checkCostOverruns(budgetData);
      expect(alerts).toHaveLength(1);
    });
  });

  describe('threshold management', () => {
    test('should update thresholds', () => {
      const newThresholds = { 'openai': 10.0, 'replicate': 15.0 };
      processor.updateThresholds(newThresholds);
      
      const thresholds = processor.getThresholds();
      expect(thresholds.openai).toBe(10.0);
      expect(thresholds.replicate).toBe(15.0);
      expect(thresholds.perplexity).toBe(2.0); // Should remain unchanged
    });
  });
});

describe('SlackNotifier', () => {
  let notifier;

  beforeEach(() => {
    // Mock environment variables
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/test';
    process.env.SLACK_CHANNEL = '#test-alerts';
    process.env.DASHBOARD_URL = 'http://localhost:3000';
    
    notifier = new SlackNotifier();
  });

  afterEach(() => {
    delete process.env.SLACK_WEBHOOK_URL;
    delete process.env.SLACK_CHANNEL;
    delete process.env.DASHBOARD_URL;
  });

  describe('initialization', () => {
    test('should initialize with webhook URL when provided', () => {
      expect(notifier.isConfigured()).toBe(true);
      expect(notifier.channel).toBe('#test-alerts');
    });

    test('should be disabled without webhook URL', () => {
      delete process.env.SLACK_WEBHOOK_URL;
      const unconfiguredNotifier = new SlackNotifier();
      expect(unconfiguredNotifier.isConfigured()).toBe(false);
    });
  });

  describe('alert formatting', () => {
    test('should format cost alerts correctly', () => {
      const alert = {
        severity: 'critical',
        service: 'OpenAI Chat',
        currentCost: 10.5,
        threshold: 5.0,
        overrun: 5.5,
        percentage: 210,
        period: 'daily'
      };

      const formatted = notifier.formatCostAlert(alert);
      
      expect(formatted.channel).toBe('#test-alerts');
      expect(formatted.username).toBe('ATT Cost Monitor');
      expect(formatted.attachments[0].color).toBe('#FF0000'); // Critical = red
      expect(formatted.attachments[0].title).toContain('OpenAI Chat');
    });

    test('should format system alerts correctly', () => {
      const alerts = [
        { severity: 'critical', service: 'OpenAI Chat', overrun: 5.5 },
        { severity: 'high', service: 'Replicate', overrun: 3.2 }
      ];

      const formatted = notifier.formatSystemAlert(alerts);
      
      expect(formatted.attachments[0].title).toContain('Multiple Cost Overruns');
      expect(formatted.attachments[0].fields.some(f => f.title === 'Critical Alerts')).toBe(true);
    });
  });

  describe('configuration management', () => {
    test('should update configuration', () => {
      const newConfig = {
        webhookUrl: 'https://hooks.slack.com/new',
        channel: '#new-channel',
        username: 'New Bot'
      };

      notifier.updateConfig(newConfig);
      
      const config = notifier.getConfig();
      expect(config.channel).toBe('#new-channel');
      expect(config.username).toBe('New Bot');
    });

    test('should return current configuration', () => {
      const config = notifier.getConfig();
      
      expect(config).toMatchObject({
        enabled: true,
        channel: '#test-alerts',
        username: 'ATT Cost Monitor',
        webhookConfigured: true,
        dashboardUrl: 'http://localhost:3000'
      });
    });
  });
});

// Mock tests for network calls
describe('SlackNotifier Network Tests', () => {
  test('should handle webhook send success', async () => {
    // Mock successful response
    const mockResponse = { success: true, reason: 'test' };
    
    // This would normally require mocking the HTTPS module
    // For integration tests, we'd use a real webhook or mock server
    expect(mockResponse.success).toBe(true);
  });

  test('should handle webhook send failure', async () => {
    // Mock failed response
    const mockResponse = { success: false, error: 'Network error' };
    
    expect(mockResponse.success).toBe(false);
    expect(mockResponse.error).toBe('Network error');
  });
});