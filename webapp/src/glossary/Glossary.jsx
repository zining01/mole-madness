import React, { useEffect, useState } from 'react';
import { features } from '../data/features.js';
import { featureColor } from '../utils/featureColors.js';
import { CaseImage } from '../quiz/CaseImage.jsx';
import { caseDiagnosis, diagnosesFor, exampleCounts, examplesFor, featureGroups, featureOrder } from './glossary.js';
import styles from './Glossary.module.css';

// The feature glossary: every dermoscopic feature with its definition, the
// diagnoses it points to, and the quiz cases that show it. `feature` comes from
// the address (#glossary/<id>), so each feature page can be linked to.
export function Glossary({ feature }) {
  return (
    <div className={styles.page}>
      {feature && features[feature] ? <FeaturePage key={feature} id={feature} /> : <FeatureList />}
    </div>
  );
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function FeatureList() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const matches = (id) => !q || `${features[id].name} ${features[id].description}`.toLowerCase().includes(q);
  const groups = featureGroups.map((g) => ({ ...g, ids: g.ids.filter(matches) })).filter((g) => g.ids.length);

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Feature glossary</h2>
      <p className={styles.hint}>
        Every feature used in the quiz, with examples from the cases. Terms follow the International Dermoscopy
        Society consensus.
      </p>
      <input type="search" className={styles.search} placeholder="Search features" aria-label="Search features"
        value={query} onChange={(e) => setQuery(e.target.value)} />
      {groups.map(({ category, ids }) => (
        <section key={category}>
          <h3>{category}</h3>
          <ul className={styles.list}>
            {ids.map((id) => (
              <li key={id}>
                <a href={`#glossary/${id}`}>
                  <span className={styles.swatch} style={{ background: featureColor(id) }} />
                  <span className={styles.listText}>
                    <strong>{features[id].name}</strong>
                    <span>{features[id].description}</span>
                  </span>
                  <span className={styles.count}>{exampleCounts[id] ? plural(exampleCounts[id], 'example') : 'No examples yet'}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!groups.length && <p className={styles.hint}>No features match "{query}".</p>}
    </div>
  );
}

function FeaturePage({ id }) {
  const f = features[id];
  const { key, supportive } = diagnosesFor(id);
  const i = featureOrder.indexOf(id);
  const prev = featureOrder[i - 1];
  const next = featureOrder[i + 1];

  return (
    <div className={styles.card}>
      <a href="#glossary" className={styles.back}>← All features</a>
      <p className={styles.category}>{f.category}</p>
      <h2 className={styles.title}>{f.name}</h2>
      <p className={styles.description}>{f.description}</p>
      {f.polarizedOnly && (
        <p className={styles.hint}>Seen only with polarized dermoscopy, so it can be missing from non-polarized images.</p>
      )}
      {key.length > 0 && (
        <p className={styles.dxRow}><span>Key clue for</span>{key.map((d) => <span key={d} className={styles.dxKey}>{d}</span>)}</p>
      )}
      {supportive.length > 0 && (
        <p className={styles.dxRow}><span>Also seen in</span>{supportive.map((d) => <span key={d} className={styles.dx}>{d}</span>)}</p>
      )}

      <Examples feature={id} />

      <nav className={styles.pager}>
        {prev ? <a href={`#glossary/${prev}`}>← {features[prev].name}</a> : <span />}
        {next && <a href={`#glossary/${next}`}>{features[next].name} →</a>}
      </nav>
    </div>
  );
}

// One example at a time, with arrows (or ← →) and a strip of thumbnails.
function Examples({ feature }) {
  const [examples] = useState(() => examplesFor(feature));
  const [index, setIndex] = useState(0);
  const [showMarks, setShowMarks] = useState(true);
  const [hideDx, setHideDx] = useState(false);
  const [revealed, setRevealed] = useState(null); // index whose diagnosis was revealed while hidden
  const count = examples.length;

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      if (e.key === 'ArrowRight') setIndex((n) => Math.min(count - 1, n + 1));
      else if (e.key === 'ArrowLeft') setIndex((n) => Math.max(0, n - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count]);

  // Fetch the next image ahead of time so stepping through feels instant.
  useEffect(() => {
    const next = examples[index + 1]?.c;
    if (next) new Image().src = next.image || next.src;
  }, [examples, index]);

  if (!count) {
    return (
      <section className={styles.examples}>
        <h3>Examples</h3>
        <p className={styles.hint}>None of the current quiz cases are tagged with this feature yet.</p>
      </section>
    );
  }

  const { c, marked, note } = examples[index];
  const dxShown = !hideDx || revealed === index;

  return (
    <section className={styles.examples}>
      <div className={styles.exampleHeader}>
        <h3>Examples</h3>
        <span className={styles.hint}>{index + 1} of {count}</span>
      </div>

      <div className={styles.viewer}>
        <CaseImage key={c.id} c={c} showHighlights={showMarks} only={feature} />
        <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} aria-label="Previous example"
          disabled={index === 0} onClick={() => setIndex(index - 1)}>‹</button>
        <button type="button" className={`${styles.arrow} ${styles.arrowRight}`} aria-label="Next example"
          disabled={index === count - 1} onClick={() => setIndex(index + 1)}>›</button>
      </div>

      <div className={styles.toggles}>
        {marked && (
          <label><input type="checkbox" checked={showMarks} onChange={(e) => setShowMarks(e.target.checked)} /> Show marked example</label>
        )}
        <label><input type="checkbox" checked={hideDx} onChange={(e) => { setHideDx(e.target.checked); setRevealed(null); }} /> Hide diagnosis (test yourself)</label>
      </div>

      <p className={styles.caseDx}>
        {dxShown ? caseDiagnosis(c) : (
          <button type="button" className={styles.linkButton} onClick={() => setRevealed(index)}>What's the diagnosis? Show</button>
        )}
      </p>
      {note && <p className={styles.note}>{note}</p>}

      {count > 1 && (
        <div className={styles.strip} aria-label="All examples">
          {examples.map((e, n) => (
            <button key={e.c.id} type="button" aria-label={`Example ${n + 1}`} aria-current={n === index}
              className={styles.thumb} onClick={() => setIndex(n)}>
              <img src={e.c.image || e.c.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
