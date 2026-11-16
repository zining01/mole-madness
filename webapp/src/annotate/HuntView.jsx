import React, { useEffect, useState } from 'react';
import { features } from '../data/features.js';
import reviewSet from '../data/reviewSet.json';
import { dxById, dxOfCode, plural } from './queue.js';
import { HUNT_GOAL, acceptedCounts, huntHits, thinFeatures } from './hunt.js';
import styles from './Annotate.module.css';

// Never offer the reviewer study's fixed set for learner content.
const exclude = new Set(reviewSet.cases.map((c) => c.id));
const PAGE = 8;

// Leads you've looked at and ruled out ("feature:imageId"). Remembered per
// browser for convenience only; the image itself stays available.
const DISMISSED_KEY = 'annotate.hunt.dismissed';
const readDismissed = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY)) ?? []);
  } catch {
    return new Set();
  }
};
const writeDismissed = (set) => {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
  } catch {
    // private mode / blocked storage — lasts until the page reloads
  }
};

/**
 * Features short of examples, each with the unreviewed images a model thinks
 * show it. The overview lists them; clicking a lead opens the viewer, which
 * steps through leads one at a time with the keyboard.
 *   at / setAt — { feature, index } of the lead being viewed, or null. Kept by
 *                the parent so the place survives a trip to the editor.
 */
