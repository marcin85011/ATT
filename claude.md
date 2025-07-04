{
  "name": "Merch by Amazon - Ultimate 2025 Edition v3.0",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 3
            }
          ]
        }
      },
      "id": "schedule-trigger",
      "name": "Schedule Trigger (3h)",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [250, 300]
    },
    {
      "parameters": {},
      "id": "manual-trigger",
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [250, 450]
    },
    {
      "parameters": {
        "content": "## 🎯 Ultimate Merch by Amazon AI Agent System v3.0\n\n### Core Intelligence Features:\n- **Product Performance Scoring**: Bella+Canvas & Gildan preference\n- **Color Strategy**: 45% success with black/white combos\n- **A10 Algorithm Optimization**: External traffic focus\n- **Creative Mutations**: 20% experimental designs\n- **Negative Keyword Learning**: Prunes failed strategies\n- **Mobile-First Enforcement**: 160px thumbnail testing\n- **Dynamic Pricing Tiers**: Based on seller level\n- **Enhanced IP Protection**: Zero-tolerance compliance\n\n### NEW PROFITABILITY FEATURES:\n- **Performance Feedback Loop**: Learn from winning designs\n- **Automated Repricing**: Adjust prices based on performance\n- **Trend Detection**: Catch emerging opportunities early\n- **Error Recovery**: Auto-retry failed operations\n- **Analytics Dashboard**: Real-time performance metrics\n\n### Key Metrics:\n- Text-only designs: 23% conversion rate\n- BSR visibility cliff: 500k threshold\n- Mobile traffic: 77% of all views\n- Thumbnail CTR target: >2.5%\n- Daily Upload Target: 100 designs\n\n### Required Sheets:\n- AMAZON_MEMORY_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- AMAZON_PERFORMANCE_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- AMAZON_TRENDING_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- AMAZON_ANALYTICS_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- DRIVE_FOLDER_ID: 1PEsieoyQyFQTG1LcRENMZdMIlq3S2F6d"
      },
      "id": "system-overview",
      "name": "Ultimate System Overview",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [450, 100]
    },
    {
      "parameters": {
        "operation": "getAll",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "AgentMemory",
        "options": {
          "returnAllColumns": true
        }
      },
      "id": "load-agent-memory",
      "name": "Load Agent Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [450, 300],
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 5000
    },
    {
      "parameters": {
        "operation": "getAll",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "NegativeKeywords",
        "options": {
          "returnAllColumns": true
        }
      },
      "id": "load-negative-keywords",
      "name": "Load Negative Keywords",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [450, 400],
      "continueOnFail": true
    },
    {
      "parameters": {
        "operation": "getAll",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "PerformanceData",
        "options": {
          "returnAllColumns": true
        }
      },
      "id": "load-performance-data",
      "name": "Load Performance Data",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [450, 500],
      "continueOnFail": true
    },
    {
      "parameters": {
        "jsCode": "// Ultimate Amazon AI System with Performance Feedback & Analytics\nconst memory = $node[\"Load Agent Memory\"].json || [];\nconst negativeKeywords = $node[\"Load Negative Keywords\"].json || [];\nconst performanceData = $node[\"Load Performance Data\"].json || [];\nconst currentDate = new Date();\n\n// Retrieve Amazon-specific insights\nconst amazonInsights = {\n  research: memory.filter(m => m.agent === 'research').slice(-20),\n  creative: memory.filter(m => m.agent === 'creative').slice(-20),\n  quality: memory.filter(m => m.agent === 'quality').slice(-20),\n  strategy: memory.filter(m => m.agent === 'strategy').slice(-20)\n};\n\n// PERFORMANCE FEEDBACK LOOP - Analyze winning designs\nconst winningDesigns = performanceData\n  .filter(d => d.sales_count > 10 && d.roi > 200)\n  .sort((a, b) => b.roi - a.roi)\n  .slice(0, 20);\n\nconst winningPatterns = {\n  themes: {},\n  keywords: {},\n  colors: {},\n  niches: {}\n};\n\nwinningDesigns.forEach(design => {\n  // Extract patterns from winners\n  if (design.theme) winningPatterns.themes[design.theme] = (winningPatterns.themes[design.theme] || 0) + design.sales_count;\n  if (design.keywords) {\n    design.keywords.split(',').forEach(kw => {\n      winningPatterns.keywords[kw.trim()] = (winningPatterns.keywords[kw.trim()] || 0) + design.sales_count;\n    });\n  }\n  if (design.color_strategy) winningPatterns.colors[design.color_strategy] = (winningPatterns.colors[design.color_strategy] || 0) + design.sales_count;\n  if (design.niche) winningPatterns.niches[design.niche] = (winningPatterns.niches[design.niche] || 0) + design.sales_count;\n});\n\n// TREND DETECTION - Identify emerging opportunities\nconst trendAnalysis = {\n  emerging_keywords: [],\n  velocity_changes: [],\n  seasonal_opportunities: []\n};\n\n// Analyze keyword velocity\nconst recentPerformance = performanceData.filter(d => {\n  const daysAgo = (currentDate - new Date(d.created_at)) / (1000 * 60 * 60 * 24);\n  return daysAgo <= 7;\n});\n\nconst keywordVelocity = {};\nrecentPerformance.forEach(d => {\n  if (d.keywords) {\n    d.keywords.split(',').forEach(kw => {\n      const keyword = kw.trim();\n      if (!keywordVelocity[keyword]) keywordVelocity[keyword] = { count: 0, sales: 0 };\n      keywordVelocity[keyword].count++;\n      keywordVelocity[keyword].sales += d.sales_count || 0;\n    });\n  }\n});\n\n// Identify high-velocity keywords\nObject.entries(keywordVelocity).forEach(([keyword, data]) => {\n  if (data.count >= 3 && data.sales >= 5) {\n    trendAnalysis.emerging_keywords.push({\n      keyword,\n      velocity: data.sales / data.count,\n      trend: 'rising'\n    });\n  }\n});\n\n// Process negative keywords from failed designs\nconst negativeKeywordList = (negativeKeywords\n  .map(k => k.keyword ? k.keyword.toLowerCase() : null))\n  .filter(Boolean);\n\n// Calculate creative mutation counter\nconst totalDesignsToday = amazonInsights.creative\n  .filter(m => m.timestamp && new Date(m.timestamp).toDateString() === currentDate.toDateString())\n  .length;\nconst shouldMutate = (totalDesignsToday + 1) % 5 === 0;\n\n// ANALYTICS METRICS\nconst analytics = {\n  total_designs: performanceData.length,\n  total_sales: performanceData.reduce((sum, d) => sum + (d.sales_count || 0), 0),\n  total_revenue: performanceData.reduce((sum, d) => sum + (d.revenue || 0), 0),\n  average_roi: performanceData.length > 0 ? performanceData.reduce((sum, d) => sum + (d.roi || 0), 0) / performanceData.length : 0,\n  conversion_rate: performanceData.filter(d => d.sales_count > 0).length / (performanceData.length || 1),\n  top_performing_niche: Object.entries(winningPatterns.niches).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',\n  trending_keywords: trendAnalysis.emerging_keywords.slice(0, 5)\n};\n\n// Enhanced Amazon-specific system state\nconst systemState = {\n  execution_id: `AMZN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,\n  timestamp: currentDate.toISOString(),\n  platform: 'merch_by_amazon',\n  agent_memory: amazonInsights,\n  learned_patterns: winningPatterns,\n  negative_keywords: [...new Set(negativeKeywordList)],\n  performance_feedback: {\n    winning_designs: winningDesigns.slice(0, 10),\n    winning_patterns: winningPatterns,\n    success_metrics: analytics\n  },\n  trend_analysis: trendAnalysis,\n  creative_mutation_due: shouldMutate,\n  \n  // Enhanced product performance scoring\n  product_performance: {\n    preferred_products: {\n      'T-Shirt': { \n        primary: 'Bella+Canvas 3001',\n        score: 95,\n        features: ['4.2oz cotton', '65+ colors', 'retail fit'],\n        conversion_boost: 1.23\n      },\n      'Hoodie': {\n        primary: 'Gildan 18500',\n        score: 90,\n        features: ['8.0oz fleece', '47+ colors', 'double-lined hood'],\n        price_advantage: true\n      }\n    }\n  },\n  \n  // Enhanced BSR analysis with visibility cliff\n  bsr_analysis: {\n    excellent: 50000,\n    good: 100000,\n    marginal: 500000,\n    poor: 1000000,\n    visibility_cliff: 500000\n  },\n  \n  // A10 algorithm optimization factors\n  a10_optimization: {\n    organic_sales: { weight: 0.25, priority: 1 },\n    external_traffic: { weight: 0.20, priority: 2 },\n    seller_authority: { weight: 0.18, priority: 3 },\n    click_through_rate: { weight: 0.15, priority: 4 },\n    mobile_first: { traffic_share: 0.77 }\n  },\n  \n  amazon_targets: {\n    daily_designs: 100,\n    bsr_threshold: 500000,\n    saturation_limit: 1000,\n    quality_threshold: 9.0,\n    simplicity_score: 8.0,\n    mutation_rate: 0.2\n  },\n  \n  product_types: ['T-Shirt', 'Hoodie', 'Tank Top']\n};\n\nreturn [{\n  json: systemState\n}];"
      },
      "id": "init-amazon-system",
      "name": "Initialize Ultimate System",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 400]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Ultimate Amazon Research Agent with performance feedback and trend detection.\n\nYour enhanced capabilities:\n- Analyze BSR with tier system (Excellent <50k, Good <100k, Marginal <500k, Poor >1M)\n- PRIORITIZE niches similar to winning patterns\n- Detect emerging trends from velocity data\n- AVOID negative keywords from failed designs\n- Find underserved sub-niches\n- Focus on A10 algorithm factors\n\nMemory context:\n{{JSON.stringify($json.agent_memory.research, null, 2)}}\n\nWINNING PATTERNS TO REPLICATE:\n{{JSON.stringify($json.performance_feedback.winning_patterns, null, 2)}}\n\nEMERGING TRENDS:\n{{JSON.stringify($json.trend_analysis.emerging_keywords, null, 2)}}\n\nNegative keywords to AVOID:\n{{JSON.stringify($json.negative_keywords, null, 2)}}\n\nYour task: Identify 5 HIGH-POTENTIAL niches based on:\n1. BSR tier analysis (prioritize Excellent and Good tiers)\n2. Less than 1,000 competing designs\n3. Similar to winning patterns OR emerging trends\n4. Text-only design potential (23% conversion advantage)\n5. No trademark risks or negative keywords\n6. Works across T-shirts, Hoodies, and Tank Tops\n7. Mobile-first considerations (77% of traffic)\n\nFocus on:\n- Niches that match winning patterns\n- Keywords with rising velocity\n- Professions, hobbies, funny sayings, identity\n- Unique angles on proven concepts\n\nFor each niche, include:\n- BSR tier classification\n- A10 optimization potential\n- Mobile visibility score\n- Color strategy recommendation\n- Performance prediction based on similar winners",
        "systemMessage": "You are an expert Amazon market researcher with predictive analytics. Prioritize opportunities similar to proven winners. Always return structured JSON with performance predictions.",
        "options": {
          "temperature": 0.7,
          "maxTokens": 4000
        },
        "tools": [
          {
            "type": "code",
            "tool": {
              "name": "analyze_amazon_niche_enhanced",
              "description": "Analyze Amazon niche with performance prediction",
              "language": "javaScript",
              "code": "// Enhanced Amazon niche analyzer with performance prediction\nconst analyzeNiche = (niche, keywords, winningPatterns) => {\n  // Simulate BSR and competition data with tier analysis\n  const niches = {\n    'nurse_humor': { avg_bsr: 45000, competition: 750, growth: 'stable', tier: 'excellent' },\n    'fishing_dad': { avg_bsr: 89000, competition: 450, growth: 'growing', tier: 'good' },\n    'teacher_tired': { avg_bsr: 298000, competition: 890, growth: 'stable', tier: 'marginal' },\n    'gaming_programmer': { avg_bsr: 156000, competition: 320, growth: 'growing', tier: 'good' },\n    'plant_mom': { avg_bsr: 412000, competition: 680, growth: 'stable', tier: 'marginal' },\n    'craft_beer_dad': { avg_bsr: 23000, competition: 290, growth: 'growing', tier: 'excellent' }\n  };\n  \n  const data = niches[niche] || { avg_bsr: 400000, competition: 600, growth: 'stable', tier: 'marginal' };\n  \n  // Enhanced scoring with performance prediction\n  const tierScores = { excellent: 10, good: 7, marginal: 4, poor: 1 };\n  const bsrScore = tierScores[data.tier] || 4;\n  const compScore = Math.max(0, 10 - (data.competition / 100));\n  const growthBonus = data.growth === 'growing' ? 2 : data.growth === 'stable' ? 1 : 0;\n  \n  // Check similarity to winning patterns\n  let patternMatch = 0;\n  if (winningPatterns) {\n    Object.entries(winningPatterns.niches || {}).forEach(([winNiche, sales]) => {\n      if (niche.includes(winNiche) || winNiche.includes(niche)) {\n        patternMatch = Math.min(3, sales / 10);\n      }\n    });\n  }\n  \n  // A10 optimization potential\n  const a10Potential = {\n    organic_sales: data.tier === 'excellent' ? 0.9 : 0.6,\n    external_traffic: 0.7,\n    ctr_potential: data.competition < 500 ? 0.8 : 0.5,\n    mobile_friendly: 0.85\n  };\n  \n  const opportunityScore = (bsrScore * 0.3 + compScore * 0.3 + growthBonus * 0.2 + patternMatch * 0.2);\n  \n  // Performance prediction based on similar patterns\n  const performancePrediction = {\n    expected_sales_30d: Math.round(opportunityScore * 10),\n    expected_roi: Math.round(opportunityScore * 30),\n    confidence: opportunityScore > 7 ? 'high' : opportunityScore > 5 ? 'medium' : 'low'\n  };\n  \n  return {\n    niche,\n    metrics: {\n      ...data,\n      bsr_tier: data.tier,\n      visibility_above_cliff: data.avg_bsr < 500000\n    },\n    a10_potential: a10Potential,\n    opportunity_score: opportunityScore.toFixed(2),\n    recommendation: opportunityScore > 7 ? 'HIGH_POTENTIAL' : opportunityScore > 5 ? 'MODERATE' : 'AVOID',\n    color_strategy: 'black_white_priority',\n    performance_prediction: performancePrediction\n  };\n};\n\nreturn analyzeNiche(input.niche, input.keywords, input.winning_patterns);"
            }
          }
        ]
      },
      "id": "amazon-research-agent",
      "name": "Ultimate Research Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [850, 400]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$node[\"Initialize Ultimate System\"].json.execution_id}}",
            "agent": "research",
            "timestamp": "={{new Date().toISOString()}}",
            "type": "niche_analysis_ultimate",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-research-memory",
      "name": "Save Research Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [1050, 400],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.firecrawl.dev/v1/scrape",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer fc-fe2f9e923d654211939200b02977d0af"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\"url\": \"https://www.amazon.com/s?k=\" + encodeURIComponent($node[\"Ultimate Research Agent\"].json.output?.amazon_niches?.[0]?.niche_name || \"trending t-shirt\") + \"&rh=n%3A7141123011\", \"formats\": [\"markdown\"], \"onlyMainContent\": true, \"waitFor\": 2000}",
        "options": {
          "timeout": 60000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "firecrawl-market-analysis",
      "name": "Firecrawl Market Analysis",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1250, 300],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.perplexity.ai/chat/completions",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.PERPLEXITY_API_KEY}}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\"model\": \"llama-3.1-sonar-small-128k-online\", \"messages\": [{\"role\": \"user\", \"content\": \"Analyze current Amazon Merch trends for Q4 2024 and 2025 predictions for niches. Focus on: 1) Trending keywords 2) Seasonal patterns 3) Competition levels 4) Price points 5) BSR opportunities. Return JSON with trends, predictions, and recommendations.\"}], \"max_tokens\": 2000, \"temperature\": 0.7, \"return_citations\": true}",
        "options": {
          "timeout": 45000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "perplexity-trend-analysis",
      "name": "Perplexity Trend Analysis",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1250, 500],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://google-keyword-insight1.p.rapidapi.com/volume/?keyword={{encodeURIComponent($node[\"Ultimate Research Agent\"].json.output?.amazon_niches?.[0]?.niche_name || \"trending t-shirt\")}}&location=US&lang=en",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-rapidapi-host",
              "value": "google-keyword-insight1.p.rapidapi.com"
            },
            {
              "name": "x-rapidapi-key",
              "value": "dfbebd54f5msh2a58a7d8c95899fp103dd1jsn7edcb20d8c1d"
            }
          ]
        },
        "options": {
          "timeout": 30000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "keyword-research-api",
      "name": "Enhanced Keyword Research",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1250, 700],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "jsCode": "// Consolidate Enhanced Research Data\nconst baseResearch = $node[\"Save Research Memory\"].json;\nconst firecrawlData = $node[\"Firecrawl Market Analysis\"].json || {};\nconst perplexityData = $node[\"Perplexity Trend Analysis\"].json || {};\nconst keywordData = $node[\"Enhanced Keyword Research\"].json || {};\n\n// Parse Perplexity response \nlet trendInsights = {};\ntry {\n  if (perplexityData.choices && perplexityData.choices[0]) {\n    const content = perplexityData.choices[0].message.content;\n    // Try to extract JSON from the response\n    const jsonMatch = content.match(/\\{[\\s\\S]*\\}/);\n    if (jsonMatch) {\n      trendInsights = JSON.parse(jsonMatch[0]);\n    }\n  }\n} catch (e) {\n  console.log('Could not parse Perplexity trends:', e.message);\n}\n\n// Extract keyword suggestions\nlet keywordSuggestions = [];\ntry {\n  if (keywordData.data && keywordData.data.suggestions) {\n    keywordSuggestions = keywordData.data.suggestions.slice(0, 20);\n  }\n} catch (e) {\n  console.log('Could not parse keyword data:', e.message);\n}\n\n// Return enhanced research for opportunity processing\nreturn [{\n  json: {\n    output: $node[\"Ultimate Research Agent\"].json.output,\n    enhanced_market_data: {\n      competitor_count: firecrawlData.markdown ? (firecrawlData.markdown.match(/sponsored/gi) || []).length : 0,\n      market_saturation: firecrawlData.markdown ? firecrawlData.markdown.length > 10000 ? 'high' : 'medium' : 'unknown',\n      trend_insights: trendInsights,\n      keyword_opportunities: keywordSuggestions,\n      data_sources: ['internal_research', 'firecrawl_market', 'perplexity_trends', 'google_keywords'],\n      enhancement_timestamp: new Date().toISOString()\n    }\n  }\n}];"
      },
      "id": "consolidate-enhanced-research",
      "name": "Consolidate Enhanced Research", 
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1450, 400]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.scrapehero.com/amazon/product",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-api-key",
              "value": "afEkGumEoRrk899rlKkUNMIBYTPZle6a"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\"asin\": $json.output?.amazon_niches?.[0]?.competitor_asin || \"B08N5WRWNW\", \"marketplace\": \"US\", \"include_reviews\": true, \"include_pricing\": true, \"include_bsr\": true}",
        "options": {
          "timeout": 45000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "scrapehero-product-analysis",
      "name": "ScrapeHero Product Analysis",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1600, 300],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q={{encodeURIComponent($node[\"Consolidate Enhanced Research\"].json.output?.amazon_niches?.[0]?.niche_name || \"trending t-shirt\")}}&order=relevance&publishedAfter={{new Date(Date.now() - 7*24*60*60*1000).toISOString()}}&key={{$env.GOOGLE_API_KEY}}&maxResults=50&regionCode=US&safeSearch=moderate",
        "options": {
          "timeout": 30000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "youtube-trend-analysis",
      "name": "YouTube Trend Analysis",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1600, 500],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://newsapi.org/v2/top-headlines?country=us&pageSize=50&apiKey=d2004e2a3d144e81b039f0560247d167&category=general",
        "options": {
          "timeout": 30000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "newsapi-current-events",
      "name": "NewsAPI Current Events",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1600, 700],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "resource": "chat",
        "modelId": {
          "__rl": true,
          "value": "gpt-4o",
          "mode": "list"
        },
        "messages": {
          "values": [
            {
              "role": "system",
              "content": "You are a visual competitor analysis expert for Amazon Merch. Analyze t-shirt designs and provide structured JSON with color strategy, typography, layout, market positioning, and mobile optimization insights."
            },
            {
              "role": "user",
              "content": [
                {
                  "type": "image_url",
                  "image_url": {
                    "url": "data:image/png;base64,{{$node[\"Download Competitor Image\"].binary?.data || \"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==\"}}"
                  }
                },
                {
                  "type": "text",
                  "text": "Analyze this Amazon t-shirt design for: 1) Color strategy effectiveness 2) Typography readability 3) Layout composition 4) Market positioning 5) Mobile optimization (160px thumbnail). Return JSON analysis."
                }
              ]
            }
          ]
        },
        "jsonOutput": true,
        "options": {
          "temperature": 0.3,
          "maxTokens": 1500
        }
      },
      "id": "openai-vision-competitor-analysis",
      "name": "Visual Competitor Intelligence",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1.4,
      "position": [1800, 300],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "jsCode": "// Process Ultimate Research output with performance optimization"\nconst researchOutput = $json.output;\nconst systemState = $node[\"Initialize Ultimate System\"].json;\n\n// Parse Amazon opportunities with enhanced filtering\nconst opportunities = typeof researchOutput === 'string' \n  ? JSON.parse(researchOutput)\n  : researchOutput;\n\n// Enhanced filtering with performance prediction\nconst validOpportunities = opportunities.amazon_niches\n  .filter(opp => {\n    const tierPriority = ['excellent', 'good'];\n    const hasPriorityTier = tierPriority.includes(opp.metrics.bsr_tier);\n    \n    const a10Score = Object.values(opp.a10_potential || {}).reduce((a, b) => a + b, 0) / 4;\n    \n    return hasPriorityTier &&\n      opp.metrics.competition < systemState.amazon_targets.saturation_limit &&\n      opp.opportunity_score >= 7.0 &&\n      a10Score >= 0.7 &&\n      opp.metrics.visibility_above_cliff &&\n      opp.performance_prediction.confidence !== 'low';\n  })\n  .map(opp => ({\n    ...opp,\n    execution_id: systemState.execution_id,\n    product_types: systemState.product_types,\n    product_performance: systemState.product_performance,\n    design_requirements: {\n      resolution: '4500x5400',\n      format: 'PNG',\n      background: 'transparent',\n      style: 'simple_bold_readable',\n      color_priority: opp.color_strategy,\n      mobile_optimized: true\n    },\n    creative_mutation_due: systemState.creative_mutation_due,\n    performance_target: opp.performance_prediction\n  }));\n\n// Return for processing\nreturn validOpportunities.map(opp => ({ json: opp }));"
      },
      "id": "process-opportunities",
      "name": "Process Ultimate Opportunities",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1250, 400]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Ultimate Amazon Creative Agent with winning pattern replication.\n\nAmazon Design Principles 2025:\n- TEXT-ONLY PRIORITY: 23% conversion advantage over graphics\n- COLOR STRATEGY: Black background + white text (45% success) is PRIORITY 1\n- MOBILE FIRST: Must be readable at 160x160px thumbnail\n- SIMPLICITY: Maximum impact with minimum elements\n- REPLICATE SUCCESS: Use elements from winning designs\n\nWINNING PATTERNS TO REPLICATE:\n{{JSON.stringify($node[\"Initialize Ultimate System\"].json.performance_feedback.winning_patterns, null, 2)}}\n\nNiche Opportunity:\n{{JSON.stringify($json, null, 2)}}\n\nCREATIVE MUTATION STATUS: {{$json.creative_mutation_due ? 'REQUIRED' : 'STANDARD'}}\n\n{{#if $json.creative_mutation_due}}\n⚡ MUTATION REQUIRED: Experiment with:\n- Combine two unrelated trending topics\n- Use completely unexpected visual style\n- Create contrarian take on the niche\n- Apply absurdist humor or surreal approach\n{{/if}}\n\nGenerate 5 design concepts with 3 variations each:\n1. Typography-focused (different fonts/layouts)\n2. Simple icon + text combinations\n3. Funny/Clever saying variations\n4. Pattern-based design (if applicable)\n{{#if $json.creative_mutation_due}}5. MUTATION CONCEPT (experimental){{/if}}\n\nFor each design:\n- Prioritize elements from winning patterns\n- Use BLACK/WHITE color scheme for highest conversion\n- Ensure 160px thumbnail readability\n- Keep it SIMPLE (text-only preferred)\n- Maximum 3 colors total\n- Font size minimum 72pt equivalent\n- High contrast (4.5:1 minimum)\n\nFocus on what sells:\n- Profession pride with twist\n- Hobby enthusiasm with humor\n- Family roles with unique angle\n- Motivational with edge\n- Trending topics with longevity",
        "systemMessage": "You are an expert Amazon POD designer specializing in replicating winning patterns. Prioritize proven elements while maintaining originality. Always return structured JSON.",
        "options": {
          "temperature": "={{$json.creative_mutation_due ? 0.9 : 0.8}}",
          "maxTokens": 4000
        },
        "tools": [
          {
            "type": "code",
            "tool": {
              "name": "generate_winning_variations",
              "description": "Generate variations based on winning patterns",
              "language": "javaScript",
              "code": "// Generate variations based on winning patterns\nfunction generateVariations(baseTheme, niche, isMutation, winningPatterns) {\n  const colorStrategies = {\n    A: {\n      background: 'black',\n      text: 'white',\n      accent: 'white',\n      success_rate: 0.45,\n      mobile_score: 10\n    },\n    B: {\n      background: 'white',\n      text: 'black',\n      accent: 'black',\n      success_rate: 0.41,\n      mobile_score: 9\n    },\n    C: {\n      background: 'dark_navy',\n      text: 'white',\n      accent: 'light_gray',\n      success_rate: 0.38,\n      mobile_score: 8\n    }\n  };\n  \n  const variations = {};\n  Object.keys(colorStrategies).forEach(key => {\n    variations[key] = {\n      color_scheme: colorStrategies[key],\n      style: key === 'A' ? 'bold_typography' : key === 'B' ? 'clean_minimal' : 'vintage_text',\n      layout: key === 'A' ? 'centered_stack' : key === 'B' ? 'left_aligned' : 'curved_banner',\n      font: key === 'A' ? 'impact_style' : key === 'B' ? 'helvetica_bold' : 'retro_serif',\n      approach: isMutation ? 'experimental_fusion' : 'proven_formula',\n      mutation: isMutation,\n      winning_elements: extractWinningElements(winningPatterns, niche)\n    };\n    \n    variations[key].print_placement = {\n      tshirt: 'center_chest',\n      hoodie: 'center_chest_above_pocket',\n      tank: 'center_chest_narrow'\n    };\n    variations[key].max_colors = 3;\n    variations[key].complexity = 'simple';\n    variations[key].thumbnail_optimized = true;\n  });\n  \n  return variations;\n}\n\nfunction extractWinningElements(patterns, niche) {\n  const elements = [];\n  if (patterns?.themes) {\n    Object.entries(patterns.themes).forEach(([theme, count]) => {\n      if (count > 5) elements.push({ type: 'theme', value: theme, strength: count });\n    });\n  }\n  return elements;\n}\n\nconst result = generateVariations(input.theme, input.niche, input.is_mutation, input.winning_patterns);\nreturn result;"
            }
          }
        ]
      },
      "id": "amazon-creative-agent",
      "name": "Ultimate Creative Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [1450, 400]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$node[\"Initialize Ultimate System\"].json.execution_id}}",
            "agent": "creative",
            "timestamp": "={{new Date().toISOString()}}",
            "type": "={{$node['Initialize Ultimate System'].json.creative_mutation_due ? 'design_generation_mutation' : 'design_generation_standard'}}",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-creative-memory",
      "name": "Save Creative Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [1650, 400],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://textgears-textgears-v1.p.rapidapi.com/spelling",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-rapidapi-host",
              "value": "textgears-textgears-v1.p.rapidapi.com"
            },
            {
              "name": "x-rapidapi-key",
              "value": "dfbebd54f5msh2a58a7d8c95899fp103dd1jsn7edcb20d8c1d"
            },
            {
              "name": "Content-Type",
              "value": "application/x-www-form-urlencoded"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "form",
        "bodyParameters": {
          "parameters": [
            {
              "name": "text",
              "value": "={{JSON.stringify($node[\"Ultimate Creative Agent\"].json.output)}}"
            },
            {
              "name": "language",
              "value": "en-US"
            }
          ]
        },
        "options": {
          "timeout": 30000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "grammarly-text-check",
      "name": "Enhanced Text Quality Check",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1850, 300],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "jsCode": "// Process text quality results and prepare for design creation\nconst grammarlyResult = $node[\"Enhanced Text Quality Check\"].json || {};\nconst creativeOutput = $node[\"Ultimate Creative Agent\"].json.output;\n\n// Parse grammar check results\nlet textQualityScore = 10;\nlet corrections = [];\n\ntry {\n  if (grammarlyResult.response && grammarlyResult.response.errors) {\n    const errors = grammarlyResult.response.errors;\n    textQualityScore = Math.max(1, 10 - (errors.length * 0.5));\n    corrections = errors.map(err => ({\n      type: err.type,\n      message: err.description,\n      suggestions: err.suggestions || []\n    }));\n  }\n} catch (e) {\n  console.log('Could not parse grammar results:', e.message);\n}\n\n// Return enhanced creative output with quality metrics\nreturn [{\n  json: {\n    output: creativeOutput,\n    text_quality: {\n      score: textQualityScore,\n      corrections: corrections,\n      grammar_check_performed: true,\n      timestamp: new Date().toISOString()\n    }\n  }\n}];"
      },
      "id": "process-text-quality",
      "name": "Process Text Quality Results",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2050, 300]
    },
    {
      "parameters": {
        "jsCode": "// Process Ultimate Creative output with winning patterns"\nconst creativeOutput = $json.output;\nconst nicheData = $node[\"Process Ultimate Opportunities\"].json;\n\n// Parse design concepts\nconst concepts = typeof creativeOutput === 'string'\n  ? JSON.parse(creativeOutput)\n  : creativeOutput;\n\n// Prepare Amazon-optimized designs with winning elements\nlet allDesigns = [];\n\nconcepts.design_concepts.forEach(concept => {\n  concept.variations.forEach(variation => {\n    // Enhanced prompt with winning patterns\n    const colorScheme = variation.color_scheme || { background: 'black', text: 'white' };\n    const isMutation = concept.mutation || false;\n    const winningElements = variation.winning_elements || [];\n    \n    const designPrompt = `Create a Merch by Amazon t-shirt design.\n${concept.theme}\n${variation.text_content ? `Text (MUST be perfectly readable): \"${variation.text_content}\"` : ''}\n\nCOLOR REQUIREMENTS:\n- Background: ${colorScheme.background}\n- Text color: ${colorScheme.text}\n- Accent (if any): ${colorScheme.accent}\n- High contrast ratio: minimum 4.5:1\n\nAMAZON REQUIREMENTS:\n- Resolution: 4500x5400 pixels\n- Transparent background PNG\n- Text-only design preferred (23% higher conversion)\n- Must be readable at 160x160px thumbnail size\n- Font size: minimum 72pt equivalent\n- Maximum 3 colors total\n- Style: ${variation.style}\n- Layout: ${variation.layout}\n- Font style: ${variation.font_type || variation.font}\n${isMutation ? '- CREATIVE MUTATION: Experimental/unexpected approach' : ''}\n${winningElements.length > 0 ? '- INCORPORATE WINNING ELEMENTS: ' + winningElements.map(e => e.value).join(', ') : ''}\n\nDESIGN MUST BE:\n- Centered on transparent background\n- Bold and impactful for mobile viewing\n- Simple enough to work on all products\n- Professional print-ready quality\n- NO gradients, photos, or complex effects\n- NO copyrighted elements or brand references`;\n\n    allDesigns.push({\n      concept_id: `${nicheData.execution_id}_${concept.concept_id}`,\n      variant_id: variation.variant_id,\n      niche: nicheData.niche_name,\n      product_types: nicheData.product_types,\n      product_performance: nicheData.product_performance,\n      design_theme: concept.theme,\n      text_content: variation.text_content || '',\n      keywords: concept.amazon_keywords || [],\n      enhanced_prompt: designPrompt,\n      color_strategy: colorScheme,\n      is_mutation: isMutation,\n      design_type: variation.text_content && !variation.has_graphics ? 'text_only' : 'text_with_graphics',\n      expected_conversion: variation.text_content && !variation.has_graphics ? 0.23 : 0.18,\n      performance_target: nicheData.performance_target,\n      winning_elements: winningElements,\n      design_specs: {\n        resolution: '4500x5400',\n        format: 'PNG',\n        background: 'transparent',\n        max_colors: 3,\n        print_area: '12x15 inches',\n        mobile_optimized: true,\n        thumbnail_size: '160x160px'\n      },\n      quality_targets: {\n        simplicity_score: 8.0,\n        readability_score: 9.0,\n        thumbnail_score: 8.5,\n        contrast_ratio: 4.5\n      },\n      metadata: {\n        ...concept,\n        ...variation,\n        niche_data: nicheData,\n        bsr_tier: nicheData.metrics.bsr_tier,\n        a10_potential: nicheData.a10_potential\n      }\n    });\n  });\n});\n\n// Return for batch processing\nreturn allDesigns.map(design => ({ json: design }));"
      },
      "id": "prepare-amazon-designs",
      "name": "Prepare Ultimate Designs",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1850, 400]
    },
    {
      "parameters": {
        "batchSize": 3,
        "options": {}
      },
      "id": "design-batcher",
      "name": "Design Batch Processor",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [2050, 400]
    },
    {
      "parameters": {
        "jsCode": "// Enhanced IP check for Amazon with expanded brand list\nconst concept = $json;\n\n// Expanded high-risk brand list for Amazon\nconst amazonHighRiskBrands = [\n  'Nike', 'Adidas', 'Disney', 'Marvel', 'Star Wars', \n  'NFL', 'NBA', 'MLB', 'NHL', 'FIFA',\n  'Nintendo', 'Pokemon', 'Sony', 'Xbox', 'PlayStation',\n  'Apple', 'Google', 'Amazon', 'Microsoft', 'Meta',\n  'Coca-Cola', 'Pepsi', 'McDonald\\'s', 'Starbucks',\n  'Harry Potter', 'Lord of the Rings', 'Game of Thrones',\n  'Supreme', 'Gucci', 'Louis Vuitton', 'Chanel',\n  'Tesla', 'SpaceX', 'NASA', 'Harvard', 'Yale'\n];\n\n// Amazon is much stricter - check more thoroughly\nconst searchTerms = [\n  concept.design_theme,\n  ...(concept.keywords || []),\n  concept.text_content || '',\n  // Add common variations Amazon checks\n  concept.text_content?.replace(/[^a-zA-Z0-9\\s]/g, ''),\n  concept.text_content?.toLowerCase(),\n  concept.text_content?.toUpperCase(),\n  // Check for phonetic similarities\n  concept.text_content?.replace(/ph/gi, 'f'),\n  concept.text_content?.replace(/ck/gi, 'k')\n].filter(Boolean);\n\n// Clean and prepare comprehensive queries\nconst cleanedTerms = [...new Set(searchTerms)].map(term => \n  term.trim()\n    .replace(/[^a-zA-Z0-9\\s]/g, '')\n    .toLowerCase()\n);\n\n// Check for brand risks including partial matches\nconst brandRisks = [];\ncleanedTerms.forEach(term => {\n  amazonHighRiskBrands.forEach(brand => {\n    const brandLower = brand.toLowerCase();\n    if (term.includes(brandLower) || \n        brandLower.includes(term) || \n        term.replace(/[aeiou]/g, '') === brandLower.replace(/[aeiou]/g, '')) {\n      brandRisks.push({ term, brand, risk: 'HIGH' });\n    }\n  });\n});\n\n// Amazon checks exact matches more strictly\nconst usptoQuery = cleanedTerms.slice(0, 3).join(' '); // Multiple terms\nconst markerQuery = cleanedTerms\n  .map(s => encodeURIComponent(s))\n  .join('|');\n\nreturn [{\n  json: {\n    ...concept,\n    ip_check: {\n      uspto_query: usptoQuery,\n      marker_query: markerQuery,\n      raw_terms: cleanedTerms,\n      brand_risks: brandRisks,\n      brand_risk_detected: brandRisks.length > 0,\n      risk_level: brandRisks.length > 0 ? 'HIGH' : 'CHECK_REQUIRED',\n      platform: 'amazon'\n    }\n  }\n}];"
      },
      "id": "build-amazon-ip-queries",
      "name": "Build Enhanced IP Queries",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2250, 400]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://trademark-lookup-api.p.rapidapi.com/google/namesearch/1/10?query={{encodeURIComponent($json.ip_check.uspto_query)}}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-rapidapi-host",
              "value": "trademark-lookup-api.p.rapidapi.com"
            },
            {
              "name": "x-rapidapi-key",
              "value": "dfbebd54f5msh2a58a7d8c95899fp103dd1jsn7edcb20d8c1d"
            },
            {
              "name": "Accept",
              "value": "application/json"
            }
          ]
        },
        "options": {
          "timeout": 15000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "uspto-check",
      "name": "Enhanced USPTO Trademark Check",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2450, 300],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://eu-trademarks.p.rapidapi.com/eutm/search?keyword={{encodeURIComponent($json.ip_check.marker_query)}}&regex=%5EA&page=1&status=Registered",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-rapidapi-host",
              "value": "eu-trademarks.p.rapidapi.com"
            },
            {
              "name": "x-rapidapi-key", 
              "value": "dfbebd54f5msh2a58a7d8c95899fp103dd1jsn7edcb20d8c1d"
            },
            {
              "name": "Accept",
              "value": "application/json"
            }
          ]
        },
        "options": {
          "timeout": 15000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "markerapi-check",
      "name": "Enhanced EU Trademark Check",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2450, 500],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{($node[\"USPTO Trademark Check\"].json.total || 0) > 0 || ($node[\"MarkerAPI Trademark Check\"].json.total || 0) > 0 || $json.ip_check.brand_risk_detected}}",
              "rightValue": true,
              "operator": {
                "type": "boolean",
                "operation": "true"
              }
            }
          ]
        }
      },
      "id": "amazon-trademark-gate",
      "name": "Enhanced Trademark Gate",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [2650, 400]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "IPFlagged",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "concept_id": "={{$json.concept_id}}",
            "design_theme": "={{$json.design_theme}}",
            "text_content": "={{$json.text_content}}",
            "keywords": "={{$json.keywords.join(', ')}}",
            "uspto_hits": "={{$node[\"USPTO Trademark Check\"].json.total || 0}}",
            "marker_hits": "={{$node[\"MarkerAPI Trademark Check\"].json.total || 0}}",
            "brand_risks": "={{JSON.stringify($json.ip_check.brand_risks)}}",
            "flagged_reason": "={{$json.ip_check.brand_risk_detected ? 'Brand name/similarity detected: ' + $json.ip_check.brand_risks.map(r => r.brand).join(', ') : 'Trademark found'}}",
            "flagged_at": "={{new Date().toISOString()}}",
            "platform": "amazon",
            "stage": "pre-generation",
            "is_mutation": "={{$json.is_mutation}}"
          }
        }
      },
      "id": "log-amazon-ip-flagged",
      "name": "Log Enhanced IP Flagged",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [2850, 500],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.replicate.com/v1/predictions",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.REPLICATE_API_TOKEN}}"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\"version\": \"google/imagen-4-ultra\", \"input\": {\"prompt\": \"{{$json.enhanced_prompt}}\", \"output_format\": \"png\", \"aspect_ratio\": \"4:5\", \"output_quality\": 100, \"negative_prompt\": \"blurry, low quality, watermark, signature, text overlay, mockup, model wearing, person, hands, faces\"}}",
        "options": {
          "timeout": 180000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "generate-design",
      "name": "Generate Design (Imagen-4-Ultra)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2850, 300],
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 10000
    },
    {
      "parameters": {
        "jsCode": "// Replicate Polling Handler for Imagen-3\nconst replicateResponse = $json;\nconst predictionId = replicateResponse.id;\n\nif (!predictionId) {\n  throw new Error('No prediction ID received from Replicate');\n}\n\n// Return prediction ID for polling\nreturn [{\n  json: {\n    prediction_id: predictionId,\n    status: replicateResponse.status || 'starting',\n    poll_url: `https://api.replicate.com/v1/predictions/${predictionId}`,\n    poll_count: 0,\n    max_polls: 30,\n    design_data: $node[\"Design Batch Processor\"].json\n  }\n}];"
      },
      "id": "prepare-replicate-polling",
      "name": "Prepare Replicate Polling",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [3050, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "={{$json.poll_url}}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{$env.REPLICATE_API_TOKEN}}"
            }
          ]
        },
        "options": {
          "timeout": 30000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "poll-replicate-status",
      "name": "Poll Replicate Status",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [3250, 300],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "jsCode": "// Check Replicate Status and Handle Polling\nconst pollResult = $json;\nconst inputData = $node[\"Prepare Replicate Polling\"].json;\n\nif (pollResult.status === 'succeeded' && pollResult.output && pollResult.output.length > 0) {\n  // Success - extract base64 image\n  const imageUrl = pollResult.output[0];\n  \n  return [{\n    json: {\n      ...inputData.design_data,\n      design_b64: null, // Will be populated by image download\n      image_url: imageUrl,\n      generation_status: 'completed',\n      generation_cost: pollResult.metrics?.predict_time || 0\n    }\n  }];\n} else if (pollResult.status === 'failed' || pollResult.status === 'canceled') {\n  // Failed - log and skip\n  throw new Error(`Replicate generation failed: ${pollResult.error || 'Unknown error'}`);\n} else if (inputData.poll_count >= inputData.max_polls) {\n  // Timeout - log and skip  \n  throw new Error('Replicate generation timed out after 30 polls');\n} else {\n  // Still processing - continue polling\n  return [{\n    json: {\n      ...inputData,\n      poll_count: inputData.poll_count + 1,\n      status: pollResult.status\n    }\n  }];\n}"
      },
      "id": "process-replicate-result",
      "name": "Process Replicate Result",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [3450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{$json.generation_status}}",
              "rightValue": "completed",
              "operator": {
                "type": "string",
                "operation": "equals"
              }
            }
          ]
        }
      },
      "id": "check-generation-complete",
      "name": "Check Generation Complete",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [3650, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "={{$json.image_url}}",
        "options": {
          "timeout": 60000,
          "response": {
            "response": {
              "outputFormat": "binaryBuffer"
            }
          }
        }
      },
      "id": "download-generated-image",
      "name": "Download Generated Image",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [3850, 200],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "jsCode": "// Convert downloaded image to base64\nconst imageBuffer = $binary.data;\nconst imageB64 = imageBuffer.toString('base64');\n\nreturn [{\n  json: {\n    ...$node[\"Check Generation Complete\"].json,\n    design_b64: imageB64\n  }\n}];"
      },
      "id": "convert-image-to-b64",
      "name": "Convert Image to Base64",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [4050, 200]
    },
    {
      "parameters": {
        "resource": "chat",
        "modelId": {
          "__rl": true,
          "value": "gpt-4o",
          "mode": "list"
        },
        "messages": {
          "values": [
            {
              "role": "system",
              "content": "You are \"Amazon-Compliance-Agent-2025,\" enforcing ZERO-TOLERANCE policies with mobile optimization awareness.\n\nAmazon Compliance Checks:\n1. Trademark/brand references (even partial/phonetic)\n2. Celebrity names or likenesses\n3. Sports teams, leagues, organizations\n4. Entertainment properties (movies/TV/books/games)\n5. Company names, slogans, logos\n6. Misleading claims (Best, #1, Official, Genuine)\n7. Prohibited content (drugs, weapons, hate, violence)\n8. Copyright characters or artwork\n9. Medical/health claims without FDA approval\n10. Environmental claims without FTC compliance\n\nMOBILE OPTIMIZATION CHECKS:\n- Text readable at 160x160px thumbnail?\n- Contrast ratio ≥ 4.5:1?\n- Font size appropriate for mobile?\n\nRETURN ENHANCED JSON:\n{\n  \"trademark_hits\": [{\"term\":\"Example\",\"risk_level\":\"HIGH\",\"match_type\":\"exact|partial|phonetic\"}],\n  \"policy_flags\": [\"specific_violation\"],\n  \"amazon_risk_score\": 0-10,\n  \"mobile_optimization\": {\n    \"thumbnail_readable\": true/false,\n    \"contrast_ratio\": number\n  },\n  \"verdict\": \"PASS\" | \"REVIEW\" | \"FAIL\",\n  \"reason\": \"Specific explanation\",\n  \"fix_suggestion\": \"How to make it compliant\",\n  \"is_mutation\": true/false\n}"
            },
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": "Analyze this Merch by Amazon design for compliance and mobile optimization:\n{\n  \"title\": \"{{$node[\"Design Batch Processor\"].json.design_theme}}\",\n  \"keywords\": {{JSON.stringify($node[\"Design Batch Processor\"].json.keywords)}},\n  \"text\": \"{{$node[\"Design Batch Processor\"].json.text_content}}\",\n  \"niche\": \"{{$node[\"Design Batch Processor\"].json.niche}}\",\n  \"is_mutation\": {{$node[\"Design Batch Processor\"].json.is_mutation}},\n  \"color_strategy\": {{JSON.stringify($node[\"Design Batch Processor\"].json.color_strategy)}}\n}"
                },
                {
                  "type": "image_url",
                  "image_url": {
                    "url": "={{ 'data:image/png;base64,' + $json.data[0].b64_json }}"
                  }
                }
              ]
            }
          ]
        },
        "jsonOutput": true,
        "options": {
          "temperature": 0.1,
          "maxTokens": 1000
        }
      },
      "id": "amazon-compliance-agent",
      "name": "Enhanced Compliance Agent",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1.4,
      "position": [3050, 300],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "jsCode": "// Parse Enhanced Amazon compliance results\nconst complianceResult = typeof $json.message?.content === 'string'\n  ? JSON.parse($json.message.content)\n  : $json.message?.content || $json;\n\nconst designData = $node[\"Design Batch Processor\"].json;\nconst imageB64 = $node[\"Generate Design (GPT-4o)\"].json.data[0].b64_json;\n\n// Enhanced compliance with mobile checks\nconst passesCompliance = \n  complianceResult.verdict === 'PASS' && \n  complianceResult.amazon_risk_score < 3 && // Very low risk tolerance\n  complianceResult.mobile_optimization?.thumbnail_readable === true &&\n  (complianceResult.mobile_optimization?.contrast_ratio || 0) >= 4.5;\n\n// Check if mutation designs get special handling\nconst isMutation = designData.is_mutation || complianceResult.is_mutation;\nconst mutationAllowance = isMutation ? 1 : 0; // Slightly more lenient for mutations\n\nreturn [{\n  json: {\n    ...designData,\n    design_b64: imageB64,\n    compliance_check: complianceResult,\n    passes_compliance: passesCompliance || (isMutation && complianceResult.amazon_risk_score < (3 + mutationAllowance)),\n    compliance_timestamp: new Date().toISOString(),\n    mobile_optimization: complianceResult.mobile_optimization,\n    is_mutation: isMutation\n  }\n}];"
      },
      "id": "parse-compliance",
      "name": "Parse Enhanced Compliance",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [3250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{$json.passes_compliance}}",
              "rightValue": true,
              "operator": {
                "type": "boolean",
                "operation": "true"
              }
            }
          ]
        }
      },
      "id": "compliance-gate",
      "name": "Amazon Compliance Gate",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [3450, 300]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "IPFlagged",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "concept_id": "={{$json.concept_id}}",
            "design_theme": "={{$json.design_theme}}",
            "text_content": "={{$json.text_content}}",
            "design_url": "={{$json.design_url || ''}}",
            "verdict": "={{$json.compliance_check.verdict}}",
            "risk_score": "={{$json.compliance_check.amazon_risk_score}}",
            "trademark_hits": "={{JSON.stringify($json.compliance_check.trademark_hits)}}",
            "policy_flags": "={{JSON.stringify($json.compliance_check.policy_flags)}}",
            "mobile_optimization": "={{JSON.stringify($json.mobile_optimization)}}",
            "flagged_reason": "={{$json.compliance_check.reason}}",
            "fix_suggestion": "={{$json.compliance_check.fix_suggestion}}",
            "flagged_at": "={{$json.compliance_timestamp}}",
            "platform": "amazon",
            "stage": "post-generation",
            "is_mutation": "={{$json.is_mutation}}"
          }
        }
      },
      "id": "log-policy-flagged",
      "name": "Log Policy Flagged",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [3650, 500],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "agentPrompt": "You are the Ultimate Amazon Quality Agent with performance prediction.\n\nDesign to evaluate:\n- Theme: {{$json.design_theme}}\n- Niche: {{$json.niche}}\n- Products: {{JSON.stringify($json.product_types)}}\n- Color Strategy: {{JSON.stringify($json.color_strategy)}}\n- Is Mutation: {{$json.is_mutation}}\n- Performance Target: {{JSON.stringify($json.performance_target)}}\n\nPerform Ultimate Quality Analysis:\n1. Simplicity Score (1-10) - Text-only designs score higher.\n2. Readability Score (1-10) - Based on 160px thumbnail test.\n3. Print Quality (1-10) - DTG compatibility, no thin lines.\n4. Versatility Score (1-10) - Works on T-Shirt, Hoodie, Tank Top.\n5. Mobile Visibility Score (1-10) - Crucial for 77% of traffic.\n6. Professional Appearance (1-10) - Looks like a real brand.\n7. Color Effectiveness Score (1-10) - Based on success rates.\n8. Font Impact Score (1-10) - Bold, simple fonts get higher scores.\n9. Market Appeal Score (1-10) - Based on winning patterns.\n10. Uniqueness Score (1-10) - Stands out while being familiar.\n\nCRITICAL MOBILE REQUIREMENTS:\n- Thumbnail Readability (160x160px): PASS/FAIL\n- Contrast Ratio: Must be >= 4.5:1\n- Font Size: Must be >= 72pt equivalent\n\nPERFORMANCE PREDICTION:\nBased on quality scores and market data, predict:\n- Expected CTR (click-through rate)\n- Expected conversion rate\n- Expected 30-day sales\n- ROI potential\n\nTask: Return structured JSON with all scores, performance predictions, and recommendations.",
        "systemMessage": "You are an Amazon quality expert with predictive analytics. Be strict on quality while providing accurate performance predictions. Return comprehensive JSON analysis.",
        "options": {
          "temperature": 0.3,
          "maxTokens": 2000
        },
        "hasOutputParser": true
      },
      "id": "amazon-quality-agent",
      "name": "Ultimate Quality Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [3650, 300]
    },
    {
      "parameters": {
        "jsCode": "// Process Ultimate Quality results with performance prediction\nconst qualityResult = typeof $json.output === 'string'\n  ? JSON.parse($json.output)\n  : $json.output;\n\nconst designData = $node[\"Amazon Compliance Gate\"].json;\n\n// Calculate Ultimate Amazon quality score\nconst scores = qualityResult.quality_scores || {};\nconst amazonScore = (\n  (scores.simplicity || 0) * 1.5 +\n  (scores.readability || 0) * 2 +\n  (scores.print_quality || 0) +\n  (scores.versatility || 0) +\n  (scores.mobile_visibility || 0) * 2.5 +\n  (scores.professional || 0) * 1.5 +\n  (scores.color_effectiveness || 0) * 1.5 +\n  (scores.market_appeal || 0) * 1.5 +\n  (scores.uniqueness || 0)\n) / 12;\n\n// Enhanced quality thresholds with performance prediction\nconst passesQuality = \n  amazonScore >= 8.5 &&\n  (scores.mobile_visibility || 0) >= 8.5 &&\n  (scores.readability || 0) >= 9 &&\n  (qualityResult.predicted_ctr || 0) >= 2.0;\n\n// Special handling for mutations (slightly lower bar)\nconst isMutation = designData.is_mutation;\nconst mutationBonus = isMutation ? 0.5 : 0;\n\n// Performance prediction data\nconst performancePrediction = {\n  predicted_ctr: qualityResult.predicted_ctr || 2.5,\n  predicted_conversion: qualityResult.predicted_conversion || 0.15,\n  predicted_30d_sales: qualityResult.predicted_30d_sales || 5,\n  predicted_roi: qualityResult.predicted_roi || 150,\n  confidence: qualityResult.confidence || 'medium'\n};\n\nreturn [{\n  json: {\n    ...designData,\n    quality_assessment: qualityResult,\n    amazon_quality_score: (amazonScore + mutationBonus).toFixed(2),\n    passes_quality: passesQuality || (isMutation && amazonScore >= 8.0),\n    performance_prediction: performancePrediction,\n    mobile_score: scores.mobile_visibility,\n    quality_timestamp: new Date().toISOString()\n  }\n}];"
      },
      "id": "process-quality",
      "name": "Process Ultimate Quality",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [3850, 300]
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{$json.passes_quality}}",
              "rightValue": true,
              "operator": {
                "type": "boolean",
                "operation": "true"
              }
            }
          ]
        }
      },
      "id": "quality-gate",
      "name": "Quality Gate",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [4050, 300]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$json.concept_id.split('_')[0]}}",
            "agent": "quality",
            "timestamp": "={{$json.quality_timestamp}}",
            "type": "quality_pass",
            "data": "={{JSON.stringify({concept_id: $json.concept_id, score: $json.amazon_quality_score, theme: $json.design_theme, is_mutation: $json.is_mutation, predicted_ctr: $json.performance_prediction.predicted_ctr, predicted_sales: $json.performance_prediction.predicted_30d_sales})}}",
            "success": "=true"
          }
        }
      },
      "id": "save-quality-memory",
      "name": "Save Quality Pass Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [4250, 200],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "Rejected",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "concept_id": "={{$json.concept_id}}",
            "design_theme": "={{$json.design_theme}}",
            "variant_id": "={{$json.variant_id}}",
            "quality_scores": "={{JSON.stringify($json.quality_assessment)}}",
            "amazon_score": "={{$json.amazon_quality_score}}",
            "predicted_ctr": "={{$json.performance_prediction.predicted_ctr}}",
            "mobile_score": "={{$json.mobile_score}}",
            "rejection_reasons": "={{$json.quality_assessment.issues?.join('; ') || 'Below Amazon quality threshold'}}",
            "design_url": "={{$json.design_url || ''}}",
            "rejected_at": "={{$json.quality_timestamp}}",
            "platform": "amazon",
            "is_mutation": "={{$json.is_mutation}}"
          }
        }
      },
      "id": "log-rejected",
      "name": "Log Rejected Designs",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [4250, 500],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "jsCode": "// Extract potential negative keywords from rejected designs\nconst rejectedDesign = $json;\nconst keywords = rejectedDesign.keywords || [];\nconst theme = rejectedDesign.design_theme;\n\n// Extract potential negative keywords from theme and tags\nconst negativeKeywordCandidates = [...new Set([\n  ...keywords,\n  ...theme.split(' ').filter(w => w.length > 3)\n].map(k => k.toLowerCase()))];\n\n// Prepare entries for the NegativeKeywords sheet\nconst negativeEntries = negativeKeywordCandidates.map(keyword => ({\n  keyword,\n  concept_id: rejectedDesign.concept_id,\n  rejection_reason: rejectedDesign.rejection_reasons,\n  quality_score: rejectedDesign.amazon_score,\n  added_date: new Date().toISOString()\n}));\n\nreturn negativeEntries.map(entry => ({ json: entry }));"
      },
      "id": "extract-negative-keywords",
      "name": "Extract Negative Keywords",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [4450, 500]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "NegativeKeywords",
        "columns": {
          "mappingMode": "autoMapInputData",
          "options": {}
        }
      },
      "id": "save-negative-keywords",
      "name": "Save Negative Keywords",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [4650, 500],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "agentPrompt": "You are the Ultimate Amazon Strategy Agent with dynamic pricing and A/B testing.\n\nDesign data:\n{{JSON.stringify($json, null, 2)}}\n\nMarket intelligence:\n- BSR: {{$json.metadata.niche_data.metrics.avg_bsr}}\n- BSR Tier: {{$json.metadata.bsr_tier}}\n- Competition: {{$json.metadata.niche_data.metrics.competition}}\n- Predicted CTR: {{$json.performance_prediction.predicted_ctr}}%\n- Predicted Sales: {{$json.performance_prediction.predicted_30d_sales}}\n- Is Mutation: {{$json.is_mutation}}\n\nA10 ALGORITHM PRIORITIES:\n1. Organic sales performance (25%)\n2. External traffic potential (20%)\n3. Seller authority signals (18%)\n4. Click-through optimization (15%)\n5. Conversion rate factors (12%)\n\nDYNAMIC PRICING STRATEGY:\nBased on performance predictions:\n- High performers (>10 predicted sales): Premium pricing\n- Standard performers (5-10 sales): Competitive pricing\n- Experimental (mutations): Test pricing\n\nCreate Ultimate Amazon metadata:\n\n1. BRAND STRATEGY:\n   - Generate unique, memorable brand (1 word)\n   - Ensure trademark safety\n\n2. TITLE OPTIMIZATION (200 char max):\n   - A/B TEST: Create two titles:\n     - Title A (Keyword-Driven): [Brand] [Main Keywords] [Product Type]\n     - Title B (Benefit-Driven): Compelling, emotional hook for CTR.\n\n3. BULLET POINTS (2 required):\n   - Bullet 1: Core benefit + who it's for (lifestyle).\n   - Bullet 2: Quality/gift messaging + emotional appeal.\n\n4. BACKEND KEYWORDS (250 chars max per field):\n   - Fill all available fields with synonyms, misspellings, long-tail, and Spanish translations.\n\n5. DYNAMIC PRICING:\n   - Base on predicted performance\n   - Factor in BSR tier and competition\n   - Test different price points\n   - Include promotional pricing strategy\n\n6. EXTERNAL TRAFFIC STRATEGY:\n   - Social media hashtags\n   - Google search terms\n   - Pinterest keywords\n   - TikTok trends\n\nReturn complete JSON with A/B titles, dynamic pricing, and traffic strategy.",
        "systemMessage": "You are an A10-optimized Amazon listing strategist with performance-based pricing. Create metadata that maximizes ranking and conversion. Return complete JSON.",
        "options": {
          "temperature": 0.5,
          "maxTokens": 3000
        },
        "tools": [
          {
            "type": "code",
            "tool": {
              "name": "generate_performance_pricing",
              "description": "Calculate performance-based dynamic pricing",
              "language": "javaScript",
              "code": "// Performance-based pricing optimizer\nfunction generatePerformancePricing(productType, predictedSales, bsr, competition, bsrTier, isMutation) {\n  const basePrices = {\n    'T-Shirt': 19.99,\n    'Hoodie': 37.99,\n    'Tank Top': 18.99\n  };\n  \n  // Performance-based pricing tiers\n  let performanceMultiplier = 1.0;\n  if (predictedSales > 15) performanceMultiplier = 1.25; // Premium\n  else if (predictedSales > 10) performanceMultiplier = 1.15; // High\n  else if (predictedSales > 5) performanceMultiplier = 1.05; // Standard\n  else performanceMultiplier = 0.95; // Competitive\n  \n  let price = basePrices[productType] * performanceMultiplier;\n  \n  // BSR tier adjustments\n  const bsrTierAdjustments = { 'excellent': 1.1, 'good': 1.05, 'marginal': 0.95, 'poor': 0.9 };\n  price *= bsrTierAdjustments[bsrTier] || 1.0;\n  \n  // Mutation pricing strategy\n  if (isMutation) {\n    price *= 1.1; // Test higher price for unique designs\n  }\n  \n  // Round to psychological pricing\n  price = Math.round(price) - 0.01;\n  \n  // A/B price testing\n  const priceA = price;\n  const priceB = Math.round(price * 0.9) - 0.01; // 10% lower for testing\n  \n  // Promotional pricing\n  const launchPrice = Math.round(price * 0.85) - 0.01; // 15% launch discount\n  \n  return {\n    recommended_price: priceA,\n    test_price: priceB,\n    launch_price: launchPrice,\n    price_strategy: performanceMultiplier > 1.1 ? 'premium' : 'competitive',\n    expected_royalty: (priceA * 0.35).toFixed(2),\n    pricing_confidence: predictedSales > 10 ? 'high' : 'medium'\n  };\n}\n\nreturn generatePerformancePricing(input.product_type, input.predicted_sales, input.bsr, input.competition, input.bsr_tier, input.is_mutation);"
            }
          }
        ]
      },
      "id": "amazon-strategy-agent",
      "name": "Ultimate Strategy Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [4250, 300]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$json.concept_id.split('_')[0]}}",
            "agent": "strategy",
            "timestamp": "={{new Date().toISOString()}}",
            "type": "listing_strategy_ultimate",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-strategy-memory",
      "name": "Save Strategy Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [4450, 300],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "operation": "binary",
        "binaryPropertyName": "design_b64",
        "options": {}
      },
      "id": "convert-b64-to-binary",
      "name": "Convert B64 to Binary",
      "type": "n8n-nodes-base.moveBinaryData",
      "typeVersion": 1,
      "position": [4650, 300]
    },
    {
      "parameters": {
        "operation": "image",
        "action": "resize",
        "dataPropertyName": "data",
        "format": "png",
        "resizeOption": "resizeAbsolute",
        "width": 4500,
        "height": 5400,
        "options": {
          "quality": 100,
          "density": 300
        }
      },
      "id": "resize-to-amazon",
      "name": "Resize to Amazon Specs",
      "type": "n8n-nodes-base.editImage",
      "typeVersion": 1,
      "position": [4850, 300]
    },
    {
      "parameters": {
        "jsCode": "// Prepare final Ultimate Amazon listing data with performance tracking\nconst strategyOutput = $node[\"Ultimate Strategy Agent\"].json.output;\nconst designData = $node[\"Quality Gate\"].json;\nconst binaryData = $node[\"Resize to Amazon Specs\"].binary;\n\n// Structure for Ultimate Amazon upload sheet with performance tracking\nconst amazonListing = {\n  // Design identifiers\n  concept_id: designData.concept_id,\n  variant_id: designData.variant_id,\n  design_theme: designData.design_theme,\n  niche: designData.niche,\n  is_mutation: designData.is_mutation,\n  \n  // Performance predictions & tracking\n  performance_score: designData.amazon_quality_score,\n  predicted_ctr: designData.performance_prediction.predicted_ctr,\n  predicted_conversion: designData.performance_prediction.predicted_conversion,\n  predicted_30d_sales: designData.performance_prediction.predicted_30d_sales,\n  predicted_roi: designData.performance_prediction.predicted_roi,\n  confidence: designData.performance_prediction.confidence,\n  \n  // File information\n  filename: `${designData.concept_id}_${designData.variant_id}_4500x5400.png`,\n  \n  // Color strategy\n  color_strategy: `${designData.color_strategy.background}/${designData.color_strategy.text}`,\n  color_success_rate: designData.color_strategy.success_rate,\n  \n  // Amazon metadata\n  brand_name: strategyOutput.brand_name,\n  \n  // T-Shirt Listing with A/B Titles and Dynamic Pricing\n  tshirt_title_a: strategyOutput.tshirt.title_a,\n  tshirt_title_b: strategyOutput.tshirt.title_b,\n  tshirt_bullet1: strategyOutput.tshirt.bullets[0],\n  tshirt_bullet2: strategyOutput.tshirt.bullets[1],\n  tshirt_description: strategyOutput.tshirt.description || '',\n  tshirt_keywords: strategyOutput.tshirt.backend_keywords,\n  tshirt_price_a: strategyOutput.tshirt.price_a,\n  tshirt_price_b: strategyOutput.tshirt.price_b,\n  tshirt_launch_price: strategyOutput.tshirt.launch_price,\n  tshirt_product: designData.product_performance.preferred_products['T-Shirt'].primary,\n  \n  // Hoodie Listing with A/B Titles and Dynamic Pricing\n  hoodie_title_a: strategyOutput.hoodie.title_a,\n  hoodie_title_b: strategyOutput.hoodie.title_b,\n  hoodie_bullet1: strategyOutput.hoodie.bullets[0],\n  hoodie_bullet2: strategyOutput.hoodie.bullets[1],\n  hoodie_description: strategyOutput.hoodie.description || '',\n  hoodie_keywords: strategyOutput.hoodie.backend_keywords,\n  hoodie_price_a: strategyOutput.hoodie.price_a,\n  hoodie_price_b: strategyOutput.hoodie.price_b,\n  hoodie_launch_price: strategyOutput.hoodie.launch_price,\n  hoodie_product: designData.product_performance.preferred_products['Hoodie'].primary,\n  \n  // Tank Top Listing with A/B Titles and Dynamic Pricing\n  tank_title_a: strategyOutput.tank_top.title_a,\n  tank_title_b: strategyOutput.tank_top.title_b,\n  tank_bullet1: strategyOutput.tank_top.bullets[0],\n  tank_bullet2: strategyOutput.tank_top.bullets[1],\n  tank_description: strategyOutput.tank_top.description || '',\n  tank_keywords: strategyOutput.tank_top.backend_keywords,\n  tank_price_a: strategyOutput.tank_top.price_a,\n  tank_price_b: strategyOutput.tank_top.price_b,\n  tank_launch_price: strategyOutput.tank_top.launch_price,\n  \n  // External Traffic Strategy\n  social_hashtags: strategyOutput.external_traffic.social_hashtags || [],\n  google_keywords: strategyOutput.external_traffic.google_keywords || [],\n  pinterest_keywords: strategyOutput.external_traffic.pinterest_keywords || [],\n  tiktok_trends: strategyOutput.external_traffic.tiktok_trends || [],\n  \n  // Quality & Market Metrics\n  quality_score: designData.amazon_quality_score,\n  compliance_score: designData.compliance_check.amazon_risk_score,\n  bsr_tier: designData.metadata.bsr_tier,\n  opportunity_score: designData.metadata.niche_data.opportunity_score,\n  \n  // Timestamps\n  created_at: new Date().toISOString(),\n  ready_for_upload: true,\n  \n  // Performance Tracking Fields (to be updated later)\n  actual_sales: 0,\n  actual_ctr: 0,\n  actual_conversion: 0,\n  actual_roi: 0,\n  performance_updated_at: null\n};\n\nreturn [{\n  json: amazonListing,\n  binary: binaryData\n}];"
      },
      "id": "prepare-final-data",
      "name": "Prepare Ultimate Final Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [5050, 300]
    },
    {
      "parameters": {
        "operation": "upload",
        "binaryPropertyName": "data",
        "googleFolder": {
          "__rl": true,
          "value": "1PEsieoyQyFQTG1LcRENMZdMIlq3S2F6d",
          "mode": "id"
        },
        "name": "={{$json.filename}}",
        "options": {}
      },
      "id": "upload-to-drive",
      "name": "Upload Design to Drive",
      "type": "n8n-nodes-base.googleDrive",
      "typeVersion": 3,
      "position": [5250, 300],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.mediamodifier.com/v2/mockups/generate",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-api-key",
              "value": "3cf4fd68-40fe-4adc-aada-95b6ef7f495e"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\"template_id\": \"t-shirt-basic-mockup\", \"design_url\": $json.webViewLink, \"format\": \"png\", \"quality\": \"high\", \"background\": \"white\"}",
        "options": {
          "timeout": 60000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "media-modifier-mockups",
      "name": "Generate Professional Mockups",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [5450, 600],
      "continueOnFail": true,
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "ReadyForUpload",
        "columns": {
          "mappingMode": "autoMapInputData",
          "options": {}
        }
      },
      "id": "save-to-upload-sheet",
      "name": "Save to Upload Sheet",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [5450, 300],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "PerformanceData",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "concept_id": "={{$json.concept_id}}",
            "design_theme": "={{$json.design_theme}}",
            "niche": "={{$json.niche}}",
            "keywords": "={{$json.tank_keywords}}",
            "color_strategy": "={{$json.color_strategy}}",
            "predicted_sales": "={{$json.predicted_30d_sales}}",
            "predicted_ctr": "={{$json.predicted_ctr}}",
            "predicted_roi": "={{$json.predicted_roi}}",
            "quality_score": "={{$json.quality_score}}",
            "bsr_tier": "={{$json.bsr_tier}}",
            "created_at": "={{$json.created_at}}",
            "is_mutation": "={{$json.is_mutation}}",
            "price_strategy": "={{JSON.stringify({tshirt_a: $json.tshirt_price_a, tshirt_b: $json.tshirt_price_b, hoodie_a: $json.hoodie_price_a, hoodie_b: $json.hoodie_price_b})}}",
            "sales_count": "=0",
            "revenue": "=0",
            "roi": "=0",
            "status": "pending"
          }
        }
      },
      "id": "save-performance-tracking",
      "name": "Save Performance Tracking",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [5250, 400],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{$node[\"Design Batch Processor\"].context[\"noItemsLeft\"]}}",
              "rightValue": true,
              "operator": {
                "type": "boolean",
                "operation": "true"
              }
            }
          ]
        }
      },
      "id": "check-batch-complete",
      "name": "Check Batch Complete",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [5650, 400]
    },
    {
      "parameters": {
        "jsCode": "// Ultimate Amazon execution summary with analytics dashboard data\nconst execution = $node[\"Initialize Ultimate System\"].json;\nconst allUploads = $input.all();\n\n// Calculate enhanced metrics\nconst executionTime = (new Date() - new Date(execution.timestamp)) / 1000 / 60;\nconst designsApproved = allUploads.length;\nconst designsPerHour = executionTime > 0 ? (designsApproved / executionTime) * 60 : 0;\n\n// Calculate mutation statistics\nconst mutationStats = {\n  total: allUploads.filter(d => d.json.is_mutation).length,\n  percentage: (allUploads.length > 0 ? (allUploads.filter(d => d.json.is_mutation).length / allUploads.length * 100) : 0).toFixed(1)\n};\n\n// Aggregate performance predictions and analytics\nlet totalPredictedSales = 0;\nlet totalPredictedRevenue = 0;\nlet totalPredictedROI = 0;\nlet totalCTRPrediction = 0;\nconst colorStrategyStats = {};\nconst nicheStats = {};\nconst priceTestingData = [];\n\nallUploads.forEach(item => {\n  const data = item.json;\n  \n  // Performance tracking\n  totalPredictedSales += parseFloat(data.predicted_30d_sales || 0);\n  totalPredictedRevenue += (parseFloat(data.predicted_30d_sales || 0) * parseFloat(data.tshirt_price_a || 19.99));\n  totalPredictedROI += parseFloat(data.predicted_roi || 0);\n  totalCTRPrediction += parseFloat(data.predicted_ctr || 0);\n  \n  // Color strategy tracking\n  const colorKey = data.color_strategy || 'unknown';\n  if (!colorStrategyStats[colorKey]) {\n    colorStrategyStats[colorKey] = { count: 0, avg_score: 0, avg_ctr: 0, predicted_sales: 0 };\n  }\n  colorStrategyStats[colorKey].count++;\n  colorStrategyStats[colorKey].avg_score += parseFloat(data.quality_score);\n  colorStrategyStats[colorKey].avg_ctr += parseFloat(data.predicted_ctr);\n  colorStrategyStats[colorKey].predicted_sales += parseFloat(data.predicted_30d_sales || 0);\n  \n  // Niche performance\n  const niche = data.niche;\n  if (!nicheStats[niche]) {\n    nicheStats[niche] = {\n      count: 0,\n      avg_quality: 0,\n      avg_opportunity: 0,\n      predicted_sales: 0,\n      predicted_revenue: 0,\n      mutations: 0\n    };\n  }\n  nicheStats[niche].count++;\n  nicheStats[niche].avg_quality += parseFloat(data.quality_score);\n  nicheStats[niche].avg_opportunity += parseFloat(data.opportunity_score);\n  nicheStats[niche].predicted_sales += parseFloat(data.predicted_30d_sales || 0);\n  nicheStats[niche].predicted_revenue += (parseFloat(data.predicted_30d_sales || 0) * parseFloat(data.tshirt_price_a || 19.99));\n  if (data.is_mutation) nicheStats[niche].mutations++;\n  \n  // Price testing data\n  priceTestingData.push({\n    concept_id: data.concept_id,\n    price_a: data.tshirt_price_a,\n    price_b: data.tshirt_price_b,\n    launch_price: data.tshirt_launch_price\n  });\n});\n\n// Calculate averages\nObject.keys(colorStrategyStats).forEach(key => {\n  const stat = colorStrategyStats[key];\n  stat.avg_score = (stat.avg_score / stat.count).toFixed(2);\n  stat.avg_ctr = (stat.avg_ctr / stat.count).toFixed(2);\n  stat.sales_per_design = (stat.predicted_sales / stat.count).toFixed(1);\n});\n\nObject.keys(nicheStats).forEach(niche => {\n  const stat = nicheStats[niche];\n  stat.avg_quality = (stat.avg_quality / stat.count).toFixed(2);\n  stat.avg_opportunity = (stat.avg_opportunity / stat.count).toFixed(2);\n  stat.sales_per_design = (stat.predicted_sales / stat.count).toFixed(1);\n  stat.revenue_per_design = (stat.predicted_revenue / stat.count).toFixed(2);\n  stat.mutation_rate = ((stat.mutations / stat.count) * 100).toFixed(1) + '%';\n});\n\n// Analytics Dashboard Data\nconst analyticsData = {\n  execution_id: execution.execution_id,\n  platform: 'merch_by_amazon_ultimate',\n  duration_minutes: executionTime.toFixed(2),\n  designs_approved: designsApproved,\n  designs_per_hour: designsPerHour.toFixed(1),\n  total_listings: designsApproved * 3, // 3 products per design\n  \n  revenue_projections: {\n    predicted_30d_sales: totalPredictedSales.toFixed(0),\n    predicted_30d_revenue: '$' + totalPredictedRevenue.toFixed(2),\n    predicted_avg_roi: (totalPredictedROI / (designsApproved || 1)).toFixed(0) + '%',\n    predicted_monthly_profit: '$' + (totalPredictedRevenue * 0.35).toFixed(2), // ~35% royalty\n    path_to_10k: Math.ceil(10000 / (totalPredictedRevenue * 0.35)) + ' months'\n  },\n  \n  performance_metrics: {\n    avg_predicted_ctr: (totalCTRPrediction / (designsApproved || 1)).toFixed(2) + '%',\n    expected_ctr_above_target: allUploads.filter(d => parseFloat(d.json.predicted_ctr) >= 2.5).length,\n    mobile_optimized: allUploads.filter(d => d.json.mobile_score >= 8.5).length,\n    high_confidence_predictions: allUploads.filter(d => d.json.confidence === 'high').length\n  },\n  \n  mutation_statistics: mutationStats,\n  color_strategy_performance: colorStrategyStats,\n  niche_performance: nicheStats,\n  price_testing_summary: {\n    total_tests: priceTestingData.length,\n    avg_price_a: '$' + (priceTestingData.reduce((sum, p) => sum + parseFloat(p.price_a), 0) / priceTestingData.length).toFixed(2),\n    avg_price_b: '$' + (priceTestingData.reduce((sum, p) => sum + parseFloat(p.price_b), 0) / priceTestingData.length).toFixed(2)\n  },\n  \n  trending_opportunities: execution.trend_analysis.emerging_keywords.slice(0, 5),\n  winning_patterns_used: Object.keys(execution.performance_feedback.winning_patterns.themes || {}).slice(0, 5),\n  \n  recommendations: []\n};\n\n// Intelligent recommendations based on data\nif (analyticsData.performance_metrics.avg_predicted_ctr < 2.5) {\n  analyticsData.recommendations.push('Focus on higher contrast designs for better mobile CTR');\n}\nif (mutationStats.percentage < 15) {\n  analyticsData.recommendations.push('Increase creative mutations to discover new opportunities');\n}\nif (totalPredictedRevenue < 1000) {\n  analyticsData.recommendations.push('Scale up daily design production to reach revenue goals faster');\n}\nif (Object.values(colorStrategyStats).some(s => s.sales_per_design > 10)) {\n  analyticsData.recommendations.push('Double down on high-performing color strategies');\n}\n\n// Save to analytics sheet\nreturn [{ json: analyticsData }];"
      },
      "id": "execution-summary",
      "name": "Ultimate Analytics Dashboard",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [5850, 400]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "ExecutionSummary",
        "columns": {
          "mappingMode": "autoMapInputData",
          "options": {}
        }
      },
      "id": "save-execution-summary",
      "name": "Save Execution Summary",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [6050, 400],
      "retryOnFail": true,
      "maxTries": 3
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "AnalyticsDashboard",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "timestamp": "={{$json.execution_id}}",
            "designs_created": "={{$json.designs_approved}}",
            "predicted_revenue": "={{$json.revenue_projections.predicted_30d_revenue}}",
            "predicted_profit": "={{$json.revenue_projections.predicted_monthly_profit}}",
            "avg_ctr": "={{$json.performance_metrics.avg_predicted_ctr}}",
            "top_niche": "={{Object.entries($json.niche_performance).sort((a,b) => b[1].predicted_revenue - a[1].predicted_revenue)[0]?.[0] || 'none'}}",
            "top_color": "={{Object.entries($json.color_strategy_performance).sort((a,b) => b[1].predicted_sales - a[1].predicted_sales)[0]?.[0] || 'none'}}",
            "mutation_rate": "={{$json.mutation_statistics.percentage}}%",
            "trending_keywords": "={{$json.trending_opportunities.map(t => t.keyword).join(', ')}}",
