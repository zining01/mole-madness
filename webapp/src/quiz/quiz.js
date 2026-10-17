// Quiz logic: the answer choices, building a session, choosing answer options,
// and what to show when an answer is revealed. No React here.
//
// Answer choices sit on top of the annotation diagnoses (taxonomy.js). Most
// diagnoses are their own answer; ANSWER_GROUPS merges subtypes that look alike
// on dermoscopy into one choice. The reveal still names the specific subtype and
// teaches from that subtype's own feature list.
import cases from '../data/quizCases.json';
import { quizDiagnoses, diagnosesForMode, codeToDx, revealLabel } from '../data/taxonomy.js';
import { diagnosisFeatures, features } from '../data/features.js';
import { findingsLibrary } from '../components/findingsLibrary.js';
import { fastShuffle } from '../utils/helpers.js';

export const OPTION_COUNT = 4;
export const MODES = { basic: 'Basic', advanced: 'Advanced' };

// The first member supplies the feature list used for "would usually show".
const ANSWER_GROUPS = {
  basic: {
    nevus: { name: 'Nevus', members: ['nevus', 'intradermal_nevus', 'congenital_nevus'] },
  },
  advanced: {
    benign_nevus: { name: 'Benign nevus', members: ['banal_nevus', 'intradermal_nevus', 'banal_congenital_nevus'] },
    dysplastic_nevus: { name: 'Dysplastic nevus', members: ['dysplastic_nevus', 'dysplastic_congenital_nevus'] },
  },
};

const dxByMode = { basic: diagnosesForMode('basic'), advanced: diagnosesForMode('advanced') };
const codeMaps = { basic: codeToDx('basic'), advanced: codeToDx('advanced') };

const buildAnswers = (mode) => {
  const dxs = dxByMode[mode];
  const groupOf = {};
  for (const [id, g] of Object.entries(ANSWER_GROUPS[mode])) for (const m of g.members) groupOf[m] = id;
  const answerOfDx = (dx) => groupOf[dx] ?? dx;

  const answers = {};
  for (const dx of Object.keys(dxs)) {
    const id = answerOfDx(dx);
    if (answers[id]) continue;
    const members = ANSWER_GROUPS[mode][id]?.members ?? [dx];
    const first = dxs[members[0]];
    const differentials = [...new Set(members.flatMap((m) => dxs[m].differentials).map(answerOfDx))].filter(
      (d) => d !== id
    );
    answers[id] = {
      name: ANSWER_GROUPS[mode][id]?.name ?? first.name,
      superclass: first.superclass,
      malignancy: first.malignancy,
      differentials,
      members,
      featureDx: members[0],
    };
  }
  return { answers, answerOfDx };
};
const built = { basic: buildAnswers('basic'), advanced: buildAnswers('advanced') };

/** The answer choices for a mode, keyed by id, in taxonomy order. */
export const answers = (mode) => built[mode].answers;
/** The specific annotation diagnosis of a case (e.g. intradermal_nevus). */
export const dxOf = (c, mode) => codeMaps[mode][c.code];
/** The answer choice a case belongs to (e.g. nevus). */
export const answerOf = (c, mode) => {
  const dx = dxOf(c, mode);
  return dx && built[mode].answerOfDx(dx);
};

/** Cases usable in a mode, by answer (e.g. lichenoid keratosis only exists in advanced). */
export const casesByAnswer = (mode) => {
  const out = {};
  for (const c of cases) {
    const a = answerOf(c, mode);
    if (a) (out[a] ??= []).push(c);
  }
  return out;
};

// Diagnosis ids across modes: Nevus ⇄ Banal + Dysplastic nevus, and so on.
const convertDx = (dx, to) => {
  if (to === 'advanced') return quizDiagnoses[dx]?.advancedSplit ?? [dx];
  const parent = Object.keys(quizDiagnoses).find((p) => quizDiagnoses[p].advancedSplit?.includes(dx));
  return [parent ?? dx];
};
const answersForDx = (dxIds, mode) =>
  [...new Set(dxIds.flatMap((dx) => convertDx(dx, mode)).filter((dx) => dxByMode[mode][dx]).map(built[mode].answerOfDx))];

/** Carry a selection of answers across a mode switch. */
export const convertSelection = (ids, to) => {
  const from = to === 'advanced' ? 'basic' : 'advanced';
  return answersForDx(ids.flatMap((id) => answers(from)[id]?.members ?? []), to);
};

