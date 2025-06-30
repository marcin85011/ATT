{
  "name": "Merch by Amazon - Enhanced 2025 Edition",
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
      "position": [
        250,
        300
      ]
    },
    {
      "parameters": {},
      "id": "manual-trigger",
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [
        250,
        450
      ]
    },
    {
      "parameters": {
        "content": "## 🎯 Enhanced Merch by Amazon AI Agent System\n\n### 2025 Market Optimizations:\n- **Product Intelligence**: Bella+Canvas 3001 & Gildan 18500 scoring\n- **Color Strategy**: 45% success with black/white combinations\n- **BSR Tiers**: Excellent (<50k), Good (<100k), Marginal (<500k), Poor (>1M)\n- **A10 Algorithm**: Organic sales (25%), External traffic (20%), CTR (15%)\n- **Design Priorities**: Text-only (23% conversion), Mobile-first (160px)\n- **Creative Mutations**: 20% experimental designs\n- **Negative Feedback**: Learning from failed keywords\n- **Dynamic Pricing**: Tiered by seller level\n\n### Enhanced Features:\n1. **Research Agent**: BSR tier analysis, negative keyword filtering\n2. **Creative Agent**: Color optimization, mutation system\n3. **Quality Agent**: 160px thumbnail testing, mobile requirements\n4. **Strategy Agent**: A10 optimization, dynamic pricing matrix\n\n### Required Variables (in n8n):\n- AMAZON_MEMORY_SHEET_ID\n- AMAZON_LISTINGS_SHEET_ID (for ReadyForUpload tab)\n- AMAZON_REJECTED_SHEET_ID\n- AMAZON_IP_FLAGGED_SHEET_ID\n- AMAZON_DESIGNS_FOLDER_ID"
      },
      "id": "system-overview",
      "name": "Enhanced Amazon System Overview",
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        450,
        100
      ]
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
      "position": [
        450,
        300
      ]
    },
    {
      "parameters": {
        "operation": "getAll",
        "documentId": {
          "__rl": true,
          "value": "={{$vars.AMAZON_MEMORY_SHEET_ID}}",
          "mode": "id"
        },
        "sheetName": "NegativeKeywords",
        "options": {
          "returnAllColumns": true
        }
      },
      "id": "load-negative-keywords",
      "name": "Load Negative Keywords",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [
        450,
        400
      ],
      "continueOnFail": true
    },
    {
      "parameters": {
        "jsCode": "// Enhanced Amazon-specific AI Agent System with 2025 optimizations\nconst memory = $node[\"load-agent-memory\"].json || [];\nconst negativeKeywords = $node[\"load-negative-keywords\"].json || [];\nconst currentDate = new Date();\n\n// Retrieve Amazon-specific insights\nconst amazonInsights = {\n  research: memory.filter(m => m.agent === 'research').slice(-20),\n  creative: memory.filter(m => m.agent === 'creative').slice(-20),\n  quality: memory.filter(m => m.agent === 'quality').slice(-20),\n  strategy: memory.filter(m => m.agent === 'strategy').slice(-20)\n};\n\n// Extract winning patterns for Amazon\nconst winningPatterns = amazonInsights.strategy\n  .filter(m => m.type === 'amazon_winner' && m.data)\n  .map(m => JSON.parse(m.data));\n\n// Process negative keywords from failed designs\nconst negativeKeywordList = (negativeKeywords\n  .map(k => k.keyword ? k.keyword.toLowerCase() : null))\n  .filter(Boolean);\n\n// Enhanced Amazon-specific system state\nconst systemState = {\n  execution_id: `AMZN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,\n  timestamp: currentDate.toISOString(),\n  platform: 'merch_by_amazon',\n  agent_memory: amazonInsights,\n  learned_patterns: winningPatterns,\n  negative_keywords: [...new Set(negativeKeywordList)],\n  \n  // Enhanced product performance scoring\n  product_performance: {\n    preferred_products: {\n      'T-Shirt': { \n        primary: 'Bella+Canvas 3001',\n        score: 95,\n        features: ['4.2oz cotton', '65+ colors', 'retail fit'],\n        conversion_boost: 1.23\n      },\n      'Hoodie': {\n        primary: 'Gildan 18500',\n        score: 90,\n        features: ['8.0oz fleece', '47+ colors', 'double-lined hood'],\n        price_advantage: true\n      }\n    }\n  },\n  \n  // Enhanced BSR analysis with visibility cliff\n  bsr_analysis: {\n    excellent: 50000,\n    good: 100000,\n    marginal: 500000,\n    poor: 1000000,\n    visibility_cliff: 500000\n  },\n  \n  // A10 algorithm optimization factors\n  a10_optimization: {\n    organic_sales: { weight: 0.25, priority: 1 },\n    external_traffic: { weight: 0.20, priority: 2 },\n    seller_authority: { weight: 0.18, priority: 3 },\n    click_through_rate: { weight: 0.15, priority: 4 },\n    mobile_first: { traffic_share: 0.77 }\n  },\n  \n  // Design priorities with conversion rates\n  design_priorities: {\n    text_only: { priority: 1, conversion: 0.23 },\n    text_with_graphics: { priority: 2, conversion: 0.18 },\n    graphics_only: { priority: 3, conversion: 0.12 }\n  },\n  \n  // Mobile optimization requirements\n  mobile_requirements: {\n    thumbnail_size: '160x160px',\n    readability_threshold: 0.85,\n    contrast_minimum: 4.5,\n    font_size_minimum: '72pt equivalent'\n  },\n  \n  amazon_targets: {\n    daily_designs: 50,\n    bsr_threshold: 500000,\n    saturation_limit: 1000,\n    quality_threshold: 9.0,\n    simplicity_score: 8.0,\n    mutation_rate: 0.2\n  },\n  \n  product_types: ['T-Shirt', 'Hoodie', 'Tank Top']\n};\n\n// Calculate mutation counter for creative experiments\nconst totalDesignsToday = amazonInsights.creative\n  .filter(m => m.timestamp && new Date(m.timestamp).toDateString() === currentDate.toDateString())\n  .length;\nconst shouldMutate = (totalDesignsToday + 1) % 5 === 0;\n\nsystemState.creative_mutation_due = shouldMutate;\n\nreturn [{\n  json: systemState\n}];"
      },
      "id": "init-amazon-system",
      "name": "Initialize Enhanced Amazon System",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        650,
        350
      ]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Enhanced Amazon Research Agent with 2025 market intelligence and negative keyword filtering.\n\nYour capabilities:\n- Analyze BSR with tier system (Excellent <50k, Good <100k, Marginal <500k, Poor >1M)\n- Identify evergreen niches with consistent demand\n- Detect market saturation levels\n- AVOID negative keywords from failed designs\n- Find underserved sub-niches\n- Focus on A10 algorithm factors\n\nMemory context:\n{{JSON.stringify($json.agent_memory.research, null, 2)}}\n\nNegative keywords to AVOID:\n{{JSON.stringify($json.negative_keywords, null, 2)}}\n\nProduct performance data:\n{{JSON.stringify($json.product_performance, null, 2)}}\n\nYour task: Identify 5 HIGH-POTENTIAL niches for Merch by Amazon based on:\n1. BSR tier analysis (prioritize Excellent and Good tiers)\n2. Less than 1,000 competing designs\n3. Evergreen appeal (not seasonal/trendy)\n4. Text-only design potential (23% conversion advantage)\n5. No trademark risks or negative keywords\n6. Works across T-shirts, Hoodies, and Tank Tops\n7. Mobile-first considerations (77% of traffic)\n\nFocus on:\n- Professions (Nurse, Teacher, Engineer)\n- Hobbies (Gaming, Fishing, Gardening)\n- Funny sayings (Dad jokes, Sarcasm)\n- Pride/Identity (Mom, Dad, Grandparent)\n- Motivational (but unique angles)\n\nFor each niche, include:\n- BSR tier classification\n- A10 optimization potential\n- Mobile visibility score\n- Color strategy recommendation",
        "systemMessage": "You are an expert Amazon market researcher with 2025 optimization knowledge. Focus on BSR tiers, A10 factors, and mobile-first design. Always return structured JSON with enhanced metrics.",
        "options": {
          "temperature": 0.7,
          "maxTokens": 4000
        },
        "tools": [
          {
            "type": "code",
            "tool": {
              "name": "analyze_amazon_niche_enhanced",
              "description": "Analyze Amazon niche with BSR tiers and A10 factors",
              "language": "javaScript",
              "code": "// Enhanced Amazon niche analyzer with BSR tiers\nconst analyzeNiche = (niche, keywords) => {\n  // Simulate BSR and competition data with tier analysis\n  const niches = {\n    'nurse_humor': { avg_bsr: 45000, competition: 750, growth: 'stable', tier: 'excellent' },\n    'fishing_dad': { avg_bsr: 89000, competition: 450, growth: 'growing', tier: 'good' },\n    'teacher_tired': { avg_bsr: 298000, competition: 890, growth: 'stable', tier: 'marginal' },\n    'gaming_programmer': { avg_bsr: 156000, competition: 320, growth: 'growing', tier: 'good' },\n    'plant_mom': { avg_bsr: 412000, competition: 680, growth: 'stable', tier: 'marginal' },\n    'gym_motivation': { avg_bsr: 734000, competition: 1200, growth: 'declining', tier: 'poor' },\n    'craft_beer_dad': { avg_bsr: 23000, competition: 290, growth: 'growing', tier: 'excellent' }\n  };\n  \n  const data = niches[niche] || { avg_bsr: 400000, competition: 600, growth: 'stable', tier: 'marginal' };\n  \n  // Enhanced scoring with BSR tiers\n  const tierScores = { excellent: 10, good: 7, marginal: 4, poor: 1 };\n  const bsrScore = tierScores[data.tier] || 4;\n  const compScore = Math.max(0, 10 - (data.competition / 100));\n  const growthBonus = data.growth === 'growing' ? 2 : data.growth === 'stable' ? 1 : 0;\n  \n  // A10 optimization potential\n  const a10Potential = {\n    organic_sales: data.tier === 'excellent' ? 0.9 : 0.6,\n    external_traffic: 0.7,\n    ctr_potential: data.competition < 500 ? 0.8 : 0.5,\n    mobile_friendly: 0.85\n  };\n  \n  const opportunityScore = (bsrScore * 0.4 + compScore * 0.3 + growthBonus * 0.3);\n  \n  return {\n    niche,\n    metrics: {\n      ...data,\n      bsr_tier: data.tier,\n      visibility_above_cliff: data.avg_bsr < 500000\n    },\n    a10_potential: a10Potential,\n    opportunity_score: opportunityScore.toFixed(2),\n    recommendation: opportunityScore > 7 ? 'HIGH_POTENTIAL' : opportunityScore > 5 ? 'MODERATE' : 'AVOID',\n    color_strategy: 'black_white_priority' \n  };\n};\n\nreturn analyzeNiche(input.niche, input.keywords);"
            }
          },
          {
            "type": "code",
            "tool": {
              "name": "filter_negative_keywords",
              "description": "Filter out niches with negative keywords",
              "language": "javaScript",
              "code": "// Filter niches based on negative keyword list\nfunction filterNegativeKeywords(nicheName, nicheKeywords, negativeList) {\n  const allTerms = [nicheName, ...nicheKeywords].map(t => t.toLowerCase());\n  \n  const hasNegativeKeyword = allTerms.some(term => \n    negativeList.some(negative => \n      term.includes(negative) || negative.includes(term)\n    )\n  );\n  \n  return {\n    niche: nicheName,\n    contains_negative: hasNegativeKeyword,\n    matched_negatives: negativeList.filter(neg => \n      allTerms.some(term => term.includes(neg) || neg.includes(term))\n    ),\n    recommendation: hasNegativeKeyword ? 'SKIP' : 'PROCEED'\n  };\n}\n\nconst result = filterNegativeKeywords(input.niche, input.keywords, input.negatives);\nreturn result;"
            }
          }
        ]
      },
      "id": "amazon-research-agent",
      "name": "Enhanced Amazon Research Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [
        850,
        350
      ]
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
            "type": "niche_analysis_enhanced",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-research-memory",
      "name": "Save Research Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [
        1050,
        350
      ]
    },
    {
      "parameters": {
        "jsCode": "// Process Enhanced Amazon Research output\nconst researchOutput = $json.output;\nconst systemState = $node[\"init-amazon-system\"].json;\n\n// Parse Amazon opportunities with enhanced filtering\nconst opportunities = typeof researchOutput === 'string' \n  ? JSON.parse(researchOutput)\n  : researchOutput;\n\n// Enhanced filtering with BSR tiers and A10 potential\nconst validOpportunities = opportunities.amazon_niches\n  .filter(opp => {\n    const tierPriority = ['excellent', 'good'];\n    const hasPriorityTier = tierPriority.includes(opp.metrics.bsr_tier);\n    \n    const a10Score = Object.values(opp.a10_potential || {}).reduce((a, b) => a + b, 0) / 4;\n    \n    return hasPriorityTier &&\n      opp.metrics.competition < systemState.amazon_targets.saturation_limit &&\n      opp.opportunity_score >= 7.0 &&\n      a10Score >= 0.7 &&\n      opp.metrics.visibility_above_cliff;\n  })\n  .map(opp => ({\n    ...opp,\n    execution_id: systemState.execution_id,\n    product_types: systemState.product_types,\n    product_performance: systemState.product_performance,\n    design_requirements: {\n      resolution: '4500x5400',\n      format: 'PNG',\n      background: 'transparent',\n      style: 'simple_bold_readable',\n      color_priority: opp.color_strategy,\n      mobile_optimized: true\n    },\n    creative_mutation_due: systemState.creative_mutation_due\n  }));\n\n// Return for processing\nreturn validOpportunities.map(opp => ({ json: opp }));"
      },
      "id": "process-opportunities",
      "name": "Process Enhanced Opportunities",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1250,
        350
      ]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Enhanced Amazon Creative Agent with color optimization and mutation capabilities.\n\nAmazon Design Principles 2025:\n- TEXT-ONLY PRIORITY: 23% conversion advantage over graphics\n- COLOR STRATEGY: Black background + white text (45% success) is PRIORITY 1\n- MOBILE FIRST: Must be readable at 160x160px thumbnail\n- SIMPLICITY: Maximum impact with minimum elements\n- PRODUCT OPTIMIZATION: Designs for {{$json.product_performance.preferred_products['T-Shirt'].primary}}, {{$json.product_performance.preferred_products['Hoodie'].primary}}, etc.\n\nColor requirements:\n- PRIORITY 1: Black background + white text (45% success rate)\n- PRIORITY 2: White background + black text (41% success rate)\n- Mobile visibility test: Must be readable at 160x160px\n- Reject low-contrast combinations automatically\n\nNiche Opportunity:\n{{JSON.stringify($json, null, 2)}}\n\nCREATIVE MUTATION STATUS: {{$json.creative_mutation_due ? 'REQUIRED' : 'STANDARD'}}\n\n{{#if $json.creative_mutation_due}}\n⚡ MUTATION REQUIRED: For this concept, you MUST introduce a 'creative mutation':\n- Combine two unrelated trending topics\n- Use completely unexpected visual style for the niche\n- Create design based on contrarian take\n- Apply absurdist humor or surreal approach\n- Label this with mutation: true\n{{/if}}\n\nGenerate 5 design concepts with 3 variations each:\n1. Typography-focused (different fonts/layouts)\n2. Simple icon + text combinations\n3. Funny/Clever saying variations\n{{#if $json.creative_mutation_due}}4. MUTATION CONCEPT (experimental/unexpected){{/if}}\n\nFor each design:\n- Use BLACK/WHITE color scheme for highest conversion\n- Ensure 160px thumbnail readability\n- Keep it SIMPLE (text-only preferred)\n- Maximum 3 colors total\n- Font size minimum 72pt equivalent\n- High contrast (4.5:1 minimum)\n- NO gradients, photos, or complex illustrations\n\nFocus on what sells on Amazon:\n- Profession pride with twist\n- Hobby enthusiasm with humor\n- Family roles with unique angle\n- Motivational with edge",
        "systemMessage": "You are an expert Amazon POD designer specializing in high-converting text-only designs. Prioritize black/white combinations and mobile readability. When mutation is required, be boldly creative while maintaining readability. Always return structured JSON.",
        "options": {
          "temperature": "={{$json.creative_mutation_due ? 0.9 : 0.8}}",
          "maxTokens": 4000
        },
        "tools": [
          {
            "type": "code",
            "tool": {
              "name": "generate_color_optimized_variations",
              "description": "Generate color-optimized design variations",
              "language": "javaScript",
              "code": "// Enhanced variation generator with color strategy\nfunction generateVariations(baseTheme, niche, isMutation) {\n  const colorStrategies = {\n    A: {\n      background: 'black',\n      text: 'white',\n      accent: 'white',\n      success_rate: 0.45,\n      mobile_score: 10\n    },\n    B: {\n      background: 'white',\n      text: 'black',\n      accent: 'black',\n      success_rate: 0.41,\n      mobile_score: 9\n    },\n    C: {\n      background: 'dark_navy',\n      text: 'white',\n      accent: 'light_gray',\n      success_rate: 0.38,\n      mobile_score: 8\n    }\n  };\n  \n  const variations = {};\n  Object.keys(colorStrategies).forEach(key => {\n    variations[key] = {\n      color_scheme: colorStrategies[key],\n      style: key === 'A' ? 'bold_typography' : key === 'B' ? 'clean_minimal' : 'vintage_text',\n      layout: key === 'A' ? 'centered_stack' : key === 'B' ? 'left_aligned' : 'curved_banner',\n      font: key === 'A' ? 'impact_style' : key === 'B' ? 'helvetica_bold' : 'retro_serif',\n      approach: isMutation ? 'experimental_fusion' : 'proven_formula',\n      mutation: isMutation\n    };\n    \n    variations[key].print_placement = {\n      tshirt: 'center_chest',\n      hoodie: 'center_chest_above_pocket',\n      tank: 'center_chest_narrow'\n    };\n    variations[key].max_colors = 3;\n    variations[key].complexity = 'simple';\n    variations[key].thumbnail_optimized = true;\n  });\n  \n  return variations;\n}\n\nconst result = generateVariations(input.theme, input.niche, input.is_mutation);\nreturn result;"
            }
          },
          {
            "type": "code",
            "tool": {
              "name": "validate_mobile_thumbnail",
              "description": "Validate design for 160px thumbnail visibility",
              "language": "javaScript",
              "code": "// Mobile thumbnail validation with enhanced metrics\nfunction validateMobileThumbnail(textLength, fontSize, contrast, complexity) {\n  // 160x160px thumbnail requirements\n  const minFontSize = 72;\n  const minContrast = 4.5;\n  const maxTextLength = 10; // Optimal for mobile\n  \n  const fontScore = fontSize >= minFontSize ? 10 : (fontSize / minFontSize) * 10;\n  const contrastScore = contrast >= minContrast ? 10 : (contrast / minContrast) * 10;\n  const lengthScore = Math.max(0, 10 - ((textLength - maxTextLength) * 0.5));\n  const simplicityScore = 10 - complexity;\n  \n  const thumbnailScore = (fontScore * 0.3 + contrastScore * 0.3 + lengthScore * 0.2 + simplicityScore * 0.2);\n  \n  return {\n    thumbnail_score: thumbnailScore.toFixed(2),\n    passes_160px_test: thumbnailScore >= 8.5,\n    optimization_tips: {\n      font_size: fontSize < minFontSize ? `Increase to ${minFontSize}pt` : 'OK',\n      contrast: contrast < minContrast ? `Increase to ${minContrast}:1` : 'OK',\n      text_length: textLength > maxTextLength ? `Reduce to ${maxTextLength} words` : 'OK',\n      overall: thumbnailScore < 8.5 ? 'Simplify design for mobile' : 'Mobile optimized'\n    },\n    mobile_ready: thumbnailScore >= 8.5\n  };\n}\n\nconst result = validateMobileThumbnail(input.text_length, input.font_size, input.contrast, input.complexity);\nreturn result;"
            }
          }
        ]
      },
      "id": "amazon-creative-agent",
      "name": "Enhanced Amazon Creative Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [
        1450,
        350
      ]
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
            "type": "={{$json.creative_mutation_due ? 'design_generation_mutation' : 'design_generation_standard'}}",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-creative-memory",
      "name": "Save Creative Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [
        1650,
        350
      ]
    },
    {
      "parameters": {
        "jsCode": "// Process Enhanced Creative output with color optimization\nconst creativeOutput = $json.output;\nconst nicheData = $node[\"process-opportunities\"].json;\n\n// Parse design concepts\nconst concepts = typeof creativeOutput === 'string'\n  ? JSON.parse(creativeOutput)\n  : creativeOutput;\n\n// Prepare Amazon-optimized designs with color strategy\nlet allDesigns = [];\n\nconcepts.design_concepts.forEach(concept => {\n  concept.variations.forEach(variation => {\n    // Enhanced prompt with color strategy and mobile optimization\n    const colorScheme = variation.color_scheme || { background: 'black', text: 'white' };\n    const isMutation = concept.mutation || false;\n    \n    const designPrompt = `Create a Merch by Amazon t-shirt design.\n${concept.theme}\n${variation.text_content ? `Text (MUST be perfectly readable): \"${variation.text_content}\"` : ''}\n\nCOLOR REQUIREMENTS:\n- Background: ${colorScheme.background}\n- Text color: ${colorScheme.text}\n- Accent (if any): ${colorScheme.accent}\n- High contrast ratio: minimum 4.5:1\n\nAMAZON REQUIREMENTS:\n- Resolution: 4500x5400 pixels\n- Transparent background PNG\n- Text-only design preferred (23% higher conversion)\n- Must be readable at 160x160px thumbnail size\n- Font size: minimum 72pt equivalent\n- Maximum 3 colors total\n- Style: ${variation.style}\n- Layout: ${variation.layout}\n- Font style: ${variation.font_type || variation.font}\n${isMutation ? '- CREATIVE MUTATION: Experimental/unexpected approach' : ''}\n\nDESIGN MUST BE:\n- Centered on transparent background\n- Bold and impactful for mobile viewing\n- Simple enough to work on ${nicheData.product_performance.preferred_products['T-Shirt'].primary}, ${nicheData.product_performance.preferred_products['Hoodie'].primary}, Tank Top\n- Professional print-ready quality\n- NO gradients, photos, or complex effects\n- NO copyrighted elements or brand references`;\n\n    allDesigns.push({\n      concept_id: `${nicheData.execution_id}_${concept.concept_id}`,\n      variant_id: variation.variant_id,\n      niche: nicheData.niche_name,\n      product_types: nicheData.product_types,\n      product_performance: nicheData.product_performance,\n      design_theme: concept.theme,\n      text_content: variation.text_content || '',\n      keywords: concept.amazon_keywords || [],\n      enhanced_prompt: designPrompt,\n      color_strategy: colorScheme,\n      is_mutation: isMutation,\n      design_type: variation.text_content && !variation.has_graphics ? 'text_only' : 'text_with_graphics',\n      expected_conversion: variation.text_content && !variation.has_graphics ? 0.23 : 0.18,\n      design_specs: {\n        resolution: '4500x5400',\n        format: 'PNG',\n        background: 'transparent',\n        max_colors: 3,\n        print_area: '12x15 inches',\n        mobile_optimized: true,\n        thumbnail_size: '160x160px'\n      },\n      quality_targets: {\n        simplicity_score: 8.0,\n        readability_score: 9.0,\n        thumbnail_score: 8.5,\n        contrast_ratio: 4.5\n      },\n      metadata: {\n        ...concept,\n        ...variation,\n        niche_data: nicheData,\n        bsr_tier: nicheData.metrics.bsr_tier,\n        a10_potential: nicheData.a10_potential\n      }\n    });\n  });\n});\n\n// Track mutations for analysis\nif (allDesigns.some(d => d.is_mutation)) {\n  console.log(`Creative mutation generated for execution ${nicheData.execution_id}`);\n}\n\n// Return for batch processing\nreturn allDesigns.map(design => ({ json: design }));"
      },
      "id": "prepare-amazon-designs",
      "name": "Prepare Enhanced Designs",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        1850,
        350
      ]
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
      "position": [
        2050,
        350
      ]
    }
  ]
}
,
    {
      "parameters": {
        "jsCode": "// Enhanced IP check for Amazon with expanded brand list\nconst concept = $json;\n\n// Expanded high-risk brand list for Amazon\nconst amazonHighRiskBrands = [\n  'Nike', 'Adidas', 'Disney', 'Marvel', 'Star Wars', \n  'NFL', 'NBA', 'MLB', 'NHL', 'FIFA',\n  'Nintendo', 'Pokemon', 'Sony', 'Xbox', 'PlayStation',\n  'Apple', 'Google', 'Amazon', 'Microsoft', 'Meta',\n  'Coca-Cola', 'Pepsi', 'McDonald\\'s', 'Starbucks',\n  'Harry Potter', 'Lord of the Rings', 'Game of Thrones',\n  'Supreme', 'Gucci', 'Louis Vuitton', 'Chanel',\n  'Tesla', 'SpaceX', 'NASA', 'Harvard', 'Yale'\n];\n\n// Amazon is much stricter - check more thoroughly\nconst searchTerms = [\n  concept.design_theme,\n  ...(concept.keywords || []),\n  concept.text_content || '',\n  // Add common variations Amazon checks\n  concept.text_content?.replace(/[^a-zA-Z0-9\\s]/g, ''),\n  concept.text_content?.toLowerCase(),\n  concept.text_content?.toUpperCase(),\n  // Check for phonetic similarities\n  concept.text_content?.replace(/ph/gi, 'f'),\n  concept.text_content?.replace(/ck/gi, 'k')\n].filter(Boolean);\n\n// Clean and prepare comprehensive queries\nconst cleanedTerms = [...new Set(searchTerms)].map(term => \n  term.trim()\n    .replace(/[^a-zA-Z0-9\\s]/g, '')\n    .toLowerCase()\n);\n\n// Check for brand risks including partial matches\nconst brandRisks = [];\ncleanedTerms.forEach(term => {\n  amazonHighRiskBrands.forEach(brand => {\n    const brandLower = brand.toLowerCase();\n    if (term.includes(brandLower) || \n        brandLower.includes(term) || \n        term.replace(/[aeiou]/g, '') === brandLower.replace(/[aeiou]/g, '')) {\n      brandRisks.push({ term, brand, risk: 'HIGH' });\n    }\n  });\n});\n\n// Amazon checks exact matches more strictly\nconst usptoQuery = cleanedTerms.slice(0, 3).join(' '); // Multiple terms\nconst markerQuery = cleanedTerms\n  .map(s => encodeURIComponent(s))\n  .join('|');\n\nreturn [{\n  json: {\n    ...concept,\n    ip_check: {\n      uspto_query: usptoQuery,\n      marker_query: markerQuery,\n      raw_terms: cleanedTerms,\n      brand_risks: brandRisks,\n      brand_risk_detected: brandRisks.length > 0,\n      risk_level: brandRisks.length > 0 ? 'HIGH' : 'CHECK_REQUIRED',\n      platform: 'amazon'\n    }\n  }\n}];"
      },
      "id": "build-amazon-ip-queries",
      "name": "Build Enhanced IP Queries",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2150,
        350
      ]
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
      "position": [
        2350,
        300
      ],
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
      "position": [
        2350,
        400
      ],
      "continueOnFail": true
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{($node[\"uspto-check\"].json.total || 0) > 0 || ($node[\"markerapi-check\"].json.total || 0) > 0 || $json.ip_check.brand_risk_detected || $json.ip_check.brand_risks.length > 0}}",
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
      "position": [
        2550,
        350
      ]
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
            "brand_risks": "={{JSON.stringify($json.ip_check.brand_risks)}}",
            "brand_risk": "={{$json.ip_check.brand_risk_detected ? 'YES' : 'NO'}}",
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
      "position": [
        2750,
        400
      ]
    },
    {
      "parameters": {
        "resource": "image",
        "prompt": "={{$json.enhanced_prompt}}",
        "options": {
          "quality": "hd",
          "size": "1024x1024",
          "style": "vivid",
          "n": 1,
          "responseFormat": "b64_json"
        }
      },
      "id": "generate-design",
      "name": "Generate Design (GPT-4o)",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1.4,
      "position": [
        2750,
        300
      ],
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
              "content": "You are \"Amazon-Compliance-Agent-2025,\" enforcing ZERO-TOLERANCE policies with mobile optimization awareness.\n\nAmazon Compliance Checks:\n1. Trademark/brand references (even partial/phonetic)\n2. Celebrity names or likenesses\n3. Sports teams, leagues, organizations\n4. Entertainment properties (movies/TV/books/games)\n5. Company names, slogans, logos\n6. Misleading claims (Best, #1, Official, Genuine)\n7. Prohibited content (drugs, weapons, hate, violence)\n8. Copyright characters or artwork\n9. Medical/health claims without FDA approval\n10. Environmental claims without FTC compliance\n\nMOBILE OPTIMIZATION CHECKS:\n- Text readable at 160x160px thumbnail?\n- Contrast ratio ≥ 4.5:1?\n- Font size appropriate for mobile?\n- Design fills 85% of area?\n\nRETURN ENHANCED JSON:\n{\n  \"trademark_hits\": [{\"term\":\"Example\",\"risk_level\":\"HIGH\",\"match_type\":\"exact|partial|phonetic\"}],\n  \"policy_flags\": [\"specific_violation\"],\n  \"amazon_risk_score\": 0-10,\n  \"mobile_optimization\": {\n    \"thumbnail_readable\": true/false,\n    \"contrast_ratio\": number,\n    \"predicted_ctr\": \"percentage\"\n  },\n  \"verdict\": \"PASS\" | \"REVIEW\" | \"FAIL\",\n  \"reason\": \"Specific explanation\",\n  \"fix_suggestion\": \"How to make it compliant\",\n  \"is_mutation\": true/false\n}"
            },
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": "Analyze this Merch by Amazon design for compliance and mobile optimization:\n{\n  \"title\": \"{{$node[\"design-batcher\"].json.design_theme}}\",\n  \"keywords\": {{JSON.stringify($node[\"design-batcher\"].json.keywords)}},\n  \"text\": \"{{$node[\"design-batcher\"].json.text_content}}\",\n  \"niche\": \"{{$node[\"design-batcher\"].json.niche}}\",\n  \"is_mutation\": {{$node[\"design-batcher\"].json.is_mutation}},\n  \"color_strategy\": {{JSON.stringify($node[\"design-batcher\"].json.color_strategy)}}\n}"
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
      "position": [
        2950,
        300
      ]
    },
    {
      "parameters": {
        "jsCode": "// Parse Enhanced Amazon compliance results\nconst complianceResult = typeof $json.message?.content === 'string'\n  ? JSON.parse($json.message.content)\n  : $json.message?.content || $json;\n\nconst designData = $node[\"design-batcher\"].json;\nconst imageB64 = $node[\"generate-design\"].json.data[0].b64_json;\n\n// Enhanced compliance with mobile checks\nconst passesCompliance = \n  complianceResult.verdict === 'PASS' && \n  complianceResult.amazon_risk_score < 3 && // Very low risk tolerance\n  complianceResult.mobile_optimization?.thumbnail_readable === true &&\n  complianceResult.mobile_optimization?.contrast_ratio >= 4.5;\n\n// Check if mutation designs get special handling\nconst isMutation = designData.is_mutation || complianceResult.is_mutation;\nconst mutationAllowance = isMutation ? 1 : 0; // Slightly more lenient for mutations\n\nreturn [{\n  json: {\n    ...designData,\n    design_b64: imageB64,\n    compliance_check: complianceResult,\n    passes_compliance: passesCompliance || (isMutation && complianceResult.amazon_risk_score < (3 + mutationAllowance)),\n    compliance_timestamp: new Date().toISOString(),\n    mobile_optimization: complianceResult.mobile_optimization,\n    is_mutation: isMutation\n  }\n}];"
      },
      "id": "parse-compliance",
      "name": "Parse Enhanced Compliance",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        3150,
        300
      ]
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
      "position": [
        3350,
        300
      ]
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
      "position": [
        3550,
        400
      ]
    },
    {
      "parameters": {
        "jsCode": "// Prepare data for the Strategy Agent\nconst designData = $node[\"compliance-gate\"].json;\nconst binaryData = $node[\"generate-design\"].binary.data;\n\nreturn [{\n  json: designData,\n  binary: {\n    data: binaryData\n  }\n}];"
      },
      "id": "prepare-strategy-input",
      "name": "Prepare Strategy Input",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        4150,
        100
      ]
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
      "position": [
        4550,
        200
      ]
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
        "name": "={{$node[\"prepare-final-data\"].json.filename}}",
        "options": {}
      },
      "id": "upload-to-drive",
      "name": "Upload Design to Drive",
      "type": "n8n-nodes-base.googleDrive",
      "typeVersion": 3,
      "position": [
        5550,
        200
      ]
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
      "position": [
        5750,
        200
      ]
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
      "position": [
        5950,
        200
      ]
    },
    {
      "parameters": {
        "jsCode": "// Enhanced Amazon execution summary with performance tracking\nconst execution = $node[\"init-amazon-system\"].json;\nconst allUploads = $input.all();\n\n// Calculate enhanced metrics\nconst executionTime = (new Date() - new Date(execution.timestamp)) / 1000 / 60;\nconst designsApproved = allUploads.length;\nconst designsPerHour = executionTime > 0 ? (designsApproved / executionTime) * 60 : 0;\n\n// Calculate mutation statistics\nconst mutationStats = {\n  total: allUploads.filter(d => d.json.is_mutation).length,\n  percentage: (allUploads.length > 0 ? (allUploads.filter(d => d.json.is_mutation).length / allUploads.length * 100) : 0).toFixed(1)\n};\n\n// Aggregate performance predictions\nlet totalPerformanceScore = 0;\nlet totalCTRPrediction = 0;\nconst colorStrategyStats = {};\nconst nicheStats = {};\n\nallUploads.forEach(item => {\n  const data = item.json;\n  \n  // Performance tracking\n  totalPerformanceScore += parseFloat(data.performance_score || 0);\n  totalCTRPrediction += parseFloat(data.predicted_ctr || 0);\n  \n  // Color strategy tracking\n  const colorKey = data.color_strategy ? `${data.color_strategy.background}/${data.color_strategy.text}` : 'unknown';\n  if (!colorStrategyStats[colorKey]) {\n    colorStrategyStats[colorKey] = { count: 0, avg_score: 0, avg_ctr: 0 };\n  }\n  colorStrategyStats[colorKey].count++;\n  colorStrategyStats[colorKey].avg_score += parseFloat(data.quality_score);\n  colorStrategyStats[colorKey].avg_ctr += parseFloat(data.predicted_ctr);\n  \n  // Niche performance\n  const niche = data.niche;\n  if (!nicheStats[niche]) {\n    nicheStats[niche] = {\n      count: 0,\n      avg_quality: 0,\n      avg_opportunity: 0,\n      avg_performance: 0,\n      mutations: 0\n    };\n  }\n  nicheStats[niche].count++;\n  nicheStats[niche].avg_quality += parseFloat(data.quality_score);\n  nicheStats[niche].avg_opportunity += parseFloat(data.opportunity_score);\n  nicheStats[niche].avg_performance += parseFloat(data.performance_score);\n  if (data.is_mutation) nicheStats[niche].mutations++;\n});\n\n// Calculate averages\nObject.keys(colorStrategyStats).forEach(key => {\n  const stat = colorStrategyStats[key];\n  stat.avg_score = (stat.avg_score / stat.count).toFixed(2);\n  stat.avg_ctr = (stat.avg_ctr / stat.count).toFixed(2);\n});\n\nObject.keys(nicheStats).forEach(niche => {\n  const stat = nicheStats[niche];\n  stat.avg_quality = (stat.avg_quality / stat.count).toFixed(2);\n  stat.avg_opportunity = (stat.avg_opportunity / stat.count).toFixed(2);\n  stat.avg_performance = (stat.avg_performance / stat.count).toFixed(2);\n  stat.mutation_rate = ((stat.mutations / stat.count) * 100).toFixed(1) + '%';\n});\n\n// Generate enhanced insights\nconst insights = {\n  execution_id: execution.execution_id,\n  platform: 'merch_by_amazon_enhanced',\n  duration_minutes: executionTime.toFixed(2),\n  designs_approved: designsApproved,\n  designs_per_hour: designsPerHour.toFixed(1),\n  total_listings: designsApproved * 3, // 3 products per design\n  \n  performance_metrics: {\n    avg_performance_score: (totalPerformanceScore / (designsApproved || 1)).toFixed(2),\n    avg_predicted_ctr: (totalCTRPrediction / (designsApproved || 1)).toFixed(2) + '%',\n    expected_ctr_above_target: allUploads.filter(d => parseFloat(d.json.predicted_ctr) >= 2.5).length,\n    mobile_optimized: allUploads.filter(d => d.json.mobile_optimization?.thumbnail_readable).length\n  },\n  \n  mutation_statistics: mutationStats,\n  color_strategy_performance: colorStrategyStats,\n  niche_performance: nicheStats,\n  \n  recommendations: []\n};\n\n// Enhanced adaptive recommendations\nif (insights.performance_metrics.avg_predicted_ctr < 2.5) {\n  insights.recommendations.push('Focus on higher contrast designs for better mobile CTR');\n}\nif (mutationStats.percentage < 15) {\n  insights.recommendations.push('Increase creative mutations to discover new opportunities');\n}\n\nreturn [{ json: insights }];"
      },
      "id": "execution-summary",
      "name": "Enhanced Execution Summary",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        6150,
        200
      ]
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
      "position": [
        6350,
        200
      ]
    }
  ],
  "connections": {},
  "settings": {}
}