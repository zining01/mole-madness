import React, { useState } from 'react';
import { features } from '../data/features.js';
import { Schematic } from '../learn/Schematic.jsx';
import { Question } from './Question.jsx';
import { engine, CURRICULUM, TYPES, TYPE_IDS } from './practice.js';
import styles from './Practice.module.css';

const SETTINGS_KEY = 'mm.practice.settings';
const COUNTS = [10, 20, 30];
const MAX_RETRIES = 3;

const loadSettings = () => {
  const defaults = { count: 10, types: TYPE_IDS };
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    const types = Array.isArray(saved?.types) ? saved.types.filter((t) => TYPES[t]) : [];
    if (saved && COUNTS.includes(saved.count) && types.length) return { count: saved.count, types };
  } catch {
    // fall through
  }
  return defaults;
};
const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // private mode / blocked storage
  }
};

const lesionType = (scope) => engine.lesionTypes.find((t) => t.scope === scope);
const scopeName = (scope) => {
  if (scope === 'all') return 'All features';
  if (lesionType(scope)) return lesionType(scope).name;
  return features[scope]?.name ?? scope;
};

const newSession = (scope, { count, types }) => ({
  scope,
  items: engine.buildSession({ scope, count, types }),
  answers: [],
  index: 0,
  retries: 0,
  done: false,
});

/**
 * Feature practice: setup → questions → summary.
 *   visible      — whether this page is on screen (it stays mounted to keep your place)
 *   initialScope — from a "practice this" link: start on that scope straight away.
 *                  The app remounts this component (a new key) for each such link.
 */
export function PracticeApp({ visible, initialScope = null }) {
  const [settings, setSettings] = useState(loadSettings);
  const [scope, setScope] = useState(initialScope ?? 'all');
  // { scope, items, answers, index, retries, done }
  const [session, setSession] = useState(() => (initialScope ? newSession(initialScope, loadSettings()) : null));

  const start = (forScope, using) => {
    setScope(forScope);
    setSession(newSession(forScope, using));
    window.scrollTo(0, 0);
  };

  const updateSettings = (next) => {
    setSettings(next);
    saveSettings(next);
  };

  const onAnswer = ({ correct, results }) => {
    setSession((s) => {
      const item = s.items[s.index];
      const answers = [...s.answers, { item, correct, results }];
      let { items, retries } = s;
      // A missed feature comes back once more at the end, in another image.
      if (!correct && retries < MAX_RETRIES) {
        const again = engine.retryItem(item.feature, settings.types, items, s.scope);
        if (again) {
          items = [...items, again];
          retries++;
        }
      }
      return { ...s, answers, items, retries };
    });
  };

  const onNext = () => {
    setSession((s) => (s.index + 1 >= s.items.length ? { ...s, done: true } : { ...s, index: s.index + 1 }));
    window.scrollTo(0, 0);
  };

  let content;
  if (!session) {
    content = <Setup settings={settings} scope={scope} onScope={setScope} onChange={updateSettings} onStart={() => start(scope, settings)} />;
  } else if (!session.items.length) {
    content = (
      <div className={styles.card}>
        <h2 className={styles.title}>Nothing to practice yet</h2>
        <p className={styles.hint}>There are no questions for {scopeName(session.scope).toLowerCase()} with the question types you have switched on.</p>
        <button type="button" className={styles.primary} onClick={() => setSession(null)}>Back</button>
      </div>
    );
  } else if (session.done) {
    content = <Summary session={session} onAgain={() => start(session.scope, settings)} onSetup={() => setSession(null)} />;
  } else {
    const { items, index, answers } = session;
    const answered = answers.length > index;
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.progressRow}>
            <span>{scopeName(session.scope)} · {index + 1} of {items.length}</span>
            <button type="button" className={styles.linkButton} onClick={() => setSession(null)}>End session</button>
          </div>
          <div className={styles.progressBar}><span style={{ width: `${(100 * (index + (answered ? 1 : 0))) / items.length}%` }} /></div>
          <Question key={index} item={items[index]} active={visible} isLast={index === items.length - 1 && answered}
            onAnswer={onAnswer} onNext={onNext} />
        </div>
      </div>
    );
  }
  return <div className={styles.page}>{content}</div>;
}

