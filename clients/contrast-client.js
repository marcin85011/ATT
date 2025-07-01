/**
 * WCAG Contrast Analyzer Client - Agent #29
 * Color contrast validation for accessibility compliance
 */

const sharp = require('sharp');
const { trackCost } = require('../shared/cost-tracker');
const { errorHandler } = require('../shared/error-handler');
const { validateEnvironment } = require('../shared/utils');

class ContrastClient {
  constructor() {
    this.agentId = 'contrast-analyzer-29';
    this.mockMode = process.env.MOCK_MODE === 'true';
  }

  async analyzeContrast(imageData, options = {}) {
    const startTime = Date.now();
    
    try {
      if (this.mockMode) {
        return this._getMockResult(startTime);
      }

      // Analyze image contrast using sharp library
      const result = await this._analyzeImageContrast(imageData, options);
      
      // No external API cost - local processing only
      await trackCost(this.agentId, 0.000, 'Local contrast analysis');
      
      return this._formatResult(result, startTime);
      
    } catch (error) {
      await errorHandler(this.agentId, error, { imageSize: imageData?.length || 0 });
      throw error;
    }
  }

  async _analyzeImageContrast(imageData, options) {
    try {
      // Convert image data to buffer if needed
      let imageBuffer;
      if (Buffer.isBuffer(imageData)) {
        imageBuffer = imageData;
      } else if (typeof imageData === 'string') {
        // Handle base64 or file path
        if (imageData.startsWith('data:')) {
          const base64Data = imageData.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
          imageBuffer = Buffer.from(imageData, 'base64');
        }
      } else {
        throw new Error('Invalid image data format');
      }

      // Get image metadata and process
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      
      // Resize image for faster processing while maintaining aspect ratio
      const maxDimension = 800;
      const processedImage = image.resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true
      });

      // Extract raw pixel data
      const { data, info } = await processedImage
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Extract color information
      const colorData = this._extractColors(data, info);
      
      // Calculate contrast ratios
      const contrastAnalysis = this._analyzeContrasts(colorData);
      
      // Check WCAG compliance
      const wcagCompliance = this._checkWCAGCompliance(contrastAnalysis.maxContrastRatio);
      
      // Simulate colorblind vision
      const colorblindAnalysis = this._simulateColorblindness(colorData);

      return {
        wcag_aa_compliant: wcagCompliance.aa,
        wcag_aaa_compliant: wcagCompliance.aaa,
        contrast_ratio: Math.round(contrastAnalysis.maxContrastRatio * 100) / 100,
        primary_text_color: contrastAnalysis.textColor,
        background_color: contrastAnalysis.backgroundColor,
        accessibility_score: this._calculateAccessibilityScore({
          contrast_ratio: contrastAnalysis.maxContrastRatio,
          wcag_aa_compliant: wcagCompliance.aa,
          wcag_aaa_compliant: wcagCompliance.aaa,
          colorblind_friendly: colorblindAnalysis.friendly
        }),
        colorblind_friendly: colorblindAnalysis.friendly,
        image_dimensions: {
          width: metadata.width,
          height: metadata.height,
          channels: metadata.channels
        },
        color_analysis: {
          dominant_colors: colorData.dominantColors,
          total_unique_colors: colorData.uniqueColors.length,
          brightness_distribution: colorData.brightnessDistribution
        }
      };

    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  _getMockResult(startTime) {
    // Mock response for development/testing
    const processingTime = Date.now() - startTime;
    
    // Simulate different contrast scenarios
    const scenarios = [
      {
        wcag_aa_compliant: true,
        wcag_aaa_compliant: true,
        contrast_ratio: 8.2,
        status: 'pass'
      },
      {
        wcag_aa_compliant: true,
        wcag_aaa_compliant: false,
        contrast_ratio: 5.1,
        status: 'warning'
      },
      {
        wcag_aa_compliant: false,
        wcag_aaa_compliant: false,
        contrast_ratio: 3.2,
        status: 'fail'
      }
    ];
    
    // Pick first scenario (best case) for mock
    const scenario = scenarios[0];
    
    return {
      agent: this.agentId,
      status: scenario.status,
      wcag_aa_compliant: scenario.wcag_aa_compliant,
      wcag_aaa_compliant: scenario.wcag_aaa_compliant,
      contrast_ratio: scenario.contrast_ratio,
      primary_text_color: '#FFFFFF',
      background_color: '#1A1A1A',
      accessibility_score: this._calculateAccessibilityScore(scenario),
      colorblind_friendly: true,
      processing_time_ms: processingTime,
      cost: 0.000,
      mock: true
    };
  }

  _formatResult(analysisResult, startTime) {
    const processingTime = Date.now() - startTime;
    
    return {
      agent: this.agentId,
      status: this._determineStatus(analysisResult),
      wcag_aa_compliant: analysisResult.wcag_aa_compliant,
      wcag_aaa_compliant: analysisResult.wcag_aaa_compliant,
      contrast_ratio: analysisResult.contrast_ratio,
      primary_text_color: analysisResult.primary_text_color,
      background_color: analysisResult.background_color,
      accessibility_score: analysisResult.accessibility_score,
      colorblind_friendly: analysisResult.colorblind_friendly,
      processing_time_ms: processingTime,
      cost: 0.000,
      mock: false
    };
  }

