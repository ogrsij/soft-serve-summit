// Soft Serve Summit — hand-in program (Node 22, standard library only).
//
// The game itself is the static site in game/: no build step, no network.
// This program copies game/ and screenshots/ into the output directory and
// writes dossier.json with the kit's vendored buildDossier, exactly the
// bytes the gate rebuilds and compares. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader, /output is the output directory and MAKEFUN_OUTPUT_DIR
// is unset.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
const localShots = join(repoRoot, 'screenshots');
if (existsSync(localShots)) {
  cpSync(localShots, shotsDir, { recursive: true });
}

// The gate's own caps, passed so a hand-in the scorer would refuse is
// refused here first: at most 4 screenshots of 256 KiB, at most 993 files
// and 48 MiB under game/, no game path over 1,000 bytes, and the dossier
// text capped at 160 KiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