// Presets are written with basic-mode diagnosis ids.
const PRESETS = {
  all: { name: 'Everything', ids: null },
  melanocytic: { name: 'Melanocytic lesions', filter: (a) => a.superclass === 'Melanocytic' },
  nonmelanocytic: { name: 'Non-melanocytic lesions', filter: (a) => a.superclass === 'Nonmelanocytic' },
  melanoma: {
    name: 'Melanoma vs mimics',
    ids: ['melanoma', 'nevus', 'seb_keratosis', 'spitz_reed', 'blue_nevus', 'lichenoid_keratosis'],
  },
  pink: {
    name: 'Pink & vascular',
    ids: ['bcc', 'scc', 'actinic_keratosis', 'vascular_lesion', 'pyogenic_granuloma', 'angiokeratoma', 'kaposi', 'dermatofibroma'],
  },
  face: {
    name: 'Face & sun-damaged skin',
    ids: ['lentigo_maligna', 'solar_lentigo', 'seb_keratosis', 'lichenoid_keratosis', 'actinic_keratosis', 'scc', 'bcc'],
  },
  acral: { name: 'Acral (palms & soles)', ids: ['acral_nevus', 'acral_melanoma'] },
};

export const presets = (mode) =>
  Object.entries(PRESETS).map(([key, p]) => {
    const all = Object.keys(answers(mode));
    let ids;
    if (p.filter) ids = all.filter((id) => p.filter(answers(mode)[id]));
    else if (!p.ids) ids = all;
    else ids = answersForDx(p.ids, mode);
    return { key, name: p.name, ids };
  });

/**
 * Up to `count` cases spread evenly over the selected answers, never two from
 * the same patient, in random order, each with its shuffled answer options.
 */
export const newSession = (mode, selected, count) =>
  buildSession(mode, selected, count).map((c) => ({ case: c, options: optionsFor(c, mode, selected) }));

const buildSession = (mode, selected, count) => {
  const pools = casesByAnswer(mode);
  const queues = Object.fromEntries(selected.map((a) => [a, fastShuffle(pools[a] ?? [])]));
  const usedPatients = new Set();
  const picked = [];
  let order = fastShuffle(selected);
  while (picked.length < count && order.length) {
    const next = [];
    for (const a of order) {
      if (picked.length >= count) break;
      const queue = queues[a];
      while (queue.length && usedPatients.has(queue[0].patient)) queue.shift();
      if (!queue.length) continue;
      const c = queue.shift();
      usedPatients.add(c.patient);
      picked.push(c);
      next.push(a);
    }
    order = fastShuffle(next);
  }
  return fastShuffle(picked);
};

/**
 * The correct answer plus distractors from the selected set: its likely
 * mix-ups first, then the same superclass, then anything else selected.
 */
const optionsFor = (c, mode, selected) => {
  const all = answers(mode);
  const answer = answerOf(c, mode);
  const others = selected.filter((a) => a !== answer);
  const differentials = all[answer].differentials.filter((a) => others.includes(a));
  const sameClass = others.filter((a) => !differentials.includes(a) && all[a].superclass === all[answer].superclass);
  const rest = others.filter((a) => !differentials.includes(a) && !sameClass.includes(a));
  const distractors = [...fastShuffle(differentials), ...fastShuffle(sameClass), ...fastShuffle(rest)].slice(
    0,
    OPTION_COUNT - 1
  );
  return fastShuffle([answer, ...distractors]);
};

/** The specific diagnosis under the answer, e.g. "Intradermal nevus" or "SCC in situ (Bowen disease)". */
export const subtypeLabel = (c, mode) => {
  const name = answers(mode)[answerOf(c, mode)].name;
  const specific = revealLabel(dxOf(c, mode), c.code);
  if (specific !== name) return specific;
  const advanced = codeMaps.advanced[c.code]; // basic mode: e.g. "Dysplastic nevus"
  const advancedLabel = revealLabel(advanced, c.code);
  return advancedLabel !== name ? advancedLabel : null;
};

/** Features to show for a case, from its specific diagnosis' lists: what's in this image, and what isn't. */
export const featureBreakdown = (c, mode) => {
  const dx = dxOf(c, mode);
  const { key, supportive } = diagnosisFeatures[dx];
  const role = (f) => (key.includes(f) ? 'key' : supportive.includes(f) ? 'supportive' : null);
  const rank = { key: 0, supportive: 1 };
  const seen = c.present
    .filter((f) => features[f])
    .map((f) => ({ id: f, role: role(f), note: c.evidence[f] ?? null }))
    .sort((a, b) => (rank[a.role] ?? 2) - (rank[b.role] ?? 2));
  const missingKey = key.filter((f) => !c.present.includes(f));
  return { dxName: dxByMode[mode][dx].name, seen, missingKey };
};

/** Key features of an answer choice, for "what your answer would usually show". */
export const answerKeyFeatures = (answerId, mode) => diagnosisFeatures[answers(mode)[answerId].featureDx].key;

/** Your clinical pearl and schematic for the dataset diagnosis, if there is one. */
export const pearlFor = (c) =>
  findingsLibrary[c.label] ?? findingsLibrary[c.label.replace('Lentiginious', 'Lentiginous')] ?? null;

export const totalCases = cases.length;
