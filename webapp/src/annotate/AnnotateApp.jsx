import React, { useEffect, useState } from 'react';
import data from '../metadata_cloud.json';
import { AnnotationEditor } from './AnnotationEditor.jsx';
import { AtlasView } from './AtlasView.jsx';
import { ReviewView } from './ReviewView.jsx';
import { HuntView } from './HuntView.jsx';
import { CandidateGrid } from './CandidateGrid.jsx';
import { buildIndex, dxById, dxOfCode, quotas, acceptedByCode, plural } from './queue.js';
import { loadAnnotations, loadSuggestions, saveAnnotation, deleteAnnotation } from './store.js';
import { toReviewCount } from './suggestions.js';
import { quickAccept, thinFeatures } from './hunt.js';
import styles from './Annotate.module.css';

const index = buildIndex(data);
const codeNames = Object.fromEntries(Object.values(data).map((r) => [r.code, r.diagnosis]));
const PASSES = [
  [5, 'First pass (5)'],
  [15, 'Full set (15)'],
];

// Remembered per browser for convenience only; annotations live in the repo.
const readPref = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
const writePref = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode / blocked storage — nothing to do
  }
};

const progressFor = (dxId, annotations, target) => {
  const q = quotas(dxId, index, target);
  const done = acceptedByCode(dxId, annotations);
  return {
    done: Object.keys(q).reduce((n, c) => n + Math.min(done[c], q[c]), 0),
    total: Object.values(q).reduce((a, b) => a + b, 0),
  };
};

