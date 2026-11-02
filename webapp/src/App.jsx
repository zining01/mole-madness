import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ViewTabs } from './components/ViewTabs.jsx';
import { QuizApp } from './quiz/QuizApp.jsx';
import { QuizVisibleContext } from './quiz/visibility.js';
import { Glossary } from './glossary/Glossary.jsx';
import { AccountProvider } from './auth/AccountProvider.jsx';

// Reviewers only, so it (and the review set's data) loads on first visit.
const ReviewSet = lazy(() => import('./review/ReviewSet.jsx'));

// Pages live in the address's #fragment, so the back button works and a feature
// page can be linked to: #quiz (default), #glossary, #glossary/<feature id>,
// #review, #review/<case id>.
const parseRoute = () => {
  const [view, id] = window.location.hash.slice(1).split('/');
  return view === 'glossary' || view === 'review' ? { view, id: id ?? null } : { view: 'quiz', id: null };
};

function App() {
  // Clicking the logo starts over: a new key remounts the quiz at its setup screen.
  const [quizKey, setQuizKey] = useState(0);
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const startOver = () => {
    setQuizKey((k) => k + 1);
    window.location.hash = 'quiz';
  };

  return (
    <AccountProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header onLogoClick={startOver} />
        <ViewTabs view={route.view} />
        <main style={{ flex: 1 }}>
          {/* The quiz stays mounted while the glossary is open, so you keep your place. */}
          <div hidden={route.view !== 'quiz'}>
            <QuizVisibleContext.Provider value={route.view === 'quiz'}>
              <QuizApp key={quizKey} />
            </QuizVisibleContext.Provider>
          </div>
          {route.view === 'glossary' && <Glossary feature={route.id} />}
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
