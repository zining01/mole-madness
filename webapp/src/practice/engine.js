// Feature practice: turns the annotated cases into questions about features and
// chooses which features a session should cover. No React here, and the cases
// are passed in, so this file can be run on its own (see scripts/check_practice.mjs).
//
// Two kinds of question, both about one target feature:
//   name     — "Which of these features does this lesion show?" (or, when
//              highlights are shown to learners, "What is the marked structure?")
//   pick     — "Which lesion shows X?" between two images
// A session covers all features, one category, one feature, or one lesion type
// (that diagnosis' features, asked on images of that diagnosis).
//
// What counts as a lesion WITHOUT a feature matters as much as what counts as
// one with it. Each image was only checked for its own diagnosis' feature list
// (key + supportive), so:
//   - in the list and unticked → looked for and not seen: a safe "absent"
//   - marked unsure            → never used either way
//   - a partial record (accepted for single features from the feature hunt)
//                              → never "absent": the rest wasn't assessed
//   - not in the list          → nobody looked. Used as "absent" only for
//     specific structures that have no business in that diagnosis; never for
//     GENERIC features (symmetry, scale, a brown structureless area…), which
//     can turn up in any lesion.
import { diagnosisFeatures, features } from '../data/features.js';
import { codeToDx, diagnosesForMode, revealLabel } from '../data/taxonomy.js';
import { lookalikesOf } from '../data/lookalikes.js';

export const TYPES = {
  name: { label: 'Name it', blurb: 'Choose which feature a lesion shows' },
  pick: { label: 'Pick the lesion', blurb: 'Choose which of two lesions shows the feature' },
};
export const TYPE_IDS = Object.keys(TYPES);

// The order categories are listed in: whole-lesion organization and the
// melanocytic basics first, site-specific patterns last.
export const CURRICULUM = [
  'Organization',
  'Network',
  'Dots & globules',
  'Structureless',
  'Lines',
  'Keratin & surface',
  'BCC structures',
  'Vessels',
  'Hair & follicles',
  'Facial',
  'Acral',
];

// Features that can appear in almost any lesion, so an image is only treated as
// lacking one when its own checklist asked about it.
const GENERIC = new Set([
  ...Object.keys(features).filter((f) => features[f].category === 'Organization'),
  'typical_network',
  'structureless_brown',
  'regular_globules',
  'irregular_globules',
  'keratin_scale',
  'ulceration',
  'multiple_small_erosions',
  'dotted_vessels',
  'polymorphous_vessels',
  'short_fine_telangiectasias',
  'hypertrichosis',
  'red_structureless',
  'white_structureless',
  'shiny_white_structures',
]);

// Highlights are drawn around a clear example, sometimes generously. One that
// takes in most of the image points at nothing in particular, so "name it" asks
// about the whole image instead.
const MAX_NAME_AREA = 0.25;

const specificDx = diagnosesForMode('advanced');
const dxOfCode = codeToDx('advanced');

const shuffle = (list, random) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
const sample = (list, random) => list[Math.floor(random() * list.length)];

// Wrong answers in "name it" should look different from the right one, so the
// question tests recognizing the feature rather than splitting hairs between
// near-identical terms. Two features count as similar if they are a look-alike
// pair, sit in the same category, or share a distinctive word in their names
// (blue-white veil / whitish veil, red lacunae / dark lacunae).
const COMMON_WORDS = new Set(['patt', 'stru', 'area', 'line', 'pigm', 'with', 'like', 'smal', 'mult', 'open']);
const nameStems = (f) =>
  new Set(features[f].name.toLowerCase().split(/[^a-z]+/).filter((w) => w.length >= 4).map((w) => w.slice(0, 4)).filter((w) => !COMMON_WORDS.has(w)));
const stemsOf = Object.fromEntries(Object.keys(features).map((f) => [f, nameStems(f)]));
const lookalikeSets = Object.fromEntries(Object.keys(features).map((f) => [f, new Set(lookalikesOf(f).map((l) => l.id))]));
export const similarFeatures = (a, b) =>
  a === b ||
  lookalikeSets[a].has(b) ||
  features[a].category === features[b].category ||
  [...stemsOf[a]].some((w) => stemsOf[b].has(w));

/** 'dx:bcc' → 'bcc': a scope that means "features of this lesion type, on images of it". */
const dxOfScope = (scope) => (typeof scope === 'string' && scope.startsWith('dx:') ? scope.slice(3) : null);

const highlightArea = (h) => (h.shape === 'ellipse' ? Math.PI * h.rx * h.ry : 0);

/**
 * cases         — the exported, accepted cases
 * random        — source of randomness (seeded in the check script)
 * useHighlights — whether "name it" may mark a structure on the image
 */
