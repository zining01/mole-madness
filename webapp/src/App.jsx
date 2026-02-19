import React, { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen'
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { ReviewScreen } from './components/ReviewScreen';
import data from './metadata_cloud.json'; // Assuming this is your JSON file with all the cases
import { generateDeck } from './utils/sessionBuilder'; // Import the deck generation function
import { fastShuffle } from './utils/helpers'; // Import the shuffle function
import { useKeyboardControls } from './hooks/useKeyboardControls'; // Import the custom hook for keyboard controls

function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [ids, setIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [results, setResults] = useState({});
  const [mode, setMode] = useState('game'); // 'game', 'summary', or 'review'
  const [showFeedback, setShowFeedback] = useState(false);
  const [userResult, setUserResult] = useState(null);

  const currentId = ids[currentIndex];
  const currentItem = data[currentId] || {};
  
  // Setup State
  const [settings, setSettings] = useState({
    count: 20,
    malignantFraction: 0.5, // 0.5 means 50% Malignant, 50% Benign
    type: 'both'
  });

  // Calculate percentages for the display labels
  const malPercent = Math.round(settings.malignantFraction * 100);
  const benignPercent = 100 - malPercent;

  const startSession = () => {
    // Generate the deck based on settings
    const newDeck = generateDeck(data, settings, fastShuffle);
    
    // Update state
    setIds(newDeck);
    setCurrentIndex(0); // Good practice to reset index here
    setSessionActive(true);
  };

  // Handle user choice and provide feedback
  const handleChoice = (guess) => {
    if (showFeedback) return;
    const isCorrect = guess === currentItem.malignancy;
    
    // Track the result
    setResults(prev => ({ ...prev, [currentId]: isCorrect }));
    
    setUserResult(isCorrect);
    setShowFeedback(true);
  };

  // Move to the next case
  const handleNext = () => {
    setShowFeedback(false);
    setUserResult(null);
    
    // Check if we are at the end
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

  // KEYBOARD CONTROLS: Left for Benign, Right for Malignant, Space or Enter for Next
// Use the custom hook
  useKeyboardControls(
    () => handleChoice('Benign'),    // onLeft
    () => handleChoice('Malignant'), // onRight
    handleNext,                      // onSpace
    showFeedback                     // isDisabled/Mode toggle
  );

  // Reset image loaded state when moving to a new case or restarting session
  useEffect(() => {
    setImgLoaded(false);
  }, [currentIndex, sessionActive]);

  // If the session has started, but we don't have data yet, show the loader
  if (sessionActive && (!currentId || !data[currentId])) {
    return <LoadingScreen />;
  }

  // PRELOAD FIRST IMAGE: This is a simple optimization to ensure the first image loads quickly when the session starts.
  useEffect(() => {
  if (sessionActive && ids.length > 0) {
    const firstImg = new Image();
    const firstItem = data[ids[0]];
    firstImg.src = firstItem.image_url || `/images/${ids[0]}.webp`;
  }
  }, [sessionActive, ids]);

  if (!sessionActive) {
    return (
      <SetupScreen 
        settings={settings} 
        setSettings={setSettings} 
        onStart={startSession} 
      />
    );
  }

  if (mode === 'summary') {
    return <SummaryScreen 
      results={results} 
      ids={ids} 
      data={data} 
      onReview={() => setMode('review')} 
      onNewSession={startNewSession} 
    />;
  }

  if (mode === 'review') {
    return <ReviewScreen 
      results={results} 
      data={data}
      reviewIndex={reviewIndex}
      setReviewIndex={setReviewIndex} 
      onExit={() => {
        setMode('summary');
        setReviewIndex(0); // Reset for next time
      }}
    />;
  }

  return (
    <GameScreen 
      ids={ids} 
      data={data} 
      currentIndex={currentIndex} 
      onNext={handleNext} 
      onChoice={handleChoice} 
      showFeedback={showFeedback} 
      userResult={userResult}
      onReset={resetSession}
      onNewSession={startNewSession}
    />
  );
};

export default App;