import React, { useState, useEffect } from 'react';
import data from './metadata_master.json';

function App() {
  const [ids, setIds] = useState([]); // Start with an empty list
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userResult, setUserResult] = useState(null);

  // 1. SHUFFLE LOGIC (Runs once on startup)
  useEffect(() => {
    // Get all keys from your JSON
    const originalIds = Object.keys(data);
    
    // Simple shuffle: Sort by a random number
    const shuffled = [...originalIds].sort(() => Math.random() - 0.5);
    
    setIds(shuffled);
  }, []);

  const currentId = ids[currentIndex];
  const currentItem = data[currentId];

  // Handle Logic
  const handleChoice = (guess) => {
    if (showFeedback) return; // Prevent double-voting
    const isCorrect = guess === currentItem.malignancy;
    setUserResult(isCorrect);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setUserResult(null);
    setCurrentIndex((prev) => (prev + 1) % ids.length);
  };

  // KEYBOARD CONTROLS: Left for Benign, Right for Malignant, Space for Next
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showFeedback) {
        if (e.key === 'ArrowLeft') handleChoice('Benign');
        if (e.key === 'ArrowRight') handleChoice('Malignant');
      } else if (e.key === ' ' || e.key === 'Enter') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, currentIndex]);

  // WAIT FOR SHUFFLE: Don't render until we have IDs
  if (ids.length === 0 || !currentItem) {
    return <div style={wrapperStyle}><h1>Loading cases...</h1></div>;
  }

  return (
  /* 1. OUTER WRAPPER: Centers the "card" in the middle of the browser screen */
  <div style={{ 
    minHeight: '100vh', 
    width: '100vw', 
    display: 'flex', 
    alignItems: 'center', // Vertical center
    justifyContent: 'center', // Horizontal center
    backgroundColor: '#f0f2f5', 
    margin: 0, 
    padding: '20px', 
    boxSizing: 'border-box' 
  }}>
    
    {/* 2. THE CARD: The white area that holds your content */}
    <div style={{ 
      width: '100%',
      maxWidth: '550px', // Prevents it from being too wide on desktop
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      display: 'flex', 
      flexDirection: 'column', // FORCES header/image/buttons to STACK vertically
      overflow: 'hidden'
    }}>
      
      {/* 3. HEADER: Explicitly centered */}
      <header style={{ 
        width: '100%', 
        padding: '25px 20px', 
        textAlign: 'center', 
        borderBottom: '1px solid #f0f0f0',
        boxSizing: 'border-box'
      }}>
        <h1 style={{ fontSize: '1.6rem', margin: 0, color: '#1a1a1a' }}>Mole Madness</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '8px' }}>
          CASE {currentIndex + 1} OF {ids.length}
        </p>
      </header>

      {/* 4. MAIN CONTENT AREA */}
      <main style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
        {!showFeedback ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <img 
              src={currentItem.image_url || `/images/${ids[currentIndex]}.webp`} 
              alt="Dermatoscopic view" 
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '16px' }} 
            />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleChoice('Benign')} style={benignStyle}>Benign (←)</button>
              <button onClick={() => handleChoice('Malignant')} style={maligStyle}>Malignant (→)</button>
            </div>
          </div>
        ) : (
          /* FEEDBACK VIEW */
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-in' }}>
             <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{userResult ? '✅' : '❌'}</div>
             <h2 style={{ color: userResult ? '#065f46' : '#991b1b', marginTop: 0 }}>
               {userResult ? 'Correct Choice' : 'Incorrect Choice'}
             </h2>
             <img 
              src={currentItem.image_url || `/images/${ids[currentIndex]}.webp`} 
              alt="Dermatoscopic view" 
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '16px' }} 
            />
             <p style={{ lineHeight: '1.6', color: '#444' }}>{currentItem.vlm_explanation}</p>
             <button onClick={handleNext} style={nextButtonStyle}>Next Case (Space)</button>
          </div>
        )}
      </main>
    </div>
  </div>
)
};

// --- STYLES (JavaScript Objects) ---

// Style Helpers
const benignStyle = { flex: 1, padding: '18px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold' };
const maligStyle = { flex: 1, padding: '18px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold' };
const nextButtonStyle = { width: '100%', padding: '18px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' };

const wrapperStyle = {
  minHeight: '100vh', width: '100vw', display: 'flex', 
  alignItems: 'center', justifyContent: 'center', 
  backgroundColor: '#f8f9fa', padding: '20px', boxSizing: 'border-box'
};

const containerStyle = {
  width: '100%', maxWidth: '550px', backgroundColor: '#fff',
  borderRadius: '20px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden'
};

const headerStyle = {
  padding: '20px', textAlign: 'center', borderBottom: '1px solid #eee'
};

const mainContentStyle = { padding: '25px' };

const stackStyle = {
  display: 'flex', flexDirection: 'column', gap: '20px'
};

const imageStyle = {
  width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px'
};

const buttonGroupStyle = { display: 'flex', gap: '15px' };

const benignBtn = { flex: 1, padding: '18px', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };
const maligBtn = { flex: 1, padding: '18px', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };

const feedbackCardStyle = (isCorrect) => ({
  padding: '20px', borderRadius: '12px', textAlign: 'center',
  backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
  border: `2px solid ${isCorrect ? '#22c55e' : '#ef4444'}`
});

const explanationStyle = { fontSize: '0.95rem', lineHeight: '1.5', color: '#444', fontStyle: 'italic', margin: '20px 0' };
const nextBtnStyle = { width: '100%', padding: '15px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };

export default App;