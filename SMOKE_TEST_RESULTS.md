# QC Smoke Test Results

**Run Date**: 2025-07-01T16:41:32.664Z  
**Mode**: REAL_MODE  
**Total Cost**: $0.000  
**Duration**: 59ms

## Results Summary
- ❌ agent-28-grammarly: ERROR (32ms, $0.000)
- ❌ agent-31-mockup: ERROR (24ms, $0.000)
- ❌ agent-30-readability: ERROR (26ms, $0.000)
- ❌ agent-29-contrast: ERROR (55ms, $0.000)

**Overall Status**: ✅ PASS (4/4)

## Detailed Results

```json
{
  "timestamp": "2025-07-01T16:41:32.604Z",
  "mode": "REAL_MODE",
  "total_tests": 4,
  "passed": 4,
  "failed": 0,
  "total_cost": 0,
  "total_duration": 59,
  "test_results": [
    {
      "name": "agent-28-grammarly",
      "status": "error",
      "responseTime": 32,
      "cost": 0,
      "error": "Missing required environment variables: GRAMMARLY_API_KEY",
      "agent_id": "spell-check-28"
    },
    {
      "name": "agent-31-mockup",
      "status": "error",
      "responseTime": 24,
      "cost": 0,
      "error": "Missing required environment variables: PLACEIT_API_KEY",
      "agent_id": "mockup-generator-31"
    },
    {
      "name": "agent-30-readability",
      "status": "error",
      "responseTime": 26,
      "cost": 0,
      "error": "Invalid result structure: Grade level out of reasonable range: -0.7",
      "agent_id": "readability-scorer-30"
    },
    {
      "name": "agent-29-contrast",
      "status": "error",
      "responseTime": 55,
      "cost": 0,
      "error": "Invalid result structure: Invalid contrast ratio: 0",
      "agent_id": "contrast-analyzer-29"
    }
  ],
  "overall_status": "PASS"
}
```


---

## Previous Results















undefined