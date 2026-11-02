// Data for the feature glossary: the features by category, which diagnoses each
// one points to, and the quiz cases that show it. No React here.
import cases from '../data/quizCases.json';
import { diagnosisFeatures, features } from '../data/features.js';
import { diagnosesForMode } from '../data/taxonomy.js';
import { answerOf, answers, subtypeLabel } from '../quiz/quiz.js';

/** All feature ids in vocabulary order, grouped by category. */
export const featureGroups = (() => {
  const groups = [];
  for (const id of Object.keys(features)) {
    const category = features[id].category;
    if (groups.at(-1)?.category !== category) groups.push({ category, ids: [] });
    groups.at(-1).ids.push(id);
  }
  return groups;
})();
export const featureOrder = featureGroups.flatMap((g) => g.ids);

// The specific (advanced-mode) diagnoses, e.g. "Dysplastic nevus" rather than "Nevus".
const specificDx = diagnosesForMode('advanced');

/** Diagnoses for which the feature is a key clue, and those where it's supportive. */
export const diagnosesFor = (feature) => {
  const key = [];
  const supportive = [];
  for (const [dx, lists] of Object.entries(diagnosisFeatures)) {
    if (!specificDx[dx]) continue;
    if (lists.key.includes(feature)) key.push(specificDx[dx].name);
    else if (lists.supportive.includes(feature)) supportive.push(specificDx[dx].name);
  }
  return { key, supportive };
};

/**
 * Cases showing the feature, best teaching examples first: those with the
 * feature marked on the image, then those with a note on where to find it.
 */
export const examplesFor = (feature) =>
  cases
    .filter((c) => c.present.includes(feature))
    .map((c) => ({ c, marked: c.highlights.some((h) => h.feature === feature), note: c.evidence[feature] ?? null }))
    .sort((a, b) => b.marked - a.marked || Boolean(b.note) - Boolean(a.note) || a.c.id.localeCompare(b.c.id));

export const exampleCounts = Object.fromEntries(featureOrder.map((f) => [f, cases.filter((c) => c.present.includes(f)).length]));

/** "Benign nevus · Compound nevus", or the dataset's label if the case isn't in the quiz taxonomy. */
export const caseDiagnosis = (c) => {
  const answer = answerOf(c, 'advanced');
  if (!answer) return c.label;
  const subtype = subtypeLabel(c, 'advanced');
  return `${answers('advanced')[answer].name}${subtype ? ` · ${subtype}` : ''}`;
};
