import React from 'react';
import styles from './LoadingScreen.module.css';

export function LoadingScreen() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.skeleton} style={{ width: '100px', height: '100px', margin: 'auto' }} />
      <h1>Preparing your cases...</h1>
    </div>
  );
} 