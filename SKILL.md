---
name: surf-check
description: Surf forecast decision engine with tiered confidence. Evaluates conditions and outputs alerts to stdout.
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

# surf-check

A surf forecast decision engine. Evaluates forecasts against configurable thresholds and outputs alert-worthy conditions to stdout.

## Quick Start

```bash
cd {baseDir} && npm install
npm run check
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run check` | Full forecast with alerts |
| `npm run check:debug` | Shows why each day did/didn't alert |
| `npm run check:json` | JSON output |
| `npm run check:cron` | Cron mode — only new alerts, respects quiet hours |

## Configuration

Create `~/.surf-check.json`:

```json
{
  "spots": [
    { "id": "5842041f4e65fad6a7708a01", "name": "My Local Break" }
  ],
  "waveMin": 2,
  "waveMax": 6
}
```

Find spot IDs from Surfline URLs:
```
https://www.surfline.com/surf-report/spot-name/5842041f4e65fad6a7708a01
                                              └── spot ID
```

All fields optional. Defaults: Belmar/Long Branch, 2-6ft, quiet hours 10pm-6am.

## Alert Logic

Thresholds adjust based on forecast accuracy:

| Days Out | Minimum Rating |
|----------|----------------|
| 4+ days | Fair-Good+ |
| 1-3 days | Fair+ |
| Day of | Good+ (before 8am only) |

## Premium Data (Optional)

For 16-day forecasts (vs 6-day free), log into your Surfline Premium account:

```bash
npm run login -- --interactive
```

## OpenClaw Integration

```json
{
  "name": "surf-check",
  "schedule": { "kind": "cron", "expr": "0 */6 * * *", "tz": "America/New_York" },
  "payload": {
    "kind": "systemEvent",
    "text": "Run: cd ~/surf-check && npm run check:cron"
  },
  "sessionTarget": "main"
}
```
