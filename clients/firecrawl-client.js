/**
 * Firecrawl SERP Client
 * Production-ready client for Agent #05 competitor SERP scraping
 */

class FirecrawlClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.firecrawl.dev/v1';
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  async scrapeSerp(query, options = {}) {
    const { 
      market = 'us',
      language = 'en',
      maxResults = 20,
      includeMetadata = true 
    } = options;

    const payload = {
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      formats: ['markdown', 'html'],
      includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'a'],
      excludeTags: ['script', 'style', 'nav', 'footer'],
      waitFor: 2000,
      onlyMainContent: true,
      actions: [
        {
          type: 'wait',
          milliseconds: 2000
        }
      ]
    };

    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}/scrape`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ATT-System/1.0 (Automated Trend Analysis)'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Firecrawl API error ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(`Firecrawl scraping failed: ${result.error || 'Unknown error'}`);
        }

        // Extract SERP data from the scraped content
        const serpData = this.extractSerpData(result.data, query);
        
        return {
          success: true,
          query,
          market,
          language,
          totalResults: serpData.length,
          results: serpData.slice(0, maxResults),
          metadata: includeMetadata ? {
            scrapedAt: new Date().toISOString(),
            source: 'firecrawl',
            cost: 0.002, // $0.002 per scrape
            jobId: result.jobId
          } : null
        };

      } catch (error) {
        attempt++;
        console.error(`Firecrawl attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt >= this.maxRetries) {
          return {
            success: false,
            error: error.message,
            query,
            retryCount: attempt,
            metadata: {
              failedAt: new Date().toISOString(),
              source: 'firecrawl'
            }
          };
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  extractSerpData(scrapedData, query) {
    const results = [];
    
    try {
      // Parse the markdown content to extract search results
      const content = scrapedData.markdown || scrapedData.html || '';
      
      // Basic regex patterns to extract Google search results
      const resultPattern = /<h3[^>]*>.*?<\/h3>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<\/a>/gi;
      const titlePattern = /<h3[^>]*>(.*?)<\/h3>/i;
      const urlPattern = /href="([^"]*)"/i;
      
      let match;
      let position = 1;
      
      while ((match = resultPattern.exec(content)) !== null && position <= 20) {
        const resultHtml = match[0];
        const titleMatch = titlePattern.exec(resultHtml);
        const urlMatch = urlPattern.exec(resultHtml);
        
        if (titleMatch && urlMatch) {
          const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
          const url = urlMatch[1];
          
          // Skip Google internal links
          if (!url.includes('google.com') && !url.startsWith('/search')) {
            results.push({
              position,
              title,
              url: url.startsWith('http') ? url : `https://${url}`,
              domain: this.extractDomain(url),
              snippet: this.extractSnippet(content, position),
              isAd: false, // Firecrawl typically filters ads
              relevanceScore: this.calculateRelevance(title, query)
            });
            position++;
          }
        }
      }
      
    } catch (error) {
      console.error('Error extracting SERP data:', error);
    }
    
    return results;
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.split('/')[0];
    }
  }

  extractSnippet(content, position) {
    // Extract snippet text around the position
    const lines = content.split('\n');
    const snippetStart = Math.max(0, position * 3 - 1);
    const snippetEnd = Math.min(lines.length, snippetStart + 3);
    
    return lines.slice(snippetStart, snippetEnd)
      .join(' ')
      .replace(/<[^>]*>/g, '')
      .substring(0, 200)
      .trim();
  }

  calculateRelevance(title, query) {
    const titleLower = title.toLowerCase();
    const queryTerms = query.toLowerCase().split(' ');
    
    let score = 0;
    queryTerms.forEach(term => {
      if (titleLower.includes(term)) {
        score += 1;
      }
    });
    
    return Math.min(1, score / queryTerms.length);
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'test',
          limit: 1
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

module.exports = { FirecrawlClient };