import React from 'react';
import { useAccount } from '../auth/account.js';
import styles from './Header.module.css';

export function Header({ onLogoClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.logoGroup} onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <h1 className={styles.title}>Mole Madness</h1>
          <span className={styles.beta}>Beta</span>
        </div>
        <div className={styles.right}>
          <div className={styles.tagline}>a dermoscopy learning game</div>
          <AccountStatus />
        </div>
      </div>
    </header>
  );
}

// "Guest · Sign in to review" or "you@hospital.org · Sign out".
function AccountStatus() {
  const { enabled, loading, role, email, approved, signIn, signOut } = useAccount();
  if (!enabled || loading) return null;
  return (
    <div className={styles.account}>
      {role === 'guest' ? (
        <>Guest · <button type="button" onClick={signIn}>Sign in to review</button></>
      ) : (
        <>
          <span className={styles.email} title={email}>{email}</span>
          {approved === false && ' (not approved yet)'} · <button type="button" onClick={signOut}>Sign out</button>
        </>
      )}
    </div>
  );
}
