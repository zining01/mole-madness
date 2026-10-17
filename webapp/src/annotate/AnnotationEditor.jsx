import React, { useEffect, useRef, useState } from 'react';
import { features, diagnosisFeatures } from '../data/features.js';
import { revealLabel } from '../data/taxonomy.js';
import { AnnotationShapes } from '../components/AnnotationShapes.jsx';
import { featureColor } from '../utils/featureColors.js';
import { dxById } from './queue.js';
import { networkConflict, notesForSave, openSuggestions, twoRunPrefill } from './suggestions.js';
import styles from './Annotate.module.css';

// Record shape saved per image:
//   present    — every feature seen in the image (the main annotation)
//   highlights — optional shapes pointing at one clear example of a present feature
//   atlas      — present features this image is a reference example for
//   reviewedSuggestions — model disagreements you've looked at and set aside
//   evidence / lowConfidence — the model's notes (see notesForSave), kept in step on save
//   hiddenSuggestions — low-confidence model calls kept out of the "add" suggestions
//   prefilled — set when the image started from the model's two-run pre-ticks
const isRegion = (f) => features[f].annotate === 'region';
const ALL_FEATURES = Object.keys(features);
const MIN_RADIUS = 0.01; // drags smaller than this are treated as accidental clicks

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const round4 = (v) => Math.round(v * 1e4) / 1e4;
const roundShape = (r) =>
  Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'number' ? round4(v) : v]));

