#!/usr/bin/env npx tsx
/**
 * Check Surfline Forecast
 * 
 * Display current forecast and alerts for configured spots.
 * 
 * Usage:
 *   npx tsx scripts/check-forecast.ts
 *   npx tsx scripts/check-forecast.ts --debug
 *   npx tsx scripts/check-forecast.ts --json
 */

import { SPOTS, DEFAULT_ALERT_CONFIG } from '../src/types.js';
import { fetchDailyForecasts, formatForecast } from '../src/providers/surfline.js';
import {
  generateAlert,
  formatMultiSpotSummary,
  debugEvaluations,
} from '../src/services/alerts.js';

async function main() {
  const jsonOutput = process.argv.includes('--json');
  const debugMode = process.argv.includes('--debug');
  const spotsToCheck = [SPOTS.BELMAR, SPOTS.LONG_BRANCH];
  const now = new Date();

  console.log('🏄 Checking Surfline forecasts...\n');

  const alerts = [];

  for (const spot of spotsToCheck) {
    if (!jsonOutput) {
      console.log(`📍 ${spot.name}`);
      console.log('-'.repeat(40));
    }

    try {
      const forecasts = await fetchDailyForecasts(spot, 6);

      if (!jsonOutput) {
        for (const forecast of forecasts) {
          console.log(formatForecast(forecast));
        }
      }

      if (debugMode) {
        console.log('\nAlert evaluation:');
        console.log(debugEvaluations(forecasts, DEFAULT_ALERT_CONFIG, now));
      }

      const alert = generateAlert(spot, forecasts, DEFAULT_ALERT_CONFIG, now);
      if (alert) {
        alerts.push(alert);
      }

      if (!jsonOutput) {
        console.log('');
      }
    } catch (error) {
      console.error(`Error fetching ${spot.name}:`, error);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(alerts, null, 2));
  } else {
    console.log('='.repeat(40));
    console.log('ALERTS');
    console.log('='.repeat(40));

    if (alerts.length === 0) {
      console.log('No alerts - conditions not meeting criteria.');
    } else {
      console.log(formatMultiSpotSummary(alerts));
    }
  }
}

main().catch(console.error);
