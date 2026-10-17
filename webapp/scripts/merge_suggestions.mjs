// Apply the model's confident feature calls to annotations.json (see mergeClaude
// in src/annotate/suggestions.js for exactly what is and isn't changed).
//   node webapp/scripts/merge_suggestions.mjs            # preview only
//   node webapp/scripts/merge_suggestions.mjs --apply    # write
//   add --with-removals to also untick what the model calls absent (off by default)
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { features } from '../src/data/features.js';
import { mergeClaude } from '../src/annotate/suggestions.js';

const ANNOTATIONS =
  process.env.ANNOTATIONS_FILE ?? fileURLToPath(new URL('../src/data/annotations.json', import.meta.url));
const SUGGESTIONS = fileURLToPath(
  new URL('../../data_pipeline/suggestions/with_dx.claude-opus-5-5.json', import.meta.url)
);
const apply = process.argv.includes('--apply');
const applyRemovals = process.argv.includes('--with-removals');

const annotations = JSON.parse(fs.readFileSync(ANNOTATIONS, 'utf8'));
const suggestions = JSON.parse(fs.readFileSync(SUGGESTIONS, 'utf8'));

const tally = (counts, list) => list.forEach((f) => (counts[f] = (counts[f] ?? 0) + 1));
const added = {};
const removed = {};
const kept = {};
let images = 0;
let changed = 0;
let conflicts = 0;
let evidenceNotes = 0;
let lowConfidence = 0;

for (const [id, record] of Object.entries(annotations)) {
  if (record.status !== 'accepted' || !suggestions[id]) continue;
  const result = mergeClaude(record, suggestions[id], { applyRemovals });
  images++;
  if (result.added.length || result.removed.length) changed++;
  if (result.conflict) conflicts++;
  tally(added, result.added);
  tally(removed, result.removed);
  tally(kept, result.keptHighlighted);
  evidenceNotes += Object.keys(result.record.evidence).length;
  lowConfidence += Object.keys(result.record.lowConfidence).length;
  annotations[id] = { ...result.record, updated: new Date().toISOString() };
}

const top = (counts) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([f, n]) => `${features[f].name} ${n}`)
    .join(', ') || 'none';

console.log(`${images} images with a second opinion; ${changed} would change.`);
console.log(`Ticks added (${Object.values(added).reduce((a, b) => a + b, 0)}): ${top(added)}`);
console.log(`Ticks removed (${Object.values(removed).reduce((a, b) => a + b, 0)}): ${top(removed)}`);
console.log(`Kept because you highlighted them: ${top(kept)}`);
console.log(`Network contradictions left for review: ${conflicts} images`);
console.log(`Claude notes stored: ${evidenceNotes} for present features, ${lowConfidence} low-confidence (hidden)`);

if (apply) {
  const sorted = Object.fromEntries(Object.keys(annotations).sort().map((k) => [k, annotations[k]]));
  fs.writeFileSync(`${ANNOTATIONS}.tmp`, JSON.stringify(sorted, null, 2) + '\n');
  fs.renameSync(`${ANNOTATIONS}.tmp`, ANNOTATIONS);
  console.log(`Wrote ${ANNOTATIONS}`);
} else {
  console.log('Preview only — run with --apply to write.');
}