// suggestion / second: the model's first and repeat run for this image. An image
// with no record yet starts from the features both runs called present.
export function AnnotationEditor({ image, dxId, existing, suggestion, second, onSave, onReturnToQueue, onClose }) {
  const { key, supportive } = diagnosisFeatures[dxId];
  const prefill = existing ? null : twoRunPrefill(suggestion, second);
  const base = existing ?? prefill;
  const [present, setPresent] = useState(() => new Set(base?.present ?? []));
  const [atlas, setAtlas] = useState(() => new Set(existing?.atlas ?? []));
  const [highlights, setHighlights] = useState(existing?.highlights ?? []);
  const [reviewed, setReviewed] = useState(() => new Set(existing?.reviewedSuggestions ?? []));
  const hidden = new Set(base?.hiddenSuggestions ?? []);
  const [polarized, setPolarized] = useState(existing?.polarized ?? null);
  const [note, setNote] = useState(existing?.note ?? '');
  const [tool, setTool] = useState('ellipse');
  const [activeFeature, setActiveFeature] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [draft, setDraft] = useState(null);
  const [size, setSize] = useState(null);
  const [src, setSrc] = useState(`/${image.src}`);
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const svgRef = useRef(null);

  const highlightCounts = {};
  for (const h of highlights) highlightCounts[h.feature] = (highlightCounts[h.feature] ?? 0) + 1;

  // --- Tagging ---
  const togglePresent = (f) => {
    const next = new Set(present);
    if (next.has(f)) {
      if (highlightCounts[f] && !window.confirm(`Untick “${features[f].name}” and remove its highlights?`)) return;
      next.delete(f);
      setHighlights(highlights.filter((h) => h.feature !== f));
      setSelected(null);
      if (atlas.has(f)) setAtlas(new Set([...atlas].filter((a) => a !== f)));
      if (activeFeature === f) setActiveFeature(null);
    } else {
      next.add(f);
    }
    setPresent(next);
    setDirty(true);
  };

  const toggleAtlas = (f) => {
    const next = new Set(atlas);
    if (next.has(f)) next.delete(f);
    else next.add(f);
    setAtlas(next);
    setDirty(true);
  };

  const markReviewed = (f) => {
    setReviewed(new Set([...reviewed, f]));
    setDirty(true);
  };

  // --- Highlights ---
  const addHighlight = (shape) => {
    setSelected(highlights.length);
    setHighlights([...highlights, roundShape(shape)]);
    if (!present.has(shape.feature)) setPresent(new Set([...present, shape.feature]));
    setDirty(true);
  };

  const removeHighlight = (i) => {
    setHighlights(highlights.filter((_, j) => j !== i));
    setSelected(null);
    setHovered(null);
    setDirty(true);
  };

  const toPoint = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) };
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    setSelected(null);
    if (!activeFeature) return;
    const p = toPoint(e);
    if (tool === 'point') {
      addHighlight({ feature: activeFeature, shape: 'point', x: p.x, y: p.y });
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraft({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
  };

  const onPointerMove = (e) => {
    if (!draft) return;
    const p = toPoint(e);
    setDraft({ ...draft, x1: p.x, y1: p.y });
  };

  const onPointerUp = () => {
    if (!draft) return;
    const rx = Math.abs(draft.x1 - draft.x0) / 2;
    const ry = Math.abs(draft.y1 - draft.y0) / 2;
    if (rx > MIN_RADIUS && ry > MIN_RADIUS) {
      addHighlight({
        feature: activeFeature,
        shape: 'ellipse',
        cx: (draft.x0 + draft.x1) / 2,
        cy: (draft.y0 + draft.y1) / 2,
        rx,
        ry,
      });
    }
    setDraft(null);
  };

  const onShapePointerDown = (e, i) => {
    e.stopPropagation();
    setSelected(i);
  };

  // E / P switch tools, Delete removes the selected highlight, Escape stops drawing.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'e') setTool('ellipse');
      else if (e.key === 'p') setTool('point');
      else if (e.key === 'Escape') {
        setSelected(null);
        setActiveFeature(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selected !== null) {
        e.preventDefault();
        removeHighlight(selected);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // --- Saving ---
  const save = async (status) => {
    if (status === 'accepted' && present.size === 0 && !window.confirm('Accept with no features ticked?')) return;
    if (status === 'flagged' && !note.trim() && !window.confirm('Flag without a note about what looks wrong?')) return;
    setSaving(true);
    const notes = notesForSave(base, present, suggestion);
    try {
      await onSave({
        ...(existing?.merged && { merged: existing.merged }),
        ...(base?.prefilled && { prefilled: base.prefilled }),
        hiddenSuggestions: [...hidden].sort(),
        ...notes,
        code: image.code,
        patient_id: image.patient_id,
        status,
        polarized,
        present: [...present].sort(),
        highlights,
        atlas: [...atlas].sort(),
        reviewedSuggestions: [...reviewed].sort(),
        note: note.trim(),
        updated: new Date().toISOString(),
      });
    } catch (err) {
      window.alert(`Save failed: ${err.message}`);
      setSaving(false);
    }
  };

  const close = () => {
    if (!dirty || window.confirm('Discard unsaved changes?')) onClose();
  };

  const returnToQueue = async () => {
    if (!window.confirm('Remove this image\'s record and put it back in the queue?')) return;
    try {
      await onReturnToQueue();
    } catch (err) {
      window.alert(`Failed: ${err.message}`);
    }
  };

  // --- Feature lists ---
  const open = openSuggestions(suggestion, present, reviewed, hidden);
  const openByFeature = Object.fromEntries(open.map((o) => [o.feature, o]));
  const toReview = open.filter((o) => o.kind !== 'unsure').length;
  const listed = new Set([...key, ...supportive]);
  // Ticked features outside the diagnosis' lists, plus ones the model suggests.
  const otherShown = [...new Set([...present, ...open.map((o) => o.feature)])].filter((f) => !listed.has(f));
  const q = query.trim().toLowerCase();
  const searchResults = q
    ? ALL_FEATURES.filter(
        (f) => !listed.has(f) && !otherShown.includes(f) &&
          `${features[f].name} ${features[f].category}`.toLowerCase().includes(q)
      )
    : [];

  const suggestionLine = (f) => {
    const o = openByFeature[f];
    if (!o || o.kind === 'unsure') return null; // low-confidence calls stay hidden for now
    const label = { add: 'Model sees this', remove: "Model didn't see this", unsure: 'Model unsure' }[o.kind];
    const kindClass = { add: '', remove: styles.suggestionRemove, unsure: styles.suggestionUnsure }[o.kind];
    return (
      <div className={`${styles.suggestion} ${kindClass}`}>
        <span><strong>{label}</strong>{o.evidence && `: ${o.evidence}`}</span>
        <span className={styles.suggestionActions}>
          {o.kind === 'remove' ? (
            <>
              <button type="button" onClick={() => markReviewed(f)}>Keep</button>
              <button type="button" onClick={() => togglePresent(f)}>Untick</button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => togglePresent(f)}>Tick</button>
              <button type="button" onClick={() => markReviewed(f)}>Dismiss</button>
            </>
          )}
        </span>
      </div>
    );
  };

  const featureRow = (f) => {
    const on = present.has(f);
    const drawing = activeFeature === f;
    return (
      <React.Fragment key={f}>
      <div className={`${styles.featureRow} ${drawing ? styles.featureActive : ''}`} title={features[f].description}>
        <label className={styles.check}>
          <input type="checkbox" checked={on} onChange={() => togglePresent(f)} />
          <span className={on ? styles.featureOn : ''}>{features[f].name}</span>
          {features[f].polarizedOnly && <span className={styles.tag}>polarized</span>}
        </label>
        {on && (
          <button type="button" className={`${styles.iconBtn} ${atlas.has(f) ? styles.atlasOn : ''}`}
            onClick={() => toggleAtlas(f)} title="Use this image as a reference example in the feature atlas">
            {atlas.has(f) ? '★' : '☆'}
          </button>
        )}
        {isRegion(f) && (
          <button type="button" className={`${styles.iconBtn} ${drawing ? styles.drawingOn : ''}`}
            onClick={() => setActiveFeature(drawing ? null : f)} title="Highlight an example on the image">
            <span className={styles.swatch} style={{ background: featureColor(f) }} />
            {drawing ? 'drawing' : 'highlight'}
            {highlightCounts[f] > 0 && ` (${highlightCounts[f]})`}
          </button>
        )}
      </div>
      {suggestionLine(f)}
      {on && !openByFeature[f] && suggestion?.features[f]?.status === 'present' && suggestion.features[f].evidence && (
        <div className={styles.evidenceLine}>Claude: {suggestion.features[f].evidence}</div>
      )}
      </React.Fragment>
    );
  };

  const subtype = revealLabel(dxId, image.code);
  const dxName = dxById[dxId].name;

  return (
    <div className={styles.editor}>
      <div>
        <div className={styles.canvas}>
          <img src={src} alt={image.id} draggable={false}
            onLoad={(e) => setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            onError={() => image.image_url && src !== image.image_url && setSrc(image.image_url)} />
          {size && (
            <svg ref={svgRef} viewBox={`0 0 ${size.w} ${size.h}`}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
              style={{ cursor: activeFeature ? 'crosshair' : 'default' }}>
              <AnnotationShapes highlights={highlights} width={size.w} height={size.h}
                emphasis={hovered ?? selected} onShapePointerDown={onShapePointerDown} />
              {draft && (
                <ellipse cx={((draft.x0 + draft.x1) / 2) * size.w} cy={((draft.y0 + draft.y1) / 2) * size.h}
                  rx={(Math.abs(draft.x1 - draft.x0) / 2) * size.w} ry={(Math.abs(draft.y1 - draft.y0) / 2) * size.h}
                  fill="none" stroke={featureColor(activeFeature)} strokeWidth={2} strokeDasharray="6 4"
                  vectorEffect="non-scaling-stroke" pointerEvents="none" />
              )}
            </svg>
          )}
        </div>
        <div className={styles.toolRow}>
          <button type="button" className={`${styles.btn} ${tool === 'ellipse' ? styles.btnOn : ''}`} onClick={() => setTool('ellipse')}>
            Ellipse (E)
          </button>
          <button type="button" className={`${styles.btn} ${tool === 'point' ? styles.btnOn : ''}`} onClick={() => setTool('point')}>
            Point (P)
          </button>
        </div>
        <p className={styles.hint}>
          {activeFeature
            ? `${tool === 'ellipse' ? 'Drag to draw an ellipse' : 'Click to place a point'} on a clear example of “${features[activeFeature].name}”. Esc to stop.`
            : 'Tick every feature you see. Highlights are optional: press “highlight” next to a feature to point at one clear example — no need to mark every occurrence.'}
        </p>
        {highlights.length > 0 && (
          <>
            <h3>Highlights ({highlights.length})</h3>
            <ol className={styles.shapeList}>
              {highlights.map((h, i) => (
                <li key={i} className={selected === i ? styles.shapeSelected : ''}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(i)}>
                  <span className={styles.swatch} style={{ background: featureColor(h.feature) }} />
                  {features[h.feature]?.name ?? h.feature}
                  <span className={styles.meta}>{h.shape}</span>
                  <button type="button" className={styles.remove} aria-label="Remove highlight"
                    onClick={(e) => { e.stopPropagation(); removeHighlight(i); }}>×</button>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>

      <aside className={styles.panel}>
        <header className={styles.panelHeader}>
          <h2>{dxName}</h2>
          {subtype !== dxName && <p className={styles.subtype}>{subtype}</p>}
          <p className={styles.meta}>
            {image.id} · {image.patient_id} · source label: {image.diagnosis} ({image.code})
          </p>
          {prefill && (
            <p className={styles.prefill}>
              Pre-ticked by Claude: the {prefill.present.length} features both of its runs saw. Check the image
              quality, adjust the ticks, then accept.
            </p>
          )}
          {existing && (
            <p className={styles.meta}>
              Saved as <strong>{existing.status}</strong> on {new Date(existing.updated).toLocaleString()}
            </p>
          )}
          {suggestion && (
            <p className={styles.meta}>
              Second opinion from {suggestion.served_by ?? suggestion.model}:{' '}
              {toReview ? <strong>{toReview} to review</strong> : 'nothing left to review'}
            </p>
          )}
          {networkConflict(present) && (
            <p className={styles.warning}>“No pigment network” is ticked along with a pigment network; untick one.</p>
          )}
        </header>

        <section>
          <h3>Key features</h3>
          {key.map(featureRow)}
          <h3>Supportive</h3>
          {supportive.map(featureRow)}
          <h3>Other features</h3>
          {otherShown.map(featureRow)}
          <input className={styles.search} type="search" placeholder="Search all features…"
            value={query} onChange={(e) => setQuery(e.target.value)} />
          {searchResults.map(featureRow)}
        </section>

        <section>
          <h3>Dermoscopy mode</h3>
          <div className={styles.toolRow}>
            {[[null, 'Unknown'], [true, 'Polarized'], [false, 'Non-polarized']].map(([value, label]) => (
              <label key={label} className={styles.check}>
                <input type="radio" name="polarized" checked={polarized === value}
                  onChange={() => { setPolarized(value); setDirty(true); }} />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3>Teaching note</h3>
          <textarea className={styles.note} rows={3} value={note}
            placeholder="Shown in the answer reveal — or why you're skipping / flagging"
            onChange={(e) => { setNote(e.target.value); setDirty(true); }} />
        </section>

        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.primary}`} disabled={saving} onClick={() => save('accepted')}>
            Accept &amp; save
          </button>
          <button type="button" className={styles.btn} disabled={saving} onClick={() => save('skipped')}>
            Skip (not usable)
          </button>
          <button type="button" className={`${styles.btn} ${styles.warn}`} disabled={saving} onClick={() => save('flagged')}>
            Flag label
          </button>
          <button type="button" className={styles.btn} disabled={saving} onClick={close}>Back</button>
          {existing && (
            <button type="button" className={`${styles.btn} ${styles.linkBtn}`} disabled={saving} onClick={returnToQueue}>
              Return to queue
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
