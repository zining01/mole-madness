// Feature hunt, step 1 and step 3 (see src/annotate/hunt.js).
//
//   node webapp/scripts/export_hunt.mjs [--goal 5] [--per-feature 40]
// Picks unused images to screen for the features that have fewer than --goal
// accepted examples: up to --per-feature images for each, from the diagnoses
// that list the feature (key-clue diagnoses first), one per unused patient in each.
// Images in the reviewer study's fixed set, already reviewed, or already
// pre-tagged are left out. Writes data_pipeline/suggestions/hunt_batch.json
// ({ id: [features to ask about] }) for
//   python screen_features.py
//
//   node webapp/scripts/export_hunt.mjs --hits [--spare 2]
// After screening: writes data_pipeline/suggestions/hunt_hits.json, the hits
// worth pre-tagging in full (for each feature, --spare times as many as it
// still needs, confident calls first), for
//   python suggest_features.py --variant with_dx --ids-file suggestions/hunt_hits.json
//   python suggest_features.py --variant with_dx --ids-file suggestions/hunt_hits.json --run-name r2
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { diagnosisFeatures, features } from '../src/data/features.js';
import { buildIndex, dxById } from '../src/annotate/queue.js';
import { HUNT_GOAL, acceptedCounts, diagnosesListing, huntHits, thinFeatures } from '../src/annotate/hunt.js';

const flag = (name) => process.argv.includes(`--${name}`);
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? Number(process.argv[i + 1]) : fallback;
};
const GOAL = arg('goal', HUNT_GOAL);
const PER_FEATURE = arg('per-feature', 40);
const SPARE = arg('spare', 2);

const path = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const read = (rel, fallback) => (fs.existsSync(path(rel)) ? JSON.parse(fs.readFileSync(path(rel), 'utf8')) : fallback);
const SUGGESTIONS = '../../data_pipeline/suggestions/';

const data = read('../src/metadata_cloud.json');
const annotations = read('../src/data/annotations.json');
const reviewSet = read('../src/data/reviewSet.json', { cases: [] });
const pretagged = read(`${SUGGESTIONS}with_dx.claude-opus-5-5.json`, {});
const screen = read(`${SUGGESTIONS}hunt_results.json`, {});

const exclude = new Set(reviewSet.cases.map((c) => c.id));
const counts = acceptedCounts(annotations);
const thin = thinFeatures(annotations, GOAL);
const hits = huntHits({ data, annotations, screen, suggestions: pretagged, exclude, goal: GOAL });
const name = (f) => features[f].name.slice(0, 34).padEnd(34);

if (flag('hits')) {
  const chosen = new Set();
  console.log(`${'feature'.padEnd(34)} accepted  hits  to pre-tag`);
  for (const f of thin) {
    const want = (GOAL - counts[f]) * SPARE;
    const take = hits[f].slice(0, want);
    for (const h of take) if (!pretagged[h.id]) chosen.add(h.id);
    console.log(`${name(f)} ${String(counts[f]).padStart(8)} ${String(hits[f].length).padStart(5)} ${String(take.length).padStart(11)}`);
  }
  const out = path(`${SUGGESTIONS}hunt_hits.json`);
  fs.writeFileSync(out, JSON.stringify([...chosen].sort(), null, 1) + '\n');
  console.log(`\n${chosen.size} images not yet pre-tagged written to ${out}`);
  process.exit(0);
}

// --- Choosing images to screen ---
const index = buildIndex(data);
const usedPatients = new Set([
  ...Object.values(annotations).filter((a) => a.status === 'accepted').map((a) => a.patient_id),
  ...reviewSet.cases.map((c) => c.patient),
]);
const usable = (id) => !annotations[id] && !exclude.has(id) && !pretagged[id];

// One image per unused patient, subtypes interleaved, in the queue's stable order.
const poolCache = {};
const pool = (dx) => {
  if (poolCache[dx]) return poolCache[dx];
  const lists = dxById[dx].codes.map((code) =>
    (index[dx]?.[code] ?? [])
      .filter(({ patient }) => !usedPatients.has(patient))
      .map(({ ids }) => ids.find(usable))
      .filter(Boolean)
  );
  const out = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push(l[i]);
  return (poolCache[dx] = out);
};

// How many images each diagnosis contributes: every image of a diagnosis is
// asked about all the thin features on that diagnosis' list, so a diagnosis
// needs as many images as its most demanding feature.
const take = Object.fromEntries(Object.keys(dxById).map((dx) => [dx, 0]));
const asked = {}; // feature → images that will be asked about it
for (const f of thin) {
  // What is already on hand counts towards this feature's share.
  const needed = Math.max(0, PER_FEATURE - hits[f].length - Object.values(screen).filter((r) => r.features?.[f]).length);
  const { key, supportive } = diagnosesListing(f);
  let got = 0;
  for (const group of [key, supportive]) {
    const dxs = group.filter((dx) => dxById[dx]);
    // Round-robin, so a feature shared by several diagnoses is looked for in each.
    for (let round = 1; got < needed && dxs.some((dx) => pool(dx).length >= round); round++) {
      for (const dx of dxs) {
        if (got >= needed || pool(dx).length < round) continue;
        take[dx] = Math.max(take[dx], round);
        got++;
      }
    }
    if (got >= needed) break;
  }
}

const thinSet = new Set(thin);
const batch = {};
for (const [dx, n] of Object.entries(take)) {
  if (!n) continue;
  const lists = diagnosisFeatures[dx];
  const ask = [...lists.key, ...lists.supportive].filter((f) => thinSet.has(f));
  for (const id of pool(dx).slice(0, n)) {
    batch[id] = ask;
    for (const f of ask) asked[f] = (asked[f] ?? 0) + 1;
  }
}

console.log(`Features with fewer than ${GOAL} accepted examples: ${thin.length}\n`);
console.log(`${'feature'.padEnd(34)} accepted  hits waiting  images to screen`);
for (const f of thin) {
  console.log(`${name(f)} ${String(counts[f]).padStart(8)} ${String(hits[f].length).padStart(13)} ${String(asked[f] ?? 0).padStart(17)}`);
}
console.log(`\n${'diagnosis'.padEnd(34)} images`);
for (const [dx, n] of Object.entries(take)) if (n) console.log(`${dxById[dx].name.slice(0, 34).padEnd(34)} ${String(Math.min(n, pool(dx).length)).padStart(6)}`);

const out = path(`${SUGGESTIONS}hunt_batch.json`);
fs.writeFileSync(out, JSON.stringify(batch, null, 1) + '\n');
const questions = Object.values(batch).reduce((n, list) => n + list.length, 0);
console.log(`\n${Object.keys(batch).length} images (${questions} feature questions) written to ${out}`);
