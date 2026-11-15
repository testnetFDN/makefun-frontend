// Static studio architecture: first-load board modules stay small;
// detail, standings and profiles load only when a route needs them.
// This entry copies authored assets and delegates every dossier byte
// to the unchanged starter library, without network or build tooling.
import { cpSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 3, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
const dossier = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
console.log(
  'make.fun studio dossier complete',
  '\n' + dossier.text.split('\n').filter(line => line.startsWith('Totals:')).join('\n'),
  '\nScreenshot count: ' + dossier.images.length,
);
