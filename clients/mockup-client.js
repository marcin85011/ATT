/**
 * Placeit Mockup Generator Client - Agent #31
 * Generate realistic t-shirt mockups for marketing and preview
 */

const fetch = require('node-fetch');
const { trackCost } = require('../shared/cost-tracker');
const { errorHandler } = require('../shared/error-handler');
const { validateEnvironment, generateId } = require('../shared/utils');

class MockupClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.PLACEIT_API_KEY;
    this.baseUrl = 'https://api.placeit.net/v1';
    this.mockMode = process.env.MOCK_MODE === 'true';
    this.agentId = 'mockup-generator-31';
  }

  async generateMockups(designImageUrl, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate environment
      const envCheck = validateEnvironment(['PLACEIT_API_KEY']);
      if (!envCheck.valid && !this.mockMode) {
        throw new Error(`Missing required environment variables: ${envCheck.missing.join(', ')}`);
      }

      if (this.mockMode) {
        return this._getMockResult(designImageUrl, startTime);
      }

      // Call Placeit API with asynchronous polling
      const result = await this._callPlaceitAPI(designImageUrl, options);
      
      // Track cost - $0.01 per mockup set
      await trackCost(this.agentId, 0.01, `Generated 3 mockup variations`);
      
      return this._formatResult(result, startTime);
      
    } catch (error) {
      await errorHandler(this.agentId, error, { designUrl: designImageUrl });
      throw error;
    }
  }

  async _callPlaceitAPI(designImageUrl, options) {
    const requestBody = {
      design_url: designImageUrl,
      garment_type: options.garmentType || 'unisex_tshirt',
      garment_color: options.garmentColor || 'black',
      mockup_types: options.mockupTypes || ['front_view', 'lifestyle', 'flat_lay'],
      resolution: options.resolution || '1200x1200',
      format: options.format || 'PNG',
      webhook_url: options.webhookUrl // Optional webhook for async completion
    };

    // Step 1: Submit mockup generation job
    const submitResponse = await fetch(`${this.baseUrl}/mockups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ATT-System-QC-Agent/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!submitResponse.ok) {
      const errorBody = await submitResponse.text();
      throw new Error(`Placeit API error ${submitResponse.status}: ${errorBody}`);
    }

    const submitResult = await submitResponse.json();
    const jobId = submitResult.job_id;

    if (!jobId) {
      throw new Error('No job ID returned from Placeit API');
    }

    // Step 2: Poll for completion with exponential backoff
    const maxPollingTime = 300000; // 5 minutes max
    const startPolling = Date.now();
    const pollingInterval = 2000; // Start with 2 seconds
    let currentInterval = pollingInterval;
    
    while (Date.now() - startPolling < maxPollingTime) {
      await this._sleep(currentInterval);
      
      const statusResponse = await fetch(`${this.baseUrl}/mockups/${jobId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'ATT-System-QC-Agent/1.0'
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusResult = await statusResponse.json();
      
      if (statusResult.status === 'completed') {
        // Get the final results
        return await this._fetchMockupResults(jobId);
      } else if (statusResult.status === 'failed') {
        throw new Error(`Mockup generation failed: ${statusResult.error || 'Unknown error'}`);
      }
      
      // Exponential backoff - increase interval but cap at 30 seconds
      currentInterval = Math.min(currentInterval * 1.5, 30000);
    }

    throw new Error('Mockup generation timed out after 5 minutes');
  }

  async _fetchMockupResults(jobId) {
    const resultResponse = await fetch(`${this.baseUrl}/mockups/${jobId}/results`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'User-Agent': 'ATT-System-QC-Agent/1.0'
      }
    });

    if (!resultResponse.ok) {
      throw new Error(`Failed to fetch results: ${resultResponse.status}`);
    }

    const results = await resultResponse.json();
    
    return {
      job_id: jobId,
      mockups: results.mockups || [],
      design_url: results.design_url,
      total_processing_time: results.processing_time_ms,
      placeit_cost: results.cost || 0.01
    };
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async _callPlaceitSingleAPI(designImageUrl, mockupType, options) {
    const requestBody = {
      design_url: designImageUrl,
      mockup_type: mockupType,
      garment_type: options.garmentType || 'unisex_tshirt',
      garment_color: options.garmentColor || 'black',
      resolution: options.resolution || '1200x1200',
      format: options.format || 'PNG'
    };

    // Submit single mockup generation job
    const submitResponse = await fetch(`${this.baseUrl}/mockups/single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ATT-System-QC-Agent/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!submitResponse.ok) {
      const errorBody = await submitResponse.text();
      throw new Error(`Placeit single mockup error ${submitResponse.status}: ${errorBody}`);
    }

    const result = await submitResponse.json();
    
    // For single mockups, response might be immediate or include job_id for polling
    if (result.mockup_url) {
      // Immediate response
      return {
        mockup_type: mockupType,
        mockup_url: result.mockup_url,
        resolution: result.resolution || '1200x1200',
        design_url: designImageUrl,
        processing_time_ms: result.processing_time_ms || 0,
        placeit_cost: result.cost || 0.005
      };
    } else if (result.job_id) {
      // Needs polling - reuse the polling logic but for single mockup
      return await this._pollSingleMockup(result.job_id, designImageUrl, mockupType);
    } else {
      throw new Error('Invalid response from Placeit single mockup API');
    }
  }

  async _pollSingleMockup(jobId, designImageUrl, mockupType) {
    const maxPollingTime = 180000; // 3 minutes for single mockup
    const startPolling = Date.now();
    let currentInterval = 1000; // Start with 1 second for single mockups
    
    while (Date.now() - startPolling < maxPollingTime) {
      await this._sleep(currentInterval);
      
      const statusResponse = await fetch(`${this.baseUrl}/mockups/${jobId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'ATT-System-QC-Agent/1.0'
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Single mockup status check failed: ${statusResponse.status}`);
      }

      const statusResult = await statusResponse.json();
      
      if (statusResult.status === 'completed') {
        return {
          mockup_type: mockupType,
          mockup_url: statusResult.mockup_url,
          resolution: statusResult.resolution || '1200x1200',
          design_url: designImageUrl,
          processing_time_ms: statusResult.processing_time_ms || 0,
          placeit_cost: statusResult.cost || 0.005,
          job_id: jobId
        };
      } else if (statusResult.status === 'failed') {
        throw new Error(`Single mockup generation failed: ${statusResult.error || 'Unknown error'}`);
      }
      
      // Shorter intervals for single mockups
      currentInterval = Math.min(currentInterval * 1.3, 5000);
    }

    throw new Error('Single mockup generation timed out after 3 minutes');
  }

  _getMockResult(designImageUrl, startTime) {
    // Mock response for development/testing
    const processingTime = Date.now() - startTime;
    const mockupId = generateId('mockup');
    
    // Generate placeholder mockup URLs
    const mockups = [
      {
        type: 'front_view',
        url: `https://via.placeholder.com/1200x1200/000000/FFFFFF?text=Front+View+Mockup`,
        resolution: '1200x1200',
        garment_color: 'black',
        description: 'Classic front view on black t-shirt'
      },
      {
        type: 'lifestyle',
        url: `https://via.placeholder.com/1200x1200/CCCCCC/333333?text=Lifestyle+Mockup`,
        resolution: '1200x1200',
        garment_color: 'heather_gray',
        description: 'Person wearing design in natural setting'
      },
      {
        type: 'flat_lay',
        url: `https://via.placeholder.com/1200x1200/FFFFFF/000000?text=Flat+Lay+Mockup`,
        resolution: '1200x1200',
        garment_color: 'white',
        description: 'Product photography style on textured surface'
      }
    ];

    return {
      agent: this.agentId,
      status: 'pass',
      mockups_generated: mockups.length,
      mockup_urls: mockups,
      design_url: designImageUrl,
      total_variations: mockups.length,
      quality_score: 9.2,
      processing_time_ms: processingTime,
      estimated_cost: 0.01,
      mock: true,
      mockup_id: mockupId
    };
  }

  _formatResult(apiResult, startTime) {
    // Format the Placeit API response to our standard format
    const processingTime = Date.now() - startTime;
    
    // Transform Placeit mockups to our format
    const formattedMockups = (apiResult.mockups || []).map(mockup => ({
      type: mockup.type || 'unknown',
      url: mockup.image_url || mockup.url,
      resolution: mockup.resolution || '1200x1200',
      garment_color: mockup.garment_color || 'black',
      description: mockup.description || `${mockup.type || 'Mockup'} variation`,
      placeit_id: mockup.id
    }));
    
    return {
      agent: this.agentId,
      status: this._determineStatus(apiResult),
      mockups_generated: formattedMockups.length,
      mockup_urls: formattedMockups,
      design_url: apiResult.design_url,
      total_variations: formattedMockups.length,
      quality_score: this._calculateQualityScore(apiResult),
      processing_time_ms: processingTime,
      placeit_processing_time: apiResult.total_processing_time || 0,
      estimated_cost: apiResult.placeit_cost || 0.01,
      mock: false,
      job_id: apiResult.job_id
    };
  }

  _determineStatus(result) {
    // Quality checks for mockup generation
    if (!result.mockups || result.mockups.length === 0) return 'fail';
    if (result.mockups.length < 3) return 'warning';
    
    // Check if all mockups have valid URLs
    const validMockups = result.mockups.filter(m => m.url && m.url.startsWith('http'));
    if (validMockups.length !== result.mockups.length) return 'warning';
    
    return 'pass';
  }

  _calculateQualityScore(result) {
    let score = 0;
    
    // Base score for successful generation
    if (result.mockups && result.mockups.length > 0) {
      score += 40;
    }
    
    // Bonus for multiple variations
    if (result.mockups && result.mockups.length >= 3) {
      score += 30;
    }
    
    // Bonus for high resolution
    const hasHighRes = result.mockups?.some(m => 
      m.resolution && m.resolution.includes('1200')
    );
    if (hasHighRes) score += 20;
    
    // Bonus for variety in mockup types
    const uniqueTypes = new Set(result.mockups?.map(m => m.type) || []);
    if (uniqueTypes.size >= 3) score += 10;
    
    return Math.min(10, score / 10);
  }

  // Generate specific mockup type
  async generateSingleMockup(designImageUrl, mockupType, options = {}) {
    const startTime = Date.now();
    
    try {
      if (this.mockMode) {
        return this._getSingleMockResult(designImageUrl, mockupType, startTime);
      }

      // Call Placeit API for single mockup generation
      const result = await this._callPlaceitSingleAPI(designImageUrl, mockupType, options);
      
      // Track cost for single mockup
      await trackCost(this.agentId, 0.005, `Generated single ${mockupType} mockup`);
      
      return result;
      
    } catch (error) {
      await errorHandler(this.agentId, error, { designUrl: designImageUrl, type: mockupType });
      throw error;
    }
  }

  _getSingleMockResult(designImageUrl, mockupType, startTime) {
    const processingTime = Date.now() - startTime;
    const mockupId = generateId('single-mockup');
    
    const mockupTypeConfig = {
      front_view: { color: '000000', text: 'Front+View', bg: '000000' },
      lifestyle: { color: 'CCCCCC', text: 'Lifestyle', bg: 'CCCCCC' },
      flat_lay: { color: 'FFFFFF', text: 'Flat+Lay', bg: 'FFFFFF' }
    };
    
    const config = mockupTypeConfig[mockupType] || mockupTypeConfig.front_view;
    
    return {
      agent: this.agentId,
      status: 'pass',
      mockup_type: mockupType,
      mockup_url: `https://via.placeholder.com/1200x1200/${config.bg}/333333?text=${config.text}+Mockup`,
      resolution: '1200x1200',
      design_url: designImageUrl,
      quality_score: 9.0,
      processing_time_ms: processingTime,
      estimated_cost: 0.005,
      mock: true,
      mockup_id: mockupId
    };
  }

  // Batch mockup generation for multiple designs
  async generateBatchMockups(designUrls, options = {}) {
    const batchResults = [];
    
    for (const designUrl of designUrls) {
      try {
        const result = await this.generateMockups(designUrl, options);
        batchResults.push({
          design_url: designUrl,
          success: true,
          result: result
        });
      } catch (error) {
        batchResults.push({
          design_url: designUrl,
          success: false,
          error: error.message
        });
      }
    }
    
    return {
      agent: this.agentId,
      batch_size: designUrls.length,
      successful: batchResults.filter(r => r.success).length,
      failed: batchResults.filter(r => !r.success).length,
      results: batchResults,
      total_cost: batchResults.filter(r => r.success).length * 0.01
    };
  }

  // Health check method
  async healthCheck() {
    try {
      if (this.mockMode) {
        const testResult = await this.generateMockups('test-url');
        return { 
          status: 'healthy', 
          mode: 'mock',
          mock_test_passed: testResult.mock === true
        };
      }
      
      // Test API connectivity with minimal request
      const healthResponse = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'ATT-System-QC-Agent/1.0'
        },
        timeout: 10000
      });

      if (healthResponse.ok) {
        return { 
          status: 'healthy', 
          mode: 'production',
          api_status: 'connected',
          rate_limit_remaining: healthResponse.headers.get('X-RateLimit-Remaining') || 'unknown'
        };
      } else {
        return { 
          status: 'degraded', 
          mode: 'production',
          api_status: 'error',
          error: `HTTP ${healthResponse.status}`
        };
      }
      
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Get available mockup templates
  async getAvailableTemplates(category = null) {
    if (this.mockMode) {
      return {
        templates: [
          { id: 'unisex_tshirt_front', name: 'Unisex T-Shirt Front View', category: 'apparel' },
          { id: 'lifestyle_casual', name: 'Casual Lifestyle', category: 'lifestyle' },
          { id: 'flat_lay_minimal', name: 'Minimal Flat Lay', category: 'product' }
        ],
        total: 3,
        mock: true
      };
    }
    
    try {
      const queryParams = new URLSearchParams();
      if (category) queryParams.append('category', category);
      queryParams.append('garment_type', 'tshirt'); // Focus on t-shirts for our use case
      
      const response = await fetch(`${this.baseUrl}/templates?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'ATT-System-QC-Agent/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Template fetch failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        templates: data.templates || [],
        total: data.total || 0,
        categories: data.categories || [],
        mock: false
      };
      
    } catch (error) {
      // Fallback to basic templates if API fails
      return {
        templates: [
          { id: 'unisex_tshirt_front', name: 'Unisex T-Shirt Front View', category: 'apparel' },
          { id: 'lifestyle_casual', name: 'Casual Lifestyle', category: 'lifestyle' },
          { id: 'flat_lay_minimal', name: 'Minimal Flat Lay', category: 'product' }
        ],
        total: 3,
        error: error.message,
        fallback: true
      };
    }
  }
}

module.exports = { MockupClient };