/**
 * Slack Notifier for Cost Alerts
 * Sends formatted alerts to Slack via webhooks
 */

const https = require('https');
const { URL } = require('url');

class SlackNotifier {
  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.enabled = !!this.webhookUrl;
    this.channel = process.env.SLACK_CHANNEL || '#att-system-alerts';
    this.username = process.env.SLACK_USERNAME || 'ATT Cost Monitor';
    this.iconEmoji = process.env.SLACK_ICON || ':warning:';
    
    if (!this.enabled) {
      console.warn('⚠️ Slack notifications disabled: SLACK_WEBHOOK_URL not configured');
    }
  }

  formatCostAlert(alert) {
    const { severity, service, currentCost, threshold, overrun, percentage, period } = alert;
    
    // Severity-based colors and emojis
    const severityConfig = {
      critical: { color: '#FF0000', emoji: '🚨', urgency: 'CRITICAL' },
      high: { color: '#FF8C00', emoji: '⚠️', urgency: 'HIGH' },
      medium: { color: '#FFD700', emoji: '⚡', urgency: 'MEDIUM' },
      low: { color: '#32CD32', emoji: '💡', urgency: 'LOW' }
    };
    
    const config = severityConfig[severity] || severityConfig.medium;
    
    return {
      channel: this.channel,
      username: this.username,
      icon_emoji: this.iconEmoji,
      attachments: [
        {
          color: config.color,
          fallback: `${config.urgency}: ${service} cost overrun - $${currentCost} (${percentage}% of threshold)`,
          title: `${config.emoji} Cost Alert: ${service}`,
          title_link: process.env.DASHBOARD_URL || 'http://localhost:3000',
          fields: [
            {
              title: 'Severity',
              value: `${config.urgency} (${severity})`,
              short: true
            },
            {
              title: 'Period',
              value: period.charAt(0).toUpperCase() + period.slice(1),
              short: true
            },
            {
              title: 'Current Cost',
              value: `$${currentCost.toFixed(4)}`,
              short: true
            },
            {
              title: 'Threshold',
              value: `$${threshold.toFixed(4)}`,
              short: true
            },
            {
              title: 'Overrun',
              value: `$${overrun.toFixed(4)} (${percentage}%)`,
              short: true
            },
            {
              title: 'Service',
              value: service,
              short: true
            }
          ],
          footer: 'ATT Cost Monitor',
          footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };
  }

  formatSystemAlert(alerts) {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const highCount = alerts.filter(a => a.severity === 'high').length;
    const totalOverrun = alerts.reduce((sum, a) => sum + a.overrun, 0);
    
    const color = criticalCount > 0 ? '#FF0000' : highCount > 0 ? '#FF8C00' : '#FFD700';
    const emoji = criticalCount > 0 ? '🚨' : highCount > 0 ? '⚠️' : '💰';
    
    return {
      channel: this.channel,
      username: this.username,
      icon_emoji: this.iconEmoji,
      attachments: [
        {
          color: color,
          fallback: `Multiple cost alerts: ${alerts.length} services over budget`,
          title: `${emoji} Multiple Cost Overruns Detected`,
          title_link: process.env.DASHBOARD_URL || 'http://localhost:3000',
          text: `${alerts.length} services have exceeded their cost thresholds`,
          fields: [
            {
              title: 'Critical Alerts',
              value: criticalCount.toString(),
              short: true
            },
            {
              title: 'High Priority',
              value: highCount.toString(),
              short: true
            },
            {
              title: 'Total Overrun',
              value: `$${totalOverrun.toFixed(4)}`,
              short: true
            },
            {
              title: 'Services Affected',
              value: alerts.map(a => a.service).join(', '),
              short: false
            }
          ],
          footer: 'ATT Cost Monitor',
          footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
          ts: Math.floor(Date.now() / 1000),
          actions: [
            {
              type: 'button',
              text: 'View Dashboard',
              url: process.env.DASHBOARD_URL || 'http://localhost:3000',
              style: 'primary'
            }
          ]
        }
      ]
    };
  }

  async sendAlert(alert) {
    if (!this.enabled) {
      console.log('🔇 Slack notification skipped (not configured)');
      return { success: false, reason: 'not_configured' };
    }

    try {
      const payload = this.formatCostAlert(alert);
      const result = await this.sendToSlack(payload);
      
      console.log(`📢 Slack alert sent for ${alert.service} (${alert.severity})`);
      return { success: true, result };
      
    } catch (error) {
      console.error('❌ Failed to send Slack alert:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendMultipleAlertsNotification(alerts) {
    if (!this.enabled || alerts.length === 0) {
      return { success: false, reason: 'not_configured_or_empty' };
    }

    try {
      const payload = this.formatSystemAlert(alerts);
      const result = await this.sendToSlack(payload);
      
      console.log(`📢 Slack system alert sent for ${alerts.length} services`);
      return { success: true, result };
      
    } catch (error) {
      console.error('❌ Failed to send Slack system alert:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendTestNotification() {
    if (!this.enabled) {
      return { success: false, reason: 'not_configured' };
    }

    const testPayload = {
      channel: this.channel,
      username: this.username,
      icon_emoji: ':white_check_mark:',
      text: '✅ ATT Cost Monitor test notification - system is working correctly!',
      attachments: [
        {
          color: '#36a64f',
          fields: [
            {
              title: 'Test Time',
              value: new Date().toISOString(),
              short: true
            },
            {
              title: 'Status',
              value: 'All systems operational',
              short: true
            }
          ]
        }
      ]
    };

    try {
      const result = await this.sendToSlack(testPayload);
      console.log('📢 Slack test notification sent successfully');
      return { success: true, result };
    } catch (error) {
      console.error('❌ Failed to send Slack test notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendToSlack(payload) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.webhookUrl);
      const postData = JSON.stringify(payload);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'ATT-Cost-Monitor/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, body: data });
          } else {
            reject(new Error(`Slack API error: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        reject(new Error('Slack webhook request timeout'));
      });

      req.setTimeout(30000); // 30 second timeout
      req.write(postData);
      req.end();
    });
  }

  // Configuration helpers
  isConfigured() {
    return this.enabled;
  }

  getConfig() {
    return {
      enabled: this.enabled,
      channel: this.channel,
      username: this.username,
      webhookConfigured: !!this.webhookUrl,
      dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000'
    };
  }

  updateConfig(config = {}) {
    if (config.webhookUrl) {
      this.webhookUrl = config.webhookUrl;
      this.enabled = true;
    }
    if (config.channel) this.channel = config.channel;
    if (config.username) this.username = config.username;
    if (config.iconEmoji) this.iconEmoji = config.iconEmoji;
    
    console.log('📝 Slack notifier configuration updated');
  }
}

module.exports = { SlackNotifier };