// Second-opinion feature calls from data_pipeline/suggest_features.py, compared
// with an image's own tags. A disagreement stays open until the tags change to
// match or it's marked reviewed (saved as `reviewedSuggestions` on the record).
//   add    — model says present, not ticked
//   remove — ticked, model says absent
//   unsure — model unsure, not ticked (a hint; doesn't count as needing review)
// Features in the record's `hiddenSuggestions` were deliberately set aside as low
// confidence (e.g. only one of two runs saw them), so they don't come back as "add".
import { diagnosisFeatures } from '../data/features.js';

/**
 * Features the model is asked about for a diagnosis: its key + supportive lists.
 * Older runs also asked about every whole-lesion feature; calls outside these
 * lists are ignored everywhere.
 */
export const inScope = (dx) => new Set([...diagnosisFeatures[dx].key, ...diagnosisFeatures[dx].supportive]);

const scopedCalls = (suggestion) => {
  if (!suggestion) return [];
  const scope = inScope(suggestion.dx);
  return Object.entries(suggestion.features).filter(([f]) => scope.has(f));
};

export const openSuggestions = (suggestion, present, reviewed, hidden = new Set()) => {
  const out = [];
  for (const [feature, { status, evidence }] of scopedCalls(suggestion)) {
    if (reviewed.has(feature)) continue;
    const ticked = present.has(feature);
    if (!ticked && status === 'present') {
      if (!hidden.has(feature)) out.push({ feature, kind: 'add', evidence });
    } else if (ticked && status === 'absent') out.push({ feature, kind: 'remove', evidence });
    else if (!ticked && status === 'uncertain') out.push({ feature, kind: 'unsure', evidence });
  }
  return out;
};

// "No pigment network" can't be true alongside a pigment network of either kind.
export const NO_NETWORK = 'no_pigment_network';
export const NETWORK_FEATURES = ['typical_network', 'atypical_network'];
export const networkConflict = (present) => present.has(NO_NETWORK) && NETWORK_FEATURES.some((f) => present.has(f));

// Calls the merge leaves to you: you tend to read these differently from the model.
export const HOLD_FROM_MERGE = ['multiple_colors'];

/**
 * The model's notes to store on a record: `evidence` for present features the
 * model also called present (shown in the app), `lowConfidence` for every call
 * it was unsure about (kept as data, hidden for now).
 */
export const claudeFields = (present, suggestion) => {
  const evidence = {};
  const lowConfidence = {};
  for (const [f, { status, evidence: text }] of scopedCalls(suggestion)) {
    if (status === 'present' && present.has(f) && text) evidence[f] = text;
    if (status === 'uncertain') lowConfidence[f] = text;
  }
  return { evidence, lowConfidence };
};

/**
 * Notes to save after an edit made while looking at `suggestion` (any run):
 * a present feature keeps the note it already has; one without a note takes
 * this run's, if this run calls it present. Notes for unticked features are dropped.
 * Low-confidence notes already on the record are left as they are.
 */
export const notesForSave = (record, present, suggestion) => {
  const fresh = claudeFields(present, suggestion);
  const evidence = {};
  for (const f of present) {
    const text = record?.evidence?.[f] ?? fresh.evidence[f];
    if (text) evidence[f] = text;
  }
  return { evidence, lowConfidence: record?.lowConfidence ?? fresh.lowConfidence };
};

/**
 * Pre-ticks for an image no one has reviewed yet, from two identical runs: a
 * feature is ticked only if both runs call it present (the first run's note is
 * kept). Anything one run calls present or either run is unsure about becomes
 * low confidence and is hidden. Returns null unless both runs are available.
 * "Multiple colors" is left for you, as in the merge.
 */
