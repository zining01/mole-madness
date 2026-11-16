import React, { useEffect, useState } from 'react';
import { features } from '../data/features.js';
import { lookalikesOf } from '../data/lookalikes.js';
import { CaseImage } from '../quiz/CaseImage.jsx';
import { caseDiagnosis, diagnosesFor, examplesFor, featureOrder } from '../glossary/glossary.js';
import { engine, CURRICULUM, practiceLink } from '../practice/practice.js';
import { SHOW_HIGHLIGHTS } from '../data/display.js';
import { Schematic } from './Schematic.jsx';
import styles from './Learn.module.css';

// The feature map (every feature, grouped) and the
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

const groups = CURRICULUM.map((category) => ({
  category,
  ids: featureOrder.filter((id) => features[id].category === category),
})).filter((g) => g.ids.length);

function FeatureMap() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const matches = (id) => !q || `${features[id].name} ${features[id].description} ${features[id].category}`.toLowerCase().includes(q);
  const shown = groups.map((g) => ({ ...g, ids: g.ids.filter(matches) })).filter((g) => g.ids.length);

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
        <input type="search" className={styles.search} placeholder="Search features" aria-label="Search features"
          value={query} onChange={(e) => setQuery(e.target.value)} />
        {shown.map(({ category, ids }) => {
          const practicable = ids.filter(engine.isPracticable);
          return (
            <section key={category}>
              <div className={styles.groupHead}>
                <h3>{category}</h3>
                <span className={styles.groupMeta}>
                  {plural(ids.length, 'feature')}
                  {practicable.length > 0 && !q && <> · <a href={practiceLink(category)}>Practice</a></>}
                </span>
              </div>
              <ul className={styles.tiles}>
                {ids.map((id) => (
                  <li key={id}>
                    <a href={`#learn/${id}`} className={styles.tile}>
                      <Schematic id={id} size={56} />
                      <span className={styles.tileText}>
                        <strong>{features[id].name}</strong>
                        <span className={styles.none}>{engine.isPracticable(id) ? plural(engine.exampleCount(id), 'example') : 'No examples yet'}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {!shown.length && <p className={styles.hint}>No features match "{query}".</p>}
        <p className={styles.footnote}>
          Terms follow the International Dermoscopy Society consensus.
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
