/**
 * Mock Server for MBA Intelligence Engine API Testing
 * Provides canned responses for all 15 external APIs
 */

const express = require('express');
const cors = require('cors');

class APIMockServer {
  constructor(port = 3001) {
    this.app = express();
    this.port = port;
    this.requestLog = [];
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      this.requestLog.push({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
      });
      next();
    });
  }

  setupRoutes() {
    // OpenAI API Mock
    this.app.post('/v1/chat/completions', (req, res) => {
      const mockResponse = this.getMockResponse('openai', 'chat_completion', req.body);
      res.json(mockResponse);
    });

    // Replicate API Mock (Imagen-4-Ultra)
    this.app.post('/v1/predictions', (req, res) => {
      const mockResponse = this.getMockResponse('replicate', 'create_prediction', req.body);
      res.json(mockResponse);
    });

    this.app.get('/v1/predictions/:id', (req, res) => {
      const mockResponse = this.getMockResponse('replicate', 'get_prediction', { id: req.params.id });
      res.json(mockResponse);
    });

    // ScrapeHero API Mock
    this.app.post('/amazon/product', (req, res) => {
      const mockResponse = this.getMockResponse('scrapehero', 'product_analysis', req.body);
      res.json(mockResponse);
    });

    // YouTube API Mock
    this.app.get('/youtube/v3/search', (req, res) => {
      const mockResponse = this.getMockResponse('youtube', 'search', req.query);
      res.json(mockResponse);
    });

    // NewsAPI Mock
    this.app.get('/v2/top-headlines', (req, res) => {
      const mockResponse = this.getMockResponse('newsapi', 'headlines', req.query);
      res.json(mockResponse);
    });

    // Perplexity API Mock
    this.app.post('/chat/completions', (req, res) => {
      const mockResponse = this.getMockResponse('perplexity', 'chat', req.body);
      res.json(mockResponse);
    });

    // Google Keyword Insight Mock
    this.app.get('/volume/', (req, res) => {
      const mockResponse = this.getMockResponse('google_keywords', 'volume', req.query);
      res.json(mockResponse);
    });

    // Firecrawl Mock
    this.app.post('/v1/scrape', (req, res) => {
      const mockResponse = this.getMockResponse('firecrawl', 'scrape', req.body);
      res.json(mockResponse);
    });

    // TextGears Grammar Check Mock
    this.app.post('/spelling', (req, res) => {
      const mockResponse = this.getMockResponse('textgears', 'spelling', req.body);
      res.json(mockResponse);
    });

    // Trademark APIs Mock
    this.app.get('/google/namesearch/:page/:limit', (req, res) => {
      const mockResponse = this.getMockResponse('trademark_lookup', 'search', req.query);
      res.json(mockResponse);
    });

    this.app.get('/eutm/search', (req, res) => {
      const mockResponse = this.getMockResponse('eu_trademarks', 'search', req.query);
      res.json(mockResponse);
    });

    // Media Modifier Mock
    this.app.post('/v2/mockups/generate', (req, res) => {
      const mockResponse = this.getMockResponse('media_modifier', 'generate', req.body);
      res.json(mockResponse);
    });

    // Notion API Mock
    this.app.post('/v1/pages', (req, res) => {
      const mockResponse = this.getMockResponse('notion', 'create_page', req.body);
      res.json(mockResponse);
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        requests_logged: this.requestLog.length
      });
    });

    // Get request logs
    this.app.get('/logs', (req, res) => {
      res.json({
        total_requests: this.requestLog.length,
        logs: this.requestLog.slice(-50) // Last 50 requests
      });
    });

    // Clear logs
    this.app.delete('/logs', (req, res) => {
      this.requestLog = [];
      res.json({ message: 'Logs cleared' });
    });
  }

  getMockResponse(apiName, scenario, requestData = {}) {
    const mockResponses = {
      openai: {
        chat_completion: {
          choices: [{
            message: {
              content: JSON.stringify({
                trademark_hits: [],
                policy_flags: [],
                amazon_risk_score: 1,
                mobile_optimization: {
                  thumbnail_readable: true,
                  contrast_ratio: 5.2
                },
                verdict: "PASS",
                reason: "Mock compliance check passed",
                fix_suggestion: "None required",
                is_mutation: false
              })
            }
          }],
          usage: {
            prompt_tokens: 150,
            completion_tokens: 75,
            total_tokens: 225
          }
        }
      },

      replicate: {
        create_prediction: {
          id: "mock-prediction-id-12345",
          status: "starting",
          created_at: new Date().toISOString(),
          urls: {
            get: `http://localhost:${this.port}/v1/predictions/mock-prediction-id-12345`
          }
        },
        get_prediction: {
          id: "mock-prediction-id-12345",
          status: "succeeded",
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          output: ["https://replicate.delivery/mock-image-url.png"],
          metrics: {
            predict_time: 15.2
          }
        }
      },

      scrapehero: {
        product_analysis: {
          asin: requestData.asin || "B08N5WRWNW",
          title: "Mock T-Shirt Product",
          price: "$19.99",
          rating: 4.3,
          reviews_count: 1247,
          bsr: {
            "Clothing, Shoes & Jewelry": 45678
          },
          availability: "In Stock",
          variants: [
            { size: "S", color: "Black", availability: "In Stock" },
            { size: "M", color: "Black", availability: "In Stock" },
            { size: "L", color: "Black", availability: "In Stock" }
          ]
        }
      },

      youtube: {
        search: {
          items: [
            {
              id: { videoId: "mock-video-1" },
              snippet: {
                title: "Trending T-Shirt Design Ideas 2025",
                description: "Latest trends in t-shirt designs for Amazon Merch",
                publishedAt: new Date().toISOString(),
                channelTitle: "Design Trends Channel",
                statistics: {
                  viewCount: "125000",
                  likeCount: "3500"
                }
              }
            },
            {
              id: { videoId: "mock-video-2" },
              snippet: {
                title: "Coffee Lover Shirt Designs That Sell",
                description: "Popular coffee-themed designs for POD",
                publishedAt: new Date().toISOString(),
                channelTitle: "POD Success",
                statistics: {
                  viewCount: "89000",
                  likeCount: "2100"
                }
              }
            }
          ],
          pageInfo: {
            totalResults: 25,
            resultsPerPage: 10
          }
        }
      },

      newsapi: {
        headlines: {
          status: "ok",
          totalResults: 10,
          articles: [
            {
              title: "Holiday Shopping Trends Show Increased Custom Apparel Demand",
              description: "Consumer preference shifting toward personalized merchandise",
              url: "https://example.com/news/1",
              publishedAt: new Date().toISOString(),
              source: { name: "Retail News" }
            },
            {
              title: "Small Business Success Stories in Print-on-Demand",
              description: "Entrepreneurs finding success in custom apparel market",
              url: "https://example.com/news/2",
              publishedAt: new Date().toISOString(),
              source: { name: "Business Daily" }
            }
          ]
        }
      },

      perplexity: {
        chat: {
          choices: [{
            message: {
              content: JSON.stringify({
                trends: {
                  "2025_predictions": [
                    "Minimalist text designs",
                    "Retro 90s aesthetics",
                    "Sustainability themes",
                    "Mental health awareness"
                  ]
                },
                seasonal_patterns: {
                  "Q4_2024": "Holiday themes performing well",
                  "Q1_2025": "New Year motivation designs trending"
                },
                competition_levels: {
                  "coffee_niche": "Medium",
                  "fitness_niche": "High",
                  "pet_niche": "Low"
                },
                recommendations: [
                  "Focus on text-only designs for higher conversion",
                  "Black/white color schemes performing best",
                  "Mobile-first design approach critical"
                ]
              })
            }
          }]
        }
      },

      google_keywords: {
        volume: {
          data: {
            keyword: requestData.keyword || "coffee lover",
            volume: 12100,
            competition: "Medium",
            cpc: 0.85,
            suggestions: [
              "coffee lover shirt",
              "coffee addict tee",
              "caffeine dependent",
              "but first coffee",
              "coffee mom life"
            ]
          }
        }
      },

      firecrawl: {
        scrape: {
          success: true,
          data: {
            markdown: "# Amazon Search Results\n\n## Sponsored Products\n\n- Coffee Lover T-Shirt - $19.99\n- But First Coffee Tee - $17.99\n- Caffeine Addict Shirt - $21.99\n\n## Organic Results\n\n- Coffee Mom Life Shirt - $18.99\n- I Run on Coffee - $16.99",
            metadata: {
              title: "Amazon.com: coffee lover shirt",
              description: "Shop coffee lover shirts on Amazon",
              statusCode: 200
            }
          }
        }
      },

      textgears: {
        spelling: {
          response: {
            errors: [
              {
                type: "spelling",
                description: "Possible spelling mistake",
                offset: 45,
                length: 8,
                suggestions: ["correct", "spelling"]
              }
            ],
            corrections: 1
          }
        }
      },

      trademark_lookup: {
        search: {
          data: [],
          total: 0,
          message: "No trademark conflicts found"
        }
      },

      eu_trademarks: {
        search: {
          data: [],
          total: 0,
          message: "No EU trademark conflicts found"
        }
      },

      media_modifier: {
        generate: {
          success: true,
          mockup_url: "https://mock-cdn.com/mockup-12345.png",
          processing_time: 3.2,
          template_used: "t-shirt-basic-mockup"
        }
      },

      notion: {
        create_page: {
          object: "page",
          id: "mock-page-id-12345",
          created_time: new Date().toISOString(),
          last_edited_time: new Date().toISOString(),
          properties: {
            Title: {
              title: [{
                text: { content: requestData.properties?.Title?.title?.[0]?.text?.content || "Mock Page" }
              }]
            }
          }
        }
      }
    };

    // Handle error scenarios
    if (requestData._scenario === 'rate_limit') {
      return {
        error: {
          message: 'Rate limit exceeded',
          type: 'rate_limit_error'
        }
      };
    }

    if (requestData._scenario === 'server_error') {
      return {
        error: {
          message: 'Internal server error',
          type: 'server_error'
        }
      };
    }

    return mockResponses[apiName]?.[scenario] || {
      error: `Mock response not found for ${apiName}:${scenario}`
    };
  }

  start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`🎭 API Mock Server running on http://localhost:${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log(`📝 Request logs: http://localhost:${this.port}/logs`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Mock server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getRequestLog() {
    return this.requestLog;
  }

  clearRequestLog() {
    this.requestLog = [];
  }
}

module.exports = APIMockServer;