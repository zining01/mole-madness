import React, { useState, useEffect } from 'react';
import styles from './GameScreen.module.css';
import { EducationalDetails } from './EducationalDetails';

export function GameScreen({ ids, data, currentIndex, onNext, onChoice, showFeedback, userResult }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const currentId = ids[currentIndex];
  const currentItem = data[currentId];

  // Reset image loader when moving to a new case
  useEffect(() => {
    setImgLoaded(false);
  }, [currentIndex]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1>Mole Madness</h1>
          <p>CASE {currentIndex + 1} OF {ids.length}</p>
        </header>

        <main className={styles.main}>
          {!showFeedback ? (
            <div className={styles.stack}>
              <div className={styles.imageContainer}>
                {!imgLoaded && <div className={styles.skeleton} style={{height: '100%'}} />}
                <img 
                  src={currentItem?.image_url || `/images/${currentId}.webp`} 
                  alt="Dermatoscopic view" 
                  className={styles.lesionImage}
                  onLoad={() => setImgLoaded(true)}
                  style={{ display: imgLoaded ? 'block' : 'none' }}
                />
              </div>
              
              <div className={styles.buttonGroup}>
                <button onClick={() => onChoice('Benign')} className={styles.benignBtn}>Benign (←)</button>
                <button onClick={() => onChoice('Malignant')} className={styles.maligBtn}>Malignant (→)</button>
              </div>
            </div>
          ) : (
            <div className={styles.feedbackArea}>
               <div className={styles.resultEmoji}>{userResult ? '✅' : '❌'}</div>
               <h2 style={{ color: userResult ? '#065f46' : '#991b1b' }}>
                 {userResult ? 'Correct Choice' : 'Incorrect Choice'}
               </h2>
               <img 
                 src={currentItem?.image_url || `/images/${currentId}.webp`} 
                 className={styles.lesionImage}
                 alt="Result view"
               />
               <p className={styles.diagnosis}>{currentItem?.diagnosis}</p>
               <p className={styles.explanation}>{currentItem?.vlm_explanation}</p>
               <EducationalDetails diagnosis={currentItem?.diagnosis} />
               <button onClick={onNext} className={styles.nextBtn}>Next Case (Space)</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}