export function AnnotateApp() {
  const [annotations, setAnnotations] = useState(null);
  const [suggestions, setSuggestions] = useState({});
  const [hiresSuggestions, setHiresSuggestions] = useState({});
  const [secondSuggestions, setSecondSuggestions] = useState({});
  const [huntScreen, setHuntScreen] = useState({});
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(() => Number(readPref('annotate.target', 5)));
  const [dxId, setDxId] = useState(() => {
    const saved = readPref('annotate.dx', null);
    return dxById[saved] ? saved : Object.keys(dxById)[0];
  });
  const [view, setView] = useState('dx'); // 'dx' (candidate grid), 'atlas', 'review' or 'hunt'
  const [reviewId, setReviewId] = useState(null);
  const [huntAt, setHuntAt] = useState(null); // { feature, index } of the lead being viewed
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    loadAnnotations().then(setAnnotations, (err) => setError(err.message));
    loadSuggestions().then(setSuggestions, () => setSuggestions({}));
    loadSuggestions('hires').then(setHiresSuggestions, () => setHiresSuggestions({}));
    loadSuggestions('second').then(setSecondSuggestions, () => setSecondSuggestions({}));
    loadSuggestions('hunt').then(setHuntScreen, () => setHuntScreen({}));
  }, []);

  const chooseTarget = (t) => {
    setTarget(t);
    writePref('annotate.target', t);
  };
  const chooseDx = (id) => {
    setDxId(id);
    setView('dx');
    writePref('annotate.dx', id);
  };

  const handleSave = async (record) => {
    await saveAnnotation(openId, record);
    setAnnotations((prev) => ({ ...prev, [openId]: record }));
    setOpenId(null);
  };

  // Quick edits from the review page: save first, then update state.
  const handleRecordChange = async (id, record) => {
    try {
      await saveAnnotation(id, record);
      setAnnotations((prev) => ({ ...prev, [id]: record }));
    } catch (err) {
      window.alert(`Save failed: ${err.message}`);
    }
  };

  // From the feature hunt: accept one feature of an image without opening the
  // editor. Returns a function that puts things back as they were.
  const handleQuickAccept = async (id, feature, lead) => {
    const before = annotations[id] ?? null;
    const record = quickAccept(data[id], feature, lead, before);
    try {
      await saveAnnotation(id, record);
    } catch (err) {
      window.alert(`Save failed: ${err.message}`);
      return null;
    }
    setAnnotations((prev) => ({ ...prev, [id]: record }));
    return async () => {
      try {
        if (before) await saveAnnotation(id, before);
        else await deleteAnnotation(id);
      } catch (err) {
        window.alert(`Undo failed: ${err.message}`);
        return;
      }
      setAnnotations((prev) => {
        const { [id]: _, ...rest } = prev;
        return before ? { ...rest, [id]: before } : rest;
      });
    };
  };

  const handleReturnToQueue = async () => {
    await deleteAnnotation(openId);
    setAnnotations((prev) => {
      const { [openId]: _, ...rest } = prev;
      return rest;
    });
    setOpenId(null);
  };

  if (error) {
    return (
      <div className={styles.app}>
        <p>Couldn't load annotations ({error}). The annotation tool only works under <code>npm run dev</code>.</p>
      </div>
    );
  }
  if (!annotations) return <div className={styles.app}><p>Loading…</p></div>;

  const totals = Object.keys(dxById).map((id) => progressFor(id, annotations, target));
  const overall = totals.reduce((acc, p) => ({ done: acc.done + p.done, total: acc.total + p.total }), { done: 0, total: 0 });
  const openIn = (run) =>
    Object.entries(annotations).filter(([id, a]) => a.status === 'accepted' && toReviewCount(run[id], a) > 0).length;
  const toReview = openIn(suggestions);
  const toReviewHires = openIn(hiresSuggestions);
  const atlasFeatures = new Set(
    Object.values(annotations).filter((a) => a.status === 'accepted').flatMap((a) => a.atlas)
  ).size;

  let lastGroup = null;

  return (
    <div className={styles.app}>
      <nav className={`${styles.sidebar} ${openId ? styles.sidebarLocked : ''}`}>
        <h1>Annotate</h1>
        <p className={styles.meta}>{overall.done} / {overall.total} images accepted</p>
        {toReview > 0 && <p className={styles.meta}>{plural(toReview, 'image')} with model suggestions to review</p>}
        <div className={styles.toolRow}>
          {PASSES.map(([t, label]) => (
            <button key={t} type="button" className={`${styles.btn} ${target === t ? styles.btnOn : ''}`}
              onClick={() => chooseTarget(t)}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" className={`${styles.dxItem} ${view === 'review' ? styles.dxItemOn : ''}`}
          onClick={() => setView('review')}>
          <span>Review vs Claude</span>
          <span className={styles.meta} title="Images with open disagreements: 600-px run · full-resolution run">
            {toReview} · {toReviewHires} full-res
          </span>
        </button>
        <button type="button" className={`${styles.dxItem} ${view === 'atlas' ? styles.dxItemOn : ''}`}
          onClick={() => setView('atlas')}>
          <span>Feature atlas</span>
          <span className={styles.meta}>{plural(atlasFeatures, 'feature')}</span>
        </button>
        <button type="button" className={`${styles.dxItem} ${view === 'hunt' ? styles.dxItemOn : ''}`}
          onClick={() => { setView('hunt'); setHuntAt(null); }}>
          <span>Feature hunt</span>
          <span className={styles.meta}>{plural(thinFeatures(annotations).length, 'feature')} short of examples</span>
        </button>
        <ul className={styles.dxList}>
          {Object.entries(dxById).map(([id, dx], i) => {
            const group = `${dx.superclass} · ${dx.malignancy}`;
            const heading = group !== lastGroup && <li key={group} className={styles.dxGroup}>{group}</li>;
            lastGroup = group;
            const { done, total } = totals[i];
            return [
              heading,
              <li key={id}>
                <button type="button" className={`${styles.dxItem} ${view === 'dx' && id === dxId ? styles.dxItemOn : ''}`}
                  onClick={() => chooseDx(id)}>
                  <span>{dx.name}</span>
                  <span className={styles.meta}>{done}/{total}</span>
                  <span className={styles.bar}>
                    <span className={styles.barFill} style={{ width: `${total ? (100 * done) / total : 0}%` }} />
                  </span>
                </button>
              </li>,
            ];
          })}
        </ul>
      </nav>

      <main className={styles.content}>
        {openId ? (
          <AnnotationEditor key={openId} image={data[openId]} dxId={dxOfCode[data[openId].code]}
            existing={annotations[openId]} suggestion={suggestions[openId]} second={secondSuggestions[openId]} onSave={handleSave} onReturnToQueue={handleReturnToQueue}
            onClose={() => setOpenId(null)} />
        ) : view === 'review' ? (
          <ReviewView data={data} annotations={annotations} runs={{ web: suggestions, hires: hiresSuggestions }}
            currentId={reviewId}
            setCurrentId={setReviewId} onRecordChange={handleRecordChange} onOpen={setOpenId} />
        ) : view === 'hunt' ? (
          <HuntView data={data} annotations={annotations} screen={huntScreen} suggestions={suggestions}
            second={secondSuggestions} at={huntAt} setAt={setHuntAt} onOpen={setOpenId} onQuickAccept={handleQuickAccept} />
        ) : view === 'atlas' ? (
          <AtlasView annotations={annotations} onOpen={setOpenId} />
        ) : (
          <CandidateGrid key={dxId} dxId={dxId} index={index} annotations={annotations} target={target}
            codeNames={codeNames} suggestions={suggestions} second={secondSuggestions} onOpen={setOpenId} />
        )}
      </main>
    </div>
  );
}
