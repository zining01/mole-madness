import React from 'react';
import styles from './Header.module.css';

export function Header({ onLogoClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.logoGroup} onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <h1 className={styles.title}>Mole Madness</h1>
        </div>
        <div className={styles.tagline}>a dermoscopy training game</div>
      </div>
    </header>
  );
}