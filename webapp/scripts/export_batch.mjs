// Picks the next images to pre-tag: for each diagnosis, the same candidates the
// annotation tool's queue would offer (one per unused patient, under-quota
// subtypes first), enough to fill the full-set quota plus a buffer for skips.
//   node webapp/scripts/export_batch.mjs [--target 15] [--buffer 0.25]
// Writes data_pipeline/suggestions/batch.json (a list of image ids) for
//   python suggest_features.py --variant with_dx --ids-file suggestions/batch.json
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { acceptedByCode, buildIndex, candidates, dxById, quotas } from '../src/annotate/queue.js';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? Number(process.argv[i + 1]) : fallback;
};
const TARGET = arg('target', 15);
const BUFFER = arg('buffer', 0.25);

const read = (rel) => JSON.parse(fs.readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8'));
const data = read('../src/metadata_cloud.json');
const annotations = read('../src/data/annotations.json');
const OUT = fileURLToPath(new URL('../../data_pipeline/suggestions/batch.json', import.meta.url));

const index = buildIndex(data);
const batch = [];
console.log(`${'diagnosis'.padEnd(30)} accepted  quota  picked`);
for (const dx of Object.keys(dxById)) {
  const q = quotas(dx, index, TARGET);
  const done = acceptedByCode(dx, annotations);
  const remaining = Object.keys(q).reduce((n, c) => n + Math.max(0, q[c] - done[c]), 0);
  const picked = remaining ? candidates(dx, index, annotations, TARGET, Math.ceil(remaining * (1 + BUFFER))) : [];
  batch.push(...picked.map((c) => c.id));
  const accepted = Object.values(done).reduce((a, b) => a + b, 0);
  const total = Object.values(q).reduce((a, b) => a + b, 0);
  console.log(`${dxById[dx].name.slice(0, 30).padEnd(30)} ${String(accepted).padStart(8)} ${String(total).padStart(6)} ${String(picked.length).padStart(7)}`);
}
fs.writeFileSync(OUT, JSON.stringify(batch, null, 1) + '\n');
console.log(`\n${batch.length} images written to ${OUT}`);
