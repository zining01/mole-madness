import React, { useState } from 'react';
import { sendEmailCode, verifyEmailCode } from './supabase.js';
import styles from '../quiz/Quiz.module.css';

// Reviewer sign-in with a one-time code sent to an approved email address.
export function SignIn() {
  const [step, setStep] = useState('email'); // email | code
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const send = (e) => {
    e.preventDefault();
    run(async () => {
      await sendEmailCode(email.trim());
      setStep('code');
    });
  };
  const verify = (e) => {
    e.preventDefault();
    run(() => verifyEmailCode(email.trim(), code.trim()));
  };

  return (
    <div className={styles.signIn}>
      {step === 'email' ? (
        <form onSubmit={send}>
          <p className={styles.hint}>Enter your email and we'll send you a sign-in code. Only approved reviewers can sign in.</p>
          <div className={styles.reportActions}>
            <input type="email" required autoComplete="email" placeholder="you@hospital.org" aria-label="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)} className={styles.textInput} />
            <button type="submit" className={styles.preset} disabled={busy}>{busy ? 'Sending…' : 'Send code'}</button>
          </div>
        </form>
      ) : (
        <form onSubmit={verify}>
          <p className={styles.hint}>We emailed a code to {email.trim()}. It may take a minute to arrive.</p>
          <div className={styles.reportActions}>
            <input inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6,10}" maxLength={10}
              placeholder="Code" aria-label="Sign-in code" value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className={styles.textInput} />
            <button type="submit" className={styles.preset} disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button>
            <button type="button" className={styles.linkButton} onClick={() => { setStep('email'); setCode(''); }}>
              Use a different email
            </button>
          </div>
        </form>
      )}
      {error && <p className={styles.reportError}>{error}</p>}
    </div>
  );
}
