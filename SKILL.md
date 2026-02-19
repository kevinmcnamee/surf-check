---
name: surf-check
description: Smart surf forecast alerts with tiered confidence. Monitors conditions and alerts when worth paddling out.
metadata:
  openclaw:
    emoji: "🏄"
    requires:
      bins: ["node", "npx"]
      env: []
    config:
      - id: surfline_email
        label: Surfline Email
        type: string
        env: SURFLINE_EMAIL
        optional: true
      - id: surfline_password
        label: Surfline Password
        type: secret
        env: SURFLINE_PASSWORD
        optional: true
---

# Surfline Surf Alerts

This skill monitors Surfline forecasts for Belmar and Long Branch, NJ and alerts when conditions meet the configured criteria.

## Alert Criteria

- **Wave Height:** 2-6ft
- **Rating:** Fair or better
- **Fair conditions:** Alert only on weekends (Fri-Sun)
- **Fair-Good or better:** Alert anytime
- **Forecast window:** 7 days

## Commands

### Check current forecast

```bash
cd {baseDir} && npm run check
```

Returns the 6-day forecast for all configured spots with alert evaluation.

### Check with JSON output

```bash
cd {baseDir} && npm run check:json
```

Returns structured JSON for programmatic use.

### Login to Surfline (for premium data)

Interactive login (opens browser):
```bash
cd {baseDir} && npm run login -- --interactive
```

Automated login (requires env vars):
```bash
SURFLINE_EMAIL=xxx SURFLINE_PASSWORD=xxx npm run login
```

## Data Sources

### Free API (default)
- 6-day forecast
- No authentication required
- Endpoints: wave, rating, conditions, wind

### Premium API (with login)
- 16-day forecast
- Requires Surfline Premium subscription
- Run `npm run login` first to save session

### NOAA Buoy (extension)
- Real-time buoy data from Station 44091 (Barnegat, NJ)
- Cross-reference forecasts with actual conditions

## Setup

1. Install dependencies:
   ```bash
   cd {baseDir} && npm install
   ```

2. (Optional) For premium data, log into Surfline:
   ```bash
   npm run login -- --interactive
   ```

3. Test the forecast check:
   ```bash
   npm run check
   ```

## Integration with OpenClaw

### Daily Cron Job

Set up a cron job to check forecasts every morning:

```json
{
  "name": "surfline-forecast-check",
  "schedule": { "kind": "cron", "expr": "0 6 * * *", "tz": "America/New_York" },
  "payload": {
    "kind": "systemEvent",
    "text": "Check Surfline forecast: cd ~/workspace/surfline-skill && npm run check"
  },
  "sessionTarget": "main",
  "enabled": true
}
```

### Manual Check

Ask the agent:
> "Check the surf forecast for this week"

The agent should run `npm run check` and summarize the results.

## Spots

| Name | Spot ID | URL |
|------|---------|-----|
| Belmar (16th Ave) | `5842041f4e65fad6a7708a01` | [Surfline](https://www.surfline.com/surf-report/16th-ave-belmar/5842041f4e65fad6a7708a01) |
| Long Branch | `630d04654da1381c5cb8aeb7` | [Surfline](https://www.surfline.com/surf-report/long-branch/630d04654da1381c5cb8aeb7) |

## Files

- `PLAN.md` - Development plan and architecture
- `src/types.ts` - TypeScript type definitions
- `src/providers/surfline.ts` - Surfline public API client
- `src/providers/surfline-premium.ts` - Premium API client (authenticated)
- `src/providers/noaa.ts` - NOAA buoy data client
- `src/services/alerts.ts` - Alert evaluation logic
- `scripts/check-forecast.ts` - Manual forecast check script
- `scripts/login-surfline.ts` - Surfline login script
