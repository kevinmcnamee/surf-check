---
name: surf-check
description: Surf forecast decision engine. Outputs surfable conditions for agent alerting.
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

Checks surf forecasts and tells you when conditions are worth paddling out.

## Location

```
~/workspace/surf-check
```

## Commands

Run from the skill directory:

```bash
cd ~/workspace/surf-check && npm run check
```

| Command | When to Use |
|---------|-------------|
| `npm run check` | User asks about surf conditions |
| `npm run check:debug` | Debugging why a day did/didn't qualify |
| `npm run check:json` | When you need structured data |
| `npm run check:cron` | Automated checks (cron job uses this) |

## Sample Output

```
🏄 **Surf Forecast Summary**

**Belmar (16th Ave)**
• Saturday: 2-3ft (Fair)

**Long Branch**
• Saturday: 2-3ft (Fair)
```

If nothing meets thresholds, output is empty (cron mode) or shows "No surfable conditions in the forecast."

## Decision Thresholds

| Days Out | Minimum Rating | Why |
|----------|----------------|-----|
| 4+ days | Fair-Good+ | Forecasts are fuzzy, need high confidence |
| 1-3 days | Fair+ | Sweet spot for planning |
| Day of | Good+ (before 8am) | Only if it's actually firing |

Wave height: 2-6ft (configured in `src/types.ts`)

## Your Job

When conditions are surfable:
1. **Summarize naturally** — "Looks like Saturday could be good at Belmar, 2-3ft and Fair conditions"
2. **Include the day and spot** — Kevin needs to know when and where
3. **Don't over-explain the ratings** — Kevin knows what Fair/Good means

When user asks about surf:
- Run `npm run check` and summarize the output
- If nothing's showing up, check `npm run check:debug` to see why

## Current Setup

- **Spots:** Belmar (16th Ave), Long Branch
- **Cron:** Every 6 hours (`0 */6 * * *`) — runs automatically, you'll get a system event with output
- **Quiet hours:** 10pm-6am (suppressed, queued for next check)
- **State file:** `data/state.json` — tracks what's been reported to avoid duplicates

## Cron Behavior

A cron job runs `npm run check:cron` every 6 hours. When it fires:
- You receive output as a system event
- Only *new* conditions are shown (state tracking prevents duplicates)
- If output is empty, nothing qualified or it's already been reported

When you get cron output with conditions, alert Kevin naturally via his preferred channel (Telegram).

## Troubleshooting

**No output from cron:** Normal if nothing qualifies or already reported. Run `npm run check:debug` to see evaluation.

**Reset state:** `rm ~/workspace/surf-check/data/state.json` to re-report all conditions.

**Add a spot:** Edit `src/types.ts`, find spot ID from Surfline URL:
```
https://www.surfline.com/surf-report/spot-name/5842041f4e65fad6a7708a01
                                              └── spot ID
```
