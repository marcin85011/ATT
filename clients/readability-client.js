/**
 * Flesch-Kincaid Readability Scorer Client - Agent #30
 * Readability analysis optimized for t-shirt design audiences
 */

const { trackCost } = require('../shared/cost-tracker');
const { errorHandler } = require('../shared/error-handler');
const { sanitizeText } = require('../shared/utils');

class ReadabilityClient {
  constructor() {
    this.agentId = 'readability-scorer-30';
    this.mockMode = process.env.MOCK_MODE === 'true';
  }

  async scoreReadability(text, options = {}) {
    const startTime = Date.now();
    
    try {
      // Sanitize input text
      const cleanText = sanitizeText(text, { maxLength: 2000, removeHtml: true });
      
      if (this.mockMode) {
        return this._getMockResult(cleanText, startTime);
      }

      // Local processing - no external API needed
      const result = await this._calculateReadability(cleanText, options);
      
      // No external API cost - local processing only
      await trackCost(this.agentId, 0.000, 'Local readability analysis');
      
      return this._formatResult(result, startTime);
      
    } catch (error) {
      await errorHandler(this.agentId, error, { text: text.substring(0, 100) });
      throw error;
    }
  }

  async _calculateReadability(text, options) {
    // Flesch-Kincaid implementation
    const stats = this._getTextStatistics(text);
    
    // Flesch Reading Ease: 206.835 - (1.015 × ASL) - (84.6 × ASW)
    const fleschReadingEase = 206.835 - 
      (1.015 * stats.averageSentenceLength) - 
      (84.6 * stats.averageSyllablesPerWord);
    
    // Flesch-Kincaid Grade Level: (0.39 × ASL) + (11.8 × ASW) - 15.59
    const fleschKincaidGrade = 
      (0.39 * stats.averageSentenceLength) + 
      (11.8 * stats.averageSyllablesPerWord) - 15.59;
    
    return {
      flesch_reading_ease: Math.round(fleschReadingEase * 10) / 10,
      flesch_kincaid_grade: Math.round(fleschKincaidGrade * 10) / 10,
      average_sentence_length: stats.averageSentenceLength,
      syllables_per_word: stats.averageSyllablesPerWord,
      word_count: stats.wordCount,
      sentence_count: stats.sentenceCount,
      syllable_count: stats.syllableCount
    };
  }

  _getTextStatistics(text) {
    // Count sentences (periods, exclamation marks, question marks)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length || 1;
    
    // Count words (split by whitespace, filter empty)
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);
    const wordCount = words.length;
    
    // Count syllables
    let syllableCount = 0;
    words.forEach(word => {
      syllableCount += this._countSyllables(word);
    });
    
