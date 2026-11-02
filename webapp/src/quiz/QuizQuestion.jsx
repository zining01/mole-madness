import React, { useEffect, useState } from 'react';
import { useQuizVisible } from './visibility.js';
import { CaseImage } from './CaseImage.jsx';
import { AnswerReveal } from './AnswerReveal.jsx';
import { answerOf, answers } from './quiz.js';
import styles from './Quiz.module.css';

// One question: the image and the options; after answering, the reveal.
// Keys: 1–4 to answer, Enter / Space for the next question.
export function QuizQuestion({ item, mode, number, total, score, chosen, onAnswer, onNext }) {
  const [focus, setFocus] = useState(null);
  const [showHighlights, setShowHighlights] = useState(true);
  const visible = useQuizVisible();
  const c = item.case;
  const answer = answerOf(c, mode);
  const answered = chosen != null;

  useEffect(() => {
    const onKey = (e) => {
      if (!visible || e.target.closest?.('input, textarea, select, dialog')) return;
      const n = Number(e.key);
      if (!answered && n >= 1 && n <= item.options.length) onAnswer(item.options[n - 1]);
      else if (answered && (e.key === 'Enter' || e.key === ' ')) {
        if (e.target.closest?.('button, summary, a')) return; // the focused control handles it
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const optionClass = (dx) => {
    if (!answered) return styles.option;
    if (dx === answer) return `${styles.option} ${styles.optionRight}`;
    if (dx === chosen) return `${styles.option} ${styles.optionWrong}`;
    return `${styles.option} ${styles.optionDim}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.progressRow}>
        <span>Question {number} of {total}</span>
        <span>{score} correct</span>
      </div>
      <div className={styles.progressBar}><span style={{ width: `${(100 * (number - (answered ? 0 : 1))) / total}%` }} /></div>

      <CaseImage key={c.id} c={c} showHighlights={answered && showHighlights} focus={focus} />
      {answered && c.highlights.length > 0 && (
        <label className={styles.toggle}>
          <input type="checkbox" checked={showHighlights} onChange={(e) => setShowHighlights(e.target.checked)} />
          Show marked examples
        </label>
      )}

      {!answered && <p className={styles.prompt}>What is the most likely diagnosis?</p>}
      <div className={styles.options}>
        {item.options.map((dx, i) => (
          <button key={dx} type="button" className={optionClass(dx)} disabled={answered} onClick={() => onAnswer(dx)}>
            <span className={styles.optionKey}>{i + 1}</span>
            {answers(mode)[dx].name}
          </button>
        ))}
      </div>

      {answered && (
        <>
          <AnswerReveal c={c} mode={mode} chosen={chosen} onFocus={setFocus} />
          <button type="button" className={styles.primary} onClick={onNext} autoFocus>
            {number === total ? 'See results' : 'Next case'} <span className={styles.keyHint}>Enter</span>
          </button>
        </>
      )}
    </div>
  );
}
