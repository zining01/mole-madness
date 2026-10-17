import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { QuizApp } from './quiz/QuizApp.jsx';

function App() {
  // Clicking the logo starts over: a new key remounts the quiz at its setup screen.
  const [quizKey, setQuizKey] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onLogoClick={() => setQuizKey((k) => k + 1)} />
      <main style={{ flex: 1 }}>
        <QuizApp key={quizKey} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
