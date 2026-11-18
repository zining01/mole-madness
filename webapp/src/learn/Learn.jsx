import React, { useEffect, useState } from 'react';
import { diagnosisFeatures, features } from '../data/features.js';
import { diagnosesForMode } from '../data/taxonomy.js';
import { lookalikesOf } from '../data/lookalikes.js';
import { CaseImage } from '../quiz/CaseImage.jsx';
import { caseDiagnosis, diagnosesFor, examplesFor, featureOrder } from '../glossary/glossary.js';
import { engine, CURRICULUM, practiceLink } from '../practice/practice.js';
import { SHOW_HIGHLIGHTS } from '../data/display.js';
import { Schematic } from './Schematic.jsx';
import styles from './Learn.module.css';

// The feature map (every feature, grouped by category or by diagnosis) and the
// page for one feature: diagram, definition, look-alikes, examples and practice.
// `feature` comes from the address (#learn/<id>), so each page can be linked to.
export function Learn({ feature }) {
  return (
    <div className={styles.page}>
      {feature && features[feature] ? <FeaturePage key={feature} id={feature} /> : <FeatureMap />}
    </div>
  );
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const byCategory = CURRICULUM.map((category) => ({
  id: category,
  title: category,
  practice: category,
  lists: [{ ids: featureOrder.filter((id) => features[id].category === category) }],
})).filter((g) => g.lists[0].ids.length);

// The specific diagnoses, in the quiz's order grouped by superclass and malignancy, each with its key clues and the
// features that support it. A feature can appear under several diagnoses.
const specificDx = diagnosesForMode('advanced');
const byDiagnosis = Object.entries(specificDx)
  .filter(([dx]) => diagnosisFeatures[dx])
  .map(([dx, info]) => {
    const { key, supportive } = diagnosisFeatures[dx];
    return {
      id: dx,
      title: info.name,
      section: `${info.superclass} · ${info.malignancy}`,
      practice: engine.lesionTypes.some((t) => t.id === dx) ? `dx:${dx}` : null,
      lists: [
        { label: 'Key clues', ids: key },
        { label: 'Also seen', ids: supportive.filter((f) => !key.includes(f)) },
      ],
    };
  })
  // Keep each superclass · malignancy group together (the quiz order splits some).
  .map((g, i, all) => ({ g, rank: all.findIndex((x) => x.section === g.section), i }))
  .sort((x, y) => x.rank - y.rank || x.i - y.i)
  .map(({ g }) => g);

const VIEWS = { category: 'By category', diagnosis: 'By diagnosis' };
const VIEW_KEY = 'mm.learn.view';
const readView = () => {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    return VIEWS[saved] ? saved : 'category';
  } catch {
    return 'category';
  }
};
const writeView = (view) => {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch {
    // private mode / blocked storage: the choice lasts until reload
  }
};

function Tile({ id }) {
  return (
    <li>
      <a href={`#learn/${id}`} className={styles.tile}>
        <Schematic id={id} size={56} />
        <span className={styles.tileText}>
          <strong>{features[id].name}</strong>
          <span className={styles.none}>{engine.isPracticable(id) ? plural(engine.exampleCount(id), 'example') : 'No examples yet'}</span>
        </span>
      </a>
    </li>
  );
}

