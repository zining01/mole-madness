import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ViewTabs } from './components/ViewTabs.jsx';
import { QuizApp } from './quiz/QuizApp.jsx';
import { QuizVisibleContext } from './quiz/visibility.js';
import { Learn } from './learn/Learn.jsx';
import { PracticeApp } from './practice/PracticeApp.jsx';
import { AccountProvider } from './auth/AccountProvider.jsx';

// Reviewers only, so it (and the review set's data) loads on first visit.
const ReviewSet = lazy(() => import('./review/ReviewSet.jsx'));

// Pages live in the address's #fragment, so the back button works and pages can
// be linked to:
//   #learn (default), #learn/<feature id>   the feature map and feature pages
//   #practice                               feature practice (setup, or the session in progress)
//   #practice/<feature id | category | all> start a practice session on that scope
//   #quiz                                   the diagnosis quiz
//   #review, #review/<case id>              the reviewer set
// #glossary links from before the feature map still work.
const VIEWS = ['learn', 'practice', 'quiz', 'review'];
const parseRoute = () => {
  const [first, ...rest] = window.location.hash.slice(1).split('/');
  const view = first === 'glossary' ? 'learn' : VIEWS.includes(first) ? first : 'learn';
  let id = rest.length ? rest.join('/') : null;
  try {
    id = id && decodeURIComponent(id);
  } catch {
    id = null;
  }
  return { view, id };
};

function App() {
  // Clicking the logo starts over: a new key remounts the quiz at its setup screen.
  const [quizKey, setQuizKey] = useState(0);
  const [route, setRoute] = useState(parseRoute);
  // A "practice this" link (#practice/<scope>) starts a new session: the practice
  // page is remounted with that scope, and the address goes back to plain
  // #practice so reloading or coming back doesn't restart it.
  const [practice, setPractice] = useState(() => {
    const { view, id } = parseRoute();
    return { key: 0, scope: view === 'practice' ? id : null };
  });

  useEffect(() => {
    const onHash = () => {
      const next = parseRoute();
      if (next.view === 'practice' && next.id) {
        const scope = next.id;
        setPractice((p) => ({ key: p.key + 1, scope }));
        window.history.replaceState(null, '', '#practice');
        setRoute({ view: 'practice', id: null });
      } else {
        setRoute(next);
      }
      window.scrollTo(0, 0);
    };
    if (parseRoute().view === 'practice' && parseRoute().id) window.history.replaceState(null, '', '#practice');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const startOver = () => {
    setQuizKey((k) => k + 1);
    window.location.hash = 'learn';
  };

  return (
    <AccountProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header onLogoClick={startOver} />
        <ViewTabs view={route.view} />
        <main style={{ flex: 1 }}>
          {route.view === 'learn' && <Learn feature={route.id} />}
          {/* Practice and the quiz stay mounted while another page is open, so you keep your place. */}
          <div hidden={route.view !== 'practice'}>
            <PracticeApp key={practice.key} visible={route.view === 'practice'} initialScope={practice.scope} />
          </div>
          <div hidden={route.view !== 'quiz'}>
            <QuizVisibleContext.Provider value={route.view === 'quiz'}>
              <QuizApp key={quizKey} />
            </QuizVisibleContext.Provider>
          </div>
          {route.view === 'review' && (
            <Suspense fallback={null}>
              <ReviewSet caseId={route.id} />
            </Suspense>
          )}
        </main>
        <Footer />
      </div>
    </AccountProvider>
  );
}

export default App;