export function HuntView({ data, annotations, screen, suggestions, second, at, setAt, onOpen, onQuickAccept }) {
  const [expanded, setExpanded] = useState({});
  const [last, setLast] = useState(null); // the latest quick accept: { id, feature, undo }
  const [dismissed, setDismissed] = useState(readDismissed);
  const counts = acceptedCounts(annotations);
  const thin = thinFeatures(annotations);
  const all = huntHits({ data, annotations, screen, suggestions, exclude });
  const hits = Object.fromEntries(thin.map((f) => [f, all[f].filter((h) => !dismissed.has(`${f}:${h.id}`))]));
  const withHits = thin.filter((f) => hits[f].length > 0);
  const without = thin.filter((f) => hits[f].length === 0);

  const updateDismissed = (next) => {
    setDismissed(next);
    writeDismissed(next);
  };

  const accept = async (lead) => {
    const feature = at.feature;
    const undo = await onQuickAccept(lead.id, feature, lead);
    if (undo) setLast({ id: lead.id, feature, undo });
  };
  const undoLast = async () => {
    await last.undo();
    setLast(null);
  };
  const lastNote = last && (
    <p className={styles.meta}>
      Accepted {last.id} as {features[last.feature].name.toLowerCase()}.{' '}
      <button type="button" className={styles.btn} onClick={undoLast}>Undo (Z)</button>
    </p>
  );

  if (at && hits[at.feature]?.length) {
    return (
      <LeadViewer data={data} feature={at.feature} index={Math.min(at.index, hits[at.feature].length - 1)}
        list={hits[at.feature]} order={withHits} hits={hits} accepted={counts[at.feature]}
        pretagged={(id) => Boolean(suggestions[id] && second[id])} setAt={setAt} onOpen={onOpen}
        onAccept={accept} onUndo={last ? undoLast : null} lastNote={lastNote}
        onDismiss={(id) => updateDismissed(new Set([...dismissed, `${at.feature}:${id}`]))} />
    );
  }

  return (
    <div>
      <h2>Feature hunt</h2>
      <p className={styles.meta}>
        Features with fewer than {HUNT_GOAL} accepted examples, and unreviewed images a model thinks show them. Click a
        lead to step through them one at a time.
        {Object.keys(screen).length === 0 && ' No screening results yet: these leads come from the pre-tagging run only. See the README for how to screen more images.'}
      </p>
      {lastNote}
      {dismissed.size > 0 && (
        <p className={styles.meta}>
          {plural(dismissed.size, 'lead')} ruled out.{' '}
          <button type="button" className={styles.btn} onClick={() => updateDismissed(new Set())}>Bring them back</button>
        </p>
      )}

      {withHits.map((f) => {
        const list = expanded[f] ? hits[f] : hits[f].slice(0, PAGE);
        return (
          <section key={f}>
            <h3>
              {features[f].name}{' '}
              <span className={`${styles.chip} ${counts[f] === 0 ? styles.chipMissing : ''}`}>
                {counts[f]} / {HUNT_GOAL} accepted
              </span>
            </h3>
            <p className={styles.meta}>{features[f].description}</p>
            <div className={styles.grid}>
              {list.map(({ id, status, evidence }, index) => (
                <button key={id} type="button" className={styles.thumb} onClick={() => setAt({ feature: f, index })} title={evidence}>
                  <img src={`/images/${id}.webp`} alt={id} loading="lazy" />
                  <span>{dxById[dxOfCode[data[id].code]].name}</span>
                  <span className={styles.meta}>
                    {status === 'present' ? 'clear' : 'possible'}
                    {suggestions[id] && second[id] ? ' · pre-tagged' : ''}
                  </span>
                </button>
              ))}
            </div>
            {hits[f].length > PAGE && !expanded[f] && (
              <button type="button" className={styles.btn} onClick={() => setExpanded({ ...expanded, [f]: true })}>
                Show all {hits[f].length}
              </button>
            )}
          </section>
        );
      })}

      {without.length > 0 && (
        <>
          <h3>No leads</h3>
          <div className={styles.chips}>
            {without.map((f) => (
              <span key={f} className={`${styles.chip} ${counts[f] === 0 ? styles.chipMissing : ''}`} title={features[f].description}>
                {features[f].name}: {counts[f]}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// One lead at a time. → / ← step (running on into the next feature), A accepts
// the feature without opening the editor (Z undoes the last one), Enter opens
// the editor, X rules the lead out, Esc goes back to the overview.
function LeadViewer({ data, feature, index, list, order, hits, accepted, pretagged, setAt, onOpen, onDismiss, onAccept, onUndo, lastNote }) {
  const lead = list[index];
  const f = order.indexOf(feature);

  const step = (by) => {
    const next = index + by;
    if (next >= 0 && next < list.length) setAt({ feature, index: next });
    else if (by > 0 && order[f + 1]) setAt({ feature: order[f + 1], index: 0 });
    else if (by < 0 && order[f - 1]) setAt({ feature: order[f - 1], index: hits[order[f - 1]].length - 1 });
  };
  const atStart = index === 0 && !order[f - 1];
  const atEnd = index === list.length - 1 && !order[f + 1];

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea, select')) return;
      if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'Enter') onOpen(lead.id);
      else if (e.key === 'a' || e.key === 'A') onAccept(lead);
      else if ((e.key === 'z' || e.key === 'Z') && onUndo) onUndo();
      else if (e.key === 'x' || e.key === 'X') onDismiss(lead.id);
      else if (e.key === 'Escape') setAt(null);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Fetch the next image ahead of time so stepping feels instant.
  useEffect(() => {
    const next = list[index + 1] ?? hits[order[f + 1]]?.[0];
    if (next) new Image().src = `/images/${next.id}.webp`;
  });

  return (
    <div>
      <div className={styles.reviewHeader}>
        <h2>{features[feature].name}</h2>
        <span className={`${styles.chip} ${accepted === 0 ? styles.chipMissing : ''}`}>{accepted} / {HUNT_GOAL} accepted</span>
        <span className={styles.meta}>Lead {index + 1} of {list.length} · feature {f + 1} of {order.length}</span>
        <button type="button" className={styles.btn} onClick={() => setAt(null)}>All features (Esc)</button>
      </div>
      <p className={styles.meta}>{features[feature].description}</p>

      <div className={styles.huntLayout}>
        <img key={lead.id} className={styles.huntImage} src={`/images/${lead.id}.webp`} alt={lead.id} />
        <div>
          <p>
            <span className={`${styles.chip} ${lead.status === 'present' ? styles.chipDone : ''}`}>
              {lead.status === 'present' ? 'Clear' : 'Possible'}
            </span>{' '}
            <strong>{dxById[dxOfCode[data[lead.id].code]].name}</strong>
          </p>
          <p>{lead.evidence || 'No note from the model.'}</p>
          <p className={styles.meta}>
            {lead.id} · <a href={`/__original/${lead.id}`} target="_blank" rel="noreferrer">full resolution</a>
            {pretagged(lead.id) ? ' · checklist pre-tagged' : ''}
          </p>
          <div className={styles.toolRow}>
            <button type="button" className={styles.btn} disabled={atStart} onClick={() => step(-1)}>← Previous</button>
            <button type="button" className={styles.btn} disabled={atEnd} onClick={() => step(1)}>Next →</button>
          </div>
          <div className={styles.toolRow}>
            <button type="button" className={`${styles.btn} ${styles.btnOn}`} onClick={() => onAccept(lead)}>Accept this feature (A)</button>
            <button type="button" className={styles.btn} onClick={() => onDismiss(lead.id)}>Not an example (X)</button>
            <button type="button" className={styles.btn} onClick={() => onOpen(lead.id)}>Open in editor (Enter)</button>
          </div>
          {lastNote}
        </div>
      </div>
    </div>
  );
}
