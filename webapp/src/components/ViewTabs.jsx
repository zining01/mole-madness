import React from 'react';
import { useAccount } from '../auth/account.js';
import styles from './ViewTabs.module.css';

// Switches between the feature map, feature practice, the diagnosis quiz and
// (for approved reviewers) the review set.
export function ViewTabs({ view }) {
  const { role, approved } = useAccount();
  const tab = (id, label) => (
    <a href={`#${id}`} aria-current={view === id ? 'page' : undefined}>{label}</a>
  );
  return (
    <nav className={styles.tabs} aria-label="Pages">
      {tab('learn', 'Features')}
      {tab('practice', 'Practice')}
      {tab('quiz', 'Diagnose')}
      {role === 'reviewer' && approved === true && tab('review', 'Review set')}
    </nav>
  );
}
