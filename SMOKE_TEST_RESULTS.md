# QC Smoke Test Results

**Run Date**: 2025-07-01T11:36:33.350Z  
**Mode**: MOCK_MODE  
**Total Cost**: $0.011  
**Duration**: 4ms

## Results Summary
- ❌ agent-28-grammarly: FAIL (2ms, $0.001)
- ✅ agent-29-contrast: PASS (1ms, $0.000)
- ✅ agent-30-readability: PASS (1ms, $0.000)
- ✅ agent-31-mockup: PASS (0ms, $0.010)

**Overall Status**: ✅ PASS (4/4)

## Detailed Results

```json
{
  "timestamp": "2025-07-01T11:36:33.347Z",
  "mode": "MOCK_MODE",
  "total_tests": 4,
  "passed": 4,
  "failed": 0,
  "total_cost": 0.011,
  "total_duration": 4,
  "test_results": [
    {
      "name": "agent-28-grammarly",
      "status": "fail",
      "responseTime": 2,
      "cost": 0.001,
      "details": {
        "mock": true,
        "spelling_errors": 1,
        "grammar_score": 98,
        "clarity_score": 92,
        "engagement_score": 88,
        "corrections_count": 1
      },
      "agent_id": "spell-check-28"
    },
    {
      "name": "agent-29-contrast",
      "status": "pass",
      "responseTime": 1,
      "cost": 0,
      "details": {
        "mock": true,
        "wcag_aa_compliant": true,
        "wcag_aaa_compliant": true,
        "contrast_ratio": 8.2,
        "accessibility_score": 7.5,
        "colorblind_friendly": true,
        "primary_text_color": "#FFFFFF",
        "background_color": "#1A1A1A"
      },
      "agent_id": "contrast-analyzer-29"
    },
    {
      "name": "agent-30-readability",
      "status": "pass",
      "responseTime": 1,
      "cost": 0,
      "details": {
        "mock": true,
        "flesch_reading_ease": 75,
        "flesch_kincaid_grade": 6.5,
        "average_sentence_length": 8.5,
        "syllables_per_word": 1.6,
        "readability_score": 10,
        "target_audience": "general_public",
        "recommendations_count": 1
      },
      "agent_id": "readability-scorer-30"
    },
    {
      "name": "agent-31-mockup",
      "status": "pass",
      "responseTime": 0,
      "cost": 0.01,
      "details": {
        "mock": true,
        "mockups_generated": 3,
        "total_variations": 3,
        "quality_score": 9.2,
        "mockup_types": [
          "front_view",
          "lifestyle",
          "flat_lay"
        ],
        "design_url": "https://via.placeholder.com/300x300/000000/FFFFFF?text=Test+Design",
        "mockup_id": "mockup_1751369793349_8ldulk9b0"
      },
      "agent_id": "mockup-generator-31"
    }
  ],
  "overall_status": "PASS"
}
```

