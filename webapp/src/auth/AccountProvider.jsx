import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { accountsEnabled } from './config.js';
import { AccountContext, loadChoice, saveChoice } from './account.js';
import styles from './Account.module.css';

const SignIn = lazy(() => import('./SignIn.jsx').then((m) => ({ default: m.SignIn })));

// Guest or reviewer. First-time visitors choose in a welcome box; reviewers who
// aren't signed in get the sign-in box. Both sit over the app rather than
// replacing it, so signing in mid-session keeps your place. Supabase is only
// loaded once someone chooses to be a reviewer.
export function AccountProvider({ children }) {
  const [choice, setChoice] = useState(() => (accountsEnabled ? loadChoice() : 'guest'));
  const [auth, setAuth] = useState(null); // the supabase.js module
  const [session, setSession] = useState(undefined); // undefined while loading
  const [approval, setApproval] = useState({ userId: null, approved: null });
  const [checks, setChecks] = useState(0);

  const choose = (next) => {
    setChoice(next);
    saveChoice(next);
  };

  useEffect(() => {
    if (choice !== 'reviewer') return;
    let live = true;
    let stop = () => {};
    import('./supabase.js').then((mod) => {
      if (!live) return;
      setAuth(mod);
      const { data } = mod.supabase.auth.onAuthStateChange((_event, s) => setSession(s));
      // Belt and braces for sign-ins finished in another tab.
      const refresh = () => mod.supabase.auth.getSession().then(({ data: d }) => live && setSession(d.session));
      window.addEventListener('focus', refresh);
      stop = () => {
        data.subscription.unsubscribe();
        window.removeEventListener('focus', refresh);
      };
    });
    return () => {
      live = false;
      stop();
    };
  }, [choice]);

  const signedIn = choice === 'reviewer' && auth && session ? session : null;
  const userId = signedIn?.user.id;
  useEffect(() => {
    if (!userId) return;
    let live = true;
    auth.supabase.rpc('is_reviewer').then(({ data, error }) => {
      if (live) setApproval({ userId, approved: error ? null : data === true });
    });
    return () => {
      live = false;
    };
  }, [auth, userId, checks]);

  const account = {
    enabled: accountsEnabled,
    loading: choice === 'reviewer' && (!auth || session === undefined),
    role: signedIn ? 'reviewer' : 'guest',
    email: signedIn?.user.email ?? null,
    approved: signedIn && approval.userId === userId ? approval.approved : null,
    client: signedIn ? auth.supabase : null,
    signIn: () => choose('reviewer'),
    signOut: () => {
      choose('guest'); // first, so the sign-in box doesn't flash up as the session ends
      auth?.signOut();
    },
    recheck: () => setChecks((n) => n + 1),
  };

  const box = !accountsEnabled ? null : choice === null ? 'welcome' : choice === 'reviewer' && auth && session === null ? 'signIn' : null;

  return (
    <AccountContext.Provider value={account}>
      {children}
      {box && <AccountDialog box={box} onGuest={() => choose('guest')} onReviewer={() => choose('reviewer')} />}
    </AccountContext.Provider>
  );
}

function AccountDialog({ box, onGuest, onReviewer }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    // Escape counts as choosing to carry on as a guest.
    <dialog ref={ref} className={styles.dialog} onCancel={(e) => { e.preventDefault(); onGuest(); }}>
      {box === 'welcome' ? (
        <>
          <h2>Welcome to the Mole Madness beta</h2>
          <p>Learn dermoscopy feature by feature: diagrams, real examples and short practice questions, plus a diagnosis quiz.</p>
          <div className={styles.choices}>
            <button type="button" className={styles.choice} onClick={onGuest}>
              <strong>Start learning as a guest</strong>
              <span>No sign-in needed.</span>
            </button>
            <button type="button" className={styles.choice} onClick={onReviewer}>
              <strong>Sign in as a reviewer</strong>
              <span>Review a set of images: record the features you see, then compare with Claude's calls. Invited reviewers only.</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Sign in as a reviewer</h2>
          <Suspense fallback={<p>Loading…</p>}>
            <SignIn />
          </Suspense>
          <button type="button" className={styles.guestLink} onClick={onGuest}>Continue as a guest instead</button>
        </>
      )}
    </dialog>
  );
}
