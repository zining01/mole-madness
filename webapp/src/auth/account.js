// Who is using the app: a guest, or a signed-in reviewer. Provided by
// AccountProvider; read it anywhere with useAccount().
import { createContext, useContext } from 'react';

export const AccountContext = createContext({
  enabled: false, // reviewer sign-in is configured for this site
  loading: false, // a reviewer's session is still being restored
  role: 'guest', // 'guest' | 'reviewer' (signed in)
  email: null,
  approved: null, // reviewer is on the approved list: true | false | null (checking)
  client: null, // the Supabase client, for signed-in reviewers only
  signIn: () => {},
  signOut: () => {},
  recheck: () => {},
});

export const useAccount = () => useContext(AccountContext);

// The guest/reviewer choice, remembered per browser.
const CHOICE_KEY = 'account.choice';
export const loadChoice = () => {
  try {
    const saved = localStorage.getItem(CHOICE_KEY);
    return saved === 'guest' || saved === 'reviewer' ? saved : null;
  } catch {
    return null;
  }
};
export const saveChoice = (choice) => {
  try {
    localStorage.setItem(CHOICE_KEY, choice);
  } catch {
    // private mode / blocked storage
  }
};
