/**
 * OpenAI Vision Client
 * Production-ready client for Agent #11 vision similarity guard
 */

class OpenAIVisionClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
    this.maxRetries = 3;
    this.retryDelay = 2000;
    this.model = 'gpt-4o';
  }

  async analyzeImageSimilarity(candidateImageUrl, referenceImages, options = {}) {
    const {
      threshold = 0.7,
      includeDetails = true,
      checkTrademarks = true,
      checkStyle = true,
      checkComposition = true
    } = options;

    try {
      // Prepare messages for comparison
      const messages = this.buildSimilarityMessages(candidateImageUrl, referenceImages, {
        threshold, includeDetails, checkTrademarks, checkStyle, checkComposition
      });

      const response = await this.makeVisionRequest(messages, {
        max_tokens: 2000,
        temperature: 0.1
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      const analysis = this.parseSimilarityAnalysis(response.content, threshold);
      
      return {
        success: true,
        candidateImage: candidateImageUrl,
        referenceCount: referenceImages.length,
        analysis,
        overallSimilarity: analysis.maxSimilarity,
        passesCheck: analysis.maxSimilarity < threshold,
        flaggedReasons: analysis.flaggedReasons,
        metadata: {
          model: this.model,
          analyzedAt: new Date().toISOString(),
          source: 'openai-vision',
          cost: this.calculateCost(referenceImages.length),
          tokensUsed: response.tokensUsed
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        candidateImage: candidateImageUrl,
        metadata: {
          failedAt: new Date().toISOString(),
          source: 'openai-vision'
        }
      };
    }
  }

  async analyzeDesignElements(imageUrl, options = {}) {
    const {
      focusAreas = ['text', 'graphics', 'composition', 'style', 'colors'],
      includeRecommendations = true
    } = options;

    const messages = [
      {
        role: 'system',
        content: 'You are an expert design analyst specializing in t-shirt designs and print-on-demand products. Analyze images for design elements, quality, and commercial viability. Provide detailed, actionable insights.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this t-shirt design image focusing on: ${focusAreas.join(', ')}.

Provide a detailed analysis including:
1. **Text Analysis** (if present):
   - Readability and legibility
   - Font choice and sizing
   - Text placement and spacing
   - Mobile thumbnail visibility (160px)

2. **Visual Elements**:
   - Graphics quality and style
   - Color scheme effectiveness
   - Visual hierarchy and balance
   - Print compatibility

3. **Commercial Assessment**:
   - Target audience appeal
   - Market differentiation
   - Potential trademark/IP issues
   - Print production considerations

4. **Quality Metrics** (1-10 scale):
   - Overall design quality
   - Commercial viability
   - Technical execution
   - Originality

${includeRecommendations ? '5. **Recommendations**: Specific suggestions for improvement' : ''}

Format your response as structured JSON with clear sections and numeric scores.`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high'
            }
          }
        ]
      }
    ];

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await this.makeVisionRequest(messages, {
          max_tokens: 3000,
          temperature: 0.2
        });

        if (!response.success) {
          throw new Error(response.error);
        }

        const elements = this.parseDesignElements(response.content);
        
        return {
          success: true,
          imageUrl,
          elements,
          qualityScore: elements.qualityMetrics?.overall || 0,
          commercialScore: elements.qualityMetrics?.commercial || 0,
          recommendations: elements.recommendations || [],
          metadata: {
            model: this.model,
            analyzedAt: new Date().toISOString(),
            source: 'openai-vision-elements',
            cost: 0.005, // $0.005 per detailed analysis
            tokensUsed: response.tokensUsed
          }
        };

      } catch (error) {
        attempt++;
        console.error(`Vision analysis attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt >= this.maxRetries) {
          return {
            success: false,
            error: error.message,
            imageUrl,
            retryCount: attempt
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  async detectTrademarkViolations(imageUrl, options = {}) {
    const {
      strictMode = true,
      includeBrandLogos = true,
      includeCharacters = true,
      includeSlogans = true
    } = options;

    const messages = [
      {
        role: 'system',
        content: `You are a trademark and intellectual property expert specializing in visual content analysis. Your job is to identify potential trademark, copyright, or brand violations in t-shirt designs.

${strictMode ? 'Use STRICT enforcement - flag anything that could remotely infringe.' : 'Use MODERATE enforcement - flag clear violations and close similarities.'}

Focus on detecting:
- Brand logos and trademarks
- Copyrighted characters or artwork
- Company slogans or catchphrases
- Celebrity likenesses
- Sports team logos or imagery
- Music artist or band imagery
- Movie/TV show references
- Video game characters or elements`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this t-shirt design for potential trademark/copyright violations.

Check for:
${includeBrandLogos ? '- Brand logos, symbols, or trademarks' : ''}
${includeCharacters ? '- Copyrighted characters or artwork' : ''}
${includeSlogans ? '- Protected slogans or catchphrases' : ''}
- Celebrity names or likenesses
- Sports team references
- Entertainment property references

Provide results as JSON:
{
  "violations": [
    {
      "type": "trademark|copyright|publicity",
      "description": "specific violation found",
      "confidence": 0.0-1.0,
      "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
      "entity": "brand/person/company name"
    }
  ],
  "overallRisk": "SAFE|LOW|MEDIUM|HIGH|CRITICAL",
  "recommendation": "specific action to take",
  "safeToUse": true/false
}`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high'
            }
          }
        ]
      }
    ];

    try {
      const response = await this.makeVisionRequest(messages, {
        max_tokens: 1500,
        temperature: 0.1
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      const violations = this.parseTrademarkAnalysis(response.content);
      
      return {
        success: true,
        imageUrl,
        violations: violations.violations || [],
        overallRisk: violations.overallRisk || 'UNKNOWN',
        safeToUse: violations.safeToUse !== false,
        recommendation: violations.recommendation || '',
        metadata: {
          strictMode,
          analyzedAt: new Date().toISOString(),
          source: 'openai-vision-trademark',
          cost: 0.003,
          tokensUsed: response.tokensUsed
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        imageUrl,
        metadata: {
          failedAt: new Date().toISOString(),
          source: 'openai-vision-trademark'
        }
      };
    }
  }

  buildSimilarityMessages(candidateImage, referenceImages, options) {
    const { threshold, checkTrademarks, checkStyle, checkComposition } = options;
    
    const imageContent = [
      {
        type: 'text',
        text: `Compare this candidate t-shirt design against ${referenceImages.length} reference designs from existing Amazon products.

Analyze similarity across these dimensions:
${checkStyle ? '- Visual style and artistic approach' : ''}
${checkComposition ? '- Layout and composition structure' : ''}
${checkTrademarks ? '- Text content and messaging' : ''}
- Color schemes and palettes
- Overall aesthetic and theme

For each reference image, provide:
1. Similarity score (0.0-1.0)
2. Specific similarities found
3. Risk assessment

Similarity threshold: ${threshold}
If ANY similarity score >= ${threshold}, flag as "TOO_SIMILAR"

Return results as JSON:
{
  "comparisons": [
    {
      "referenceIndex": 0,
      "similarityScore": 0.0-1.0,
      "similarities": ["specific similarities found"],
      "riskLevel": "LOW|MEDIUM|HIGH",
      "flagged": true/false
    }
  ],
  "maxSimilarity": 0.0-1.0,
  "overallAssessment": "SAFE|CAUTION|TOO_SIMILAR",
  "flaggedReasons": ["reasons if flagged"]
}`
      },
      {
        type: 'image_url',
        image_url: {
          url: candidateImage,
          detail: 'high'
        }
      }
    ];

    // Add reference images
    referenceImages.forEach((refUrl, index) => {
      imageContent.push({
        type: 'text',
        text: `Reference design ${index + 1}:`
      });
      imageContent.push({
        type: 'image_url',
        image_url: {
          url: refUrl,
          detail: 'low'
        }
      });
    });

    return [
      {
        role: 'system',
        content: 'You are an expert visual similarity analyst specializing in t-shirt designs and intellectual property protection. Compare designs objectively and identify potential copying or infringement risks.'
      },
      {
        role: 'user',
        content: imageContent
      }
    ];
  }

  async makeVisionRequest(messages, options = {}) {
    const {
      max_tokens = 1000,
      temperature = 0.1,
      model = this.model
    } = options;

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ATT-System/1.0 (Vision Analysis)'
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens,
            temperature
          })
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        
        if (!result.choices || !result.choices[0]) {
          throw new Error('Invalid response format from OpenAI API');
        }

        return {
          success: true,
          content: result.choices[0].message.content,
          tokensUsed: result.usage?.total_tokens || 0,
          model: result.model
        };

      } catch (error) {
        attempt++;
        console.error(`OpenAI Vision attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt >= this.maxRetries) {
          return {
            success: false,
            error: error.message,
            retryCount: attempt
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  parseSimilarityAnalysis(content, threshold) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        
        // Calculate max similarity
        const maxSimilarity = Math.max(
          ...analysis.comparisons.map(c => c.similarityScore || 0)
        );
        
        // Determine flagged reasons
        const flaggedReasons = analysis.comparisons
          .filter(c => c.flagged || c.similarityScore >= threshold)
          .map(c => c.similarities || [])
          .flat();

        return {
          ...analysis,
          maxSimilarity,
          flaggedReasons: [...new Set(flaggedReasons)]
        };
      }
    } catch (error) {
      console.error('Failed to parse similarity analysis:', error);
    }
    
    // Fallback parsing
    return {
      comparisons: [],
      maxSimilarity: 0,
      overallAssessment: 'UNKNOWN',
      flaggedReasons: []
    };
  }

  parseDesignElements(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse design elements:', error);
    }
    
    // Fallback parsing
    return {
      textAnalysis: {},
      visualElements: {},
      commercialAssessment: {},
      qualityMetrics: {},
      recommendations: []
    };
  }

  parseTrademarkAnalysis(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse trademark analysis:', error);
    }
    
    return {
      violations: [],
      overallRisk: 'UNKNOWN',
      safeToUse: false,
      recommendation: 'Manual review required'
    };
  }

  calculateCost(referenceImageCount) {
    // GPT-4V pricing: $0.01 per 1k tokens
    // Estimate tokens based on image count and analysis complexity
    const baseTokens = 500; // Base analysis
    const perImageTokens = 200; // Per reference image
    const totalTokens = baseTokens + (referenceImageCount * perImageTokens);
    
    return (totalTokens / 1000) * 0.01;
  }

  async batchAnalyze(imageUrls, operation = 'elements', options = {}) {
    const results = [];
    const batchSize = 2; // Conservative for vision API
    
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      
      const batchPromises = batch.map(url => {
        switch (operation) {
          case 'elements':
            return this.analyzeDesignElements(url, options);
          case 'trademark':
            return this.detectTrademarkViolations(url, options);
          default:
            return this.analyzeDesignElements(url, options);
        }
      });
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch analysis failed for images ${i}-${i + batchSize}:`, error.message);
        batch.forEach(url => {
          results.push({
            success: false,
            error: error.message,
            imageUrl: url
          });
        });
      }
      
      // Rate limiting delay
      if (i + batchSize < imageUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'Test health check' }],
          max_tokens: 10
        })
      });

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        statusCode: response.status,
        model: this.model,
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

module.exports = { OpenAIVisionClient };