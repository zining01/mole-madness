import styles from './SummaryScreen.module.css';

export function SummaryScreen({ results, ids, onReview, onNewSession }) {
  const correctCount = Object.values(results).filter(v => v === true).length;
  const total = ids.length;
  const percent = Math.round((correctCount / total) * 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2>Session Complete!</h2>
        <div className={styles.statsGrid}>
            <span className={styles.accuracyLabel}>Correct: {correctCount}</span>
            <span className={styles.accuracyLabel}>Incorrect: {total - correctCount}</span>
            <span className={styles.accuracyLabel}>Total: {total}</span>
            <span className={styles.accuracyLabel}>Accuracy: {percent}%</span>
        </div>
        {
          (total - correctCount) > 0 && (
            <button onClick={onReview} className={styles.reviewBtn}>Review Missed Cases</button>
          )
        }
        <button onClick={onNewSession} className={styles.newSessionBtn}>New Session</button>
      </div>
    </div>
  );
}