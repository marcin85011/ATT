/**
 * ScrapeHero Product Client
 * Production-ready client for Agent #06 deep competitor analysis
 */

class ScrapeHeroClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.scrapehero.com/v1';
    this.maxRetries = 3;
    this.retryDelay = 3000;
  }

  async scrapeAmazonProduct(asin, options = {}) {
    const { 
      marketplace = 'US',
      includeReviews = true,
      maxReviews = 50,
      includeVariants = true 
    } = options;

    const payload = {
      url: `https://www.amazon.com/dp/${asin}`,
      parser: 'amazon_product',
      country: marketplace,
      options: {
        include_reviews: includeReviews,
        max_reviews: maxReviews,
        include_variants: includeVariants,
        include_images: true,
        include_pricing: true,
        include_stock: true
      }
    };

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}/scrape`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ATT-System/1.0 (Product Analysis)'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`ScrapeHero API error ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(`Product scraping failed: ${result.error || 'Unknown error'}`);
        }

        // Process and structure the product data
        const productData = this.processProductData(result.data, asin);
        
        return {
          success: true,
          asin,
          marketplace,
          product: productData,
          metadata: {
            scrapedAt: new Date().toISOString(),
            source: 'scrapehero',
            cost: 0.005, // $0.005 per product scrape
            jobId: result.job_id
          }
        };

      } catch (error) {
        attempt++;
        console.error(`ScrapeHero attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt >= this.maxRetries) {
          return {
            success: false,
            error: error.message,
            asin,
            retryCount: attempt,
            metadata: {
              failedAt: new Date().toISOString(),
              source: 'scrapehero'
            }
          };
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  async scrapeSearchResults(keyword, options = {}) {
    const { 
      marketplace = 'US',
      maxResults = 20,
      sortBy = 'relevance',
      department = 'all' 
    } = options;

    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}&sort=${sortBy}`;
    
    const payload = {
      url: searchUrl,
      parser: 'amazon_search',
      country: marketplace,
      options: {
        max_results: maxResults,
        include_sponsored: false,
        include_pricing: true,
        include_ratings: true,
        include_images: true
      }
    };

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}/scrape`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`ScrapeHero API error ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(`Search scraping failed: ${result.error || 'Unknown error'}`);
        }

        const searchData = this.processSearchData(result.data, keyword);
        
        return {
          success: true,
          keyword,
          marketplace,
          totalResults: searchData.length,
          results: searchData,
          metadata: {
            scrapedAt: new Date().toISOString(),
            source: 'scrapehero',
            cost: 0.003, // $0.003 per search
            jobId: result.job_id
          }
        };

      } catch (error) {
        attempt++;
        console.error(`ScrapeHero search attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt >= this.maxRetries) {
          return {
            success: false,
            error: error.message,
            keyword,
            retryCount: attempt,
            metadata: {
              failedAt: new Date().toISOString(),
              source: 'scrapehero'
            }
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  processProductData(rawData, asin) {
    return {
      asin,
      title: rawData.title || '',
      brand: rawData.brand || '',
      price: this.extractPrice(rawData.price),
      originalPrice: this.extractPrice(rawData.original_price),
      discount: rawData.discount || 0,
      rating: parseFloat(rawData.rating) || 0,
      reviewCount: parseInt(rawData.review_count) || 0,
      bsr: this.extractBSR(rawData.best_sellers_rank),
      category: rawData.category || '',
      description: rawData.description || '',
      features: rawData.features || [],
      images: rawData.images || [],
      variants: this.processVariants(rawData.variants),
      availability: rawData.availability || 'unknown',
      seller: rawData.seller || '',
      fulfillment: rawData.fulfillment || '',
      dimensions: rawData.dimensions || {},
      weight: rawData.weight || '',
      reviews: this.processReviews(rawData.reviews),
      keywords: this.extractKeywords(rawData.title, rawData.description),
      competitorScore: this.calculateCompetitorScore(rawData)
    };
  }

  processSearchData(rawData, keyword) {
    if (!Array.isArray(rawData.products)) {
      return [];
    }

    return rawData.products.map((product, index) => ({
      position: index + 1,
      asin: product.asin,
      title: product.title || '',
      brand: product.brand || '',
      price: this.extractPrice(product.price),
      rating: parseFloat(product.rating) || 0,
      reviewCount: parseInt(product.review_count) || 0,
      imageUrl: product.image_url || '',
      url: product.url || '',
      sponsored: product.sponsored || false,
      relevanceScore: this.calculateRelevance(product.title, keyword),
      competitorLevel: this.assessCompetitorLevel(product)
    }));
  }

  processVariants(variants) {
    if (!Array.isArray(variants)) return [];
    
    return variants.map(variant => ({
      asin: variant.asin,
      title: variant.title,
      price: this.extractPrice(variant.price),
      color: variant.color || '',
      size: variant.size || '',
      style: variant.style || '',
      imageUrl: variant.image_url || ''
    }));
  }

  processReviews(reviews) {
    if (!Array.isArray(reviews)) return [];
    
    return reviews.map(review => ({
      rating: parseInt(review.rating) || 0,
      title: review.title || '',
      text: review.text || '',
      date: review.date || '',
      verified: review.verified || false,
      helpful: parseInt(review.helpful) || 0
    }));
  }

  extractPrice(priceString) {
    if (!priceString) return 0;
    const numericPrice = priceString.toString().replace(/[^0-9.]/g, '');
    return parseFloat(numericPrice) || 0;
  }

  extractBSR(bsrData) {
    if (!bsrData) return null;
    
    if (Array.isArray(bsrData)) {
      return bsrData.map(rank => ({
        category: rank.category || '',
        rank: parseInt(rank.rank) || 0
      }));
    }
    
    return [{
      category: 'Main',
      rank: parseInt(bsrData.toString().replace(/[^0-9]/g, '')) || 0
    }];
  }

  extractKeywords(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    
    return text
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 20);
  }

  calculateRelevance(title, keyword) {
    const titleLower = title.toLowerCase();
    const keywordTerms = keyword.toLowerCase().split(' ');
    
    let score = 0;
    keywordTerms.forEach(term => {
      if (titleLower.includes(term)) {
        score += 1;
      }
    });
    
    return Math.min(1, score / keywordTerms.length);
  }

  assessCompetitorLevel(product) {
    const reviewCount = parseInt(product.review_count) || 0;
    const rating = parseFloat(product.rating) || 0;
    
    if (reviewCount > 1000 && rating > 4.0) return 'strong';
    if (reviewCount > 100 && rating > 3.5) return 'moderate';
    if (reviewCount > 10) return 'weak';
    return 'minimal';
  }

  calculateCompetitorScore(rawData) {
    let score = 0;
    
    // Rating factor (0-40 points)
    const rating = parseFloat(rawData.rating) || 0;
    score += (rating / 5) * 40;
    
    // Review count factor (0-30 points)
    const reviewCount = parseInt(rawData.review_count) || 0;
    const reviewScore = Math.min(30, Math.log10(reviewCount + 1) * 10);
    score += reviewScore;
    
    // BSR factor (0-30 points)
    const bsr = this.extractBSR(rawData.best_sellers_rank);
    if (bsr && bsr[0]) {
      const rank = bsr[0].rank;
      const bsrScore = Math.max(0, 30 - (Math.log10(rank + 1) * 5));
      score += bsrScore;
    }
    
    return Math.round(score);
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
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

module.exports = { ScrapeHeroClient };