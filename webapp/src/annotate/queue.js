// Picks which images to annotate: per-diagnosis quotas, one image per patient,
// in a stable pseudo-random order so the queue doesn't reshuffle on reload.
// Annotation is done at the advanced level; basic mode reuses the same images.

import { diagnosesForMode, codeToDx } from '../data/taxonomy.js';
import { diagnosisFeatures } from '../data/features.js';

export const MODE = 'advanced';
export const dxById = diagnosesForMode(MODE);
export const dxOfCode = codeToDx(MODE);

const SUBTYPE_MIN = 3;

// FNV-1a: a cheap, stable string hash used only for ordering.
const hash = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

/** dx → code → [{ patient, ids }], patients and their images in stable order. */
export const buildIndex = (data) => {
  const byPatient = {};
  for (const rec of Object.values(data)) {
    const dx = dxOfCode[rec.code];
    if (!dx) continue;
    const codes = (byPatient[dx] ??= {});
    const patients = (codes[rec.code] ??= {});
    (patients[rec.patient_id] ??= []).push(rec.id);
  }

  const index = {};
  for (const [dx, codes] of Object.entries(byPatient)) {
    index[dx] = {};
    for (const [code, patients] of Object.entries(codes)) {
      index[dx][code] = Object.entries(patients)
        .map(([patient, ids]) => ({ patient, ids: ids.sort((a, b) => hash(a) - hash(b)) }))
        .sort((a, b) => hash(a.patient) - hash(b.patient));
    }
  }
  return index;
};

/**
 * Images wanted per source code for a diagnosis: each subtype gets at least
 * SUBTYPE_MIN (scaled down for small targets), the rest goes to the subtypes
 * with the most patients. Never more than the patients available.
 */
export const quotas = (dxId, index, target) => {
  const { codes } = dxById[dxId];
  const avail = Object.fromEntries(codes.map((c) => [c, index[dxId]?.[c]?.length ?? 0]));
  const subMin = Math.min(SUBTYPE_MIN, Math.floor(target / codes.length));
  const q = Object.fromEntries(codes.map((c) => [c, Math.min(subMin, avail[c])]));

  let left = Math.min(target, sum(avail)) - sum(q);
  while (left > 0) {
    const next = codes
      .filter((c) => q[c] < avail[c])
      .sort((a, b) => avail[b] / (q[b] + 1) - avail[a] / (q[a] + 1))[0];
    q[next]++;
    left--;
  }
  return q;
};

/** Annotation records whose image belongs to this diagnosis, by status. */
export const recordsFor = (dxId, annotations) => {
  const out = { accepted: [], flagged: [], skipped: [] };
  for (const [id, a] of Object.entries(annotations)) {
    if (dxOfCode[a.code] === dxId) out[a.status]?.push(id);
  }
  return out;
};

export const acceptedByCode = (dxId, annotations) => {
  const counts = Object.fromEntries(dxById[dxId].codes.map((c) => [c, 0]));
  for (const id of recordsFor(dxId, annotations).accepted) counts[annotations[id].code]++;
  return counts;
};

/**
 * Next images to look at: one per unused patient, from under-quota subtypes
 * first (interleaved), then the rest. Reviewed images are never offered again;
 * a patient is used up once one of their images is accepted.
 */
export const candidates = (dxId, index, annotations, target, limit) => {
  const q = quotas(dxId, index, target);
  const done = acceptedByCode(dxId, annotations);
  const usedPatients = new Set(recordsFor(dxId, annotations).accepted.map((id) => annotations[id].patient_id));

  const perCode = {};
  for (const code of dxById[dxId].codes) {
    perCode[code] = (index[dxId]?.[code] ?? [])
      .filter(({ patient }) => !usedPatients.has(patient))
      .map(({ ids }) => ids.find((id) => !annotations[id]))
      .filter(Boolean)
      .map((id) => ({ id, code }));
  }

  const interleave = (codes) => {
    const lists = codes.map((c) => perCode[c]);
    const out = [];
    for (let i = 0; out.length < limit && lists.some((l) => i < l.length); i++) {
      for (const l of lists) if (i < l.length) out.push(l[i]);
    }
    return out;
  };

  const codes = dxById[dxId].codes;
  const under = codes.filter((c) => done[c] < q[c]);
  const rest = codes.filter((c) => done[c] >= q[c]);
  return [...interleave(under), ...interleave(rest)].slice(0, limit);
};

/** For each key feature: how many accepted images of this diagnosis show it. */
export const keyFeatureCoverage = (dxId, annotations) => {
  const accepted = recordsFor(dxId, annotations).accepted.map((id) => annotations[id]);
  return diagnosisFeatures[dxId].key.map((feature) => ({
    feature,
    count: accepted.filter((a) => a.present.includes(feature)).length,
  }));
};