  _determineStatus(result) {
    // WCAG 2.1 compliance requirements
    if (!result.wcag_aa_compliant) return 'fail';
    if (!result.wcag_aaa_compliant) return 'warning';
    return 'pass';
  }

  _calculateAccessibilityScore(result) {
    let score = 0;
    
    // Base score from contrast ratio
    if (result.contrast_ratio >= 7.0) score += 50; // AAA
    else if (result.contrast_ratio >= 4.5) score += 35; // AA
    else score += 10; // Below AA
    
    // Bonus for high contrast
    if (result.contrast_ratio >= 10) score += 20;
    else if (result.contrast_ratio >= 8) score += 15;
    
    // Colorblind friendliness
    if (result.colorblind_friendly) score += 20;
    
    // Additional factors - colorblind analysis already integrated
    score += 10; // Base accessibility implementation score
    
    return Math.min(10, Math.max(0, score / 10));
  }

  // Image processing helper methods
  _extractColors(pixelData, imageInfo) {
    const { width, height, channels } = imageInfo;
    const colorCounts = new Map();
    const brightnessLevels = new Array(256).fill(0);
    
    // Sample pixels (every 4th pixel for performance)
    const sampleRate = 4;
    
    for (let i = 0; i < pixelData.length; i += channels * sampleRate) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const a = channels === 4 ? pixelData[i + 3] : 255;
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Quantize colors to reduce noise (group similar colors)
      const quantR = Math.floor(r / 32) * 32;
      const quantG = Math.floor(g / 32) * 32;
      const quantB = Math.floor(b / 32) * 32;
      
      const colorKey = `${quantR},${quantG},${quantB}`;
      colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
      
      // Track brightness distribution
      const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      brightnessLevels[brightness]++;
    }
    
    // Get dominant colors (top 10)
    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([colorKey, count]) => {
        const [r, g, b] = colorKey.split(',').map(Number);
        return {
          rgb: [r, g, b],
          hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
          count,
          percentage: (count / (pixelData.length / channels)) * 100
        };
      });
    
    return {
      dominantColors: sortedColors,
      uniqueColors: Array.from(colorCounts.keys()).map(key => key.split(',').map(Number)),
      brightnessDistribution: brightnessLevels
    };
  }

  _analyzeContrasts(colorData) {
    const colors = colorData.dominantColors;
    let maxContrastRatio = 0;
    let bestTextColor = null;
    let bestBackgroundColor = null;
    
    // Test all combinations of dominant colors
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const ratio = this._calculateContrastRatio(colors[i].rgb, colors[j].rgb);
        if (ratio > maxContrastRatio) {
          maxContrastRatio = ratio;
          // Assign lighter color as background, darker as text
          const lum1 = this._relativeLuminance(colors[i].rgb);
          const lum2 = this._relativeLuminance(colors[j].rgb);
          if (lum1 > lum2) {
            bestBackgroundColor = colors[i].hex;
            bestTextColor = colors[j].hex;
          } else {
            bestBackgroundColor = colors[j].hex;
            bestTextColor = colors[i].hex;
          }
        }
      }
    }
    
    return {
      maxContrastRatio,
      textColor: bestTextColor || colors[0]?.hex || '#000000',
      backgroundColor: bestBackgroundColor || colors[1]?.hex || '#FFFFFF'
    };
  }

  _checkWCAGCompliance(contrastRatio) {
    return {
      aa: contrastRatio >= 4.5,  // WCAG AA standard
      aaa: contrastRatio >= 7.0  // WCAG AAA standard
    };
  }

  _simulateColorblindness(colorData) {
    // Simplified colorblind simulation - check if colors would be distinguishable
    const colors = colorData.dominantColors.slice(0, 5); // Top 5 colors
    
    // Simulate deuteranopia (green blind) - remove green component difference
    let deuteranopiaDistinguishable = true;
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const [r1, g1, b1] = colors[i].rgb;
        const [r2, g2, b2] = colors[j].rgb;
        
        // Simulate deuteranopia by reducing green sensitivity
        const simR1 = r1, simR2 = r2;
        const simB1 = b1, simB2 = b2;
        const simG1 = (r1 + b1) / 2, simG2 = (r2 + b2) / 2;
        
        const diffNormal = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
        const diffColorblind = Math.abs(simR1 - simR2) + Math.abs(simG1 - simG2) + Math.abs(simB1 - simB2);
        
        // If difference is significantly reduced, colors may not be distinguishable
        if (diffColorblind < diffNormal * 0.6) {
          deuteranopiaDistinguishable = false;
          break;
        }
      }
      if (!deuteranopiaDistinguishable) break;
    }
    
    return {
      friendly: deuteranopiaDistinguishable,
      tested_conditions: ['deuteranopia'],
      distinguishable_colors: colors.length
    };
  }

  // Utility methods for WCAG calculations
  _relativeLuminance(rgb) {
    // WCAG relative luminance formula
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  _calculateContrastRatio(color1, color2) {
    const l1 = this._relativeLuminance(color1);
    const l2 = this._relativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Health check method
  async healthCheck() {
    try {
      const testResult = await this.analyzeContrast(null);
      return { 
        status: 'healthy', 
        mode: this.mockMode ? 'mock' : 'production',
        mock_test_passed: testResult.mock === true
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = { ContrastClient };