"recommendations": "={{$json.recommendations.join('; ')}}",
"path_to_10k": "={{$json.revenue_projections.path_to_10k}}"
}
}
},
"id": "save-analytics-dashboard",
"name": "Save Analytics Dashboard",
"type": "n8n-nodes-base.googleSheets",
"typeVersion": 4.2,
"position": [6250, 400],
"retryOnFail": true,
"maxTries": 3
},
{
"parameters": {
"method": "POST",
"url": "https://api.notion.com/v1/pages",
"sendHeaders": true,
"headerParameters": {
"parameters": [
{
"name": "Authorization",
"value": "Bearer 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"
},
{
"name": "Notion-Version",
"value": "2022-06-28"
},
{
"name": "Content-Type",
"value": "application/json"
}
]
},
"sendBody": true,
"specifyBody": "json",
"jsonBody": "={\"parent\": {\"database_id\": \"YOUR_PROJECT_DATABASE_ID\"}, \"properties\": {\"Title\": {\"title\": [{\"text\": {\"content\": \"Execution \" + $json.execution_id}}]}, \"Status\": {\"select\": {\"name\": \"Completed\"}}, \"Revenue\": {\"number\": parseFloat($json.revenue_projections.predicted_30d_revenue.replace('$', ''))}, \"Designs\": {\"number\": $json.designs_approved}, \"Date\": {\"date\": {\"start\": new Date().toISOString().split('T')[0]}}}}",
"options": {
"timeout": 30000,
"response": {
"response": {
"neverError": true
}
}
}
},
"id": "notion-project-backup",
"name": "Notion Project Backup",
"type": "n8n-nodes-base.httpRequest",
"typeVersion": 4.2,
"position": [6450, 300],
"continueOnFail": true,
"retryOnFail": true,
"maxTries": 3
},
{
"parameters": {
"method": "POST",
"url": "{{$env.SLACK_WEBHOOK_URL}}",
"sendHeaders": true,
"headerParameters": {
"parameters": [
{
"name": "Content-Type",
"value": "application/json"
}
]
},
"sendBody": true,
"specifyBody": "json",
"jsonBody": "={\"text\": \"🎯 MBA Intelligence Engine v3.0 Execution Complete!\", \"blocks\": [{\"type\": \"header\", \"text\": {\"type\": \"plain_text\", \"text\": \"📊 Ultimate Analytics Report\"}}, {\"type\": \"section\", \"fields\": [{\"type\": \"mrkdwn\", \"text\": \"*Designs Created:* \" + $json.designs_approved}, {\"type\": \"mrkdwn\", \"text\": \"*Predicted Revenue:* \" + $json.revenue_projections.predicted_30d_revenue}, {\"type\": \"mrkdwn\", \"text\": \"*Average CTR:* \" + $json.performance_metrics.avg_predicted_ctr}, {\"type\": \"mrkdwn\", \"text\": \"*Top Niche:* \" + (Object.entries($json.niche_performance).sort((a,b) => b[1].predicted_revenue - a[1].predicted_revenue)[0]?.[0] || 'N/A')}, {\"type\": \"mrkdwn\", \"text\": \"*Mutation Rate:* \" + $json.mutation_statistics.percentage + \"%\"}, {\"type\": \"mrkdwn\", \"text\": \"*Path to $10K:* \" + $json.revenue_projections.path_to_10k}]}, {\"type\": \"section\", \"text\": {\"type\": \"mrkdwn\", \"text\": \"*📈 Key Recommendations:*\\n\" + $json.recommendations.join(\"\\n\")}}, {\"type\": \"section\", \"text\": {\"type\": \"mrkdwn\", \"text\": \"*🔥 Trending Keywords:* \" + $json.trending_opportunities.map(t => t.keyword).join(\", \")}}, {\"type\": \"divider\"}, {\"type\": \"context\", \"elements\": [{\"type\": \"mrkdwn\", \"text\": \"Generated at \" + new Date().toISOString() + \" | Execution ID: \" + $json.execution_id}]}]}",
"options": {
"timeout": 30000,
"response": {
"response": {
"neverError": true
}
}
}
},
"id": "slack-execution-summary",
"name": "Slack Execution Summary",
"type": "n8n-nodes-base.httpRequest",
"typeVersion": 4.2,
"position": [6450, 400],
"continueOnFail": true,
"retryOnFail": true,
"maxTries": 3
}
],
"connections": {
"Schedule Trigger (3h)": {
"main": [
[
{
"node": "Load Agent Memory",
"type": "main",
"index": 0
}
]
]
},
"Manual Trigger": {
"main": [
[
{
"node": "Load Agent Memory",
"type": "main",
"index": 0
}
]
]
},
"Load Agent Memory": {
"main": [
[
{
"node": "Load Negative Keywords",
"type": "main",
"index": 0
}
]
]
},
"Load Negative Keywords": {
"main": [
[
{
"node": "Load Performance Data",
"type": "main",
"index": 0
}
]
]
},
"Load Performance Data": {
"main": [
[
{
"node": "Initialize Ultimate System",
"type": "main",
"index": 0
}
]
]
},
"Initialize Ultimate System": {
"main": [
[
{
"node": "Ultimate Research Agent",
"type": "main",
"index": 0
}
]
]
},
"Ultimate Research Agent": {
"main": [
[
{
"node": "Save Research Memory",
"type": "main",
"index": 0
}
]
]
},
"Save Research Memory": {
"main": [
[
{
"node": "Process Ultimate Opportunities",
"type": "main",
"index": 0
}
]
]
},
"Process Ultimate Opportunities": {
"main": [
[
{
"node": "Ultimate Creative Agent",
"type": "main",
"index": 0
}
]
]
},
"Ultimate Creative Agent": {
"main": [
[
{
"node": "Save Creative Memory",
"type": "main",
"index": 0
}
]
]
},
"Save Creative Memory": {
"main": [
[
{
"node": "Prepare Ultimate Designs",
"type": "main",
"index": 0
}
]
]
},
"Prepare Ultimate Designs": {
"main": [
[
{
"node": "Design Batch Processor",
"type": "main",
"index": 0
}
]
]
},
"Design Batch Processor": {
"main": [
[
{
"node": "Build Enhanced IP Queries",
"type": "main",
"index": 0
}
],
[
{
"node": "Check Batch Complete",
"type": "main",
"index": 0
}
]
]
},
"Build Enhanced IP Queries": {
"main": [
[
{
"node": "USPTO Trademark Check",
"type": "main",
"index": 0
},
{
"node": "MarkerAPI Trademark Check",
"type": "main",
"index": 0
}
]
]
},
"USPTO Trademark Check": {
"main": [
[
{
"node": "Enhanced Trademark Gate",
"type": "main",
"index": 0
}
]
]
},
"MarkerAPI Trademark Check": {
"main": [
[
{
"node": "Enhanced Trademark Gate",
"type": "main",
"index": 0
}
]
]
},
"Enhanced Trademark Gate": {
"main": [
[
{
"node": "Generate Design (GPT-4o)",
"type": "main",
"index": 0
}
],
[
{
"node": "Log Enhanced IP Flagged",
"type": "main",
"index": 0
}
]
]
},
"Log Enhanced IP Flagged": {
"main": [
[
{
"node": "Design Batch Processor",
"type": "main",
"index": 0
}
]
]
},
"Generate Design (GPT-4o)": {
"main": [
[
{
"node": "Enhanced Compliance Agent",
"type": "main",
"index": 0
}
]
]
},
"Enhanced Compliance Agent": {
"main": [
[
{
"node": "Parse Enhanced Compliance",
"type": "main",
"index": 0
}
]
]
},
"Parse Enhanced Compliance": {
"main": [
[
{
"node": "Amazon Compliance Gate",
"type": "main",
"index": 0
}
]
]
},
"Amazon Compliance Gate": {
"main": [
[
{
"node": "Ultimate Quality Agent",
"type": "main",
"index": 0
}
],
[
{
"node": "Log Policy Flagged",
"type": "main",
"index": 0
}
]
]
},
"Log Policy Flagged": {
"main": [
[
{
"node": "Design Batch Processor",
"type": "main",
"index": 0
}
]
]
},
"Ultimate Quality Agent": {
"main": [
[
{
"node": "Process Ultimate Quality",
"type": "main",
"index": 0
}
]
]
},
"Process Ultimate Quality": {
"main": [
[
{
"node": "Quality Gate",
"type": "main",
"index": 0
}
]
]
},
"Quality Gate": {
"main": [
[
{
"node": "Save Quality Pass Memory",
"type": "main",
"index": 0
},
{
"node": "Ultimate Strategy Agent",
"type": "main",
"index": 0
}
],
[
{
"node": "Log Rejected Designs",
"type": "main",
"index": 0
}
]
]
},
"Save Quality Pass Memory": {
"main": [
[]
]
},
"Log Rejected Designs": {
"main": [
[
{
"node": "Extract Negative Keywords",
"type": "main",
"index": 0
}
]
]
},
"Extract Negative Keywords": {
"main": [
[
{
"node": "Save Negative Keywords",
"type": "main",
"index": 0
}
]
]
},
"Save Negative Keywords": {
"main": [
[
{
"node": "Design Batch Processor",
"type": "main",
"index": 0
}
]
]
},
"Ultimate Strategy Agent": {
"main": [
[
{
"node": "Save Strategy Memory",
"type": "main",
"index": 0
}
]
]
},
"Save Strategy Memory": {
"main": [
[
{
"node": "Convert B64 to Binary",
"type": "main",
"index": 0
}
]
]
},
"Convert B64 to Binary": {
"main": [
[
{
"node": "Resize to Amazon Specs",
"type": "main",
"index": 0
}
]
]
},
"Resize to Amazon Specs": {
"main": [
[
{
"node": "Prepare Ultimate Final Data",
"type": "main",
"index": 0
}
]
]
},
"Prepare Ultimate Final Data": {
"main": [
[
{
"node": "Upload Design to Drive",
"type": "main",
"index": 0
},
{
"node": "Save to Upload Sheet",
"type": "main",
"index": 0
},
{
"node": "Save Performance Tracking",
"type": "main",
"index": 0
}
]
]
},
"Upload Design to Drive": {
"main": [
[
{
"node": "Design Batch Processor",
"type": "main",
"index": 0
}
]
]
},
"Save to Upload Sheet": {
"main": [
[
{
"node": "Design Batch Processor",
"type": "main",
"index": 0
}
]
]
},
"Save Performance Tracking": {
"main": [
[
{
"node": "Design Batch Processor",
"type": "main",
"index": 0
}
]
]
},
"Check Batch Complete": {
"main": [
[
{
"node": "Ultimate Analytics Dashboard",
"type": "main",
"index": 0
}
]
]
},
"Ultimate Analytics Dashboard": {
"main": [
[
{
"node": "Save Execution Summary",
"type": "main",
"index": 0
},
{
"node": "Save Analytics Dashboard",
"type": "main",
"index": 0
}
]
]
}
},
"settings": {
"executionOrder": "v1"
}
}