export const twoRunPrefill = (first, second) => {
  if (!first || !second) return null;
  const present = [];
  const evidence = {};
  const lowConfidence = {};
  const hiddenSuggestions = [];
  for (const [f, a] of scopedCalls(first)) {
    const b = second.features[f];
    if (!b || HOLD_FROM_MERGE.includes(f)) continue;
    const presentCount = (a.status === 'present') + (b.status === 'present');
    if (presentCount === 2) {
      present.push(f);
      if (a.evidence) evidence[f] = a.evidence;
    } else if (presentCount === 1 || a.status === 'uncertain' || b.status === 'uncertain') {
      const pick = a.status !== 'absent' ? a : b;
      lowConfidence[f] = pick.evidence;
      if (presentCount === 1) hiddenSuggestions.push(f);
    }
  }
  // Two runs agreeing on a contradiction is still a contradiction: leave it to you.
  if (networkConflict(new Set(present))) {
    for (const f of [NO_NETWORK, ...NETWORK_FEATURES]) {
      if (present.includes(f)) {
        present.splice(present.indexOf(f), 1);
        lowConfidence[f] = evidence[f];
        delete evidence[f];
        hiddenSuggestions.push(f);
      }
    }
  }
  return {
    present: present.sort(),
    evidence,
    lowConfidence,
    hiddenSuggestions: hiddenSuggestions.sort(),
    prefilled: { model: first.served_by ?? first.model, rule: 'both of two runs' },
  };
};

/**
 * Apply the model's confident calls to a record: present → tick, and (only with
 * applyRemovals) absent → untick. Removals are off by default because the model
 * misses small structures it can't resolve (white circles, cobblestone...), so
 * its "absent" often means "couldn't see". Left alone either way: features you've
 * reviewed, HOLD_FROM_MERGE, unticking anything you highlighted, and any change
 * that would leave "no pigment network" alongside a network. Whatever isn't
 * applied stays open on the review page.
 */
export const mergeClaude = (record, suggestion, { applyRemovals = false } = {}) => {
  const present = new Set(record.present);
  const skip = new Set([...(record.reviewedSuggestions ?? []), ...HOLD_FROM_MERGE]);
  const highlighted = new Set(record.highlights.map((h) => h.feature));
  const added = [];
  const removed = [];
  const keptHighlighted = [];

  for (const [f, { status }] of scopedCalls(suggestion)) {
    if (skip.has(f)) continue;
    if (status === 'present' && !present.has(f)) {
      present.add(f);
      added.push(f);
    } else if (applyRemovals && status === 'absent' && present.has(f)) {
      if (highlighted.has(f)) keptHighlighted.push(f);
      else {
        present.delete(f);
        removed.push(f);
      }
    }
  }

  // Undo any network change that leaves a contradiction (the model's or yours).
  let conflict = false;
  if (networkConflict(present)) {
    conflict = true;
    for (const f of [NO_NETWORK, ...NETWORK_FEATURES]) {
      if (added.includes(f)) {
        present.delete(f);
        added.splice(added.indexOf(f), 1);
      }
      if (removed.includes(f)) {
        present.add(f);
        removed.splice(removed.indexOf(f), 1);
      }
    }
  }

  return {
    record: {
      ...record,
      present: [...present].sort(),
      atlas: record.atlas.filter((f) => present.has(f)),
      ...claudeFields(present, suggestion),
      merged: { model: suggestion.served_by ?? suggestion.model, added: added.sort(), removed: removed.sort() },
    },
    added,
    removed,
    keptHighlighted,
    conflict,
  };
};

const openFor = (suggestion, record) =>
  openSuggestions(
    suggestion,
    new Set(record.present),
    new Set(record.reviewedSuggestions ?? []),
    new Set(record.hiddenSuggestions ?? [])
  );

/** Open disagreements for a saved record, hints included. */
export const recordSuggestions = (suggestion, record) => (record ? openFor(suggestion, record) : []);

/** Disagreements still needing a decision for a saved record (hints excluded). */
export const toReviewCount = (suggestion, record) =>
  recordSuggestions(suggestion, record).filter((s) => s.kind !== 'unsure').length;
