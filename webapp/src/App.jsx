import React, { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen'
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import data from './metadata_cloud.json'; // Assuming this is your JSON file with all the cases
import { generateDeck } from './utils/sessionBuilder'; // Import the deck generation function
import { fastShuffle } from './utils/helpers'; // Import the shuffle function
import { useKeyboardControls } from './hooks/useKeyboardControls'; // Import the custom hook for keyboard controls

function App() {
  const [sessionActive, setSessionActive] = useState(false);
  const [ids, setIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  
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

  const [showFeedback, setShowFeedback] = useState(false);
  const [userResult, setUserResult] = useState(null);

  const currentId = ids[currentIndex];
  const currentItem = data[currentId] || {};

  // Handle user choice and provide feedback
  const handleChoice = (guess) => {
    if (showFeedback) return; // Prevent double-voting
    const isCorrect = guess === currentItem.malignancy;
    setUserResult(isCorrect);
    setShowFeedback(true);
  };

  // Move to the next case
  const handleNext = () => {
    setShowFeedback(false);
    setUserResult(null);
    setCurrentIndex((prev) => (prev + 1) % ids.length);
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

  return (
    <GameScreen 
      ids={ids} 
      data={data} 
      currentIndex={currentIndex} 
      onNext={handleNext} 
      onChoice={handleChoice} 
      showFeedback={showFeedback} 
      userResult={userResult}
    />
  );
};

export default App;