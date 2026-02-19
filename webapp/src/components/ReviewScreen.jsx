import React from 'react';
import styles from './ReviewScreen.module.css';
import { EducationalDetails } from './EducationalDetails';

export function ReviewScreen({ results, data, reviewIndex, setReviewIndex, onExit }) {
  const missedIds = Object.keys(results).filter(id => !results[id]);
  const currentId = missedIds[reviewIndex];
  const item = data[currentId];

  const handleNext = () => {
    if (reviewIndex < missedIds.length - 1) setReviewIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (reviewIndex > 0) setReviewIndex(prev => prev - 1);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.counter}>MISSED CASE {reviewIndex + 1} OF {missedIds.length}</div>
        </header>

        <main className={styles.main}>
          <div className={styles.badge}>REVIEW MODE</div>
          <img src={item?.image_url || `/images/${currentId}.webp`} className={styles.image} alt="Lesion" />
          
          <h2 className={styles.diagnosis}>{item?.diagnosis}</h2>
          <p className={styles.explanation}>{item?.vlm_explanation}</p>
          <EducationalDetails diagnosis={item?.diagnosis} />

          <div className={styles.navRow}>
            <button onClick={handlePrev} disabled={reviewIndex === 0} className={styles.navBtn}>
              ← Previous
            </button>
            <button onClick={handleNext} disabled={reviewIndex === missedIds.length - 1} className={styles.navBtn}>
              Next →
            </button>
          </div>
          <div className={styles.navControls}>
            <button onClick={onExit} className={styles.exitBtn}>
              Exit Review
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}