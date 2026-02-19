// src/components/SetupScreen.jsx
import React from 'react';
import styles from './SetupScreen.module.css';

export function SetupScreen({ settings, setSettings, onStart }) {
  const malPercent = Math.round(settings.malignantFraction * 100);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Mole Madness!</h1>
          <p>a learning game for dermoscopy</p>
          <img src="/assets/mole.png" alt="mole mascot" className={styles.mascotStyle}/>
        </header>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label className={styles.setupLabel}>
            Total Number of Cases
            <input 
              type="number" 
              value={settings.count} 
              onChange={(e) => setSettings({...settings, count: parseInt(e.target.value) || 0})}
              className={styles.setupInput}
            />
          </label>
          <div className={styles.setupLabel}>
            <span>Malignant: <strong>{malPercent}%</strong></span>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={settings.malignantFraction} 
              onChange={(e) => setSettings({...settings, malignantFraction: parseFloat(e.target.value)})}
              className={styles.setupSlider}
            />
          </div>
          <button onClick={onStart} className={styles.nextBtn}>Start Training</button>
        </div>
      </div>
    </div>
  );
}