import React, { useEffect, useState } from 'react';
import { features } from '../data/features.js';
import { SHOW_HIGHLIGHTS } from '../data/display.js';
import { tellApart } from '../data/lookalikes.js';
import { Schematic } from '../learn/Schematic.jsx';
import { Lesion, Loupe } from './Lesion.jsx';
import { engine, TYPES } from './practice.js';
import styles from './Practice.module.css';

// One practice question. Both kinds show a prompt, take an answer, then
// teaches: what the feature is, where it is in this image, and how to tell it
// from what the learner chose. `onAnswer({ correct, results })` is called once,
// with the per-feature results to record; `onNext` moves on.
//
// Keys: 1–4 choose an option, Enter / Space continue.
export function Question({ item, active, isLast, onAnswer, onNext }) {
  const [answer, setAnswer] = useState(null);
  const Kind = KINDS[item.type];

  const submit = (value) => {
    if (answer) return;
    setAnswer(value);
    onAnswer({ correct: value.correct, results: value.results });
  };

  useEffect(() => {
    if (!active || !answer) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target.closest?.('button, a, input, textarea, select, summary')) return;
      e.preventDefault();
      onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, answer, onNext]);

  return (
    <div>
      <p className={styles.kind}>{TYPES[item.type].label}</p>
      <Kind item={item} answer={answer} submit={submit} active={active} />
      {answer && (
        <button type="button" className={styles.primary} onClick={onNext} autoFocus>
          {isLast ? 'See results' : 'Next'} <span className={styles.keyHint}>Enter</span>
        </button>
      )}
    </div>
  );
}

const useNumberKeys = (enabled, count, choose) => {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= count) choose(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
};

const Verdict = ({ correct, children }) => (
  <p className={correct ? styles.right : styles.wrong}>{children ?? (correct ? 'Correct' : 'Not quite')}</p>
);

// What the feature is, what it looks like in this image, and what it means here.
function Teach({ feature, c, chosen = null }) {
  const f = features[feature];
  const note = c.evidence?.[feature];
  const role = engine.roleIn(c, feature);
  const tell = chosen && chosen !== feature ? tellApart(feature, chosen) : null;
  return (
    <div className={styles.teach}>
      <div className={styles.teachHead}>
        <Schematic id={feature} size={64} />
        <div>
          <p className={styles.teachName}>{f.name}</p>
          <p className={styles.teachText}>{f.description}</p>
        </div>
      </div>
      {note && <p className={styles.teachText}><strong>In this lesion:</strong> {note}</p>}
      {chosen && chosen !== feature && (
        <div className={styles.versus}>
          <Schematic id={chosen} size={44} />
          <p className={styles.teachText}>
            <strong>{features[chosen].name}</strong> {tell ? `is the look-alike. ${tell}` : `would look different: ${lowerFirst(features[chosen].description)}`}
          </p>
        </div>
      )}
      <p className={styles.teachMeta}>
        Diagnosis: {engine.dxLabel(c)}
        {role === 'key' && ' — a key clue for it'}
        {role === 'supportive' && ' — a supporting clue for it'}
        {' · '}
        <a href={`#learn/${feature}`}>More examples</a>
      </p>
    </div>
  );
}

const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);

// --- Name it ---
function NameQuestion({ item, answer, submit, active }) {
  const { case: c, feature, highlight, options } = item;
  const choose = (i) => submit({ chosen: options[i], correct: options[i] === feature, results: [{ feature, correct: options[i] === feature }] });
  useNumberKeys(active && !answer, options.length, choose);

  const optionClass = (o) => {
    if (!answer) return styles.option;
    if (o === feature) return `${styles.option} ${styles.optionRight}`;
    if (o === answer.chosen) return `${styles.option} ${styles.optionWrong}`;
    return `${styles.option} ${styles.optionDim}`;
  };
  const shown = !SHOW_HIGHLIGHTS ? [] : highlight ? [highlight] : answer ? c.highlights.filter((h) => h.feature === feature) : [];

  return (
    <>
      <Lesion c={c} marks={shown} />
      <div className={styles.promptRow}>
        {highlight && <Loupe c={c} mark={highlight} />}
        <p className={styles.prompt}>
          {highlight ? 'What is the marked structure?' : 'Which of these features does this lesion show?'}
        </p>
      </div>
      <div className={styles.options}>
        {options.map((o, i) => (
          <button key={o} type="button" className={optionClass(o)} disabled={Boolean(answer)} onClick={() => choose(i)}>
            <span className={styles.optionKey}>{i + 1}</span>
            {answer && <Schematic id={o} size={32} />}
            <span>{features[o].name}</span>
          </button>
        ))}
      </div>
      {answer && (
        <>
          <Verdict correct={answer.correct} />
          <Teach feature={feature} c={c} chosen={answer.chosen} />
        </>
      )}
    </>
  );
}

// --- Pick the lesion ---
function PickQuestion({ item, answer, submit, active }) {
  const { cases, feature, foilShows } = item;
  const choose = (i) => submit({ chosen: i, correct: i === item.answer, results: [{ feature, correct: i === item.answer }] });
  useNumberKeys(active && !answer, 2, choose);
  const foil = cases[1 - item.answer];

  return (
    <>
      <div className={styles.target}>
        <Schematic id={feature} size={56} />
        <div>
          <p className={styles.prompt}>Which lesion shows <strong>{features[feature].name.toLowerCase()}</strong>?</p>
          <p className={styles.teachText}>{features[feature].description}</p>
        </div>
      </div>
      <div className={styles.pair}>
        {cases.map((c, i) => {
          const isAnswer = i === item.answer;
          const state = !answer ? '' : isAnswer ? styles.pairRight : i === answer.chosen ? styles.pairWrong : styles.pairDim;
          return (
            <button key={c.id} type="button" className={`${styles.pairItem} ${state}`} disabled={Boolean(answer)} onClick={() => choose(i)}
              aria-label={`Lesion ${i + 1}`}>
              <Lesion c={c} marks={SHOW_HIGHLIGHTS && answer && isAnswer ? c.highlights.filter((h) => h.feature === feature) : []} />
              <span className={styles.pairLabel}>
                <span className={styles.optionKey}>{i + 1}</span>
                {answer && (isAnswer ? features[feature].name : foilShows ? features[foilShows].name : `No ${features[feature].name.toLowerCase()}`)}
              </span>
            </button>
          );
        })}
      </div>
      {answer && (
        <>
          <Verdict correct={answer.correct} />
          <Teach feature={feature} c={item.case} chosen={foilShows} />
          <p className={styles.teachMeta}>The other lesion: {engine.dxLabel(foil)}</p>
        </>
      )}
    </>
  );
}

const KINDS = { name: NameQuestion, pick: PickQuestion };
