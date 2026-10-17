import React, { useEffect, useState } from 'react';
import { features } from '../data/features.js';
import { revealLabel } from '../data/taxonomy.js';
import { AnnotationShapes } from '../components/AnnotationShapes.jsx';
import { featureColor } from '../utils/featureColors.js';
import { dxById, dxOfCode } from './queue.js';
import { inScope, networkConflict, notesForSave, recordSuggestions } from './suggestions.js';
import styles from './Annotate.module.css';

const ORDER = Object.keys(dxById);
const STATUS_LABEL = { present: 'present', absent: 'absent', uncertain: 'low confidence' };
const RUNS = { web: '600-px run', hires: 'Full-resolution run' };

// Side-by-side review of your tags and the model's for one image at a time.
// runs: { web, hires } — the model's calls on the 600-px images and on the
// full-resolution originals. Changes save immediately through onRecordChange.
export function ReviewView({ data, annotations, runs, currentId, setCurrentId, onRecordChange, onOpen }) {
  const [run, setRun] = useState('web');
  const [showOriginal, setShowOriginal] = useState(null); // null: follow the run
  const suggestions = runs[run];
  const otherRun = run === 'web' ? 'hires' : 'web';
  const [dxFilter, setDxFilter] = useState('all');
  const [openOnly, setOpenOnly] = useState(true);
  const [size, setSize] = useState(null);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showLowConfidence, setShowLowConfidence] = useState(false);

  const openFor = (id) => {
    const rec = annotations[id];
    return recordSuggestions(suggestions[id], rec);
  };
  const needsReview = (id) => openFor(id).some((o) => o.kind !== 'unsure');

  // The current image stays in the list even once resolved, so it doesn't vanish mid-review.
  const ids = Object.keys(annotations)
    .filter((id) => annotations[id].status === 'accepted' && suggestions[id])
    .filter((id) => dxFilter === 'all' || dxOfCode[annotations[id].code] === dxFilter)
    .filter((id) => !openOnly || needsReview(id) || id === currentId)
    .sort((a, b) =>
      ORDER.indexOf(dxOfCode[annotations[a].code]) - ORDER.indexOf(dxOfCode[annotations[b].code]) || a.localeCompare(b)
    );
  const pos = Math.max(0, ids.indexOf(currentId));
  const id = ids[pos];

  const go = (delta) => {
    const next = ids[Math.min(ids.length - 1, Math.max(0, pos + delta))];
    if (next && next !== id) setCurrentId(next);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input[type="text"], input[type="search"], select, textarea')) return;
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const filters = (
    <div className={styles.toolRow}>
      {Object.entries(RUNS).map(([key, label]) => (
        <button key={key} type="button" className={`${styles.btn} ${run === key ? styles.btnOn : ''}`}
          disabled={!Object.keys(runs[key]).length} onClick={() => { setRun(key); setShowOriginal(null); }}>
          {label}
        </button>
      ))}
      {/* blur after choosing, so ← → go back to moving between images */}
      <select className={styles.select} value={dxFilter}
        onChange={(e) => { setDxFilter(e.target.value); setCurrentId(null); e.target.blur(); }}>
        <option value="all">All diagnoses</option>
        {ORDER.map((dx) => <option key={dx} value={dx}>{dxById[dx].name}</option>)}
      </select>
      <label className={styles.check}>
        <input type="checkbox" checked={openOnly} onChange={(e) => { setOpenOnly(e.target.checked); setCurrentId(null); }} />
        Only images with open disagreements
      </label>
    </div>
  );

  if (!id) {
    return (
      <div>
        <h2>Review vs Claude</h2>
        {filters}
        <p>Nothing to review with these filters.</p>
      </div>
    );
  }

  const rec = annotations[id];
  const image = data[id];
  const suggestion = suggestions[id];
  const other = runs[otherRun][id];
  const original = showOriginal ?? run === 'hires';
  const src = original ? `/__original/${id}` : `/${image.src}`;
  const dx = dxOfCode[rec.code];
  const present = new Set(rec.present);
  const open = Object.fromEntries(openFor(id).map((o) => [o.feature, o]));
  const reviewed = new Set(rec.reviewedSuggestions ?? []);

  // Every feature either side considered: disagreements first, then unsure, then agreements.
  const rank = (f) => (open[f] && open[f].kind !== 'unsure' ? 0 : open[f] ? 1 : 2);
  // Low-confidence calls you haven't ticked are hidden unless asked for.
  const scope = inScope(suggestion.dx);
  const rows = [...new Set([...Object.keys(suggestion.features).filter((f) => scope.has(f)), ...rec.present])]
    .filter((f) => showLowConfidence || present.has(f) || suggestion.features[f]?.status !== 'uncertain')
    .map((f, i) => ({ f, i }))
    .sort((a, b) => rank(a.f) - rank(b.f) || a.i - b.i)
    .map(({ f }) => f);
  const agreeCount = rows.filter((f) => {
    const s = suggestion.features[f]?.status;
    return s && s !== 'uncertain' && (s === 'present') === present.has(f);
  }).length;

  const save = (changes) => {
    setCurrentId(id); // pin it, so resolving its last disagreement doesn't skip ahead
    const next = { ...rec, ...changes };
    onRecordChange(id, { ...next, ...notesForSave(rec, new Set(next.present), suggestion), updated: new Date().toISOString() });
  };

  const toggleTag = (f) => {
    if (present.has(f)) {
      const n = rec.highlights.filter((h) => h.feature === f).length;
      if (n && !window.confirm(`Untick “${features[f].name}” and remove its highlight${n > 1 ? 's' : ''}?`)) return;
      save({
        present: rec.present.filter((p) => p !== f),
        highlights: rec.highlights.filter((h) => h.feature !== f),
        atlas: rec.atlas.filter((a) => a !== f),
      });
    } else {
      save({ present: [...rec.present, f].sort() });
    }
  };

  const markReviewed = (f) => save({ reviewedSuggestions: [...reviewed, f].sort() });

  return (
    <div>
      <div className={styles.reviewHeader}>
        <h2>Review vs Claude</h2>
        <span className={styles.meta}>{pos + 1} / {ids.length} · ← → to move</span>
        <button type="button" className={styles.btn} disabled={pos === 0} onClick={() => go(-1)}>← Prev</button>
        <button type="button" className={styles.btn} disabled={pos === ids.length - 1} onClick={() => go(1)}>Next →</button>
      </div>
      {filters}

      <div className={styles.reviewLayout}>
        <div>
          <div className={styles.canvas}>
            <img src={src} alt={id}
              onLoad={(e) => setSize({ src, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} />
            {size?.src === src && showHighlights && (
              <svg viewBox={`0 0 ${size.w} ${size.h}`} style={{ pointerEvents: 'none' }}>
                <AnnotationShapes highlights={rec.highlights} width={size.w} height={size.h} />
              </svg>
            )}
          </div>
          <div className={styles.toolRow}>
            <label className={styles.check}>
              <input type="checkbox" checked={original} onChange={(e) => setShowOriginal(e.target.checked)} />
              Original image{size?.src === src && original ? ` (${size.w}×${size.h})` : ''}
            </label>
            <a className={styles.meta} href={`/__original/${id}`} target="_blank" rel="noreferrer">open full size ↗</a>
            <label className={styles.check}>
              <input type="checkbox" checked={showHighlights} onChange={(e) => setShowHighlights(e.target.checked)} />
              My highlights ({rec.highlights.length})
            </label>
          </div>
          <p className={styles.subtype}>{dxById[dx].name}</p>
          {revealLabel(dx, rec.code) !== dxById[dx].name && <p className={styles.meta}>{revealLabel(dx, rec.code)}</p>}
          <p className={styles.meta}>{id} · {image.patient_id} · source label: {image.diagnosis}</p>
          {rec.note && <p className={styles.meta}>Your note: {rec.note}</p>}
          <button type="button" className={styles.btn} onClick={() => onOpen(id)}>Open in editor</button>
        </div>

        <div>
          {networkConflict(present) && (
            <p className={styles.warning}>“No pigment network” is ticked along with a pigment network; untick one.</p>
          )}
          <label className={styles.check}>
            <input type="checkbox" checked={showLowConfidence} onChange={(e) => setShowLowConfidence(e.target.checked)} />
            Show Claude's low-confidence calls
          </label>
          <p className={styles.meta}>
            Agree on {agreeCount} of {rows.length} · {Object.values(open).filter((o) => o.kind !== 'unsure').length} open
            · {RUNS[run]} ({suggestion.served_by ?? suggestion.model})
          </p>
          <table className={styles.reviewTable}>
            <thead>
              <tr><th>Feature</th><th>You</th><th>Claude</th><th>What Claude saw</th>
                <th title={`The same feature in the ${RUNS[otherRun].toLowerCase()}`}>Other run</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((f) => {
                const s = suggestion.features[f];
                const o = open[f];
                const rowClass = o && o.kind !== 'unsure' ? styles.rowOpen : o ? styles.rowUnsure : styles.rowAgree;
                return (
                  <tr key={f} className={rowClass}>
                    <td title={features[f].description}>
                      <span className={styles.swatch} style={{ background: featureColor(f) }} /> {features[f].name}
                    </td>
                    <td><input type="checkbox" checked={present.has(f)} onChange={() => toggleTag(f)} aria-label={`You: ${features[f].name}`} /></td>
                    <td>
                      {s ? <span className={`${styles.badge} ${styles[`badge_${s.status}`]}`}>{STATUS_LABEL[s.status]}</span>
                        : <span className={styles.meta}>not asked</span>}
                    </td>
                    <td className={styles.evidence}>{s?.evidence}</td>
                    <td title={other?.features[f]?.evidence || undefined}>
                      {other?.features[f] ? (
                        <span className={`${styles.badge} ${styles[`badge_${other.features[f].status}`]}`}>
                          {STATUS_LABEL[other.features[f].status]}
                        </span>
                      ) : <span className={styles.meta}>—</span>}
                    </td>
                    <td>
                      {o && o.kind !== 'unsure' && (
                        <button type="button" className={styles.iconBtn} onClick={() => markReviewed(f)}
                          title="Keep your tag as it is and stop flagging this">
                          {o.kind === 'add' ? 'dismiss' : 'keep mine'}
                        </button>
                      )}
                      {reviewed.has(f) && <span className={styles.meta}>reviewed</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
