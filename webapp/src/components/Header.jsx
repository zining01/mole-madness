import React from 'react';
import styles from './Header.module.css';

export function Header({ onLogoClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.logoGroup} onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <div className={styles.logoPlaceholder}>
            <div className={styles.logoPlaceholder}>
            <img src='/assets/mole.jpeg' alt='Mole Madness Logo' className={styles.logo} />
          </div>
          </div>
          <h1 className={styles.title}>Mole Madness</h1>
        </div>
        <div className={styles.tagline}>a dermoscopy training game</div>
      </div>
    </header>
  );
}