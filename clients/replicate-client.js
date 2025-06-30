/**
 * Replicate Imagen Client
 * Production-ready client for Agent #10 image generation (Imagen 4 Pro)
 */

class ReplicateClient {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.replicate.com/v1';
    this.maxRetries = 3;
    this.retryDelay = 5000;
    this.pollInterval = 2000;
    this.maxPollTime = 300000; // 5 minutes
  }

  async generateImage(prompt, options = {}) {
    const {
      model = 'google-research/imagen-4-pro:3a36f28996c78ce74dc3b7e45066b7b6f77b02b80e0e6cce68f1dc1cc5adcf7b',
      width = 1024,
      height = 1024,
      aspectRatio = '1:1',
      numImages = 1,
      guidanceScale = 7,
      seed = null,
      format = 'png',
      quality = 'high'
    } = options;

    // Validate and adjust parameters for Imagen 4 Pro
    const validatedOptions = this.validateImageGenOptions({
      width, height, aspectRatio, numImages, guidanceScale, seed, format, quality
    });

    const payload = {
      version: model.split(':')[1] || model,
      input: {
        prompt: this.optimizePrompt(prompt),
        width: validatedOptions.width,
        height: validatedOptions.height,
        aspect_ratio: validatedOptions.aspectRatio,
        num_outputs: validatedOptions.numImages,
        guidance_scale: validatedOptions.guidanceScale,
        output_format: validatedOptions.format,
        output_quality: validatedOptions.quality === 'high' ? 95 : 80
      }
    };

    if (validatedOptions.seed) {
      payload.input.seed = validatedOptions.seed;
    }

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        // Start prediction
        const startResponse = await fetch(`${this.baseUrl}/predictions`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${this.apiToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ATT-System/1.0 (Image Generation)'
          },
          body: JSON.stringify(payload)
        });

        if (!startResponse.ok) {
          const errorBody = await startResponse.text();
          throw new Error(`Replicate API error ${startResponse.status}: ${errorBody}`);
        }

        const prediction = await startResponse.json();
        
        if (!prediction.id) {
          throw new Error('Invalid prediction response from Replicate API');
        }

        // Poll for completion
        const result = await this.pollPrediction(prediction.id);
        
        if (result.status === 'succeeded') {
          return {
            success: true,
            prompt,
            images: result.output || [],
            metadata: {
              predictionId: prediction.id,
              model: model,
              parameters: validatedOptions,
              generatedAt: new Date().toISOString(),
              source: 'replicate-imagen4',
              cost: this.calculateCost(validatedOptions),
              processingTime: result.metrics?.predict_time || 0
            }
          };
        } else {
          throw new Error(`Image generation failed: ${result.error || 'Unknown error'}`);
        }

      } catch (error) {
        attempt++;
        console.error(`Replicate attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt >= this.maxRetries) {
          return {
            success: false,
            error: error.message,
            prompt,
            retryCount: attempt,
            metadata: {
              failedAt: new Date().toISOString(),
              source: 'replicate-imagen4'
            }
          };
        }
        
        // Exponential backoff with jitter
        const delay = this.retryDelay * attempt * (1 + Math.random() * 0.1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async pollPrediction(predictionId) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.maxPollTime) {
      try {
        const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Polling failed: ${response.status} ${response.statusText}`);
        }

        const prediction = await response.json();
        
        if (prediction.status === 'succeeded' || prediction.status === 'failed' || prediction.status === 'canceled') {
          return prediction;
        }
        
        // Continue polling
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
        
      } catch (error) {
        console.error('Polling error:', error.message);
        await new Promise(resolve => setTimeout(resolve, this.pollInterval * 2));
      }
    }
    
    throw new Error(`Prediction timed out after ${this.maxPollTime / 1000} seconds`);
  }

  validateImageGenOptions(options) {
    const validated = { ...options };
    
    // Aspect ratio validation for Imagen 4 Pro
    const validAspectRatios = ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3'];
    if (!validAspectRatios.includes(validated.aspectRatio)) {
      validated.aspectRatio = '1:1';
    }
    
    // Adjust dimensions based on aspect ratio
    switch (validated.aspectRatio) {
      case '1:1':
        validated.width = validated.height = Math.min(1024, Math.max(256, validated.width));
        break;
      case '4:3':
        validated.width = 1024;
        validated.height = 768;
        break;
      case '3:4':
        validated.width = 768;
        validated.height = 1024;
        break;
      case '16:9':
        validated.width = 1024;
        validated.height = 576;
        break;
      case '9:16':
        validated.width = 576;
        validated.height = 1024;
        break;
      case '3:2':
        validated.width = 1024;
        validated.height = 682;
        break;
      case '2:3':
        validated.width = 682;
        validated.height = 1024;
        break;
    }
    
    // Validate other parameters
    validated.numImages = Math.min(4, Math.max(1, validated.numImages));
    validated.guidanceScale = Math.min(20, Math.max(1, validated.guidanceScale));
    
    if (validated.seed !== null) {
      validated.seed = Math.abs(Math.floor(validated.seed));
    }
    
    return validated;
  }

  optimizePrompt(prompt) {
    // Imagen 4 Pro specific prompt optimizations
    let optimized = prompt;
    
    // Ensure high quality descriptors
    if (!optimized.includes('high quality') && !optimized.includes('detailed')) {
      optimized += ', high quality, detailed';
    }
    
    // Add style descriptors for t-shirt designs
    if (optimized.toLowerCase().includes('t-shirt') || optimized.toLowerCase().includes('design')) {
      if (!optimized.includes('vector')) {
        optimized += ', vector style, clean lines';
      }
      if (!optimized.includes('transparent')) {
        optimized += ', transparent background';
      }
    }
    
    // Remove potentially problematic terms
    const problematicTerms = ['copyrighted', 'trademark', 'brand name', 'logo'];
    problematicTerms.forEach(term => {
      const regex = new RegExp(term, 'gi');
      optimized = optimized.replace(regex, '');
    });
    
    // Clean up extra spaces and punctuation
    optimized = optimized.replace(/\s+/g, ' ').trim();
    optimized = optimized.replace(/,\s*,/g, ',');
    
    return optimized;
  }

  async generateVariations(baseImageUrl, prompt, options = {}) {
    const {
      numVariations = 3,
      variationStrength = 0.7,
      preserveStyle = true
    } = options;

    // Use img2img for variations
    const payload = {
      version: 'google-research/imagen-4-pro:3a36f28996c78ce74dc3b7e45066b7b6f77b02b80e0e6cce68f1dc1cc5adcf7b',
      input: {
        image: baseImageUrl,
        prompt: this.optimizePrompt(prompt),
        num_outputs: numVariations,
        guidance_scale: preserveStyle ? 5 : 7,
        image_guidance_scale: variationStrength,
        output_format: 'png',
        output_quality: 95
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Variation generation failed: ${response.status}`);
      }

      const prediction = await response.json();
      const result = await this.pollPrediction(prediction.id);

      if (result.status === 'succeeded') {
        return {
          success: true,
          baseImage: baseImageUrl,
          prompt,
          variations: result.output || [],
          metadata: {
            predictionId: prediction.id,
            variationStrength,
            preserveStyle,
            generatedAt: new Date().toISOString(),
            source: 'replicate-imagen4-variations',
            cost: this.calculateCost({ numImages: numVariations })
          }
        };
      } else {
        throw new Error(`Variation generation failed: ${result.error}`);
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        baseImage: baseImageUrl,
        prompt
      };
    }
  }

  async upscaleImage(imageUrl, options = {}) {
    const {
      scaleFactor = 2,
      enhanceDetails = true
    } = options;

    // Use Real-ESRGAN for upscaling
    const payload = {
      version: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
      input: {
        image: imageUrl,
        scale: scaleFactor,
        face_enhance: enhanceDetails
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Upscaling failed: ${response.status}`);
      }

      const prediction = await response.json();
      const result = await this.pollPrediction(prediction.id);

      if (result.status === 'succeeded') {
        return {
          success: true,
          originalImage: imageUrl,
          upscaledImage: result.output,
          scaleFactor,
          metadata: {
            predictionId: prediction.id,
            enhanceDetails,
            upscaledAt: new Date().toISOString(),
            source: 'replicate-esrgan',
            cost: 0.002 // $0.002 per upscale
          }
        };
      } else {
        throw new Error(`Upscaling failed: ${result.error}`);
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalImage: imageUrl
      };
    }
  }

  calculateCost(options) {
    // Imagen 4 Pro pricing (approximate)
    const baseCost = 0.005; // $0.005 per image
    const { numImages = 1, width = 1024, height = 1024 } = options;
    
    // Higher resolution costs more
    const pixelMultiplier = (width * height) / (1024 * 1024);
    const resolutionCost = baseCost * pixelMultiplier;
    
    return resolutionCost * numImages;
  }

  async batchGenerate(prompts, options = {}) {
    const results = [];
    const batchSize = 3; // Limit concurrent requests
    
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchPromises = batch.map(prompt => this.generateImage(prompt, options));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch generation failed for prompts ${i}-${i + batchSize}:`, error.message);
        batch.forEach(prompt => {
          results.push({
            success: false,
            error: error.message,
            prompt
          });
        });
      }
      
      // Rate limiting delay
      if (i + batchSize < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    return results;
  }

  async getModelInfo(modelName = 'google-research/imagen-4-pro') {
    try {
      const response = await fetch(`${this.baseUrl}/models/${modelName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Model info request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        error: error.message,
        modelName
      };
    }
  }

  async healthCheck() {
    try {
      // Test with a simple prediction
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: 'google-research/imagen-4-pro:3a36f28996c78ce74dc3b7e45066b7b6f77b02b80e0e6cce68f1dc1cc5adcf7b',
          input: {
            prompt: 'test image',
            width: 256,
            height: 256,
            num_outputs: 1
          }
        })
      });

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        message: response.ok ? 'API accessible' : 'API request failed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = { ReplicateClient };