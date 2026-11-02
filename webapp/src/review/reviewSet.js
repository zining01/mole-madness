// The fixed review set (built by scripts/export_review_set.mjs): the images every
// reviewer reviews, each with Claude's raw calls on its checklist. No React here.
import set from '../data/reviewSet.json';
import { diagnosisFeatures, features } from '../data/features.js';
import { diagnosesForMode } from '../data/taxonomy.js';

export const reviewSet = set;
export const reviewCases = Object.fromEntries(set.cases.map((c) => [c.id, c]));

const ALL = Object.keys(features); // vocabulary order, grouped by category
const specificDx = diagnosesForMode('advanced');

export const dxName = (c) => specificDx[c.dx].name;

/** The diagnosis' key + supportive features: the checklist, and what Claude was asked about. */
export const checklistFor = (c) => {
  const { key, supportive } = diagnosisFeatures[c.dx];
  const on = new Set([...key, ...supportive]);
  return ALL.filter((f) => on.has(f));
};

/** Every other feature, grouped by category. */
export const otherGroupsFor = (c) => {
  const checklist = new Set(checklistFor(c));
  const groups = [];
  for (const f of ALL.filter((id) => !checklist.has(id))) {
    const category = features[f].category;
    if (groups.at(-1)?.category !== category) groups.push({ category, ids: [] });
    groups.at(-1).ids.push(f);
  }
  return groups;
};

export const inVocabularyOrder = (ids) => ALL.filter((f) => ids.has(f));

// Each reviewer gets their own fixed order (seeded by their email), so order
// effects average out across reviewers.
const seededRandom = (text) => {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

export const orderFor = (email) => {
  const random = seededRandom(`${set.name}:${email}`);
  const ids = set.cases.map((c) => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
};
