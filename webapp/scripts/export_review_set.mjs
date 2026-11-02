// Builds src/data/reviewSet.json: the fixed set of images every reviewer is
// asked to review, with Claude's raw calls on each (from one saved run, before
// any of your edits) for comparison.
//
// The images come from outside the quiz (not accepted in annotations.json), so
// reviewers can't have seen an annotation of them first; export_quiz_cases.mjs
// keeps them out of the quiz and glossary even if you accept them later. The pick
// is balanced (`--per-dx` images per diagnosis, each from a different patient)
// and deterministic.
//
// Run once, before inviting reviewers, and don't change the set while reviews
// are being collected (it refuses to overwrite without --force):
//   node scripts/export_review_set.mjs [--per-dx 2] [--name v1] [--force]
import fs from 'node:fs';
import crypto from 'node:crypto';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { diagnosisFeatures } from '../src/data/features.js';
import { diagnosesForMode, revealLabel } from '../src/data/taxonomy.js';

const path = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const RUN_FILE = '../../data_pipeline/suggestions/with_dx.claude-opus-5-5.json';
const OUT = path('../src/data/reviewSet.json');

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const perDx = Number(arg('per-dx', 2));
const name = arg('name', 'v1');
if (fs.existsSync(OUT) && !process.argv.includes('--force')) {
  console.error(`${OUT} already exists. Changing the set mid-study mixes reviews of different sets; pass --force if you mean it.`);
  process.exit(1);
}

const run = JSON.parse(fs.readFileSync(path(RUN_FILE), 'utf8'));
const annotations = JSON.parse(fs.readFileSync(path('../src/data/annotations.json'), 'utf8'));
const metadata = JSON.parse(fs.readFileSync(path('../src/metadata_cloud.json'), 'utf8'));
const diagnoses = diagnosesForMode('advanced');

// Stable pseudo-random order, so the same inputs always give the same set.
const rank = (id) => crypto.createHash('sha256').update(`${name}:${id}`).digest('hex');

const byDx = {};
for (const [id, call] of Object.entries(run)) {
  if (annotations[id]?.status === 'accepted' || !metadata[id] || !diagnoses[call.dx]) continue;
  (byDx[call.dx] ??= []).push(id);
}

const cases = [];
for (const dx of Object.keys(diagnoses)) {
  const patients = new Set();
  const picked = (byDx[dx] ?? []).sort((a, b) => rank(a).localeCompare(rank(b))).filter((id) => {
    const p = metadata[id].patient_id;
    if (patients.has(p) || patients.size >= perDx) return false;
    patients.add(p);
    return true;
  });
  const { key, supportive } = diagnosisFeatures[dx];
  const checklist = [...new Set([...key, ...supportive])];
  for (const id of picked) {
    const m = metadata[id];
    const call = run[id];
    cases.push({
      id,
      code: m.code,
      patient: m.patient_id,
      image: m.image_url,
      src: `/${m.src}`,
      label: m.diagnosis,
      dx,
      diagnosis: revealLabel(dx, m.code),
      highlights: [],
      // Claude's calls on the checklist only (off-list calls from older prompts are ignored).
      claude: Object.fromEntries(checklist.filter((f) => call.features[f]).map((f) => [f, call.features[f]])),
    });
  }
  if (picked.length < perDx) console.warn(`${diagnoses[dx].name}: only ${picked.length} image(s) available`);
}

const first = Object.values(run)[0];
fs.writeFileSync(OUT, JSON.stringify({
  name,
  created: new Date().toISOString().slice(0, 10),
  claudeRun: { file: RUN_FILE.split('/').pop(), model: first.model, variant: first.variant },
  cases,
}) + '\n');
console.log(`Wrote review set "${name}": ${cases.length} images over ${new Set(cases.map((c) => c.dx)).size} diagnoses → ${OUT}`);