function FeatureMap() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState(readView);
  const chooseView = (v) => {
    setView(v);
    writeView(v);
  };

  const q = query.trim().toLowerCase();
  const text = (id) => `${features[id].name} ${features[id].description} ${features[id].category}`.toLowerCase();
  // A search matching a diagnosis name keeps all of that diagnosis' features.
  const shown = (view === 'diagnosis' ? byDiagnosis : byCategory)
    .map((g) => {
      const whole = !q || g.title.toLowerCase().includes(q);
      return { ...g, lists: g.lists.map((l) => ({ ...l, ids: whole ? l.ids : l.ids.filter((id) => text(id).includes(q)) })).filter((l) => l.ids.length) };
    })
    .filter((g) => g.lists.length);

  return (
    <>
      <div className={styles.hero}>
        <h2>Learn to see the features</h2>
        <p>
          Dermoscopy is read feature by feature. Each one here has a diagram, real examples and short practice
          questions.
        </p>
        <a className={styles.cta} href={practiceLink('all')}>Start practice</a>
      </div>

      <div className={styles.card}>
        <div className={styles.viewToggle} role="tablist" aria-label="Organize features">
          {Object.entries(VIEWS).map(([v, label]) => (
            <button key={v} type="button" role="tab" aria-selected={view === v} className={view === v ? styles.viewOn : ''}
              onClick={() => chooseView(v)}>
              {label}
            </button>
          ))}
        </div>
        <input type="search" className={styles.search}
          placeholder={view === 'diagnosis' ? 'Search features or diagnoses' : 'Search features'} aria-label="Search features"
          value={query} onChange={(e) => setQuery(e.target.value)} />
        {shown.map((g, i) => {
          const count = new Set(g.lists.flatMap((l) => l.ids)).size;
          const sectionHead = g.section && g.section !== shown[i - 1]?.section && <p className={styles.dxSection}>{g.section}</p>;
          return (
            <React.Fragment key={g.id}>
              {sectionHead}
              <section>
                <div className={styles.groupHead}>
                  <h3>{g.title}</h3>
                  <span className={styles.groupMeta}>
                    {plural(count, 'feature')}
                    {g.practice && !q && <> · <a href={practiceLink(g.practice)}>Practice</a></>}
                  </span>
                </div>
                {g.lists.map((l) => (
                  <React.Fragment key={l.label ?? 'all'}>
                    {l.label && <p className={styles.listLabel}>{l.label}</p>}
                    <ul className={styles.tiles}>
                      {l.ids.map((id) => <Tile key={id} id={id} />)}
                    </ul>
                  </React.Fragment>
                ))}
              </section>
            </React.Fragment>
          );
        })}
        {!shown.length && <p className={styles.hint}>No features match "{query}".</p>}
        <p className={styles.footnote}>
          Terms follow the International Dermoscopy Society consensus.
          {view === 'diagnosis' && ' Key clues and supporting features are the ones each diagnosis is assessed for in this app; a feature can appear under several diagnoses.'}
        </p>
      </div>
    </>
  );
}

function FeaturePage({ id }) {
  const f = features[id];
  const { key, supportive } = diagnosesFor(id);
  const alikes = lookalikesOf(id);
  const i = featureOrder.indexOf(id);
  const prev = featureOrder[i - 1];
  const next = featureOrder[i + 1];
  const practicable = engine.isPracticable(id);

  return (
    <div className={styles.card}>
      <a href="#learn" className={styles.back}>← All features</a>

      <div className={styles.featureHead}>
        <Schematic id={id} size={112} title={`Diagram of ${f.name.toLowerCase()}`} />
        <div>
          <p className={styles.category}>{f.category}</p>
          <h2 className={styles.title}>{f.name}</h2>
          <p className={styles.description}>{f.description}</p>
          {f.polarizedOnly && <p className={styles.hint}>Seen only with polarized dermoscopy. Every image in this app is polarized.</p>}
        </div>
      </div>

      {key.length > 0 && (
        <p className={styles.dxRow}><span>Key clue for</span>{key.map((d) => <span key={d} className={styles.dxKey}>{d}</span>)}</p>
      )}
      {supportive.length > 0 && (
        <p className={styles.dxRow}><span>Also seen in</span>{supportive.map((d) => <span key={d} className={styles.dx}>{d}</span>)}</p>
      )}

      {practicable && (
        <div className={styles.practiceBar}>
          <div>
            <strong>{plural(engine.exampleCount(id), 'example')}</strong>
            <span>Look through the examples, then try it.</span>
          </div>
          <a className={styles.practiceButton} href={practiceLink(id)}>Practice this feature</a>
        </div>
      )}

      {alikes.length > 0 && (
        <section>
          <h3>Don't confuse with</h3>
          <ul className={styles.alikes}>
            {alikes.map((l) => (
              <li key={l.id}>
                <a href={`#learn/${l.id}`} aria-label={features[l.id].name}><Schematic id={l.id} size={52} /></a>
                <p><a href={`#learn/${l.id}`}>{features[l.id].name}</a><br />{l.tell}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Examples feature={id} />

      <nav className={styles.pager}>
        {prev ? <a href={`#learn/${prev}`}>← {features[prev].name}</a> : <span />}
        {next && <a href={`#learn/${next}`}>{features[next].name} →</a>}
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
        <p className={styles.hint}>None of the current cases are tagged with this feature yet, so it has no practice questions.</p>
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
        <CaseImage key={c.id} c={c} showHighlights={SHOW_HIGHLIGHTS && showMarks} only={feature} />
        <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} aria-label="Previous example"
          disabled={index === 0} onClick={() => setIndex(index - 1)}>‹</button>
        <button type="button" className={`${styles.arrow} ${styles.arrowRight}`} aria-label="Next example"
          disabled={index === count - 1} onClick={() => setIndex(index + 1)}>›</button>
      </div>

      <div className={styles.toggles}>
        {SHOW_HIGHLIGHTS && marked && (
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
