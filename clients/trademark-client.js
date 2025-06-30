/**
 * Trademark Checking Client
 * Production-ready client for Agent #09 IP protection (USPTO + EUIPO)
 */

class TrademarkClient {
  constructor(usptoApiKey, euipoApiKey) {
    this.usptoApiKey = usptoApiKey;
    this.euipoApiKey = euipoApiKey;
    this.usptoBaseUrl = 'https://developer.uspto.gov/ds-api';
    this.euipoBaseUrl = 'https://euipo.europa.eu/copla/trademark/data';
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  async checkTrademark(query, options = {}) {
    const {
      regions = ['US', 'EU'],
      includeInactive = false,
      fuzzyMatch = false,
      classNumbers = []
    } = options;

    const results = {
      query,
      searchedAt: new Date().toISOString(),
      regions: {},
      overallRisk: 'unknown',
      totalMatches: 0,
      highRiskMatches: [],
      recommendations: []
    };

    // Check USPTO (US)
    if (regions.includes('US')) {
      try {
        const usptoResult = await this.checkUSPTO(query, { includeInactive, fuzzyMatch, classNumbers });
        results.regions.US = usptoResult;
        results.totalMatches += usptoResult.matches.length;
        results.highRiskMatches.push(...usptoResult.highRiskMatches);
      } catch (error) {
        results.regions.US = { error: error.message, matches: [] };
      }
    }

    // Check EUIPO (EU)
    if (regions.includes('EU')) {
      try {
        const euipoResult = await this.checkEUIPO(query, { includeInactive, fuzzyMatch, classNumbers });
        results.regions.EU = euipoResult;
        results.totalMatches += euipoResult.matches.length;
        results.highRiskMatches.push(...euipoResult.highRiskMatches);
      } catch (error) {
        results.regions.EU = { error: error.message, matches: [] };
      }
    }

    // Calculate overall risk
    results.overallRisk = this.calculateOverallRisk(results);
    results.recommendations = this.generateRecommendations(results);

    return {
      success: true,
      data: results,
      metadata: {
        source: 'trademark-client',
        cost: regions.length * 0.001, // $0.001 per region check
        searchedAt: results.searchedAt
      }
    };
  }

  async checkUSPTO(query, options = {}) {
    const { includeInactive, fuzzyMatch, classNumbers } = options;
    
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        // USPTO Trademark API search
        const searchParams = new URLSearchParams({
          searchText: query,
          start: '0',
          rows: '100'
        });

        if (classNumbers.length > 0) {
          searchParams.append('fl', classNumbers.join(','));
        }

        const response = await fetch(`${this.usptoBaseUrl}/trademark/v3/application/search?${searchParams}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ATT-System/1.0 (Trademark Check)'
          }
        });

        if (!response.ok) {
          throw new Error(`USPTO API error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return this.processUSPTOResults(result, query, { includeInactive, fuzzyMatch });

      } catch (error) {
        attempt++;
        console.error(`USPTO attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt >= this.maxRetries) {
          throw new Error(`USPTO check failed after ${attempt} attempts: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  async checkEUIPO(query, options = {}) {
    const { includeInactive, fuzzyMatch, classNumbers } = options;
    
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        // EUIPO API search (using their REST API)
        const searchParams = {
          query: query,
          type: 'trademark',
          limit: 100,
          offset: 0
        };

        if (classNumbers.length > 0) {
          searchParams.classes = classNumbers.join(',');
        }

        const response = await fetch(`${this.euipoBaseUrl}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'ATT-System/1.0 (Trademark Check)'
          },
          body: JSON.stringify(searchParams)
        });

        if (!response.ok) {
          throw new Error(`EUIPO API error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return this.processEUIPOResults(result, query, { includeInactive, fuzzyMatch });

      } catch (error) {
        attempt++;
        console.error(`EUIPO attempt ${attempt}/${this.maxRetries} failed:`, error.message);
        
        if (attempt >= this.maxRetries) {
          throw new Error(`EUIPO check failed after ${attempt} attempts: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  processUSPTOResults(result, query, options) {
    const matches = [];
    const highRiskMatches = [];
    
    if (result.queryResults && result.queryResults.searchResponseList) {
      result.queryResults.searchResponseList.forEach(trademark => {
        const match = this.normalizeUSPTOTrademark(trademark);
        
        // Calculate similarity score
        match.similarityScore = this.calculateSimilarity(query, match.markText);
        match.riskLevel = this.assessRiskLevel(match, options);
        
        matches.push(match);
        
        if (match.riskLevel === 'HIGH' || match.riskLevel === 'CRITICAL') {
          highRiskMatches.push(match);
        }
      });
    }

    return {
      source: 'USPTO',
      totalFound: result.queryResults?.numFound || 0,
      matches: matches.sort((a, b) => b.similarityScore - a.similarityScore),
      highRiskMatches,
      searchTime: new Date().toISOString()
    };
  }

  processEUIPOResults(result, query, options) {
    const matches = [];
    const highRiskMatches = [];
    
    if (result.trademarks && Array.isArray(result.trademarks)) {
      result.trademarks.forEach(trademark => {
        const match = this.normalizeEUIPOTrademark(trademark);
        
        match.similarityScore = this.calculateSimilarity(query, match.markText);
        match.riskLevel = this.assessRiskLevel(match, options);
        
        matches.push(match);
        
        if (match.riskLevel === 'HIGH' || match.riskLevel === 'CRITICAL') {
          highRiskMatches.push(match);
        }
      });
    }

    return {
      source: 'EUIPO',
      totalFound: result.totalCount || 0,
      matches: matches.sort((a, b) => b.similarityScore - a.similarityScore),
      highRiskMatches,
      searchTime: new Date().toISOString()
    };
  }

  normalizeUSPTOTrademark(trademark) {
    return {
      registrationNumber: trademark.registrationNumber || '',
      serialNumber: trademark.applicationNumber || '',
      markText: trademark.markIdentification || trademark.markLiteralElements || '',
      owner: trademark.applicantName || '',
      status: trademark.markCurrentStatusDescriptor || '',
      filingDate: trademark.applicationDate || '',
      registrationDate: trademark.registrationDate || '',
      classes: trademark.classDescriptionList?.map(c => c.primaryClassNumber) || [],
      description: trademark.goodsAndServices || '',
      isActive: this.isActiveStatus(trademark.markCurrentStatusDescriptor),
      source: 'USPTO'
    };
  }

  normalizeEUIPOTrademark(trademark) {
    return {
      registrationNumber: trademark.registrationNumber || '',
      serialNumber: trademark.applicationNumber || '',
      markText: trademark.trademarkName || trademark.wordElements || '',
      owner: trademark.applicant?.name || '',
      status: trademark.legalStatus || '',
      filingDate: trademark.filingDate || '',
      registrationDate: trademark.registrationDate || '',
      classes: trademark.niceClasses || [],
      description: trademark.goodsServices || '',
      isActive: this.isActiveStatus(trademark.legalStatus),
      source: 'EUIPO'
    };
  }

  calculateSimilarity(query1, query2) {
    if (!query1 || !query2) return 0;
    
    const str1 = query1.toLowerCase().trim();
    const str2 = query2.toLowerCase().trim();
    
    // Exact match
    if (str1 === str2) return 1.0;
    
    // Substring match
    if (str1.includes(str2) || str2.includes(str1)) return 0.9;
    
    // Levenshtein distance
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    const similarity = 1 - (distance / maxLength);
    
    // Phonetic similarity bonus
    if (this.soundsLike(str1, str2)) {
      return Math.min(1.0, similarity + 0.2);
    }
    
    return similarity;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  soundsLike(str1, str2) {
    // Simple phonetic comparison
    const phoneticStr1 = str1.replace(/[aeiou]/g, '').replace(/[^a-z]/g, '');
    const phoneticStr2 = str2.replace(/[aeiou]/g, '').replace(/[^a-z]/g, '');
    
    return phoneticStr1 === phoneticStr2;
  }

  assessRiskLevel(match, options) {
    const { similarityScore, isActive, status, classes } = match;
    
    // Critical risk - exact or near-exact match with active trademark
    if (similarityScore >= 0.9 && isActive) {
      return 'CRITICAL';
    }
    
    // High risk - high similarity with active trademark
    if (similarityScore >= 0.7 && isActive) {
      return 'HIGH';
    }
    
    // Medium risk - moderate similarity or inactive trademark
    if (similarityScore >= 0.5 || (similarityScore >= 0.3 && isActive)) {
      return 'MEDIUM';
    }
    
    // Low risk - low similarity
    if (similarityScore >= 0.2) {
      return 'LOW';
    }
    
    return 'MINIMAL';
  }

  isActiveStatus(status) {
    if (!status) return false;
    
    const activeStatuses = [
      'registered',
      'published',
      'live',
      'active',
      'in force',
      'registered and renewed'
    ];
    
    return activeStatuses.some(activeStatus => 
      status.toLowerCase().includes(activeStatus.toLowerCase())
    );
  }

  calculateOverallRisk(results) {
    const criticalCount = results.highRiskMatches.filter(m => m.riskLevel === 'CRITICAL').length;
    const highCount = results.highRiskMatches.filter(m => m.riskLevel === 'HIGH').length;
    
    if (criticalCount > 0) return 'CRITICAL';
    if (highCount > 0) return 'HIGH';
    if (results.totalMatches > 10) return 'MEDIUM';
    if (results.totalMatches > 0) return 'LOW';
    return 'MINIMAL';
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    if (results.overallRisk === 'CRITICAL') {
      recommendations.push('DO NOT USE - Critical trademark conflict detected');
      recommendations.push('Consider completely different naming/branding');
    } else if (results.overallRisk === 'HIGH') {
      recommendations.push('HIGH RISK - Modify design significantly');
      recommendations.push('Consider legal consultation before proceeding');
    } else if (results.overallRisk === 'MEDIUM') {
      recommendations.push('Proceed with caution - monitor for conflicts');
      recommendations.push('Consider minor modifications to reduce similarity');
    } else if (results.overallRisk === 'LOW') {
      recommendations.push('Low risk - proceed with standard precautions');
    } else {
      recommendations.push('Minimal risk detected - safe to proceed');
    }
    
    if (results.totalMatches === 0) {
      recommendations.push('No existing trademarks found for this query');
    }
    
    return recommendations;
  }

  async batchCheck(queries, options = {}) {
    const results = [];
    const batchSize = 5; // Limit concurrent requests
    
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      const batchPromises = batch.map(query => this.checkTrademark(query, options));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch check failed for queries ${i}-${i + batchSize}:`, error.message);
        // Add error results for failed batch
        batch.forEach(query => {
          results.push({
            success: false,
            error: error.message,
            data: { query, overallRisk: 'UNKNOWN' }
          });
        });
      }
      
      // Rate limiting delay
      if (i + batchSize < queries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  async healthCheck() {
    const checks = [];
    
    // Check USPTO
    try {
      const usptoResponse = await fetch(`${this.usptoBaseUrl}/trademark/v3/application/search?searchText=test&rows=1`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      checks.push({
        service: 'USPTO',
        status: usptoResponse.ok ? 'healthy' : 'unhealthy',
        statusCode: usptoResponse.status
      });
    } catch (error) {
      checks.push({
        service: 'USPTO',
        status: 'unhealthy',
        error: error.message
      });
    }
    
    // Check EUIPO
    try {
      const euipoResponse = await fetch(`${this.euipoBaseUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test', limit: 1 })
      });
      
      checks.push({
        service: 'EUIPO',
        status: euipoResponse.ok ? 'healthy' : 'unhealthy',
        statusCode: euipoResponse.status
      });
    } catch (error) {
      checks.push({
        service: 'EUIPO',
        status: 'unhealthy',
        error: error.message
      });
    }
    
    return {
      overall: checks.every(c => c.status === 'healthy') ? 'healthy' : 'unhealthy',
      services: checks,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { TrademarkClient };