export const createEngine = (cases, random = Math.random, { useHighlights = false } = {}) => {
  const info = new Map(); // case → { dx, scope, present, uncertain }
  const positives = {}; // feature → cases showing it
  const marks = {}; // feature → [{ c, h }]

  for (const c of cases) {
    const dx = dxOfCode[c.code];
    const lists = diagnosisFeatures[dx];
    info.set(c, {
      dx,
      scope: new Set(lists ? [...lists.key, ...lists.supportive] : []),
      present: new Set(c.present),
      uncertain: new Set(c.uncertain ?? []),
    });
    for (const f of c.present) if (features[f]) (positives[f] ??= []).push(c);
    for (const h of c.highlights) if (features[h.feature]) (marks[h.feature] ??= []).push({ c, h });
  }

  /** 'checked' (looked for, not seen), 'unlikely' (not looked for, but a specific structure), or null. */
  const absence = (c, f) => {
    const i = info.get(c);
    if (c.partial || i.present.has(f) || i.uncertain.has(f)) return null;
    if (i.scope.has(f)) return 'checked';
    return GENERIC.has(f) ? null : 'unlikely';
  };

  const lookalikeIds = (f) => lookalikesOf(f).map((l) => l.id);

  // --- Describing a case, for feedback ---
  const dxLabel = (c) => {
    const dx = info.get(c).dx;
    if (!dx) return c.label;
    const name = specificDx[dx].name;
    const subtype = revealLabel(dx, c.code);
    return subtype !== name ? `${name} · ${subtype}` : name;
  };
  /** 'key', 'supportive' or null: how the feature relates to this case's diagnosis. */
  const roleIn = (c, f) => {
    const lists = diagnosisFeatures[info.get(c).dx];
    if (!lists) return null;
    return lists.key.includes(f) ? 'key' : lists.supportive.includes(f) ? 'supportive' : null;
  };

  // --- Candidate cases for each kind of question ---
  const smallMarks = (f, limit) => (marks[f] ?? []).filter(({ h }) => highlightArea(h) <= limit);

  const foilsFor = (f, positive) => {
    const tiers = [[], [], []];
    const alikes = lookalikeIds(f);
    for (const c of cases) {
      if (c.patient === positive?.patient) continue;
      const kind = absence(c, f);
      if (!kind) continue;
      const shows = alikes.find((l) => info.get(c).present.has(l)) ?? null;
      tiers[shows ? 0 : kind === 'checked' ? 1 : 2].push({ c, shows });
    }
    return tiers;
  };
  const hasFoil = (f) => foilsFor(f, null).some((t) => t.length > 0);

  // Three wrong answers that are absent from the image and look different from
  // the right one and, where possible, from each other. Features on the lesion's
  // own checklist come first: they are plausible for the diagnosis.
  const distractorsFor = (c, target, { structuresOnly }) => {
    const ok = (f) => f !== target && absence(c, f) && !lookalikeSets[target].has(f) && !(structuresOnly && features[f].annotate === 'global');
    const pool = shuffle(Object.keys(features).filter(ok), random).sort((a, b) => (absence(c, a) === 'checked' ? 0 : 1) - (absence(c, b) === 'checked' ? 0 : 1));
    const chosen = [];
    // Strictest first: distinct from the answer and from each other; then just from the answer; then anything left.
    const rules = [
      (f) => !similarFeatures(f, target) && !chosen.some((d) => similarFeatures(f, d)),
      (f) => !similarFeatures(f, target),
      () => true,
    ];
    for (const rule of rules) {
      for (const f of pool) {
        if (chosen.length >= 3) break;
        if (!chosen.includes(f) && rule(f)) chosen.push(f);
      }
    }
    return chosen;
  };

  // With `dx`, only images of that lesion type are asked about.
  const positivesIn = (f, dx) => (dx ? (positives[f] ?? []).filter((c) => info.get(c).dx === dx) : (positives[f] ?? []));
  const candidates = {
    name: (f, dx = null) => positivesIn(f, dx),
    pick: (f, dx = null) => (hasFoil(f) ? positivesIn(f, dx) : []),
  };

  const typesFor = (f, dx = null) => TYPE_IDS.filter((t) => candidates[t](f, dx).length > 0);
  const practicable = Object.keys(features).filter((f) => (positives[f]?.length ?? 0) > 0);
  const practicableSet = new Set(practicable);

  /** How many different questions exist for a feature, per type. */
  const supply = (f) => Object.fromEntries(TYPE_IDS.map((t) => [t, candidates[t](f).length]));

  // --- Building one question ---
  const builders = {
    name: (f, c) => {
      // A mark around most of the lesion points at nothing in particular: ask about the whole image.
      const own = useHighlights ? smallMarks(f, MAX_NAME_AREA).filter((m) => m.c === c) : [];
      const highlight = own.length ? sample(own, random).h : null;
      const distractors = distractorsFor(c, f, { structuresOnly: Boolean(highlight) });
      if (distractors.length < 2) return null;
      return { highlight, options: shuffle([f, ...distractors], random) };
    },
    pick: (f, c) => {
      const tier = foilsFor(f, c).find((t) => t.length > 0);
      if (!tier) return null;
      const foil = sample(tier, random);
      const first = random() < 0.5;
      return { cases: first ? [c, foil.c] : [foil.c, c], answer: first ? 0 : 1, foilShows: foil.shows };
    },
  };

  /**
   * A question of `type` about `feature`, preferring images this session hasn't
   * shown (`used` holds "type:feature:caseId" and "caseId" entries, and is updated).
   * With `dx`, the image is of that lesion type. Returns null if every image
   * has already been used for this type of question on this feature.
   */
  const makeItem = (feature, type, used = new Set(), dx = null) => {
    const pool = candidates[type](feature, dx).filter((c) => !used.has(`${type}:${feature}:${c.id}`));
    if (!pool.length) return null;
    const unseen = pool.filter((c) => !used.has(c.id));
    for (const c of shuffle(unseen.length ? unseen : pool, random)) {
      const body = builders[type](feature, c);
      if (!body) continue;
      used.add(`${type}:${feature}:${c.id}`);
      used.add(c.id);
      for (const other of body.cases ?? []) used.add(other.id);
      return { type, feature, case: c, ...body };
    }
    return null;
  };

  // --- Choosing what a session covers ---
  // Lesion types that can be practiced: the diagnosis' own features (key clues
  // first) that at least one accepted image of that diagnosis shows.
  const featuresOfDx = (dx) => {
    const lists = diagnosisFeatures[dx];
    if (!lists || !specificDx[dx]) return [];
    return [...new Set([...lists.key, ...lists.supportive])].filter((f) => positivesIn(f, dx).length > 0);
  };
  const lesionTypes = Object.keys(specificDx)
    .map((dx) => ({ id: dx, scope: `dx:${dx}`, name: specificDx[dx].name, features: featuresOfDx(dx).length, images: cases.filter((c) => info.get(c).dx === dx).length }))
    .filter((t) => t.features > 0);

  const inScope = (scope) => {
    if (!scope || scope === 'all') return practicable;
    if (Array.isArray(scope)) return scope.filter((f) => practicableSet.has(f));
    if (dxOfScope(scope)) return featuresOfDx(dxOfScope(scope));
    if (practicableSet.has(scope)) return [scope];
    return practicable.filter((f) => features[f].category === scope);
  };

  /**
   * The questions for a session.
   *   scope — 'all', a category name, a feature id, a list of feature ids, or
   *           'dx:<diagnosis id>' for one lesion type's features on its own images
   *   count — how many questions to aim for (fewer if the images run out)
   *   types — which kinds of question may be asked
   * Features are taken in random order, going round again if the scope has
   * fewer features than questions; each question uses a new image where it can.
   */
  const buildSession = ({ scope = 'all', count = 10, types = TYPE_IDS }) => {
    const dx = dxOfScope(scope);
    const pool = shuffle(inScope(scope).filter((f) => typesFor(f, dx).some((t) => types.includes(t))), random);
    if (!pool.length) return [];
    const used = new Set();
    const items = [];
    for (let i = 0; items.length < count && i < count * 4; i++) {
      const f = pool[i % pool.length];
      for (const type of shuffle(typesFor(f, dx).filter((t) => types.includes(t)), random)) {
        const item = makeItem(f, type, used, dx);
        if (!item) continue;
        items.push(item);
        break;
      }
    }
    return items;
  };

  /** Another question on a feature the learner just missed, in a different image if there is one. */
  const retryItem = (feature, types, usedItems, scope = 'all') => {
    const dx = dxOfScope(scope);
    const used = new Set();
    for (const it of usedItems) {
      used.add(`${it.type}:${it.feature}:${it.case.id}`);
      used.add(it.case.id);
    }
    for (const type of shuffle(typesFor(feature, dx).filter((t) => types.includes(t)), random)) {
      const item = makeItem(feature, type, used, dx);
      if (item) return item;
    }
    return null;
  };

  return {
    practicable,
    isPracticable: (f) => practicableSet.has(f),
    typesFor,
    supply,
    inScope,
    makeItem,
    buildSession,
    retryItem,
    lesionTypes,
    dxOf: (c) => info.get(c).dx,
    dxLabel,
    roleIn,
    exampleCount: (f) => positives[f]?.length ?? 0,
  };
};
