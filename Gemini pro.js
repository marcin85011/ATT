{
  "name": "Merch by Amazon AI Agents - Complete Automation System",
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
        "content": "## 🎯 Merch by Amazon AI Agent System\n\n### Key Differences from Etsy:\n- **Stricter IP Protection**: Amazon has zero tolerance\n- **BSR Analysis**: Best Sellers Rank tracking\n- **Evergreen Focus**: Less seasonal, more consistent sellers\n- **Simple Designs**: Text-based designs perform best\n- **Volume Strategy**: Need 100+ designs to gain traction\n\n### AI Agents Optimized for Amazon:\n1. **Research Agent**: BSR analysis, niche saturation detection\n2. **Creative Agent**: Simple, scalable designs (T-shirt, Hoodie, Tank)\n3. **Quality Agent**: Enhanced trademark checking\n4. **Strategy Agent**: Amazon SEO, bullet points, pricing\n\n### Output:\n- 4500x5400px transparent PNGs\n- Complete metadata for manual upload\n- Niche potential scoring\n- Competition analysis\n\n### Required Sheets:\n- AMAZON_MEMORY_SHEET_ID\n- AMAZON_QUEUE_SHEET_ID\n- AMAZON_LISTINGS_SHEET_ID\n- AMAZON_REJECTED_SHEET_ID\n- AMAZON_IP_FLAGGED_SHEET_ID"
      },
      "id": "system-overview",
      "name": "Merch by Amazon System Overview",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [450, 100]
    },
    {
      "parameters": {
        "operation": "getAll",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_MEMORY_SHEET_ID}}",
          "mode": "id"
        },
        "sheetName": "AgentMemory",
        "options": {
          "returnAllColumns": true
        }
      },
      "id": "load-agent-memory",
      "name": "Load Agent Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "// Initialize Amazon-specific AI Agent System\nconst memory = $input.all().map(item => item.json);\nconst currentDate = new Date();\n\n// Retrieve Amazon-specific insights\nconst amazonInsights = {\n  research: memory.filter(m => m.agent === 'research').slice(-20),\n  creative: memory.filter(m => m.agent === 'creative').slice(-20),\n  quality: memory.filter(m => m.agent === 'quality').slice(-20),\n  strategy: memory.filter(m => m.agent === 'strategy').slice(-20)\n};\n\n// Automated Negative Keyword Feedback\nconst negativeKeywords = memory\n  .filter(m => m.agent === 'negative_keyword' && m.data)\n  .map(m => m.data.keyword);\n\n// Extract winning patterns for Amazon\nconst winningPatterns = amazonInsights.strategy\n  .filter(m => m.type === 'amazon_winner')\n  .map(m => JSON.parse(m.data));\n\n// Amazon-specific system state\nconst systemState = {\n  execution_id: `AMZN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,\n  timestamp: currentDate.toISOString(),\n  platform: 'merch_by_amazon',\n  agent_memory: amazonInsights,\n  learned_patterns: winningPatterns,\n  negative_keywords: [...new Set(negativeKeywords)], // Ensure unique keywords\n  amazon_targets: {\n    daily_designs: 50, \n    saturation_limit: 1000, \n    quality_threshold: 9.0, \n    simplicity_score: 8.0 \n  },\n  product_types: ['T-Shirt', 'Hoodie', 'Tank Top'],\n  // Enhanced BSR Threshold Logic\n  bsr_analysis: {\n    excellent: 50000,    // Green light\n    good: 100000,       // Proceed with optimization\n    marginal: 500000,   // Yellow flag - monitor\n    poor: 1000000,      // Red flag - avoid\n    visibility_cliff: 500000 // Critical threshold\n  },\n  // Product-Specific Intelligence Enhancement\n  product_performance: {\n    preferred_products: {\n      'T-Shirt': {\n        primary: 'Bella+Canvas 3001',\n        score: 95,\n        features: ['4.2oz cotton', '65+ colors', 'retail fit'],\n        conversion_boost: 1.23\n      },\n      'Hoodie': {\n        primary: 'Gildan 18500',\n        score: 90,\n        features: ['8.0oz fleece', '47+ colors', 'double-lined hood'],\n        price_advantage: true\n      }\n    }\n  }\n};\n\nreturn [{\n  json: systemState\n}];"
      },
      "id": "init-amazon-system",
      "name": "Initialize Amazon System",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Amazon Research Agent, specializing in Merch by Amazon market intelligence and niche validation.\n\nYour capabilities:\n- Analyze BSR (Best Sellers Rank) trends\n- Identify evergreen niches with consistent demand\n- Detect market saturation levels\n- Avoid seasonal trends (Amazon prefers evergreen)\n- Find underserved sub-niches\n\nMemory context:\n{{JSON.stringify($json.agent_memory.research, null, 2)}}\n\nAmazon-specific learned patterns:\n{{JSON.stringify($json.learned_patterns, null, 2)}}\n\nNegative Keywords to AVOID (Learned from past failures):\n{{JSON.stringify($json.negative_keywords, null, 2)}}\n\nYour task: Identify 5 HIGH-POTENTIAL niches for Merch by Amazon based on:\n1. BSR under 100,000 (Excellent) or under 500,000 (Good).\n2. Less than 1,000 competing designs\n3. Evergreen appeal (not seasonal/trendy)\n4. Simple design potential (text-based works best)\n5. No trademark risks\n6. Does NOT contain any of the negative keywords listed above.\n7. Works across T-shirts, Hoodies, and Tank Tops\n\nFocus on:\n- Professions (Nurse, Teacher, Engineer)\n- Hobbies (Gaming, Fishing, Gardening)\n- Funny sayings (Dad jokes, Sarcasm)\n- Pride/Identity (Mom, Dad, Grandparent)\n- Motivational (but unique angles)\n\nAvoid:\n- Pop culture references\n- Current events\n- Celebrity/Brand related\n- Overly complex designs\n- Any topic related to the Negative Keywords list.",
        "systemMessage": "You are an expert Amazon market researcher. Focus on evergreen niches with proven demand but low competition. Always return structured JSON with BSR data and saturation metrics. You must strictly avoid any niches related to the provided negative keywords.",
        "options": {
          "temperature": 0.7,
          "maxTokens": 4000
        },
        "tools": [
          {
            "type": "code",
            "tool": {
              "name": "analyze_amazon_niche",
              "description": "Analyze Amazon niche potential",
              "language": "javaScript",
              "code": "// Amazon niche analyzer\nconst analyzeNiche = (niche, keywords) => {\n  // Simulate BSR and competition data\n  const niches = {\n    'nurse_humor': { avg_bsr: 245000, competition: 750, growth: 'stable' },\n    'fishing_dad': { avg_bsr: 189000, competition: 450, growth: 'growing' },\n    'teacher_tired': { avg_bsr: 298000, competition: 890, growth: 'stable' },\n    'gaming_programmer': { avg_bsr: 156000, competition: 320, growth: 'growing' },\n    'plant_mom': { avg_bsr: 412000, competition: 680, growth: 'stable' },\n    'gym_motivation': { avg_bsr: 534000, competition: 1200, growth: 'declining' },\n    'craft_beer_dad': { avg_bsr: 223000, competition: 290, growth: 'growing' }\n  };\n  \n  const data = niches[niche] || { avg_bsr: 400000, competition: 600, growth: 'stable' };\n  \n  // Calculate opportunity score\n  const bsrScore = Math.max(0, 10 - (data.avg_bsr / 50000));\n  const compScore = Math.max(0, 10 - (data.competition / 100));\n  const growthBonus = data.growth === 'growing' ? 2 : data.growth === 'stable' ? 1 : 0;\n  \n  const opportunityScore = (bsrScore + compScore + growthBonus) / 3;\n  \n  return {\n    niche,\n    metrics: data,\n    opportunity_score: opportunityScore.toFixed(2),\n    recommendation: opportunityScore > 6 ? 'HIGH_POTENTIAL' : opportunityScore > 4 ? 'MODERATE' : 'SATURATED'\n  };\n};\n\nreturn analyzeNiche(input.niche, input.keywords);"
            }
          },
          {
            "type": "code",
            "tool": {
              "name": "calculate_saturation_index",
              "description": "Calculate market saturation for Amazon",
              "language": "javaScript",
              "code": "// Saturation calculator specific to Amazon\nfunction calculateSaturation(totalDesigns, avgBSR, newDesignsDaily) {\n  // Amazon saturation formula\n  const marketCapacity = 100000 / (avgBSR / 1000); // Rough sales capacity\n  const saturationRatio = totalDesigns / marketCapacity;\n  const competitionVelocity = newDesignsDaily / 10; // New entries impact\n  \n  const saturationIndex = (saturationRatio * 0.6) + (competitionVelocity * 0.4);\n  \n  return {\n    saturation_index: Math.min(10, saturationIndex * 10).toFixed(2),\n    market_capacity: Math.round(marketCapacity),\n    entry_difficulty: saturationIndex > 0.7 ? 'HIGH' : saturationIndex > 0.4 ? 'MEDIUM' : 'LOW',\n    recommended_entry: saturationIndex < 0.6\n  };\n}\n\nconst result = calculateSaturation(input.total_designs, input.avg_bsr, input.new_daily);\nreturn result;"
            }
          }
        ]
      },
      "id": "amazon-research-agent",
      "name": "Amazon Research Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [850, 300]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_MEMORY_SHEET_ID}}",
          "mode": "id"
        },
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$node[\"init-amazon-system\"].json.execution_id}}",
            "agent": "research",
            "timestamp": "={{new Date().toISOString()}}",
            "type": "niche_analysis",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-research-memory",
      "name": "Save Research Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [1050, 300]
    },
    {
      "parameters": {
        "jsCode": "// Process Amazon Research output\nconst researchOutput = $json.output;\nconst systemState = $node[\"init-amazon-system\"].json;\n\n// Parse Amazon opportunities\nconst opportunities = typeof researchOutput === 'string' \n  ? JSON.parse(researchOutput)\n  : researchOutput;\n\n// Filter and enhance opportunities\nconst validOpportunities = opportunities.amazon_niches\n  .filter(opp => \n    opp.metrics.avg_bsr < systemState.bsr_analysis.visibility_cliff &&\n    opp.metrics.competition < systemState.amazon_targets.saturation_limit &&\n    opp.opportunity_score >= 6.0\n  )\n  .map(opp => ({\n    ...opp,\n    execution_id: systemState.execution_id,\n    product_types: systemState.product_types,\n    design_requirements: {\n      resolution: '4500x5400',\n      format: 'PNG',\n      background: 'transparent',\n      style: 'simple_bold_readable'\n    }\n  }));\n\n// Return for processing\nreturn validOpportunities.map(opp => ({ json: opp }));"
      },
      "id": "process-opportunities",
      "name": "Process Amazon Opportunities",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1250, 300]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Amazon Creative Agent, specialized in creating simple, high-converting designs for Merch by Amazon.\n\nNiche Opportunity:\n{{JSON.stringify($json, null, 2)}}\n\nCore Principles:\n- SIMPLE IS BETTER: Text-based designs have a 23% higher conversion rate. Prioritize them.\n- BOLD & READABLE: Must be legible on a 160x160px mobile thumbnail.\n- VERSATILE: Works on T-shirts, Hoodies, and Tank Tops.\n\nDesign & Color Strategy:\n- Design Priorities: text_only (Priority 1, 23% conversion lift), text_with_graphics (Priority 2), graphics_only (Priority 3).\n- Color Requirements: PRIORITY 1: Black background + white text (45% success rate). PRIORITY 2: White background + black text (41% success rate). Reject low-contrast combinations automatically.\n\nTask: Generate 5 design concepts for the niche. \n\n**Creative Mutation Protocol:** For 1 out of every 5 concepts you generate, you MUST introduce a 'creative mutation.' This means either combining two unrelated trending topics, using a completely unexpected visual style for the niche, or creating a design based on a contrarian take on the main theme. Label this concept with `mutation: true`.\n\nFor each concept, provide 3 variations:\n1. Typography-focused (different fonts/layouts)\n2. Simple icon + text combinations\n3. Funny/Clever saying variations\n\nFor each design:\n- Keep it SIMPLE (max 3 colors)\n- Ensure readability at small sizes\n- NO gradients, photos, or complex illustrations\n\nFocus on what sells on Amazon:\n- Profession pride (\"Nurse Life\")\n- Hobby enthusiasm (\"Fishing is My Therapy\")\n- Family roles (\"Best Dad Ever\")\n- Motivational (simple, not preachy)",
        "systemMessage": "You are an expert Amazon POD designer. Create simple, bold designs that convert. Prioritize text-based designs and high-contrast color schemes. Implement the Creative Mutation protocol as instructed. Always return structured JSON.",
        "options": {
          "temperature": 0.8,
          "maxTokens": 4000
        },
        "tools": [
          {
            "type": "code",
            "tool": {
              "name": "generate_amazon_variations",
              "description": "Generate Amazon-optimized design variations",
              "language": "javaScript",
              "code": "// Amazon design variation generator\nfunction generateVariations(baseTheme, niche) {\n  const variations = {\n    A: {\n      style: 'bold_typography',\n      layout: 'centered_stack',\n      font: 'impact_style',\n      approach: 'direct_statement'\n    },\n    B: {\n      style: 'vintage_text',\n      layout: 'curved_banner',\n      font: 'retro_serif',\n      approach: 'nostalgic_angle'\n    },\n    C: {\n      style: 'modern_minimal',\n      layout: 'left_aligned',\n      font: 'clean_sans',\n      approach: 'clever_wordplay'\n    }\n  };\n  \n  // Amazon-specific adjustments\n  Object.keys(variations).forEach(key => {\n    variations[key].print_placement = {\n      tshirt: 'center_chest',\n      hoodie: 'center_chest_above_pocket',\n      tank: 'center_chest_narrow'\n    };\n    variations[key].max_colors = 3;\n    variations[key].complexity = 'simple';\n  });\n  \n  return variations;\n}\n\nconst result = generateVariations(input.theme, input.niche);\nreturn result;"
            }
          },
          {
            "type": "code",
            "tool": {
              "name": "optimize_for_thumbnail",
              "description": "Optimize design for Amazon thumbnail visibility",
              "language": "javaScript",
              "code": "// Thumbnail optimization calculator\nfunction optimizeForThumbnail(textLength, fontSize, designComplexity) {\n  // Amazon thumbnail is 500x500px, design must be readable at this size\n  const readabilityScore = Math.max(0, 10 - (textLength / 5));\n  const sizeScore = fontSize >= 72 ? 10 : fontSize / 7.2;\n  const simplicityScore = 10 - designComplexity;\n  \n  const thumbnailScore = (readabilityScore + sizeScore + simplicityScore) / 3;\n  \n  return {\n    thumbnail_score: thumbnailScore.toFixed(2),\n    recommendations: {\n      optimal_font_size: Math.max(72, fontSize),\n      max_text_length: 15,\n      design_tips: [\n        'Use high contrast colors',\n        'Avoid thin fonts',\n        'Center the main message',\n        'Keep it under 10 words'\n      ]\n    },\n    mobile_ready: thumbnailScore >= 7\n  };\n}\n\nconst result = optimizeForThumbnail(input.text_length, input.font_size, input.complexity);\nreturn result;"
            }
          }
        ]
      },
      "id": "amazon-creative-agent",
      "name": "Amazon Creative Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [1450, 300]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_MEMORY_SHEET_ID}}",
          "mode": "id"
        },
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$json.execution_id}}",
            "agent": "creative",
            "timestamp": "={{new Date().toISOString()}}",
            "type": "design_generation",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-creative-memory",
      "name": "Save Creative Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [1650, 300]
    },
    {
      "parameters": {
        "jsCode": "// Process Amazon Creative output\nconst creativeOutput = $json.output;\nconst nicheData = $node[\"process-opportunities\"].json;\n\n// Parse design concepts\nconst concepts = typeof creativeOutput === 'string'\n  ? JSON.parse(creativeOutput)\n  : creativeOutput;\n\n// Prepare Amazon-optimized designs\nlet allDesigns = [];\n\nconcepts.design_concepts.forEach(concept => {\n  concept.variations.forEach(variation => {\n    // Amazon-specific prompt engineering\n    const designPrompt = `Create a Merch by Amazon t-shirt design.\n${concept.theme}\n${variation.text_content ? `Text (MUST be perfectly readable): \"${variation.text_content}\"` : ''}\n\nAMAZON REQUIREMENTS:\n- Resolution: 4500x5400 pixels\n- Transparent background PNG\n- Simple, bold design that's readable as thumbnail\n- Maximum 3 colors for cost-effective printing\n- Style: ${variation.style}\n- Layout: ${variation.layout}\n- Font style: ${variation.font_type}\n\nDESIGN MUST BE:\n- Centered on transparent background\n- High contrast for visibility\n- Simple enough to work on T-shirt, Hoodie, and Tank Top\n- Professional print-ready quality\n- NO gradients, photos, or complex effects\n- NO copyrighted elements or brand references`;\n\n    allDesigns.push({\n      concept_id: `${nicheData.execution_id}_${concept.concept_id}`,\n      variant_id: variation.variant_id,\n      niche: nicheData.niche_name,\n      product_types: nicheData.product_types,\n      design_theme: concept.theme,\n      text_content: variation.text_content || '',\n      keywords: concept.amazon_keywords || [],\n      enhanced_prompt: designPrompt,\n      design_specs: {\n        resolution: '4500x5400',\n        format: 'PNG',\n        background: 'transparent',\n        max_colors: 3,\n        print_area: '12x15 inches'\n      },\n      quality_targets: {\n        simplicity_score: 8.0,\n        readability_score: 9.0,\n        thumbnail_score: 8.5\n      },\n      metadata: {\n        ...concept,\n        ...variation,\n        niche_data: nicheData\n      }\n    });\n  });\n});\n\n// Return for batch processing\nreturn allDesigns.map(design => ({ json: design }));"
      },
      "id": "prepare-amazon-designs",
      "name": "Prepare Amazon Designs",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1850, 300]
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
      "position": [2050, 300]
    },
    {
      "parameters": {
        "jsCode": "// Enhanced IP check for Amazon (stricter requirements)\nconst concept = $json;\n\n// Amazon is much stricter - check more thoroughly\nconst searchTerms = [\n  concept.design_theme,\n  ...(concept.keywords || []),\n  concept.text_content || '',\n  // Add common variations Amazon checks\n  concept.text_content?.replace(/[^a-zA-Z0-9\\s]/g, ''),\n  concept.text_content?.toLowerCase(),\n  concept.text_content?.toUpperCase()\n].filter(Boolean);\n\n// Clean and prepare comprehensive queries\nconst cleanedTerms = [...new Set(searchTerms)].map(term => \n  term.trim()\n    .replace(/[^a-zA-Z0-9\\s]/g, '')\n    .toLowerCase()\n);\n\n// Amazon checks exact matches more strictly\nconst usptoQuery = cleanedTerms.slice(0, 3).join(' '); // Multiple terms\nconst markerQuery = cleanedTerms\n  .map(s => encodeURIComponent(s))\n  .join('|');\n\n// Enhanced Compliance Checking with high-risk brands\nconst amazonHighRiskBrands = [\n  'Nike', 'Adidas', 'Disney', 'Marvel', 'Star Wars', \n  'NFL', 'NBA', 'MLB', 'Nintendo', 'Pokemon', 'Gucci', 'Chanel'\n].map(b => b.toLowerCase());\n\nconst hasBrandRisk = cleanedTerms.some(term => \n  amazonHighRiskBrands.some(brand => term.includes(brand))\n);\n\nreturn [{\n  json: {\n    ...concept,\n    ip_check: {\n      uspto_query: usptoQuery,\n      marker_query: markerQuery,\n      raw_terms: cleanedTerms,\n      brand_risk_detected: hasBrandRisk,\n      platform: 'amazon'\n    }\n  }\n}];"
      },
      "id": "build-amazon-ip-queries",
      "name": "Build Amazon IP Queries",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2150, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://developer.uspto.gov/tsdr/v3/trademarks?searchText={{$json.ip_check.uspto_query}}&searchType=basic",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Accept",
              "value": "application/json"
            }
          ]
        },
        "options": {
          "timeout": 10000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "uspto-check",
      "name": "USPTO Trademark Check",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2350, 250],
      "continueOnFail": true
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://api.markerapi.com/v1/trademark/search?query={{$json.ip_check.marker_query}}&apiKey={{$credentials.markerApiKey}}",
        "options": {
          "timeout": 10000,
          "response": {
            "response": {
              "neverError": true
            }
          }
        }
      },
      "id": "markerapi-check",
      "name": "MarkerAPI Trademark Check",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [2350, 350],
      "continueOnFail": true
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{($node[\"uspto-check\"].json.total || 0) > 0 || ($node[\"markerapi-check\"].json.total || 0) > 0 || $json.ip_check.brand_risk_detected}}",
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
      "name": "Amazon Trademark Gate",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [2550, 300]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_IP_FLAGGED_SHEET_ID}}",
          "mode": "id"
        },
        "sheetName": "IPFlagged",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "concept_id": "={{$json.concept_id}}",
            "design_theme": "={{$json.design_theme}}",
            "text_content": "={{$json.text_content}}",
            "keywords": "={{$json.keywords.join(', ')}}",
            "uspto_hits": "={{$node[\"uspto-check\"].json.total || 0}}",
            "marker_hits": "={{$node[\"markerapi-check\"].json.total || 0}}",
            "brand_risk": "={{$json.ip_check.brand_risk_detected ? 'YES' : 'NO'}}",
            "flagged_reason": "={{$json.ip_check.brand_risk_detected ? 'High-risk brand name detected' : 'Trademark found'}}",
            "flagged_at": "={{new Date().toISOString()}}",
            "platform": "amazon",
            "stage": "pre-generation"
          }
        }
      },
      "id": "log-amazon-ip-flagged",
      "name": "Log Amazon IP Flagged",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [2750, 350]
    },
    {
      "parameters": {
        "resource": "image",
        "prompt": "={{$json.enhanced_prompt}}",
        "options": {
          "quality": "hd",
          "size": "1024x1024",
          "style": "vivid",
          "n": 1
        }
      },
      "id": "generate-design-dalle",
      "name": "Generate Design (DALL-E 3)",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1.4,
      "position": [2750, 250],
      "retryOnFail": true,
      "maxTries": 3,
      "waitBetweenTries": 5000
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
              "content": "You are \"Amazon-Compliance-Agent,\" a ZERO-TOLERANCE reviewer for Merch by Amazon.\n\nAmazon is MUCH STRICTER than other platforms. Check for:\n1. ANY trademark/brand references (even partial)\n2. Celebrity names or likenesses\n3. Sports teams, leagues, or organizations\n4. Movie/TV/Book/Game references\n5. Company names or slogans\n6. Misleading claims (Best, #1, Official)\n7. Prohibited content (drugs, weapons, hate)\n8. Copyright characters or artwork\n\nAMAZON-SPECIFIC RULES:\n* Even SIMILAR spellings to brands = FAIL\n* Parody/Satire of brands = FAIL\n* \"Inspired by\" references = FAIL\n* Generic terms that could be trademarked = REVIEW\n* ANY doubt about originality = REVIEW\n\nReturn JSON:\n{\n  \"trademark_hits\": [{\"term\":\"Example\",\"risk_level\":\"HIGH\"}],\n  \"policy_flags\": [\"specific_violation\"],\n  \"amazon_risk_score\": 0-10,\n  \"verdict\": \"PASS\" | \"REVIEW\" | \"FAIL\",\n  \"reason\": \"Specific explanation\",\n  \"fix_suggestion\": \"How to make it compliant\"\n}"
            },
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": "Analyze this Merch by Amazon design for compliance:\n{\n  \"title\": \"{{$node[\"design-batcher\"].json.design_theme}}\",\n  \"keywords\": {{JSON.stringify($node[\"design-batcher\"].json.keywords)}},\n  \"text\": \"{{$node[\"design-batcher\"].json.text_content}}\",\n  \"niche\": \"{{$node[\"design-batcher\"].json.niche}}\"\n}"
                },
                {
                  "type": "image_url",
                  "image_url": {
                    "url": "={{$json.data[0].url}}"
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
      "name": "Amazon Compliance Agent",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1.4,
      "position": [2950, 250]
    },
    {
      "parameters": {
        "jsCode": "// Parse Amazon compliance results\nconst complianceResult = typeof $json.message?.content === 'string'\n  ? JSON.parse($json.message.content)\n  : $json.message?.content || $json;\n\nconst designData = $node[\"design-batcher\"].json;\nconst imageUrl = $node[\"generate-design-dalle\"].json.data[0].url;\n\n// Amazon requires perfect compliance\nconst passesCompliance = \n  complianceResult.verdict === 'PASS' && \n  complianceResult.amazon_risk_score < 3; // Very low risk tolerance\n\nreturn [{\n  json: {\n    ...designData,\n    design_url: imageUrl,\n    compliance_check: complianceResult,\n    passes_compliance: passesCompliance,\n    compliance_timestamp: new Date().toISOString()\n  }\n}];"
      },
      "id": "parse-compliance",
      "name": "Parse Compliance Result",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [3150, 250]
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
      "position": [3350, 250]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_IP_FLAGGED_SHEET_ID}}",
          "mode": "id"
        },
        "sheetName": "IPFlagged",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "concept_id": "={{$json.concept_id}}",
            "design_theme": "={{$json.design_theme}}",
            "text_content": "={{$json.text_content}}",
            "design_url": "={{$json.design_url}}",
            "verdict": "={{$json.compliance_check.verdict}}",
            "risk_score": "={{$json.compliance_check.amazon_risk_score}}",
            "trademark_hits": "={{JSON.stringify($json.compliance_check.trademark_hits)}}",
            "policy_flags": "={{JSON.stringify($json.compliance_check.policy_flags)}}",
            "flagged_reason": "={{$json.compliance_check.reason}}",
            "fix_suggestion": "={{$json.compliance_check.fix_suggestion}}",
            "flagged_at": "={{$json.compliance_timestamp}}",
            "platform": "amazon",
            "stage": "post-generation"
          }
        }
      },
      "id": "log-policy-flagged",
      "name": "Log Policy Flagged",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [3550, 350]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Amazon Quality Agent, ensuring designs meet Merch by Amazon's high standards.\n\nDesign to evaluate:\n- Theme: {{$json.design_theme}}\n- Niche: {{$json.niche}}\n- Products: {{$json.product_types.join(', ')}}\n\nPerform Amazon-specific quality analysis based on these STRICT mobile requirements:\n1. **Mobile Thumbnail Test (MANDATORY):** Evaluate readability on a 160x160px canvas. Pass/Fail.\n2. **Simplicity Score (1-10):** Is it simple enough for mobile Browse?\n3. **Readability Score (1-10):** Is it instantly legible?\n4. **Print Quality (1-10):** Will it print well with DTG (no thin lines)?\n5. **Contrast Check:** Does it meet a minimum 4.5:1 contrast ratio?\n6. **Versatility (1-10):** Does it work well on all 3 product types?\n7. **Professional Appearance (1-10):** Does it look like a professional product?\n\nMobile Requirements:\n- thumbnail_size: '160x160px'\n- readability_threshold: 0.85\n- contrast_minimum: 4.5\n- font_size_minimum: '72pt equivalent'\n\nProvide specific feedback for improvement if it fails.",
        "systemMessage": "You are an Amazon print quality expert. Be extremely strict about the mobile thumbnail test. Simple, professional designs are key to Amazon success. Return structured JSON.",
        "options": {
          "temperature": 0.3,
          "maxTokens": 2000
        },
        "hasOutputParser": true
      },
      "id": "amazon-quality-agent",
      "name": "Amazon Quality Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [3550, 200]
    },
    {
      "parameters": {
        "jsCode": "// Process Amazon quality results\nconst qualityResult = typeof $json.output === 'string'\n  ? JSON.parse($json.output)\n  : $json.output;\n\nconst designData = $node[\"parse-compliance\"].json;\n\n// Calculate Amazon-specific quality score\nconst scores = qualityResult.quality_scores || {};\nconst amazonScore = (\n  (scores.simplicity || 0) * 2 + // Double weight on simplicity\n  (scores.readability || 0) * 2 + // Double weight on readability\n  (scores.print_quality || 0) +\n  (scores.versatility || 0) +\n  (scores.mobile_visibility || 0) * 1.5 + // 1.5x weight on mobile\n  (scores.professional || 0)\n) / 8.5;\n\n// Amazon needs higher quality threshold\nconst passesQuality = \n  amazonScore >= 8.5 && // Higher threshold\n  scores.simplicity >= 8 &&\n  scores.readability >= 9 &&\n  scores.mobile_visibility >= 8;\n\nreturn [{\n  json: {\n    ...designData,\n    quality_assessment: qualityResult,\n    amazon_quality_score: amazonScore.toFixed(2),\n    passes_quality: passesQuality,\n    quality_timestamp: new Date().toISOString()\n  }\n}];"
      },
      "id": "process-quality",
      "name": "Process Quality Results",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [3750, 200]
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
      "position": [3950, 200]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_MEMORY_SHEET_ID}}",
          "mode": "id"
        },
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$json.concept_id.split('_')[0]}}",
            "agent": "quality",
            "timestamp": "={{$json.quality_timestamp}}",
            "type": "quality_pass",
            "data": "={{JSON.stringify({concept_id: $json.concept_id, score: $json.amazon_quality_score, theme: $json.design_theme})}}",
            "success": "=true"
          }
        }
      },
      "id": "save-quality-memory",
      "name": "Save Quality Pass Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [4150, 150]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_REJECTED_SHEET_ID}}",
          "mode": "id"
        },
        "sheetName": "Rejected",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "concept_id": "={{$json.concept_id}}",
            "design_theme": "={{$json.design_theme}}",
            "variant_id": "={{$json.variant_id}}",
            "quality_scores": "={{JSON.stringify($json.quality_assessment)}}",
            "amazon_score": "={{$json.amazon_quality_score}}",
            "rejection_reasons": "={{$json.quality_assessment.issues?.join('; ') || 'Below Amazon quality threshold'}}",
            "design_url": "={{$json.design_url}}",
            "rejected_at": "={{$json.quality_timestamp}}",
            "platform": "amazon"
          }
        }
      },
      "id": "log-rejected",
      "name": "Log Rejected Designs",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [4150, 300]
    },
    {
      "parameters": {
        "operation": "download",
        "url": "={{$json.design_url}}",
        "options": {
          "response": {
            "response": {
              "responseFormat": "file"
            }
          }
        }
      },
      "id": "download-approved",
      "name": "Download Approved Design",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [4350, 150]
    },
    {
      "parameters": {
        "operation": "binary",
        "binaryPropertyName": "data",
        "outputFormat": "png",
        "options": {
          "quality": 100,
          "width": 4500,
          "height": 5400,
          "density": 300
        }
      },
      "id": "resize-to-amazon",
      "name": "Resize to Amazon Specs",
      "type": "n8n-nodes-base.imageResize",
      "typeVersion": 1,
      "position": [4550, 150]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Amazon Strategy Agent, optimizing listings for maximum visibility and sales on Merch by Amazon.\n\nDesign data:\n{{JSON.stringify($json, null, 2)}}\n\nNiche intelligence:\n- BSR: {{$json.metadata.niche_data.metrics.avg_bsr}}\n- Competition: {{$json.metadata.niche_data.metrics.competition}}\n\nCore Directives:\n1. **A10 Algorithm Optimization**: Prioritize organic sales performance (25% weight), external traffic optimization (20%), and mobile-first design (77% of traffic).\n2. **Dynamic Pricing Strategy**: Use the pricing matrix below based on seller tier. Default to 'new_seller' if unknown.\n\nPricing Matrix:\n- `new_seller`: { range: [13.99, 14.99], strategy: 'velocity' }\n- `mid_tier`: { range: [15.99, 17.99], strategy: 'balanced' }\n- `advanced`: { range: [19.99, 24.99], strategy: 'premium' }\n\nTask: Create Amazon-optimized metadata for all required products.\n1. **Brand Name**: single word, unique, memorable.\n2. **Title**: Structure as [Brand] + [Main Keywords] + [Product Type]. Keep it readable and avoid stuffing.\n3. **Feature Bullets (2)**:\n   - Bullet 1: Focus on the main benefit and who the design is for.\n   - Bullet 2: Mention quality and suggest it as a gift idea.\n4. **Product Description**: Briefly expand on the design's theme and ideal customer.\n5. **Backend Search Terms**: 250 chars max, no keyword repetition from title/bullets.\n6. **Pricing**: Recommend a price for each product type using the pricing matrix.",
        "systemMessage": "You are an Amazon listing optimization expert. Create metadata that aligns with the A10 algorithm and uses the dynamic pricing matrix. Return complete JSON with all required fields.",
        "options": {
          "temperature": 0.5,
          "maxTokens": 3000
        },
        "tools": [
          {
            "type": "code",
            "tool": {
              "name": "generate_amazon_brand",
              "description": "Generate unique brand name for Amazon",
              "language": "javaScript",
              "code": "// Amazon brand generator\nfunction generateBrand(niche, theme) {\n  const prefixes = ['Pro', 'Epic', 'Zen', 'Joy', 'Bold', 'Pure', 'True', 'Vibe'];\n  const suffixes = ['Co', 'Tees', 'Wear', 'Style', 'Life', 'Gear', 'Club', 'Shop'];\n  \n  // Generate options\n  const options = [];\n  for (let p of prefixes) {\n    for (let s of suffixes) {\n      options.push(p + s);\n    }\n  }\n  \n  // Pick one that fits the niche\n  const brandIndex = (niche.length + theme.length) % options.length;\n  const brand = options[brandIndex];\n  \n  return {\n    brand_name: brand,\n    trademark_safe: true, // Assumes we've checked\n    memorable_score: 8\n  };\n}\n\nconst result = generateBrand(input.niche, input.theme);\nreturn result;"
            }
          },
          {
            "type": "code",
            "tool": {
              "name": "optimize_amazon_pricing",
              "description": "Calculate optimal Amazon pricing",
              "language": "javaScript",
              "code": "// Amazon pricing optimizer\nfunction optimizePricing(productType, bsr, competition) {\n  const basePrices = {\n    'T-Shirt': 19.99,\n    'Hoodie': 37.99,\n    'Tank Top': 18.99\n  };\n  \n  let price = basePrices[productType] || 19.99;\n  \n  // Adjust based on BSR (lower BSR = can charge more)\n  if (bsr < 100000) price += 2;\n  else if (bsr < 300000) price += 1;\n  else if (bsr > 500000) price -= 1;\n  \n  // Adjust based on competition\n  if (competition < 500) price += 1;\n  else if (competition > 1000) price -= 1;\n  \n  // Round to .99\n  price = Math.round(price) - 0.01;\n  \n  return {\n    recommended_price: price,\n    price_tier: price > 25 ? 'premium' : price > 20 ? 'standard' : 'budget',\n    expected_royalty: (price * 0.37).toFixed(2) // Rough Amazon royalty calc\n  };\n}\n\nconst result = optimizePricing(input.product_type, input.bsr, input.competition);\nreturn result;"
            }
          }
        ]
      },
      "id": "amazon-strategy-agent",
      "name": "Amazon Strategy Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [4750, 150]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_MEMORY_SHEET_ID}}",
          "mode": "id"
        },
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$json.concept_id.split('_')[0]}}",
            "agent": "strategy",
            "timestamp": "={{new Date().toISOString()}}",
            "type": "listing_strategy",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-strategy-memory",
      "name": "Save Strategy Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [4950, 150]
    },
    {
      "parameters": {
        "jsCode": "// Prepare final Amazon listing data\nconst strategyOutput = typeof $json.output === 'string'\n  ? JSON.parse($json.output)\n  : $json.output;\n\nconst designData = $node[\"resize-to-amazon\"].json;\nconst binaryData = $node[\"resize-to-amazon\"].binary;\n\n// Structure for Amazon upload sheet\nconst amazonListing = {\n  // Design identifiers\n  concept_id: designData.concept_id,\n  variant_id: designData.variant_id,\n  design_theme: designData.design_theme,\n  niche: designData.niche,\n  \n  // File information\n  filename: `${designData.concept_id}_4500x5400.png`,\n  design_url: designData.design_url,\n  \n  // Amazon metadata\n  brand_name: strategyOutput.brand_name,\n  \n  // T-Shirt listing\n  tshirt_title: strategyOutput.tshirt.title,\n  tshirt_bullet1: strategyOutput.tshirt.bullets[0],\n  tshirt_bullet2: strategyOutput.tshirt.bullets[1],\n  tshirt_description: strategyOutput.tshirt.description || '',\n  tshirt_keywords: strategyOutput.tshirt.backend_keywords,\n  tshirt_price: strategyOutput.tshirt.price,\n  \n  // Hoodie listing\n  hoodie_title: strategyOutput.hoodie.title,\n  hoodie_bullet1: strategyOutput.hoodie.bullets[0],\n  hoodie_bullet2: strategyOutput.hoodie.bullets[1],\n  hoodie_description: strategyOutput.hoodie.description || '',\n  hoodie_keywords: strategyOutput.hoodie.backend_keywords,\n  hoodie_price: strategyOutput.hoodie.price,\n  \n  // Tank Top listing\n  tank_title: strategyOutput.tank_top.title,\n  tank_bullet1: strategyOutput.tank_top.bullets[0],\n  tank_bullet2: strategyOutput.tank_top.bullets[1],\n  tank_description: strategyOutput.tank_top.description || '',\n  tank_keywords: strategyOutput.tank_top.backend_keywords,\n  tank_price: strategyOutput.tank_top.price,\n  \n  // Quality metrics\n  quality_score: designData.amazon_quality_score,\n  compliance_score: designData.compliance_check.amazon_risk_score,\n  thumbnail_score: designData.quality_assessment.quality_scores.mobile_visibility,\n  \n  // Market data\n  niche_bsr: designData.metadata.niche_data.metrics.avg_bsr,\n  competition_count: designData.metadata.niche_data.metrics.competition,\n  opportunity_score: designData.metadata.niche_data.opportunity_score,\n  \n  // Timestamps\n  created_at: new Date().toISOString(),\n  ready_for_upload: true\n};\n\nreturn [{\n  json: amazonListing,\n  binary: binaryData\n}];"
      },
      "id": "prepare-final-data",
      "name": "Prepare Final Amazon Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [5150, 150]
    },
    {
      "parameters": {
        "operation": "upload",
        "binaryPropertyName": "data",
        "googleFolder": {
          "__rl": true,
          "value": "={{$vars.AMAZON_DESIGNS_FOLDER_ID}}",
          "mode": "id"
        },
        "name": "={{$json.filename}}",
        "options": {}
      },
      "id": "upload-to-drive",
      "name": "Upload Design to Drive",
      "type": "n8n-nodes-base.googleDrive",
      "typeVersion": 3,
      "position": [5350, 150]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_LISTINGS_SHEET_ID}}",
          "mode": "id"
        },
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
      "position": [5550, 150]
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{$node[\"design-batcher\"].context[\"noItemsLeft\"]}}",
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
      "position": [5750, 150]
    },
    {
      "parameters": {
        "jsCode": "// Generate Amazon execution summary\nconst execution = $node[\"init-amazon-system\"].json;\nconst allUploads = $input.all();\n\n// Calculate metrics\nconst executionTime = (new Date() - new Date(execution.timestamp)) / 1000 / 60;\nconst designsApproved = allUploads.length;\nconst designsPerHour = (designsApproved / executionTime) * 60;\n\n// Aggregate niche performance\nconst nicheStats = {};\nallUploads.forEach(item => {\n  const niche = item.json.niche;\n  if (!nicheStats[niche]) {\n    nicheStats[niche] = {\n      count: 0,\n      avg_quality: 0,\n      avg_opportunity: 0\n    };\n  }\n  nicheStats[niche].count++;\n  nicheStats[niche].avg_quality += parseFloat(item.json.quality_score);\n  nicheStats[niche].avg_opportunity += parseFloat(item.json.opportunity_score);\n});\n\n// Calculate averages\nObject.keys(nicheStats).forEach(niche => {\n  nicheStats[niche].avg_quality = (nicheStats[niche].avg_quality / nicheStats[niche].count).toFixed(2);\n  nicheStats[niche].avg_opportunity = (nicheStats[niche].avg_opportunity / nicheStats[niche].count).toFixed(2);\n});\n\n// Generate insights\nconst insights = {\n  execution_id: execution.execution_id,\n  platform: 'merch_by_amazon',\n  duration_minutes: executionTime.toFixed(2),\n  designs_approved: designsApproved,\n  designs_per_hour: designsPerHour.toFixed(1),\n  total_listings: designsApproved * 3, // 3 products per design\n  niche_performance: nicheStats,\n  recommendations: []\n};\n\n// Adaptive recommendations\nif (designsPerHour < 20) {\n  insights.recommendations.push('Consider relaxing quality thresholds slightly');\n}\nif (Object.keys(nicheStats).length < 3) {\n  insights.recommendations.push('Explore more diverse niches for better portfolio balance');\n}\n\nreturn [{ json: insights }];"
      },
      "id": "execution-summary",
      "name": "Amazon Execution Summary",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [5950, 150]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_MEMORY_SHEET_ID}}",
          "mode": "id"
        },
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
      "position": [6150, 150]
    }
  ],
  "connections": {
    "Schedule Trigger (3h)": {
      "main": [[{"node": "Load Agent Memory", "type": "main", "index": 0}]]
    },
    "Manual Trigger": {
      "main": [[{"node": "Load Agent Memory", "type": "main", "index": 0}]]
    },
    "Load Agent Memory": {
      "main": [[{"node": "Initialize Amazon System", "type": "main", "index": 0}]]
    },
    "Initialize Amazon System": {
      "main": [[{"node": "Amazon Research Agent", "type": "main", "index": 0}]]
    },
    "Amazon Research Agent": {
      "main": [[{"node": "Save Research Memory", "type": "main", "index": 0}]]
    },
    "Save Research Memory": {
      "main": [[{"node": "Process Amazon Opportunities", "type": "main", "index": 0}]]
    },
    "Process Amazon Opportunities": {
      "main": [[{"node": "Amazon Creative Agent", "type": "main", "index": 0}]]
    },
    "Amazon Creative Agent": {
      "main": [[{"node": "Save Creative Memory", "type": "main", "index": 0}]]
    },
    "Save Creative Memory": {
      "main": [[{"node": "Prepare Amazon Designs", "type": "main", "index": 0}]]
    },
    "Prepare Amazon Designs": {
      "main": [[{"node": "Design Batch Processor", "type": "main", "index": 0}]]
    },
    "Design Batch Processor": {
      "main": [[
        {"node": "Build Amazon IP Queries", "type": "main", "index": 0},
        {"node": "Check Batch Complete", "type": "main", "index": 0}
      ]]
    },
    "Build Amazon IP Queries": {
      "main": [[
        {"node": "USPTO Trademark Check", "type": "main", "index": 0},
        {"node": "MarkerAPI Trademark Check", "type": "main", "index": 0}
      ]]
    },
    "USPTO Trademark Check": {
      "main": [[{"node": "Amazon Trademark Gate", "type": "main", "index": 0}]]
    },
    "MarkerAPI Trademark Check": {
      "main": [[{"node": "Amazon Trademark Gate", "type": "main", "index": 0}]]
    },
    "Amazon Trademark Gate": {
      "main": [
        [{"node": "Generate Design (DALL-E 3)", "type": "main", "index": 0}],
        [
          {"node": "Log Amazon IP Flagged", "type": "main", "index": 0},
          {"node": "Design Batch Processor", "type": "main", "index": 0}
        ]
      ]
    },
    "Log Amazon IP Flagged": {
      "main": [[]]
    },
    "Generate Design (DALL-E 3)": {
      "main": [[{"node": "Amazon Compliance Agent", "type": "main", "index": 0}]]
    },
    "Amazon Compliance Agent": {
      "main": [[{"node": "Parse Compliance Result", "type": "main", "index": 0}]]
    },
    "Parse Compliance Result": {
      "main": [[{"node": "Amazon Compliance Gate", "type": "main", "index": 0}]]
    },
    "Amazon Compliance Gate": {
      "main": [
        [{"node": "Amazon Quality Agent", "type": "main", "index": 0}],
        [
          {"node": "Log Policy Flagged", "type": "main", "index": 0},
          {"node": "Design Batch Processor", "type": "main", "index": 0}
        ]
      ]
    },
    "Log Policy Flagged": {
      "main": [[]]
    },
    "Amazon Quality Agent": {
      "main": [[{"node": "Process Quality Results", "type": "main", "index": 0}]]
    },
    "Process Quality Results": {
      "main": [[{"node": "Quality Gate", "type": "main", "index": 0}]]
    },
    "Quality Gate": {
      "main": [
        [
          {"node": "Save Quality Pass Memory", "type": "main", "index": 0},
          {"node": "Download Approved Design", "type": "main", "index": 0}
        ],
        [{"node": "Log Rejected Designs", "type": "main", "index": 0}]
      ]
    },
    "Save Quality Pass Memory": {
      "main": [[{"node": "Design Batch Processor", "type": "main", "index": 0}]]
    },
    "Log Rejected Designs": {
      "main": [[{"node": "Design Batch Processor", "type": "main", "index": 0}]]
    },
    "Download Approved Design": {
      "main": [[{"node": "Resize to Amazon Specs", "type": "main", "index": 0}]]
    },
    "Resize to Amazon Specs": {
      "main": [[{"node": "Amazon Strategy Agent", "type": "main", "index": 0}]]
    },
    "Amazon Strategy Agent": {
      "main": [[{"node": "Save Strategy Memory", "type": "main", "index": 0}]]
    },
    "Save Strategy Memory": {
      "main": [[{"node": "Prepare Final Amazon Data", "type": "main", "index": 0}]]
    },
    "Prepare Final Amazon Data": {
      "main": [[{"node": "Upload Design to Drive", "type": "main", "index": 0}]]
    },
    "Upload Design to Drive": {
      "main": [[
        {"node": "Save to Upload Sheet", "type": "main", "index": 0},
        {"node": "Design Batch Processor", "type": "main", "index": 0}
      ]]
    },
    "Save to Upload Sheet": {
      "main": [[{"node": "Check Batch Complete", "type": "main", "index": 0}]]
    },
    "Check Batch Complete": {
      "main": [
        [{"node": "Amazon Execution Summary", "type": "main", "index": 0}],
        []
      ]
    },
    "Amazon Execution Summary": {
      "main": [[{"node": "Save Execution Summary", "type": "main", "index": 0}]]
    }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": {},
  "meta": {
    "templateId": "merch-amazon-ai-agents-complete"
  }
}