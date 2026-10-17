import React, { useState } from 'react';
import { features } from '../data/features.js';
import { answerOf, answers, subtypeLabel } from './quiz.js';
import styles from './Quiz.module.css';

// "Report a problem with this case": a note box that copies the case details
// to the clipboard, so beta testers can paste it into a message to whoever sent
// them the link. Nothing is sent or stored by the app.
export function ReportProblem({ c, mode }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

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

  if (!open) {
    return (
      <button type="button" className={styles.linkButton} onClick={() => setOpen(true)}>
        Report a problem with this case
      </button>
    );
  }

  return (
    <div className={styles.report}>
      <label htmlFor={`report-${c.id}`}>What looks wrong? (the diagnosis, a feature, the image…)</label>
      <textarea id={`report-${c.id}`} rows={3} value={note}
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
