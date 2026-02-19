# 🏄 Surfline Alerts

Smart surf forecast alerts based on Surfline data. Get notified when conditions are worth paddling out — with tiered confidence based on forecast accuracy.

## Features

- **Tiered alert logic** — Requires higher confidence for longer-range forecasts
- **State tracking** — No duplicate alerts for the same forecast
- **Premium support** — Use your Surfline Premium subscription for 16-day forecasts
- **NOAA buoy data** — Cross-reference forecasts with real buoy readings
- **Cron-ready** — Designed for periodic automated checks

## How It Works

Surf forecasts get less accurate the further out you look. This tool adjusts its alert threshold accordingly:

| Days Out | Minimum Rating | Rationale |
|----------|----------------|-----------|
| 4+ days | Fair-Good or better | Forecasts are fuzzy, need high confidence |
| 1-3 days | Fair or better | Sweet spot for planning |
| Day of | Good or better | Only alert if it's actually firing |

Same-day alerts are suppressed after 6am (dawn patrol has already passed).

## Installation

```bash
git clone https://github.com/yourusername/surfline-alerts.git
cd surfline-alerts
npm install
```

### For Premium Data (Optional)

If you have a Surfline Premium subscription and want 16-day forecasts:

```bash
# Install Playwright browsers
npx playwright install chromium

# Log in (opens browser for manual login)
npm run login -- --interactive
```

Your session cookies are saved locally and reused for authenticated API requests.

## Configuration

### Adding Your Spots

Edit `src/types.ts` to add your local breaks:

```typescript
export const SPOTS: Record<string, SpotConfig> = {
  YOUR_SPOT: {
    id: 'surfline-spot-id',           // From Surfline URL
    name: 'Your Local Break',
    slug: 'your-local-break',
    url: 'https://www.surfline.com/surf-report/your-local-break/surfline-spot-id',
  },
  // Add more spots...
};
```

**Finding Spot IDs:** Go to your spot on Surfline.com. The URL will look like:
```
https://www.surfline.com/surf-report/spot-name/5842041f4e65fad6a7708a01
```
The ID is the long string at the end: `5842041f4e65fad6a7708a01`

### Alert Thresholds

Edit `src/types.ts` to adjust wave height range:

```typescript
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  waveMin: 2,        // Minimum wave height (ft)
  waveMax: 6,        // Maximum wave height (ft)
  forecastDays: 7,   // How far out to look
};
```

## Usage

### Manual Check

```bash
# Full forecast with alerts
npm run check

# With debug output (shows why each day did/didn't alert)
npm run check:debug

# JSON output
npm run check:json
```

Example output:
```
🏄 Checking Surfline forecasts...

📍 Belmar (16th Ave)
----------------------------------------
Wednesday, Feb 18: 3-4ft | Fair | Offshore 7mph
Thursday, Feb 19: 2-3ft | Poor-Fair | Cross-shore 6mph
Saturday, Feb 21: 2-3ft | Fair | Offshore 7mph

========================================
ALERTS
========================================
🏄 **Surf Forecast Summary**

**Belmar (16th Ave)**
• Saturday: 2-3ft (Fair)
```

### Automated Checks (Cron Mode)

```bash
npm run check:cron
```

Cron mode:
- Only outputs if there are **new** alerts
- Updates state file to track sent alerts
- Silent if nothing new (perfect for cron jobs)

### State Management

Alert history is stored in `data/state.json`:

```json
{
  "lastCheck": "2026-02-18T20:00:00.000Z",
  "alertsSent": {
    "5842041f4e65fad6a7708a01:2026-02-22": "2026-02-18T20:00:00.000Z"
  }
}
```

To reset and re-send all alerts:
```bash
rm data/state.json
```

## Integration Examples

### Cron Job (every 6 hours)

```bash
0 */6 * * * cd /path/to/surfline-alerts && npm run check:cron >> /var/log/surf.log
```

### OpenClaw Integration

Add to your cron jobs:
```json
{
  "name": "surfline-forecast-check",
  "schedule": { "kind": "cron", "expr": "0 */6 * * *", "tz": "America/New_York" },
  "payload": {
    "kind": "systemEvent",
    "text": "Run: cd ~/surfline-alerts && npm run check:cron"
  },
  "sessionTarget": "main"
}
```

### Slack/Discord Webhook

```bash
#!/bin/bash
OUTPUT=$(cd /path/to/surfline-alerts && npm run check:cron 2>/dev/null)
if [ -n "$OUTPUT" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"$OUTPUT\"}" \
    YOUR_WEBHOOK_URL
fi
```

## API Reference

### Surfline Public API

The tool uses Surfline's undocumented KBYG (Know Before You Go) API:

```
GET https://services.surfline.com/kbyg/spots/forecasts/{type}?spotId={id}&days={n}
```

Types: `wave`, `rating`, `wind`, `tides`, `conditions`, `weather`

Free tier is limited to 6 days. Premium extends to 16 days.

### NOAA Buoy Data

Real-time buoy readings from NDBC:

```
GET https://www.ndbc.noaa.gov/data/realtime2/{stationId}.txt
```

Useful for validating forecasts against actual conditions.

## Project Structure

```
surfline-alerts/
├── src/
│   ├── types.ts              # Type definitions, spot configs
│   ├── providers/
│   │   ├── surfline.ts       # Public API client
│   │   ├── surfline-premium.ts # Authenticated API client
│   │   └── noaa.ts           # NOAA buoy data
│   └── services/
│       ├── alerts.ts         # Alert evaluation logic
│       └── state.ts          # State persistence
├── scripts/
│   ├── check-forecast.ts     # Main CLI script
│   └── login-surfline.ts     # Premium login helper
├── data/
│   ├── session/              # Auth cookies (gitignored)
│   └── state.json            # Alert history (gitignored)
└── package.json
```

## Surfline Rating Scale

| Rating | Value | Description |
|--------|-------|-------------|
| FLAT | 0 | No surf |
| VERY_POOR | 0 | Not worth it |
| POOR | 1 | Frustrating |
| POOR_TO_FAIR | 1-2 | Might get a few |
| FAIR | 2 | Fun for most |
| FAIR_TO_GOOD | 3 | Worth the drive |
| GOOD | 4 | Get out there |
| GOOD_TO_EPIC | 5 | Call in sick |
| EPIC | 5 | Once a year |

## Contributing

PRs welcome! Some ideas:

- [ ] SMS/email notifications
- [ ] Tide-aware alerts (prefer incoming tide)
- [ ] Wind quality scoring
- [ ] Historical accuracy tracking
- [ ] Web dashboard
- [ ] Multi-region support

## License

MIT

## Disclaimer

This tool uses Surfline's undocumented API. It may break if Surfline changes their API. This project is not affiliated with Surfline.

---

*Built for surfers who'd rather be in the water than checking forecasts.*