function Setup({ settings, scope, onScope, onChange, onStart }) {
  const { count, types } = settings;
  const pool = engine.inScope(scope);

  const toggleType = (t) => {
    const next = types.includes(t) ? types.filter((x) => x !== t) : TYPE_IDS.filter((x) => x === t || types.includes(x));
    if (next.length) onChange({ ...settings, types: next });
  };

  const scopes = ['all', ...CURRICULUM.filter((cat) => engine.inScope(cat).length > 0)];
  const type = lesionType(scope);
  const customScope = !scopes.includes(scope) && !type;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Practice features</h2>
      <p className={styles.hint}>
        Short questions on one feature at a time, drawn at random from the features you choose. A feature you miss comes
        back once more at the end of the session.
      </p>

      <section>
        <h3>What to practice</h3>
        <div className={styles.chips}>
          {customScope && <button type="button" className={`${styles.chip} ${styles.chipOn}`}>{scopeName(scope)}</button>}
          {scopes.map((s) => (
            <button key={s} type="button" className={`${styles.chip} ${scope === s ? styles.chipOn : ''}`} onClick={() => onScope(s)}>
              {s === 'all' ? 'All features' : s}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>Or by lesion type</h3>
        <div className={styles.chips}>
          {engine.lesionTypes.map((t) => (
            <button key={t.id} type="button" className={`${styles.chip} ${scope === t.scope ? styles.chipOn : ''}`} onClick={() => onScope(t.scope)}>
              {t.name}
            </button>
          ))}
        </div>
        <p className={styles.hint}>
          {type
            ? `${pool.length} feature${pool.length === 1 ? '' : 's'} of ${type.name.toLowerCase()}, asked on its ${type.images} image${type.images === 1 ? '' : 's'}.`
            : `${pool.length} feature${pool.length === 1 ? '' : 's'} with examples.`}
        </p>
      </section>

      <section>
        <h3>Question types</h3>
        <div className={styles.typeGrid}>
          {TYPE_IDS.map((t) => (
            <label key={t} className={`${styles.type} ${types.includes(t) ? styles.typeOn : ''}`}>
              <input type="checkbox" checked={types.includes(t)} onChange={() => toggleType(t)} />
              <span><strong>{TYPES[t].label}</strong><span>{TYPES[t].blurb}</span></span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3>Questions</h3>
        <div className={styles.segmented}>
          {COUNTS.map((n) => (
            <button key={n} type="button" className={count === n ? styles.segmentOn : ''} onClick={() => onChange({ ...settings, count: n })}>{n}</button>
          ))}
        </div>
      </section>

      <button type="button" className={styles.primary} onClick={onStart}>Start</button>
    </div>
  );
}

function Summary({ session, onAgain, onSetup }) {
  const { answers } = session;
  const right = answers.filter((a) => a.correct).length;

  // Every feature touched this session, weakest first.
  const byFeature = new Map();
  for (const a of answers) {
    for (const r of a.results) {
      const row = byFeature.get(r.feature) ?? { feature: r.feature, marks: [] };
      row.marks.push(r.correct);
      byFeature.set(r.feature, row);
    }
  }
  const rows = [...byFeature.values()].sort(
    (a, b) => a.marks.filter(Boolean).length / a.marks.length - b.marks.filter(Boolean).length / b.marks.length
  );
  const missed = rows.filter((r) => r.marks.includes(false));

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Session complete</h2>
      {answers.length > 0 ? (
        <p className={styles.score}>{right} / {answers.length}<span>{Math.round((100 * right) / answers.length)}%</span></p>
      ) : (
        <p className={styles.hint}>No questions answered.</p>
      )}

      {missed.length > 0 && (
        <p className={styles.hint}>
          Worth another look: {missed.map((r, i) => (
            <React.Fragment key={r.feature}>{i > 0 && ', '}<a href={`#learn/${r.feature}`}>{features[r.feature].name}</a></React.Fragment>
          ))}.
        </p>
      )}

      {rows.length > 0 && (
        <section>
          <h3>Features this session</h3>
          <ul className={styles.results}>
            {rows.map(({ feature, marks }) => (
              <li key={feature}>
                <a href={`#learn/${feature}`} className={styles.resultLink}>
                  <Schematic id={feature} size={36} />
                  <span className={styles.resultName}>{features[feature].name}</span>
                </a>
                <span className={styles.dots} aria-label={`${marks.filter(Boolean).length} of ${marks.length} right`}>
                  {marks.map((ok, i) => <span key={i} className={ok ? styles.dotRight : styles.dotWrong} />)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <button type="button" className={styles.primary} onClick={onAgain}>Practice again</button>
      <div className={styles.navRow}>
        <button type="button" className={styles.secondary} onClick={onSetup}>Change settings</button>
        <a className={styles.secondary} href="#learn">Feature map</a>
      </div>
    </div>
  );
}
