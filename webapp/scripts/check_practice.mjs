// Sanity check for the feature practice engine (src/practice/engine.js): builds
// every possible question for every feature and checks that the answers
// are consistent with the annotations. Run with `npm run check-practice` after
// changing annotations, feature lists or look-alike pairs.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createEngine, TYPE_IDS } from '../src/practice/engine.js';
import { lookalikesOf } from '../src/data/lookalikes.js';
import { features } from '../src/data/features.js';
import { lookalikePairs } from '../src/data/lookalikes.js';

const cases = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../src/data/quizCases.json', import.meta.url)), 'utf8'));

let seed = 12345;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const engine = createEngine(cases, random);

const problems = [];
const check = (ok, message) => ok || problems.push(message);

for (const { a, b } of lookalikePairs) {
  check(features[a], `look-alike pair names an unknown feature: ${a}`);
  check(features[b], `look-alike pair names an unknown feature: ${b}`);
}

const totals = Object.fromEntries(TYPE_IDS.map((t) => [t, 0]));
for (const f of engine.practicable) {
  for (const type of engine.typesFor(f)) {
    const used = new Set();
    for (let item = engine.makeItem(f, type, used); item; item = engine.makeItem(f, type, used)) {
      totals[type]++;
      const where = `${type} / ${f} / ${item.case.id}`;
      const unsure = (c, x) => (c.uncertain ?? []).includes(x);
      check(item.case.present.includes(f), `${where}: the image doesn't show the feature`);
      if (type === 'name') {
        check(item.options.length >= 3, `${where}: fewer than 3 options`);
        check(!item.case.partial, `${where}: wrong answers offered for a partial record`);
        check(new Set(item.options).size === item.options.length, `${where}: repeated option`);
        check(!item.options.some((o) => lookalikesOf(f).some((l) => l.id === o)), `${where}: a look-alike of the answer is offered as a wrong answer`);
        for (const o of item.options) {
          if (o !== f) check(!item.case.present.includes(o) && !unsure(item.case, o), `${where}: wrong answer ${o} is present or unsure`);
        }
      } else if (type === 'pick') {
        const foil = item.cases[1 - item.answer];
        check(item.cases[item.answer] === item.case, `${where}: answer doesn't point at the positive image`);
        check(!foil.present.includes(f) && !unsure(foil, f), `${where}: the other image (${foil.id}) shows the feature or is unsure`);
        check(foil.patient !== item.case.patient, `${where}: both images are from one patient`);
        check(!foil.partial, `${where}: the other image (${foil.id}) is a partial record`);
      }
    }
  }
}

// Sessions: a mix of everything, each category, then each feature on its own.
for (const count of [10, 20, 30]) {
  const session = engine.buildSession({ count });
  check(session.length === count, `a session of ${count} has ${session.length} questions`);
}
for (const item of engine.buildSession({ count: 30 })) check(!item.highlight, 'a question marks the image while highlights are hidden');
for (const f of engine.practicable) {
  check(engine.buildSession({ scope: f, count: 10 }).length > 0, `no questions can be built for ${f}`);
}

// Lesion types: every question is on an image of that diagnosis, about one of its features.
for (const type of engine.lesionTypes) {
  const session = engine.buildSession({ scope: type.scope, count: 10 });
  check(session.length > 0, `no questions for lesion type ${type.id}`);
  for (const item of session) {
    check(engine.dxOf(item.case) === type.id, `lesion type ${type.id}: question on an image of ${engine.dxOf(item.case)}`);
    check(engine.inScope(type.scope).includes(item.feature), `lesion type ${type.id}: ${item.feature} isn't one of its features`);
  }
}
console.log(`Lesion types with questions: ${engine.lesionTypes.length}`);

const unpracticable = Object.keys(features).filter((f) => !engine.isPracticable(f));
console.log(`${cases.length} cases, ${engine.practicable.length} of ${Object.keys(features).length} features have examples`);
console.log('Questions available:', totals);
console.log(`No examples yet (${unpracticable.length}): ${unpracticable.join(', ')}`);
const thin = engine.practicable.filter((f) => engine.exampleCount(f) < 3);
console.log(`Fewer than 3 examples (${thin.length}): ${thin.join(', ')}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + problems.slice(0, 40).join('\n'));
  process.exit(1);
}
console.log('All checks passed.');
