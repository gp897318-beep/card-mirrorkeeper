// MIRRORKEEPER entrypoint: copies game/ and screenshots/ beside this file
// into the output dir and writes dossier.json with buildDossier.
// Run twice; both runs must write byte-identical dossier.json.
import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const here = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

await mkdir(out, { recursive: true });
await cp(join(here, "game"), join(out, "game"), { recursive: true });
await cp(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });

const dossier = await buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
await writeFile(join(out, "dossier.json"), dossier);
console.log("wrote dossier.json (" + dossier.length + " bytes) to " + out);
