import React from 'react';
import { MODES, answers, casesByAnswer, convertSelection, presets } from './quiz.js';
import styles from './Quiz.module.css';

const COUNTS = [10, 20, 40];

export function QuizSetup({ settings, onChange, onStart }) {
  const { mode, selected, count } = settings;
  const dxs = answers(mode);
  const pools = casesByAnswer(mode);
  const patients = (dx) => new Set((pools[dx] ?? []).map((c) => c.patient)).size;
  const available = selected.reduce((n, dx) => n + patients(dx), 0);
  const set = (changes) => onChange({ ...settings, ...changes });

  const toggle = (dx) =>
    set({ selected: selected.includes(dx) ? selected.filter((d) => d !== dx) : [...selected, dx] });

  const switchMode = (next) => set({ mode: next, selected: convertSelection(selected, next) });

  let lastGroup = null;
  const groups = [];
  for (const [id, dx] of Object.entries(dxs)) {
    // Actinic keratosis (premalignant) sits with the non-melanocytic malignancies.
    const melanocytic = dx.superclass === 'Melanocytic';
    const kind = dx.malignancy === 'Benign' ? 'benign' : melanocytic ? 'malignant' : 'malignant / premalignant';
    const group = `${melanocytic ? 'Melanocytic' : 'Non-melanocytic'} · ${kind}`;
    if (group !== lastGroup) groups.push({ group, ids: [] });
    groups.at(-1).ids.push(id);
    lastGroup = group;
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>New quiz</h2>

      <section>
        <h3>Level</h3>
        <div className={styles.segmented}>
          {Object.entries(MODES).map(([key, label]) => (
            <button key={key} type="button" className={mode === key ? styles.segmentOn : ''} onClick={() => switchMode(key)}>
              {label}
            </button>
          ))}
        </div>
        <p className={styles.hint}>
          {mode === 'basic'
            ? 'Junctional, compound, intradermal and congenital nevi share one answer, dysplastic or not.'
            : 'Splits benign from dysplastic nevi (acral nevi too) and adds lichenoid keratosis.'}
        </p>
      </section>

      <section>
        <h3>Diagnoses</h3>
        <div className={styles.presetRow}>
          {presets(mode).map((p) => (
            <button key={p.key} type="button" className={styles.preset} onClick={() => set({ selected: p.ids })}>
              {p.name}
            </button>
          ))}
          <button type="button" className={styles.preset} onClick={() => set({ selected: [] })}>Clear</button>
        </div>
        {groups.map(({ group, ids }) => (
          <fieldset key={group} className={styles.dxGroup}>
            <legend>{group}</legend>
            {ids.map((id) => (
              <label key={id} className={styles.dxOption}>
                <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
                <span>{dxs[id].name}</span>
                <span className={styles.count}>{patients(id)}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <p className={styles.hint}>Numbers are how many different patients' cases are available.</p>
      </section>

      <section>
        <h3>Questions</h3>
        <div className={styles.segmented}>
          {COUNTS.map((n) => (
            <button key={n} type="button" className={count === n ? styles.segmentOn : ''} onClick={() => set({ count: n })}>
              {n}
            </button>
          ))}
        </div>
        {selected.length >= 2 && available < count && (
          <p className={styles.hint}>Only {available} cases fit this selection, so the quiz will be {available} questions.</p>
        )}
      </section>

      <button type="button" className={styles.primary} disabled={selected.length < 2} onClick={onStart}>
        {selected.length < 2 ? 'Pick at least 2 diagnoses' : 'Start'}
      </button>
    </div>
  );
}
