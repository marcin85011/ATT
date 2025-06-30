/**
 * Perplexity Sonar Client
 * Production-ready client for Agent #07 cultural insights synthesis
 */

class PerplexityClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.perplexity.ai';
    this.maxRetries = 3;
    this.retryDelay = 2000;
    this.model = 'llama-3.1-sonar-small-128k-online';
  }

  async getCulturalInsights(niche, options = {}) {
    const {
      region = 'US',
      timeframe = '30d',
      depth = 'comprehensive',
      includeComparisons = true
    } = options;

    const prompt = this.buildCulturalInsightsPrompt(niche, region, timeframe, depth);

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a cultural trend analyst specializing in consumer behavior and market dynamics. Provide comprehensive, data-driven insights about cultural trends, consumer sentiment, and market opportunities. Always include specific examples, statistics when available, and actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3,
      top_p: 0.9,
      return_citations: true,
      return_images: false,
      search_domain_filter: ['reddit.com', 'twitter.com', 'tiktok.com', 'instagram.com', 'pinterest.com', 'youtube.com'],
      search_recency_filter: timeframe
    };

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ATT-System/1.0 (Cultural Analysis)'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Perplexity API error ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        
        if (!result.choices || !result.choices[0]) {
          throw new Error('Invalid response format from Perplexity API');
        }

        const insights = this.processCulturalInsights(result.choices[0].message.content, niche);
        
        return {
          success: true,
          niche,
          region,
          timeframe,
          insights,
          citations: result.citations || [],
          metadata: {
            model: this.model,
            analyzedAt: new Date().toISOString(),
            source: 'perplexity-sonar',
            cost: 0.001, // $0.001 per request
            tokensUsed: result.usage?.total_tokens || 0
          }
        };

      } catch (error) {
        attempt++;
        console.error(`Perplexity attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt >= this.maxRetries) {
          return {
            success: false,
            error: error.message,
            niche,
            retryCount: attempt,
            metadata: {
              failedAt: new Date().toISOString(),
              source: 'perplexity-sonar'
            }
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  async getTrendAnalysis(keywords, options = {}) {
    const {
      timeframe = '7d',
      platforms = ['twitter', 'reddit', 'tiktok'],
      includeEmojis = true
    } = options;

    const prompt = this.buildTrendAnalysisPrompt(keywords, timeframe, platforms);

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a social media trend analyst. Analyze trending topics, hashtags, and conversations across social platforms. Provide specific metrics, engagement rates, and trend velocity data when available.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.2,
      search_recency_filter: timeframe
    };

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Perplexity API error ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        const trendData = this.processTrendAnalysis(result.choices[0].message.content, keywords);
        
        return {
          success: true,
          keywords,
          timeframe,
          platforms,
          trends: trendData,
          citations: result.citations || [],
          metadata: {
            analyzedAt: new Date().toISOString(),
            source: 'perplexity-sonar',
            cost: 0.001,
            tokensUsed: result.usage?.total_tokens || 0
          }
        };

      } catch (error) {
        attempt++;
        if (attempt >= this.maxRetries) {
          return {
            success: false,
            error: error.message,
            keywords,
            retryCount: attempt
          };
        }
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  buildCulturalInsightsPrompt(niche, region, timeframe, depth) {
    return `Analyze the cultural trends and consumer behavior for the "${niche}" market in ${region} over the last ${timeframe}.

Please provide a comprehensive analysis including:

1. **Cultural Context & Demographics**
   - Who are the primary consumers in this niche?
   - What cultural values and beliefs drive their purchasing decisions?
   - How do demographics (age, income, lifestyle) influence behavior?

2. **Current Trends & Sentiment**
   - What are the latest trends within this niche?
   - How is consumer sentiment evolving?
   - What social media conversations are trending?

3. **Market Dynamics**
   - What's driving growth or decline in this market?
   - How competitive is the landscape?
   - What price points are consumers expecting?

4. **Design & Messaging Insights**
   - What visual styles resonate with this audience?
   - What messaging themes perform best?
   - What colors, fonts, and design elements are trending?

5. **Seasonal & Timing Factors**
   - Are there seasonal patterns in this niche?
   - What events or holidays drive engagement?
   - When is the best time to launch products?

6. **Opportunities & Gaps**
   - What unmet needs exist in this market?
   - Where are competitors falling short?
   - What new sub-niches are emerging?

Please include specific examples, data points, and actionable insights for t-shirt design and marketing strategies.`;
  }

  buildTrendAnalysisPrompt(keywords, timeframe, platforms) {
    const keywordList = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    const platformList = platforms.join(', ');

    return `Analyze trending conversations and content related to these keywords: "${keywordList}" across ${platformList} over the last ${timeframe}.

Focus on:
1. **Trending Hashtags** - What hashtags are gaining momentum?
2. **Viral Content** - What posts/videos are getting high engagement?
3. **Sentiment Analysis** - How are people talking about these topics?
4. **Engagement Metrics** - What content formats perform best?
5. **Emerging Themes** - What new angles or perspectives are trending?
6. **Influencer Activity** - Who are the key voices in this space?

Provide specific examples with engagement numbers when available.`;
  }

  processCulturalInsights(content, niche) {
    const insights = {
      niche,
      demographics: this.extractSection(content, 'demographics', 'cultural context'),
      trends: this.extractSection(content, 'trends', 'sentiment'),
      marketDynamics: this.extractSection(content, 'market dynamics', 'competitive'),
      designInsights: this.extractSection(content, 'design', 'messaging'),
      seasonality: this.extractSection(content, 'seasonal', 'timing'),
      opportunities: this.extractSection(content, 'opportunities', 'gaps'),
      keyTakeaways: this.extractKeyTakeaways(content),
      culturalScore: this.calculateCulturalScore(content),
      recommendations: this.extractRecommendations(content)
    };

    return insights;
  }

  processTrendAnalysis(content, keywords) {
    return {
      keywords,
      trendingHashtags: this.extractHashtags(content),
      viralContent: this.extractViralContent(content),
      sentiment: this.extractSentiment(content),
      engagementMetrics: this.extractEngagementMetrics(content),
      emergingThemes: this.extractEmergingThemes(content),
      influencers: this.extractInfluencers(content),
      trendVelocity: this.calculateTrendVelocity(content)
    };
  }

  extractSection(content, ...keywords) {
    const lines = content.split('\n');
    const sectionStart = lines.findIndex(line => 
      keywords.some(keyword => 
        line.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    if (sectionStart === -1) return '';
    
    const sectionEnd = lines.findIndex((line, index) => 
      index > sectionStart && 
      (line.startsWith('#') || line.startsWith('**'))
    );
    
    const endIndex = sectionEnd === -1 ? lines.length : sectionEnd;
    return lines.slice(sectionStart, endIndex).join('\n').trim();
  }

  extractKeyTakeaways(content) {
    const takeaways = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('•') || line.includes('-') || line.includes('*')) {
        const cleaned = line.replace(/[•\-*]/g, '').trim();
        if (cleaned.length > 10) {
          takeaways.push(cleaned);
        }
      }
    });
    
    return takeaways.slice(0, 10);
  }

  extractRecommendations(content) {
    const recommendations = [];
    const actionWords = ['should', 'recommend', 'suggest', 'consider', 'focus on', 'try'];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (actionWords.some(word => lowerLine.includes(word))) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations.slice(0, 8);
  }

  extractHashtags(content) {
    const hashtagRegex = /#\w+/g;
    const matches = content.match(hashtagRegex) || [];
    return [...new Set(matches)].slice(0, 20);
  }

  extractViralContent(content) {
    const viralIndicators = ['viral', 'trending', 'popular', 'million views', 'k likes'];
    const lines = content.split('\n');
    
    return lines.filter(line => 
      viralIndicators.some(indicator => 
        line.toLowerCase().includes(indicator)
      )
    ).slice(0, 5);
  }

  extractSentiment(content) {
    const positive = (content.match(/positive|good|great|love|amazing|awesome/gi) || []).length;
    const negative = (content.match(/negative|bad|hate|terrible|awful|disappointing/gi) || []).length;
    const neutral = Math.max(0, content.split(' ').length / 100 - positive - negative);
    
    const total = positive + negative + neutral;
    return {
      positive: total > 0 ? (positive / total) : 0.33,
      negative: total > 0 ? (negative / total) : 0.33,
      neutral: total > 0 ? (neutral / total) : 0.34
    };
  }

  extractEngagementMetrics(content) {
    const metrics = {};
    const numberRegex = /(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|m|million|thousand|likes|views|shares|comments)/gi;
    const matches = content.match(numberRegex) || [];
    
    matches.forEach(match => {
      const type = match.toLowerCase().includes('like') ? 'likes' :
                   match.toLowerCase().includes('view') ? 'views' :
                   match.toLowerCase().includes('share') ? 'shares' : 'engagement';
      
      if (!metrics[type]) metrics[type] = [];
      metrics[type].push(match);
    });
    
    return metrics;
  }

  extractEmergingThemes(content) {
    const themes = [];
    const themeIndicators = ['emerging', 'new trend', 'rising', 'growing', 'increasing'];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (themeIndicators.some(indicator => 
          line.toLowerCase().includes(indicator)
        )) {
        themes.push(line.trim());
      }
    });
    
    return themes.slice(0, 8);
  }

  extractInfluencers(content) {
    const influencerRegex = /@\w+/g;
    const matches = content.match(influencerRegex) || [];
    return [...new Set(matches)].slice(0, 10);
  }

  calculateCulturalScore(content) {
    const positiveIndicators = ['trending', 'popular', 'growing', 'opportunity', 'demand'];
    const negativeIndicators = ['declining', 'saturated', 'difficult', 'competitive'];
    
    let score = 50; // Base score
    
    positiveIndicators.forEach(indicator => {
      const count = (content.toLowerCase().match(new RegExp(indicator, 'g')) || []).length;
      score += count * 5;
    });
    
    negativeIndicators.forEach(indicator => {
      const count = (content.toLowerCase().match(new RegExp(indicator, 'g')) || []).length;
      score -= count * 3;
    });
    
    return Math.max(0, Math.min(100, score));
  }

  calculateTrendVelocity(content) {
    const velocityIndicators = {
      'viral': 10,
      'trending': 8,
      'rising': 6,
      'growing': 4,
      'increasing': 3,
      'declining': -3,
      'falling': -5
    };
    
    let velocity = 0;
    Object.entries(velocityIndicators).forEach(([indicator, weight]) => {
      const count = (content.toLowerCase().match(new RegExp(indicator, 'g')) || []).length;
      velocity += count * weight;
    });
    
    return Math.max(-10, Math.min(10, velocity));
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

module.exports = { PerplexityClient };