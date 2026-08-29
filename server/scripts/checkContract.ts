/**
 * Fails if the client and server disagree about the health-data contract.
 *
 * The two packages are independent (no shared workspace), so the score ranges
 * exist twice: `client/utils/stzi-system.ts` and `server/llm/scoreRanges.ts`.
 * That duplication is what let `foodScore` sit at ±3 on one side and −7…+11 on
 * the other, rejecting every well-fed user's request with a 400.
 *
 * This imports both modules and compares the live values — not a text scrape —
 * so any edit to either file that is not mirrored fails here instead of in
 * production. `client/utils/stzi-system.ts` only imports types, so Bun can load
 * it directly with no React Native runtime.
 *
 * Run with: bun run check:contract
 */
import {
   BMI_MAX,
   BMI_MIN,
   FOOD_SCORE_MAX,
   FOOD_SCORE_MIN,
   STEPS_MAX,
   STEPS_MIN,
   STZI_MAX,
   STZI_MIN,
   resolveStatus,
} from '../llm/scoreRanges';
import * as clientSystem from '../../client/utils/stzi-system';

type Check = { field: string; server: number; client: number };

const checks: Check[] = [
   { field: 'FOOD_SCORE_MIN', server: FOOD_SCORE_MIN, client: clientSystem.FOOD_SCORE_MIN },
   { field: 'FOOD_SCORE_MAX', server: FOOD_SCORE_MAX, client: clientSystem.FOOD_SCORE_MAX },
   { field: 'STZI_MIN', server: STZI_MIN, client: clientSystem.STZI_MIN },
   { field: 'STZI_MAX', server: STZI_MAX, client: clientSystem.STZI_MAX },
   { field: 'BMI_MIN', server: BMI_MIN, client: clientSystem.BMI_MIN },
   { field: 'BMI_MAX', server: BMI_MAX, client: clientSystem.BMI_MAX },
   { field: 'STEPS_MIN', server: STEPS_MIN, client: clientSystem.STEPS_MIN },
   { field: 'STEPS_MAX', server: STEPS_MAX, client: clientSystem.STEPS_MAX },
];

const failures: string[] = [];

for (const { field, server, client } of checks) {
   const status = server === client ? 'ok' : 'DRIFT';
   console.log(
      `${status === 'ok' ? '  ' : '! '}${field.padEnd(16)} server=${String(server).padEnd(8)} client=${String(client)}`
   );
   if (status === 'DRIFT') {
      failures.push(`${field}: server=${server}, client=${client}`);
   }
}

/*
 * `resolveStatus` on the server must agree with `getSTZIStatus` on the client
 * for every band, including the exact boundary values — the server computes the
 * status the UI colours the card with, so a half-point disagreement shows the
 * user a "good" badge over "low" advice.
 */
const stziSamples = [0, 0.5, 0.99, 1.0, 1.5, 1.59, 1.6, 1.99, 2];

for (const stzi of stziSamples) {
   const server = resolveStatus(stzi);
   const client = clientSystem.getSTZIStatus(stzi);
   if (server !== client) {
      failures.push(`status(stzi=${stzi}): server=${server}, client=${client}`);
      console.log(`! status(${stzi}) server=${server} client=${client}`);
   }
}

if (failures.length > 0) {
   console.error('\nHealth contract drift between client and server:');
   for (const failure of failures) console.error(`  - ${failure}`);
   console.error(
      '\nUpdate client/utils/stzi-system.ts and server/llm/scoreRanges.ts together.'
   );
   process.exit(1);
}

console.log('\nHealth contract in sync (8 ranges, 9 status boundaries).');
