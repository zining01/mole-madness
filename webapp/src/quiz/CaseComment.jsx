import React, { useState } from 'react';
import { useAccount } from '../auth/account.js';
import { features } from '../data/features.js';
import { answerOf, answers, subtypeLabel } from './quiz.js';
import styles from './Quiz.module.css';

// With reviewer sign-in set up, guests get a link to sign in as a reviewer
// (reviewers comment in the review set). Without it, "Report a problem with
// this case" copies the case details to the clipboard, to paste into a message
// to whoever shared the link.
export function CaseComment({ c, mode }) {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  if (account.enabled) {
    if (account.loading || account.role === 'reviewer') return null;
    return (
      <button type="button" className={styles.linkButton} onClick={account.signIn}>
        Invited reviewer? Sign in to review cases
      </button>
    );
  }

  if (!open) {
    return (
      <button type="button" className={styles.linkButton} onClick={() => setOpen(true)}>
        Report a problem with this case
      </button>
    );
  }

  const answer = answers(mode)[answerOf(c, mode)].name;
  const subtype = subtypeLabel(c, mode);
  const report = [
    `Mole Madness beta: problem with case ${c.id}`,
    `Diagnosis shown: ${answer}${subtype ? ` (${subtype})` : ''} [${c.code}, ${mode} mode]`,
    `Features shown: ${c.present.map((f) => features[f]?.name ?? f).join(', ') || 'none'}`,
    `Note: ${note.trim() || '(none)'}`,
  ].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      setCopied(false); // clipboard blocked: the text below can be copied by hand
    }
  };

  return (
    <div className={styles.report}>
      <label htmlFor={`report-${c.id}`}>What looks wrong? (the diagnosis, a feature, the image…)</label>
      <textarea id={`report-${c.id}`} rows={3} maxLength={2000} value={note}
        onChange={(e) => { setNote(e.target.value); setCopied(false); }} />
      <div className={styles.reportActions}>
        <button type="button" className={styles.preset} onClick={copy}>{copied ? 'Copied ✓' : 'Copy report'}</button>
        <button type="button" className={styles.linkButton} onClick={() => setOpen(false)}>Cancel</button>
      </div>
      <p className={styles.hint}>
        Paste it into a message to the person who shared this link. Nothing is sent from the app.
      </p>
      <pre className={styles.reportPreview}>{report}</pre>
    </div>
  );
}
