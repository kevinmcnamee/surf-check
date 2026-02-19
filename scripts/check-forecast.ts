#!/usr/bin/env npx tsx
/**
 * Check Surfline Forecast
 * 
 * Display current forecast for configured spots.
 * 
 * Usage:
 *   npx tsx scripts/check-forecast.ts
 */

import { SPOTS } from '../src/types.js';
import { fetchDailyForecasts, formatForecast } from '../src/providers/surfline.js';

async function main() {
  const spotsToCheck = [SPOTS.BELMAR, SPOTS.LONG_BRANCH];

  console.log('🏄 Checking Surfline forecasts...\n');

  for (const spot of spotsToCheck) {
    console.log(`📍 ${spot.name}`);
    console.log('-'.repeat(40));

    try {
      const forecasts = await fetchDailyForecasts(spot, 6);

      for (const forecast of forecasts) {
        console.log(formatForecast(forecast));
      }

      console.log('');
    } catch (error) {
      console.error(`Error fetching ${spot.name}:`, error);
    }
  }
}

main().catch(console.error);
