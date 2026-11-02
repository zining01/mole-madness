import React, { useEffect, useState } from 'react';
import { CaseImage } from './CaseImage.jsx';
import { AnswerReveal } from './AnswerReveal.jsx';
import { answerOf, answers as answerChoices } from './quiz.js';
import { useQuizVisible } from './visibility.js';
import styles from './Quiz.module.css';

// End of a session: score, accuracy per diagnosis, the most common mix-ups, and
// a way to step back through the missed cases.
export function QuizSummary({ session, answers, mode, onAgain, onNewQuiz }) {
  const [reviewing, setReviewing] = useState(null); // index into `missed`
  const [focus, setFocus] = useState(null);
  const visible = useQuizVisible();
  const names = answerChoices(mode);
  const results = session.map((item, i) => ({ item, truth: answerOf(item.case, mode), chosen: answers[i] }));
  const correct = results.filter((r) => r.truth === r.chosen).length;
  const missed = results.filter((r) => r.truth !== r.chosen);

  const byDx = {};
  for (const r of results) {
    const s = (byDx[r.truth] ??= { right: 0, total: 0 });
    s.total++;
    s.right += r.truth === r.chosen;
  }
  const confusions = {};
  for (const r of missed) {
    const k = `${r.truth}→${r.chosen}`;
    confusions[k] = (confusions[k] ?? 0) + 1;
  }

  useEffect(() => {
    if (reviewing === null || !visible) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setReviewing((i) => Math.min(missed.length - 1, i + 1));
      else if (e.key === 'ArrowLeft') setReviewing((i) => Math.max(0, i - 1));
      else if (e.key === 'Escape') setReviewing(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reviewing, missed.length, visible]);

  if (reviewing !== null) {
    const r = missed[reviewing];
    return (
      <div className={styles.card}>
        <div className={styles.progressRow}>
          <span>Missed case {reviewing + 1} of {missed.length}</span>
          <button type="button" className={styles.linkButton} onClick={() => setReviewing(null)}>Back to results</button>
        </div>
        <CaseImage key={r.item.case.id} c={r.item.case} showHighlights focus={focus} />
        <AnswerReveal key={`reveal-${r.item.case.id}`} c={r.item.case} mode={mode} chosen={r.chosen} onFocus={setFocus} />
        <div className={styles.navRow}>
          <button type="button" className={styles.secondary} disabled={reviewing === 0} onClick={() => setReviewing(reviewing - 1)}>← Previous</button>
          <button type="button" className={styles.secondary} disabled={reviewing === missed.length - 1} onClick={() => setReviewing(reviewing + 1)}>Next →</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Results</h2>
      <p className={styles.score}>
        {correct} / {results.length}
        <span>{Math.round((100 * correct) / results.length)}%</span>
      </p>

      <section>
        <h3>By diagnosis</h3>
        <table className={styles.table}>
          <tbody>
            {Object.entries(byDx)
              .sort((a, b) => a[1].right / a[1].total - b[1].right / b[1].total)
              .map(([dx, s]) => (
                <tr key={dx}>
                  <td>{names[dx].name}</td>
                  <td className={styles.num}>{s.right} / {s.total}</td>
                  <td className={styles.barCell}>
                    <span className={styles.miniBar}><span style={{ width: `${(100 * s.right) / s.total}%` }} /></span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {missed.length > 0 && (
        <section>
          <h3>Mix-ups</h3>
          <ul className={styles.confusions}>
            {Object.entries(confusions)
              .sort((a, b) => b[1] - a[1])
              .map(([k, n]) => {
                const [truth, chosen] = k.split('→');
                return (
                  <li key={k}>
                    <strong>{names[truth].name}</strong> called {names[chosen].name}{n > 1 && ` ×${n}`}
                  </li>
                );
              })}
          </ul>
        </section>
      )}

      {missed.length > 0 && (
        <button type="button" className={styles.primary} onClick={() => setReviewing(0)}>
          Review {missed.length} missed case{missed.length > 1 ? 's' : ''}
        </button>
      )}
      <div className={styles.navRow}>
        <button type="button" className={styles.secondary} onClick={onAgain}>Same settings again</button>
        <button type="button" className={styles.secondary} onClick={onNewQuiz}>New quiz</button>
      </div>
    </div>
  );
}
