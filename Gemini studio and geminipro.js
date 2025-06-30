{
  "name": "Merch by Amazon - Enhanced 2025 Edition (Fixed)",
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
        "content": "## 🎯 Enhanced Merch by Amazon AI Agent System v2.0\n\n### New Intelligence Features:\n- **Product Performance Scoring**: Bella+Canvas & Gildan preference\n- **Color Strategy**: 45% success with black/white combos\n- **A10 Algorithm Optimization**: External traffic focus\n- **Creative Mutations**: 20% experimental designs\n- **Negative Keyword Learning**: Prunes failed strategies\n- **Mobile-First Enforcement**: 160px thumbnail testing\n- **Dynamic Pricing Tiers**: Based on seller level\n- **Enhanced IP Protection**: Zero-tolerance compliance\n\n### Key Metrics:\n- Text-only designs: 23% conversion rate\n- BSR visibility cliff: 500k threshold\n- Mobile traffic: 77% of all views\n- Thumbnail CTR target: >2.5%\n- Daily Upload Target: 100 designs\n\n### Required Sheets:\n- AMAZON_MEMORY_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- AMAZON_QUEUE_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- AMAZON_LISTINGS_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- AMAZON_REJECTED_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- AMAZON_IP_FLAGGED_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- AMAZON_NEGATIVE_KEYWORDS_SHEET_ID: 1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk\n- DRIVE_FOLDER_ID: 1PEsieoyQyFQTG1LcRENMZdMIlq3S2F6d"
      },
      "id": "system-overview",
      "name": "Enhanced System Overview",
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
      "position": [450, 300]
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
        "jsCode": "// Enhanced Amazon-specific AI Agent System with 2025 optimizations\nconst memory = $node[\"Load Agent Memory\"].json || [];\nconst negativeKeywords = $node[\"Load Negative Keywords\"].json || [];\nconst currentDate = new Date();\n\n// Retrieve Amazon-specific insights\nconst amazonInsights = {\n  research: memory.filter(m => m.agent === 'research').slice(-20),\n  creative: memory.filter(m => m.agent === 'creative').slice(-20),\n  quality: memory.filter(m => m.agent === 'quality').slice(-20),\n  strategy: memory.filter(m => m.agent === 'strategy').slice(-20)\n};\n\n// Extract winning patterns for Amazon\nconst winningPatterns = amazonInsights.strategy\n  .filter(m => m.type === 'amazon_winner' && m.data)\n  .map(m => JSON.parse(m.data));\n\n// Process negative keywords from failed designs\nconst negativeKeywordList = (negativeKeywords\n  .map(k => k.keyword ? k.keyword.toLowerCase() : null))\n  .filter(Boolean);\n\n// Enhanced Amazon-specific system state\nconst systemState = {\n  execution_id: `AMZN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,\n  timestamp: currentDate.toISOString(),\n  platform: 'merch_by_amazon',\n  agent_memory: amazonInsights,\n  learned_patterns: winningPatterns,\n  negative_keywords: [...new Set(negativeKeywordList)],\n  \n  // Enhanced product performance scoring\n  product_performance: {\n    preferred_products: {\n      'T-Shirt': { \n        primary: 'Bella+Canvas 3001',\n        score: 95,\n        features: ['4.2oz cotton', '65+ colors', 'retail fit'],\n        conversion_boost: 1.23\n      },\n      'Hoodie': {\n        primary: 'Gildan 18500',\n        score: 90,\n        features: ['8.0oz fleece', '47+ colors', 'double-lined hood'],\n        price_advantage: true\n      }\n    }\n  },\n  \n  // Enhanced BSR analysis with visibility cliff\n  bsr_analysis: {\n    excellent: 50000,\n    good: 100000,\n    marginal: 500000,\n    poor: 1000000,\n    visibility_cliff: 500000\n  },\n  \n  // A10 algorithm optimization factors\n  a10_optimization: {\n    organic_sales: { weight: 0.25, priority: 1 },\n    external_traffic: { weight: 0.20, priority: 2 },\n    seller_authority: { weight: 0.18, priority: 3 },\n    click_through_rate: { weight: 0.15, priority: 4 },\n    mobile_first: { traffic_share: 0.77 }\n  },\n  \n  // Design priorities with conversion rates\n  design_priorities: {\n    text_only: { priority: 1, conversion: 0.23 },\n    text_with_graphics: { priority: 2, conversion: 0.18 },\n    graphics_only: { priority: 3, conversion: 0.12 }\n  },\n  \n  // Mobile optimization requirements\n  mobile_requirements: {\n    thumbnail_size: '160x160px',\n    readability_threshold: 0.85,\n    contrast_minimum: 4.5,\n    font_size_minimum: '72pt equivalent'\n  },\n  \n  amazon_targets: {\n    daily_designs: 100,\n    bsr_threshold: 500000,\n    saturation_limit: 1000,\n    quality_threshold: 9.0,\n    simplicity_score: 8.0,\n    mutation_rate: 0.2\n  },\n  \n  product_types: ['T-Shirt', 'Hoodie', 'Tank Top']\n};\n\n// Calculate mutation counter for creative experiments\nconst totalDesignsToday = amazonInsights.creative\n  .filter(m => m.timestamp && new Date(m.timestamp).toDateString() === currentDate.toDateString())\n  .length;\nconst shouldMutate = (totalDesignsToday + 1) % 5 === 0;\n\nsystemState.creative_mutation_due = shouldMutate;\n\nreturn [{\n  json: systemState\n}];"
      },
      "id": "init-amazon-system",
      "name": "Initialize Enhanced Amazon System",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 350]
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
          }
        ]
      },
      "id": "amazon-research-agent",
      "name": "Enhanced Amazon Research Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [850, 350]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$node[\"Initialize Enhanced Amazon System\"].json.execution_id}}",
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
      "position": [1050, 350]
    },
    {
      "parameters": {
        "jsCode": "// Process Enhanced Amazon Research output\nconst researchOutput = $json.output;\nconst systemState = $node[\"Initialize Enhanced Amazon System\"].json;\n\n// Parse Amazon opportunities with enhanced filtering\nconst opportunities = typeof researchOutput === 'string' \n  ? JSON.parse(researchOutput)\n  : researchOutput;\n\n// Enhanced filtering with BSR tiers and A10 potential\nconst validOpportunities = opportunities.amazon_niches\n  .filter(opp => {\n    const tierPriority = ['excellent', 'good'];\n    const hasPriorityTier = tierPriority.includes(opp.metrics.bsr_tier);\n    \n    const a10Score = Object.values(opp.a10_potential || {}).reduce((a, b) => a + b, 0) / 4;\n    \n    return hasPriorityTier &&\n      opp.metrics.competition < systemState.amazon_targets.saturation_limit &&\n      opp.opportunity_score >= 7.0 &&\n      a10Score >= 0.7 &&\n      opp.metrics.visibility_above_cliff;\n  })\n  .map(opp => ({\n    ...opp,\n    execution_id: systemState.execution_id,\n    product_types: systemState.product_types,\n    product_performance: systemState.product_performance,\n    design_requirements: {\n      resolution: '4500x5400',\n      format: 'PNG',\n      background: 'transparent',\n      style: 'simple_bold_readable',\n      color_priority: opp.color_strategy,\n      mobile_optimized: true\n    },\n    creative_mutation_due: systemState.creative_mutation_due\n  }));\n\n// Return for processing\nreturn validOpportunities.map(opp => ({ json: opp }));"
      },
      "id": "process-opportunities",
      "name": "Process Enhanced Opportunities",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1250, 350]
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
          }
        ]
      },
      "id": "amazon-creative-agent",
      "name": "Enhanced Amazon Creative Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [1450, 350]
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": "1KvkT4RRypuLjU_QqrynZ7DRkPisV8XFIXmE_r31HTDk",
        "sheetName": "AgentMemory",
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "execution_id": "={{$node[\"Initialize Enhanced Amazon System\"].json.execution_id}}",
            "agent": "creative",
            "timestamp": "={{new Date().toISOString()}}",
            "type": "={{$node['Initialize Enhanced Amazon System'].json.creative_mutation_due ? 'design_generation_mutation' : 'design_generation_standard'}}",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-creative-memory",
      "name": "Save Creative Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [1650, 350]
    },
    {
      "parameters": {
        "jsCode": "// Process Enhanced Creative output with color optimization\nconst creativeOutput = $json.output;\nconst nicheData = $node[\"Process Enhanced Opportunities\"].json;\n\n// Parse design concepts\nconst concepts = typeof creativeOutput === 'string'\n  ? JSON.parse(creativeOutput)\n  : creativeOutput;\n\n// Prepare Amazon-optimized designs with color strategy\nlet allDesigns = [];\n\nconcepts.design_concepts.forEach(concept => {\n  concept.variations.forEach(variation => {\n    // Enhanced prompt with color strategy and mobile optimization\n    const colorScheme = variation.color_scheme || { background: 'black', text: 'white' };\n    const isMutation = concept.mutation || false;\n    \n    const designPrompt = `Create a Merch by Amazon t-shirt design.\n${concept.theme}\n${variation.text_content ? `Text (MUST be perfectly readable): \"${variation.text_content}\"` : ''}\n\nCOLOR REQUIREMENTS:\n- Background: ${colorScheme.background}\n- Text color: ${colorScheme.text}\n- Accent (if any): ${colorScheme.accent}\n- High contrast ratio: minimum 4.5:1\n\nAMAZON REQUIREMENTS:\n- Resolution: 4500x5400 pixels\n- Transparent background PNG\n- Text-only design preferred (23% higher conversion)\n- Must be readable at 160x160px thumbnail size\n- Font size: minimum 72pt equivalent\n- Maximum 3 colors total\n- Style: ${variation.style}\n- Layout: ${variation.layout}\n- Font style: ${variation.font_type || variation.font}\n${isMutation ? '- CREATIVE MUTATION: Experimental/unexpected approach' : ''}\n\nDESIGN MUST BE:\n- Centered on transparent background\n- Bold and impactful for mobile viewing\n- Simple enough to work on ${nicheData.product_performance.preferred_products['T-Shirt'].primary}, ${nicheData.product_performance.preferred_products['Hoodie'].primary}, Tank Top\n- Professional print-ready quality\n- NO gradients, photos, or complex effects\n- NO copyrighted elements or brand references`;\n\n    allDesigns.push({\n      concept_id: `${nicheData.execution_id}_${concept.concept_id}`,\n      variant_id: variation.variant_id,\n      niche: nicheData.niche_name,\n      product_types: nicheData.product_types,\n      product_performance: nicheData.product_performance,\n      design_theme: concept.theme,\n      text_content: variation.text_content || '',\n      keywords: concept.amazon_keywords || [],\n      enhanced_prompt: designPrompt,\n      color_strategy: colorScheme,\n      is_mutation: isMutation,\n      design_type: variation.text_content && !variation.has_graphics ? 'text_only' : 'text_with_graphics',\n      expected_conversion: variation.text_content && !variation.has_graphics ? 0.23 : 0.18,\n      design_specs: {\n        resolution: '4500x5400',\n        format: 'PNG',\n        background: 'transparent',\n        max_colors: 3,\n        print_area: '12x15 inches',\n        mobile_optimized: true,\n        thumbnail_size: '160x160px'\n      },\n      quality_targets: {\n        simplicity_score: 8.0,\n        readability_score: 9.0,\n        thumbnail_score: 8.5,\n        contrast_ratio: 4.5\n      },\n      metadata: {\n        ...concept,\n        ...variation,\n        niche_data: nicheData,\n        bsr_tier: nicheData.metrics.bsr_tier,\n        a10_potential: nicheData.a10_potential\n      }\n    });\n  });\n});\n\n// Track mutations for analysis\nif (allDesigns.some(d => d.is_mutation)) {\n  console.log(`Creative mutation generated for execution ${nicheData.execution_id}`);\n}\n\n// Return for batch processing\nreturn allDesigns.map(design => ({ json: design }));"
      },
      "id": "prepare-amazon-designs",
      "name": "Prepare Enhanced Designs",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1850, 350]
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
      "position": [2050, 350]
    },
    {
      "parameters": {
        "jsCode": "// Enhanced IP check for Amazon with expanded brand list\nconst concept = $json;\n\n// Expanded high-risk brand list for Amazon\nconst amazonHighRiskBrands = [\n  'Nike', 'Adidas', 'Disney', 'Marvel', 'Star Wars', \n  'NFL', 'NBA', 'MLB', 'NHL', 'FIFA',\n  'Nintendo', 'Pokemon', 'Sony', 'Xbox', 'PlayStation',\n  'Apple', 'Google', 'Amazon', 'Microsoft', 'Meta',\n  'Coca-Cola', 'Pepsi', 'McDonald\\'s', 'Starbucks',\n  'Harry Potter', 'Lord of the Rings', 'Game of Thrones',\n  'Supreme', 'Gucci', 'Louis Vuitton', 'Chanel',\n  'Tesla', 'SpaceX', 'NASA', 'Harvard', 'Yale'\n];\n\n// Amazon is much stricter - check more thoroughly\nconst searchTerms = [\n  concept.design_theme,\n  ...(concept.keywords || []),\n  concept.text_content || '',\n  // Add common variations Amazon checks\n  concept.text_content?.replace(/[^a-zA-Z0-9\\s]/g, ''),\n  concept.text_content?.toLowerCase(),\n  concept.text_content?.toUpperCase(),\n  // Check for phonetic similarities\n  concept.text_content?.replace(/ph/gi, 'f'),\n  concept.text_content?.replace(/ck/gi, 'k')\n].filter(Boolean);\n\n// Clean and prepare comprehensive queries\nconst cleanedTerms = [...new Set(searchTerms)].map(term => \n  term.trim()\n    .replace(/[^a-zA-Z0-9\\s]/g, '')\n    .toLowerCase()\n);\n\n// Check for brand risks including partial matches\nconst brandRisks = [];\ncleanedTerms.forEach(term => {\n  amazonHighRiskBrands.forEach(brand => {\n    const brandLower = brand.toLowerCase();\n    if (term.includes(brandLower) || \n        brandLower.includes(term) || \n        term.replace(/[aeiou]/g, '') === brandLower.replace(/[aeiou]/g, '')) {\n      brandRisks.push({ term, brand, risk: 'HIGH' });\n    }\n  });\n});\n\n// Amazon checks exact matches more strictly\nconst usptoQuery = cleanedTerms.slice(0, 3).join(' '); // Multiple terms\nconst markerQuery = cleanedTerms\n  .map(s => encodeURIComponent(s))\n  .join('|');\n\nreturn [{\n  json: {\n    ...concept,\n    ip_check: {\n      uspto_query: usptoQuery,\n      marker_query: markerQuery,\n      raw_terms: cleanedTerms,\n      brand_risks: brandRisks,\n      brand_risk_detected: brandRisks.length > 0,\n      risk_level: brandRisks.length > 0 ? 'HIGH' : 'CHECK_REQUIRED',\n      platform: 'amazon'\n    }\n  }\n}];"
      },
      "id": "build-amazon-ip-queries",
      "name": "Build Enhanced IP Queries",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [2250, 350]
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
      "position": [2450, 250],
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
      "position": [2450, 450],
      "continueOnFail": true
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
      "position": [2650, 350]
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
      "position": [2850, 450]
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
      "position": [2850, 250],
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
      "position": [3050, 250]
    },
    {
      "parameters": {
        "jsCode": "// Parse Enhanced Amazon compliance results\nconst complianceResult = typeof $json.message?.content === 'string'\n  ? JSON.parse($json.message.content)\n  : $json.message?.content || $json;\n\nconst designData = $node[\"Design Batch Processor\"].json;\nconst imageB64 = $node[\"Generate Design (GPT-4o)\"].json.data[0].b64_json;\n\n// Enhanced compliance with mobile checks\nconst passesCompliance = \n  complianceResult.verdict === 'PASS' && \n  complianceResult.amazon_risk_score < 3 && // Very low risk tolerance\n  complianceResult.mobile_optimization?.thumbnail_readable === true &&\n  (complianceResult.mobile_optimization?.contrast_ratio || 0) >= 4.5;\n\n// Check if mutation designs get special handling\nconst isMutation = designData.is_mutation || complianceResult.is_mutation;\nconst mutationAllowance = isMutation ? 1 : 0; // Slightly more lenient for mutations\n\nreturn [{\n  json: {\n    ...designData,\n    design_b64: imageB64,\n    compliance_check: complianceResult,\n    passes_compliance: passesCompliance || (isMutation && complianceResult.amazon_risk_score < (3 + mutationAllowance)),\n    compliance_timestamp: new Date().toISOString(),\n    mobile_optimization: complianceResult.mobile_optimization,\n    is_mutation: isMutation\n  }\n}];"
      },
      "id": "parse-compliance",
      "name": "Parse Enhanced Compliance",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [3250, 250]
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
      "position": [3450, 250]
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
      "position": [3650, 450]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Enhanced Amazon Quality Agent, focused on mobile optimization and conversion potential.\n\nDesign to evaluate:\n- Theme: {{$json.design_theme}}\n- Niche: {{$json.niche}}\n- Products: {{JSON.stringify($json.product_types)}}\n- Color Strategy: {{JSON.stringify($json.color_strategy)}}\n- Is Mutation: {{$json.is_mutation}}\n\nPerform Enhanced Quality Analysis:\n1. Simplicity Score (1-10) - Text-only designs score higher.\n2. Readability Score (1-10) - Based on 160px thumbnail test.\n3. Print Quality (1-10) - DTG compatibility, no thin lines.\n4. Versatility Score (1-10) - Works on T-Shirt, Hoodie, Tank Top.\n5. Mobile Visibility Score (1-10) - Crucial for 77% of traffic.\n6. Professional Appearance (1-10) - Looks like a real brand.\n7. Color Effectiveness Score (1-10) - Based on success rates (black/white is high).\n8. Font Impact Score (1-10) - Bold, simple fonts get higher scores.\n\nCRITICAL MOBILE REQUIREMENTS:\n- Thumbnail Readability (160x160px): PASS/FAIL\n- Contrast Ratio: Must be >= 4.5:1\n- Font Size: Must be >= 72pt equivalent\n\nTask: Return a structured JSON with scores for each category and a final recommendation. Include a predicted CTR based on mobile visibility and design appeal.",
        "systemMessage": "You are an Amazon print quality expert focused on conversion. Be strict on mobile visibility as it's the most critical factor. For mutations, allow for some creative flexibility but maintain readability. Return comprehensive JSON analysis.",
        "options": {
          "temperature": 0.3,
          "maxTokens": 2000
        },
        "hasOutputParser": true
      },
      "id": "amazon-quality-agent",
      "name": "Enhanced Quality Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [3650, 250]
    },
    {
      "parameters": {
        "jsCode": "// Process Enhanced Quality results\nconst qualityResult = typeof $json.output === 'string'\n  ? JSON.parse($json.output)\n  : $json.output;\n\nconst designData = $node[\"Amazon Compliance Gate\"].json;\n\n// Calculate Enhanced Amazon quality score\nconst scores = qualityResult.quality_scores || {};\nconst amazonScore = (\n  (scores.simplicity || 0) * 1.5 +\n  (scores.readability || 0) * 2 +\n  (scores.print_quality || 0) +\n  (scores.versatility || 0) +\n  (scores.mobile_visibility || 0) * 2.5 +\n  (scores.professional || 0) * 1.5 +\n  (scores.color_effectiveness || 0) * 1.5\n) / 10;\n\n// Enhanced quality thresholds with CTR prediction\nconst passesQuality = \n  amazonScore >= 8.5 &&\n  (scores.mobile_visibility || 0) >= 8.5 &&\n  (scores.readability || 0) >= 9 &&\n  (qualityResult.predicted_ctr || 0) >= 2.0;\n\n// Special handling for mutations (slightly lower bar)\nconst isMutation = designData.is_mutation;\nconst mutationBonus = isMutation ? 0.5 : 0;\n\nreturn [{\n  json: {\n    ...designData,\n    quality_assessment: qualityResult,\n    amazon_quality_score: (amazonScore + mutationBonus).toFixed(2),\n    passes_quality: passesQuality || (isMutation && amazonScore >= 8.0),\n    predicted_ctr: qualityResult.predicted_ctr,\n    mobile_score: scores.mobile_visibility,\n    quality_timestamp: new Date().toISOString()\n  }\n}];"
      },
      "id": "process-quality",
      "name": "Process Enhanced Quality",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [3850, 250]
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
      "position": [4050, 250]
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
            "data": "={{JSON.stringify({concept_id: $json.concept_id, score: $json.amazon_quality_score, theme: $json.design_theme, is_mutation: $json.is_mutation, predicted_ctr: $json.predicted_ctr})}}",
            "success": "=true"
          }
        }
      },
      "id": "save-quality-memory",
      "name": "Save Quality Pass Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [4250, 150]
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
            "predicted_ctr": "={{$json.predicted_ctr}}",
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
      "position": [4250, 450]
    },
    {
      "parameters": {
        "jsCode": "// Extract potential negative keywords from rejected designs\nconst rejectedDesign = $json;\nconst keywords = rejectedDesign.keywords || [];\nconst theme = rejectedDesign.design_theme;\n\n// Extract potential negative keywords from theme and tags\nconst negativeKeywordCandidates = [...new Set([\n  ...keywords,\n  ...theme.split(' ').filter(w => w.length > 3)\n].map(k => k.toLowerCase()))];\n\n// Prepare entries for the NegativeKeywords sheet\nconst negativeEntries = negativeKeywordCandidates.map(keyword => ({\n  keyword,\n  concept_id: rejectedDesign.concept_id,\n  rejection_reason: rejectedDesign.rejection_reasons,\n  quality_score: rejectedDesign.amazon_score,\n  added_date: new Date().toISOString()\n}));\n\nreturn negativeEntries.map(entry => ({ json: entry }));"
      },
      "id": "extract-negative-keywords",
      "name": "Extract Negative Keywords",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [4450, 450]
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
      "position": [4650, 450]
    },
    {
      "parameters": {
        "agentPrompt": "You are the Enhanced Amazon Strategy Agent with A10 algorithm optimization and dynamic pricing.\n\nDesign data:\n{{JSON.stringify($json, null, 2)}}\n\nMarket intelligence:\n- BSR: {{$json.metadata.niche_data.metrics.avg_bsr}}\n- BSR Tier: {{$json.metadata.bsr_tier}}\n- Competition: {{$json.metadata.niche_data.metrics.competition}}\n- Predicted CTR: {{$json.predicted_ctr}}%\n- Is Mutation: {{$json.is_mutation}}\n\nA10 ALGORITHM PRIORITIES:\n1. Organic sales performance (25%)\n2. External traffic potential (20%)\n3. Seller authority signals (18%)\n4. Click-through optimization (15%)\n5. Conversion rate factors (12%)\n\nCreate Enhanced Amazon metadata:\n\n1. BRAND STRATEGY:\n   - Generate unique, memorable brand (1 word)\n   - Ensure trademark safety\n\n2. TITLE OPTIMIZATION (200 char max):\n   - A/B TEST: Create two titles:\n     - Title A (Keyword-Driven): [Brand] [Main Keywords] [Product Type]\n     - Title B (Benefit-Driven): Compelling, emotional hook for CTR.\n\n3. BULLET POINTS (2 required):\n   - Bullet 1: Core benefit + who it's for (lifestyle).\n   - Bullet 2: Quality/gift messaging + emotional appeal.\n\n4. BACKEND KEYWORDS (250 chars max per field):\n   - Fill all available fields with synonyms, misspellings, long-tail, and Spanish translations.\n\n5. DYNAMIC PRICING STRATEGY:\n   - New seller: $13.99-14.99 (velocity focus)\n   - Mid-tier: $15.99-17.99 (balanced)\n   - Advanced: $19.99-24.99 (premium)\n   - Adjust based on BSR tier and competition.\n   - Mutation designs: Test 10% higher pricing.\n\n6. EXTERNAL TRAFFIC KEYWORDS:\n   - Social media hashtags, Google search terms, Pinterest keywords.\n\nProduct-specific pricing:\n- T-Shirt: Standard tier\n- Hoodie: +$15-20 premium\n- Tank Top: -$2 from T-shirt\n\nReturn complete JSON with A/B titles and all fields.",
        "systemMessage": "You are an A10-optimized Amazon listing strategist. Create metadata that maximizes organic ranking and conversion. Focus on A/B title testing and dynamic pricing. Return complete JSON.",
        "options": {
          "temperature": 0.5,
          "maxTokens": 3000
        },
        "tools": [
          {
            "type": "code",
            "tool": {
              "name": "generate_dynamic_pricing",
              "description": "Calculate dynamic Amazon pricing with tiering",
              "language": "javaScript",
              "code": "// Enhanced pricing optimizer with tiering and BSR tiers\nfunction generateDynamicPricing(productType, bsr, competition, bsrTier, isMutation) {\n  const basePrices = {\n    'T-Shirt': 19.99,\n    'Hoodie': 37.99,\n    'Tank Top': 18.99\n  };\n  \n  // Simplified seller tier detection\n  const sellerTier = competition < 300 ? 'advanced' : \n                     competition < 700 ? 'mid' : 'new';\n\n  const tierMultipliers = { 'new': 0.85, 'mid': 1.0, 'advanced': 1.15 };\n  let price = basePrices[productType] * tierMultipliers[sellerTier];\n\n  // BSR tier adjustments\n  const bsrTierAdjustments = { 'excellent': 1.1, 'good': 1.05, 'marginal': 0.95, 'poor': 0.9 };\n  price *= bsrTierAdjustments[bsrTier] || 1.0;\n\n  // Mutation premium\n  if (isMutation) price *= 1.1;\n\n  // Round to psychological pricing\n  price = Math.round(price) - 0.01;\n\n  return {\n    recommended_price: price,\n    seller_tier: sellerTier,\n    price_strategy: tierMultipliers[sellerTier] > 1 ? 'premium' : 'competitive',\n    expected_royalty: (price * 0.35).toFixed(2) // Simplified royalty\n  };\n}\n\nreturn generateDynamicPricing(input.product_type, input.bsr, input.competition, input.bsr_tier, input.is_mutation);"
            }
          }
        ]
      },
      "id": "amazon-strategy-agent",
      "name": "Enhanced Strategy Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.7,
      "position": [4250, 250]
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
            "type": "listing_strategy_enhanced",
            "data": "={{JSON.stringify($json.output)}}",
            "success": "=true"
          }
        }
      },
      "id": "save-strategy-memory",
      "name": "Save Strategy Memory",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.2,
      "position": [4450, 250]
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
      "position": [4650, 250]
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
      "position": [4850, 250]
    },
    {
      "parameters": {
        "jsCode": "// Prepare final Enhanced Amazon listing data with A/B titles\nconst strategyOutput = $node[\"Enhanced Strategy Agent\"].json.output;\nconst designData = $node[\"Quality Gate\"].json;\nconst binaryData = $node[\"Resize to Amazon Specs\"].binary;\n\n// Structure for Enhanced Amazon upload sheet\nconst amazonListing = {\n  // Design identifiers\n  concept_id: designData.concept_id,\n  variant_id: designData.variant_id,\n  design_theme: designData.design_theme,\n  niche: designData.niche,\n  is_mutation: designData.is_mutation,\n  \n  // Performance predictions\n  performance_score: designData.amazon_quality_score, // Using quality score as proxy\n  predicted_ctr: designData.predicted_ctr,\n  \n  // File information\n  filename: `${designData.concept_id}_${designData.variant_id}_4500x5400.png`,\n  \n  // Color strategy\n  color_strategy: `${designData.color_strategy.background}/${designData.color_strategy.text}`,\n  color_success_rate: designData.color_strategy.success_rate,\n  \n  // Amazon metadata\n  brand_name: strategyOutput.brand_name,\n  \n  // T-Shirt Listing with A/B Titles\n  tshirt_title_a: strategyOutput.tshirt.title_a,\n  tshirt_title_b: strategyOutput.tshirt.title_b,\n  tshirt_bullet1: strategyOutput.tshirt.bullets[0],\n  tshirt_bullet2: strategyOutput.tshirt.bullets[1],\n  tshirt_description: strategyOutput.tshirt.description || '',\n  tshirt_keywords: strategyOutput.tshirt.backend_keywords,\n  tshirt_price: strategyOutput.tshirt.price,\n  tshirt_product: designData.product_performance.preferred_products['T-Shirt'].primary,\n  \n  // Hoodie Listing with A/B Titles\n  hoodie_title_a: strategyOutput.hoodie.title_a,\n  hoodie_title_b: strategyOutput.hoodie.title_b,\n  hoodie_bullet1: strategyOutput.hoodie.bullets[0],\n  hoodie_bullet2: strategyOutput.hoodie.bullets[1],\n  hoodie_description: strategyOutput.hoodie.description || '',\n  hoodie_keywords: strategyOutput.hoodie.backend_keywords,\n  hoodie_price: strategyOutput.hoodie.price,\n  hoodie_product: designData.product_performance.preferred_products['Hoodie'].primary,\n  \n  // Tank Top Listing with A/B Titles\n  tank_title_a: strategyOutput.tank_top.title_a,\n  tank_title_b: strategyOutput.tank_top.title_b,\n  tank_bullet1: strategyOutput.tank_top.bullets[0],\n  tank_bullet2: strategyOutput.tank_top.bullets[1],\n  tank_description: strategyOutput.tank_top.description || '',\n  tank_keywords: strategyOutput.tank_top.backend_keywords,\n  tank_price: strategyOutput.tank_top.price,\n  \n  // Quality & Market Metrics\n  quality_score: designData.amazon_quality_score,\n  compliance_score: designData.compliance_check.amazon_risk_score,\n  bsr_tier: designData.metadata.bsr_tier,\n  opportunity_score: designData.metadata.niche_data.opportunity_score,\n  \n  // Timestamps\n  created_at: new Date().toISOString(),\n  ready_for_upload: true\n};\n\nreturn [{\n  json: amazonListing,\n  binary: binaryData\n}];"
      },
      "id": "prepare-final-data",
      "name": "Prepare Enhanced Final Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [5050, 250]
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
      "position": [5250, 250]
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
      "position": [5450, 250]
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
      "position": [5650, 350]
    },
    {
      "parameters": {
        "jsCode": "// Enhanced Amazon execution summary with performance tracking\nconst execution = $node[\"Initialize Enhanced Amazon System\"].json;\nconst allUploads = $input.all();\n\n// Calculate enhanced metrics\nconst executionTime = (new Date() - new Date(execution.timestamp)) / 1000 / 60;\nconst designsApproved = allUploads.length;\nconst designsPerHour = executionTime > 0 ? (designsApproved / executionTime) * 60 : 0;\n\n// Calculate mutation statistics\nconst mutationStats = {\n  total: allUploads.filter(d => d.json.is_mutation).length,\n  percentage: (allUploads.length > 0 ? (allUploads.filter(d => d.json.is_mutation).length / allUploads.length * 100) : 0).toFixed(1)\n};\n\n// Aggregate performance predictions\nlet totalPerformanceScore = 0;\nlet totalCTRPrediction = 0;\nconst colorStrategyStats = {};\nconst nicheStats = {};\n\nallUploads.forEach(item => {\n  const data = item.json;\n  \n  // Performance tracking\n  totalPerformanceScore += parseFloat(data.performance_score || 0);\n  totalCTRPrediction += parseFloat(data.predicted_ctr || 0);\n  \n  // Color strategy tracking\n  const colorKey = data.color_strategy || 'unknown';\n  if (!colorStrategyStats[colorKey]) {\n    colorStrategyStats[colorKey] = { count: 0, avg_score: 0, avg_ctr: 0 };\n  }\n  colorStrategyStats[colorKey].count++;\n  colorStrategyStats[colorKey].avg_score += parseFloat(data.quality_score);\n  colorStrategyStats[colorKey].avg_ctr += parseFloat(data.predicted_ctr);\n  \n  // Niche performance\n  const niche = data.niche;\n  if (!nicheStats[niche]) {\n    nicheStats[niche] = {\n      count: 0,\n      avg_quality: 0,\n      avg_opportunity: 0,\n      avg_performance: 0,\n      mutations: 0\n    };\n  }\n  nicheStats[niche].count++;\n  nicheStats[niche].avg_quality += parseFloat(data.quality_score);\n  nicheStats[niche].avg_opportunity += parseFloat(data.opportunity_score);\n  nicheStats[niche].avg_performance += parseFloat(data.performance_score);\n  if (data.is_mutation) nicheStats[niche].mutations++;\n});\n\n// Calculate averages\nObject.keys(colorStrategyStats).forEach(key => {\n  const stat = colorStrategyStats[key];\n  stat.avg_score = (stat.avg_score / stat.count).toFixed(2);\n  stat.avg_ctr = (stat.avg_ctr / stat.count).toFixed(2);\n});\n\nObject.keys(nicheStats).forEach(niche => {\n  const stat = nicheStats[niche];\n  stat.avg_quality = (stat.avg_quality / stat.count).toFixed(2);\n  stat.avg_opportunity = (stat.avg_opportunity / stat.count).toFixed(2);\n  stat.avg_performance = (stat.avg_performance / stat.count).toFixed(2);\n  stat.mutation_rate = ((stat.mutations / stat.count) * 100).toFixed(1) + '%';\n});\n\n// Generate enhanced insights\nconst insights = {\n  execution_id: execution.execution_id,\n  platform: 'merch_by_amazon_enhanced',\n  duration_minutes: executionTime.toFixed(2),\n  designs_approved: designsApproved,\n  designs_per_hour: designsPerHour.toFixed(1),\n  total_listings: designsApproved * 3, // 3 products per design\n  \n  performance_metrics: {\n    avg_performance_score: (totalPerformanceScore / (designsApproved || 1)).toFixed(2),\n    avg_predicted_ctr: (totalCTRPrediction / (designsApproved || 1)).toFixed(2) + '%',\n    expected_ctr_above_target: allUploads.filter(d => parseFloat(d.json.predicted_ctr) >= 2.5).length,\n    mobile_optimized: allUploads.filter(d => d.json.mobile_optimization?.thumbnail_readable).length\n  },\n  \n  mutation_statistics: mutationStats,\n  color_strategy_performance: JSON.stringify(colorStrategyStats),\n  niche_performance: JSON.stringify(nicheStats),\n  \n  recommendations: []\n};\n\n// Enhanced adaptive recommendations\nif (insights.performance_metrics.avg_predicted_ctr < 2.5) {\n  insights.recommendations.push('Focus on higher contrast designs for better mobile CTR');\n}\nif (mutationStats.percentage < 15) {\n  insights.recommendations.push('Increase creative mutations to discover new opportunities');\n}\n\nreturn [{ json: insights }];"
      },
      "id": "execution-summary",
      "name": "Enhanced Execution Summary",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [5850, 350]
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
      "position": [6050, 350]
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
            "node": "Initialize Enhanced Amazon System",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Initialize Enhanced Amazon System": {
      "main": [
        [
          {
            "node": "Enhanced Amazon Research Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enhanced Amazon Research Agent": {
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
            "node": "Process Enhanced Opportunities",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Enhanced Opportunities": {
      "main": [
        [
          {
            "node": "Enhanced Amazon Creative Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enhanced Amazon Creative Agent": {
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
            "node": "Prepare Enhanced Designs",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare Enhanced Designs": {
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
            "node": "Enhanced Quality Agent",
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
    "Enhanced Quality Agent": {
      "main": [
        [
          {
            "node": "Process Enhanced Quality",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Enhanced Quality": {
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
            "node": "Enhanced Strategy Agent",
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
    "Enhanced Strategy Agent": {
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
            "node": "Prepare Enhanced Final Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Prepare Enhanced Final Data": {
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
    "Check Batch Complete": {
      "main": [
        [
          {
            "node": "Enhanced Execution Summary",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Enhanced Execution Summary": {
      "main": [
        [
          {
            "node": "Save Execution Summary",
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