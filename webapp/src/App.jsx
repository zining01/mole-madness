import React, { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { ReviewScreen } from './components/ReviewScreen';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import data from './metadata_cloud.json';
import { generateDeck } from './utils/sessionBuilder';
import { fastShuffle } from './utils/helpers';
import { useKeyboardControls } from './hooks/useKeyboardControls';

function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [ids, setIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [results, setResults] = useState({});
  const [mode, setMode] = useState('game'); 
  const [showFeedback, setShowFeedback] = useState(false);
  const [userResult, setUserResult] = useState(null);
  
  const [settings, setSettings] = useState({
    count: 20,
    malignantFraction: 0.5,
    type: 'both'
  });

  const currentId = ids[currentIndex];
  const currentItem = data[currentId] || {};

  const startSession = () => {
    const newDeck = generateDeck(data, settings, fastShuffle);
    setIds(newDeck);
    setCurrentIndex(0);
    setSessionActive(true);
  };

  const handleChoice = (guess) => {
    if (showFeedback) return;
    const isCorrect = guess === currentItem.malignancy;
    setResults(prev => ({ ...prev, [currentId]: isCorrect }));
    setUserResult(isCorrect);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setUserResult(null);
    if (currentIndex === ids.length - 1) {
      setMode('summary');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setResults({});
    setShowFeedback(false);
    setMode('game');
  };

  const startNewSession = () => {
    setSessionActive(false);
    resetSession();
  };

  useKeyboardControls(
    () => handleChoice('Benign'),
    () => handleChoice('Malignant'),
    handleNext,
    showFeedback
  );

  useEffect(() => {
    setImgLoaded(false);
  }, [currentIndex, sessionActive]);

  useEffect(() => {
    if (sessionActive && ids.length > 0) {
      const firstImg = new Image();
      const firstItem = data[ids[0]];
      firstImg.src = firstItem.image_url || `/images/${ids[0]}.webp`;
    }
  }, [sessionActive, ids]);

  // 2. Determine which screen to show
  let content;
  if (!sessionActive) {
    content = <SetupScreen settings={settings} setSettings={setSettings} onStart={startSession} />;
  } else if (!currentId || !data[currentId]) {
    content = <LoadingScreen />;
  } else if (mode === 'summary') {
    content = <SummaryScreen results={results} ids={ids} data={data} onReview={() => setMode('review')} onNewSession={startNewSession} />;
  } else if (mode === 'review') {
    content = <ReviewScreen results={results} data={data} reviewIndex={reviewIndex} setReviewIndex={setReviewIndex} onExit={() => { setMode('summary'); setReviewIndex(0); }} />;
  } else {
    content = <GameScreen ids={ids} data={data} currentIndex={currentIndex} onNext={handleNext} onChoice={handleChoice} showFeedback={showFeedback} userResult={userResult} onReset={resetSession} onNewSession={startNewSession} />;
  }

  // 3. Final Render with Global Wrapper
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onLogoClick={startNewSession} />
      <main style={{ flex: 1 }}>
        {content}
      </main>
      <Footer />
    </div>
  );
}

export default App;