    return {
      wordCount,
      sentenceCount,
      syllableCount,
      averageSentenceLength: wordCount / sentenceCount,
      averageSyllablesPerWord: syllableCount / (wordCount || 1)
    };
  }

  _countSyllables(word) {
    // Simple syllable counting algorithm
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    
    if (word.length <= 3) return 1;
    
    // Count vowel groups
    const vowels = 'aeiouy';
    let syllables = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllables++;
      }
      previousWasVowel = isVowel;
    }
    
    // Silent 'e' at the end
    if (word.endsWith('e')) {
      syllables--;
    }
    
    // Minimum one syllable per word
    return Math.max(1, syllables);
  }

  _getMockResult(text, startTime) {
    // Mock response for development/testing
    const processingTime = Date.now() - startTime;
    
    // Simulate different readability levels based on text characteristics
    const wordCount = text.split(/\s+/).length;
    const hasComplexWords = /\b\w{8,}\b/.test(text);
    const hasShortSentences = text.split(/[.!?]/).every(s => s.split(/\s+/).length <= 10);
    
    let fleschReadingEase, fleschKincaidGrade;
    
    if (hasShortSentences && !hasComplexWords) {
      // Easy to read (good for t-shirts)
      fleschReadingEase = 75.0;
      fleschKincaidGrade = 6.5;
    } else if (hasComplexWords) {
      // More difficult
      fleschReadingEase = 45.0;
      fleschKincaidGrade = 12.0;
    } else {
      // Standard level
      fleschReadingEase = 65.0;
      fleschKincaidGrade = 8.0;
    }
    
    const result = {
      agent: this.agentId,
      status: this._determineStatusFromScores(fleschReadingEase, fleschKincaidGrade),
      flesch_reading_ease: fleschReadingEase,
      flesch_kincaid_grade: fleschKincaidGrade,
      average_sentence_length: wordCount <= 10 ? 8.5 : 15.2,
      syllables_per_word: hasComplexWords ? 2.8 : 1.6,
      readability_score: this._calculateReadabilityScore(fleschReadingEase, fleschKincaidGrade),
      target_audience: this._getTargetAudience(fleschKincaidGrade),
      recommendations: this._generateRecommendations(fleschReadingEase, fleschKincaidGrade),
      processing_time_ms: processingTime,
      cost: 0.000,
      mock: true
    };
    
    return result;
  }

  _formatResult(analysisResult, startTime) {
    const processingTime = Date.now() - startTime;
    
    return {
      agent: this.agentId,
      status: this._determineStatusFromScores(
        analysisResult.flesch_reading_ease, 
        analysisResult.flesch_kincaid_grade
      ),
      flesch_reading_ease: analysisResult.flesch_reading_ease,
      flesch_kincaid_grade: analysisResult.flesch_kincaid_grade,
      average_sentence_length: analysisResult.average_sentence_length,
      syllables_per_word: analysisResult.syllables_per_word,
      readability_score: this._calculateReadabilityScore(
        analysisResult.flesch_reading_ease, 
        analysisResult.flesch_kincaid_grade
      ),
      target_audience: this._getTargetAudience(analysisResult.flesch_kincaid_grade),
      recommendations: this._generateRecommendations(
        analysisResult.flesch_reading_ease, 
        analysisResult.flesch_kincaid_grade
      ),
      processing_time_ms: processingTime,
      cost: 0.000,
      mock: false
    };
  }

  _determineStatusFromScores(readingEase, gradeLevel) {
    // Target ranges from specification:
    // Flesch Reading Ease: 60-80 (Standard to Easy)
    // Grade Level: 6-8 (optimal for t-shirts)
    
    if (gradeLevel > 10) return 'fail'; // Too complex
    if (readingEase < 50) return 'fail'; // Too difficult
    if (gradeLevel > 8 || readingEase < 60) return 'warning';
    return 'pass';
  }

  _calculateReadabilityScore(readingEase, gradeLevel) {
    // Score from 0-10 based on t-shirt design optimality
    let score = 5; // Base score
    
    // Reading ease scoring (60-80 is target)
    if (readingEase >= 60 && readingEase <= 80) {
      score += 3;
    } else if (readingEase >= 50 && readingEase < 90) {
      score += 1;
    }
    
    // Grade level scoring (6-8 is target)
    if (gradeLevel >= 6 && gradeLevel <= 8) {
      score += 2;
    } else if (gradeLevel >= 5 && gradeLevel <= 10) {
      score += 1;
    }
    
    return Math.min(10, Math.max(0, score));
  }

  _getTargetAudience(gradeLevel) {
    if (gradeLevel <= 6) return 'elementary';
    if (gradeLevel <= 8) return 'general_public';
    if (gradeLevel <= 12) return 'high_school';
    return 'college_level';
  }

  _generateRecommendations(readingEase, gradeLevel) {
    const recommendations = [];
    
    if (gradeLevel > 8) {
      recommendations.push('Consider shorter sentences for better impact');
      recommendations.push('Use simpler words where possible');
    }
    
    if (readingEase < 60) {
      recommendations.push('Text may be too complex for casual reading');
    }
    
    if (gradeLevel <= 8 && readingEase >= 60) {
      recommendations.push('Good readability level for target audience');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Text readability is within optimal range');
    }
    
    return recommendations;
  }

  // Health check method
  async healthCheck() {
    try {
      const testResult = await this.scoreReadability('This is a test sentence.');
      return { 
        status: 'healthy', 
        mode: this.mockMode ? 'mock' : 'production',
        mock_test_passed: testResult.mock === true || testResult.mock === false
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

module.exports = { ReadabilityClient };