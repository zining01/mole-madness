// Feature hunt: finding examples of features that have too few accepted images.
// Instead of sampling every diagnosis evenly, it looks only at images whose
// diagnosis lists a thin feature, asks a model one narrow question per image
// (data_pipeline/screen_features.py) and offers you the hits to confirm.
// Shared by scripts/export_hunt.mjs and the Feature hunt page in /annotate.
import { diagnosisFeatures, features } from '../data/features.js';
import { dxOfCode } from './queue.js';

export const HUNT_GOAL = 5; // accepted examples wanted per feature

/** feature → number of accepted images showing it. */
export const acceptedCounts = (annotations) => {
  const counts = Object.fromEntries(Object.keys(features).map((f) => [f, 0]));
  for (const a of Object.values(annotations)) {
    if (a.status !== 'accepted') continue;
    for (const f of a.present) if (f in counts) counts[f]++;
  }
  return counts;
};

/** Features still short of the goal, in vocabulary order. */
export const thinFeatures = (annotations, goal = HUNT_GOAL) => {
  const counts = acceptedCounts(annotations);
  return Object.keys(features).filter((f) => counts[f] < goal);
};

/** Diagnoses that list a feature: those where it is a key clue, then supportive. */
export const diagnosesListing = (feature) => {
  const key = [];
  const supportive = [];
  for (const [dx, lists] of Object.entries(diagnosisFeatures)) {
    if (lists.key.includes(feature)) key.push(dx);
    else if (lists.supportive.includes(feature)) supportive.push(dx);
  }
  return { key, supportive };
};

const inList = (dx, feature) =>
  Boolean(diagnosisFeatures[dx]) && (diagnosisFeatures[dx].key.includes(feature) || diagnosisFeatures[dx].supportive.includes(feature));

const RANK = { present: 0, uncertain: 1 };

/**
 * The record for accepting one feature of an image straight from the hunt,
 * without going through the whole checklist. It is marked `partial`: only the
 * ticked features were looked at, so the app never treats the image as lacking
 * anything. Saving the image in the editor replaces it with a full record.
 *   existing — the image's partial record, if another feature was accepted earlier
 *   lead     — the model's call: its note is kept as evidence if it was confident,
 *              and set aside as low confidence (not shown to learners) if it was unsure
 */
export const quickAccept = (image, feature, lead, existing = null) => {
  const base = existing?.partial
    ? existing
    : { code: image.code, patient_id: image.patient_id, status: 'accepted', polarized: null, present: [], highlights: [], atlas: [], note: '', evidence: {}, lowConfidence: {}, partial: true };
  const evidence = { ...base.evidence };
  const lowConfidence = { ...base.lowConfidence };
  if (lead?.evidence) (lead.status === 'present' ? evidence : lowConfidence)[feature] = lead.evidence;
  return {
    ...base,
    present: [...new Set([...base.present, feature])].sort(),
    evidence,
    lowConfidence,
    updated: new Date().toISOString(),
  };
};

/**
 * Images a model thinks show a thin feature and that nobody has reviewed yet
 * (or only in part: a quick-accepted image still offers its other leads).
 *   screen      — results of screen_features.py: { id: { features: { f: { status, evidence, model } } } }
 *   suggestions — the full pre-tagging run, whose calls count as hits too
 *   exclude     — image ids never to offer (the reviewer study's fixed set)
 * Returns { feature: [{ id, status, evidence, source }] }, confident calls first.
 */
export const huntHits = ({ data, annotations, screen = {}, suggestions = {}, exclude = new Set(), goal = HUNT_GOAL }) => {
  const thin = new Set(thinFeatures(annotations, goal));
  const usedPatients = new Set(Object.values(annotations).filter((a) => a.status === 'accepted' && !a.partial).map((a) => a.patient_id));
  const partialPatient = new Map(Object.entries(annotations).filter(([, a]) => a.partial).map(([id, a]) => [a.patient_id, id]));
  const hits = Object.fromEntries([...thin].map((f) => [f, new Map()]));

  const add = (run, source) => {
    for (const [id, rec] of Object.entries(run)) {
      const image = data[id];
      const own = annotations[id];
      if (!image || (own && !own.partial) || exclude.has(id) || usedPatients.has(image.patient_id)) continue;
      // One image per patient: once one is quick-accepted, only that image stays on offer.
      if (!own && partialPatient.has(image.patient_id)) continue;
      const dx = dxOfCode[image.code];
      for (const [f, call] of Object.entries(rec.features ?? {})) {
        if (!thin.has(f) || !(call.status in RANK) || !inList(dx, f) || own?.present.includes(f)) continue;
        const known = hits[f].get(id);
        if (!known || RANK[call.status] < RANK[known.status]) hits[f].set(id, { id, status: call.status, evidence: call.evidence, source });
      }
    }
  };
  add(screen, 'screen');
  add(suggestions, 'pretag');

  return Object.fromEntries(
    Object.entries(hits).map(([f, byId]) => [f, [...byId.values()].sort((a, b) => RANK[a.status] - RANK[b.status] || a.id.localeCompare(b.id))])
  );
};
