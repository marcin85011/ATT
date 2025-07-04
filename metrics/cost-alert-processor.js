/**
 * Real-time Cost Alert Processor
 * Detects cost threshold overruns and manages alert cooldowns
 */

const fs = require('fs').promises;
const path = require('path');

class CostAlertProcessor {
  constructor() {
    this.thresholds = this.loadThresholds();
    this.alertHistory = new Map(); // Track alerts to prevent duplicates
    this.cooldownPeriod = parseInt(process.env.COST_ALERT_COOLDOWN) || 3600000; // 1 hour default
  }

  loadThresholds() {
    try {
      const thresholdsEnv = process.env.COST_ALERT_THRESHOLDS;
      if (thresholdsEnv) {
        return JSON.parse(thresholdsEnv);
      }
    } catch (error) {
      console.warn('Invalid COST_ALERT_THRESHOLDS format, using defaults');
    }
    
    // Default thresholds for major APIs
    return {
      'openai': 5.00,
      'replicate': 10.00,
      'perplexity': 2.00,
      'firecrawl': 3.00,
      'scrapehero': 5.00,
      'textgears': 1.00,
      'media_modifier': 5.00
    };
  }

  checkCostOverruns(budgetData) {
    const alerts = [];
    const now = Date.now();
    
    if (!budgetData || !Array.isArray(budgetData)) {
      return alerts;
    }

    budgetData.forEach(service => {
      const serviceName = this.mapServiceName(service.service);
      const threshold = this.thresholds[serviceName];
      
      if (!threshold) {
        return; // No threshold configured for this service
      }

      // Check daily spend against threshold
      if (service.dailySpend > threshold) {
        const alertKey = `${serviceName}_daily_${new Date().toDateString()}`;
        
        // Check cooldown period
        if (this.isInCooldown(alertKey, now)) {
          return;
        }

        const alert = {
          type: 'cost-overrun',
          severity: this.calculateSeverity(service.dailySpend, threshold),
          service: service.service,
          serviceKey: serviceName,
          currentCost: service.dailySpend,
          threshold: threshold,
          overrun: +(service.dailySpend - threshold).toFixed(4),
          percentage: +((service.dailySpend / threshold) * 100).toFixed(1),
          period: 'daily',
          timestamp: new Date().toISOString(),
          alertId: `cost_${serviceName}_${Date.now()}`
        };

        alerts.push(alert);
        this.alertHistory.set(alertKey, now);
      }

      // Check monthly spend against higher threshold (if configured)
      const monthlyThreshold = this.thresholds[`${serviceName}_monthly`];
      if (monthlyThreshold && service.monthlySpend > monthlyThreshold) {
        const alertKey = `${serviceName}_monthly_${new Date().toISOString().slice(0, 7)}`;
        
        if (!this.isInCooldown(alertKey, now)) {
          const alert = {
            type: 'cost-overrun',
            severity: this.calculateSeverity(service.monthlySpend, monthlyThreshold),
            service: service.service,
            serviceKey: serviceName,
            currentCost: service.monthlySpend,
            threshold: monthlyThreshold,
            overrun: +(service.monthlySpend - monthlyThreshold).toFixed(4),
            percentage: +((service.monthlySpend / monthlyThreshold) * 100).toFixed(1),
            period: 'monthly',
            timestamp: new Date().toISOString(),
            alertId: `cost_monthly_${serviceName}_${Date.now()}`
          };

          alerts.push(alert);
          this.alertHistory.set(alertKey, now);
        }
      }
    });

    return alerts;
  }

  mapServiceName(serviceName) {
    // Map display names to threshold keys
    const serviceMap = {
      'OpenAI Chat': 'openai',
      'OpenAI Vision': 'openai',
      'Replicate Imagen': 'replicate',
      'Perplexity': 'perplexity',
      'Firecrawl': 'firecrawl',
      'ScrapeHero': 'scrapehero',
      'TextGears': 'textgears',
      'Media Modifier': 'media_modifier',
      'Google Sheets': 'google',
      'Google Drive': 'google',
      'YouTube API': 'youtube',
      'NewsAPI': 'newsapi',
      'USPTO Trademark': 'uspto',
      'EU Trademark': 'eu_trademark',
      'Notion': 'notion',
      'Slack': 'slack'
    };

    return serviceMap[serviceName] || serviceName.toLowerCase().replace(/\s+/g, '_');
  }

  calculateSeverity(currentCost, threshold) {
    const ratio = currentCost / threshold;
    
    if (ratio >= 2.0) return 'critical';    // 200%+ of threshold
    if (ratio >= 1.5) return 'high';       // 150%+ of threshold
    if (ratio >= 1.2) return 'medium';     // 120%+ of threshold
    return 'low';                          // Just over threshold
  }

  isInCooldown(alertKey, currentTime) {
    const lastAlertTime = this.alertHistory.get(alertKey);
    if (!lastAlertTime) return false;
    
    return (currentTime - lastAlertTime) < this.cooldownPeriod;
  }

  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('🚨 Cost alert thresholds updated:', this.thresholds);
  }

  getThresholds() {
    return { ...this.thresholds };
  }

  clearCooldowns() {
    this.alertHistory.clear();
    console.log('🚨 Cost alert cooldowns cleared');
  }

  // Get alert statistics
  getAlertStats() {
    return {
      totalThresholds: Object.keys(this.thresholds).length,
      activeCooldowns: this.alertHistory.size,
      cooldownPeriod: this.cooldownPeriod,
      lastUpdate: new Date().toISOString()
    };
  }
}

module.exports = { CostAlertProcessor };