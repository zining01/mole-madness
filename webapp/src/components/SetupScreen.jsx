// src/components/SetupScreen.jsx
import React from 'react';
import styles from './SetupScreen.module.css';

export function SetupScreen({ settings, setSettings, onStart }) {
  const malPercent = Math.round(settings.malignantFraction * 100);

  const handleCountChange = (e, minValue, maxValue) => {
    let value = parseInt(e.target.value, 10);

    // If the input is empty or not a number, we can set it to a default or 0
    if (isNaN(value)) {
      setSettings({ ...settings, count: '' }); 
      return;
    }

    // Force the number between min and max values
    if (value < minValue) value = minValue;
    if (value > maxValue) value = maxValue;

    setSettings({ ...settings, count: value });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Session Setup</h1>
          <img src='/assets/mole.jpeg' alt='Mole Madness Logo' className={styles.mascotStyle} />
        </header>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label className={styles.setupLabel}>
            Total Number of Cases
            <input 
              type="number"
              min="1"
              max="100"
              value={settings.count}
              className={styles.setupInput}
              onChange={(e) => handleCountChange(e, 1, 100)}
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