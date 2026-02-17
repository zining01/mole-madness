import React, { useState } from 'react';
// import data from './metadata_master.json';
import data from './metadata_cloud.json';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [userResult, setUserResult] = useState(null);

  const ids = Object.keys(data);
  const currentItem = data[ids[currentIndex]];

  const handleChoice = (guess) => {
    const isCorrect = guess === currentItem.malignancy;
    setUserResult(isCorrect);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setUserResult(null);
    setCurrentIndex((prev) => (prev + 1) % ids.length);
  };

  if (!currentItem) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Dataset...</div>;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system', backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '5px' }}>DermTrainer</h1>
        <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
          CASE {currentIndex + 1} OF {ids.length}
        </div>
      </header>

      <main>
        {!showFeedback ? (
          /* --- QUESTION VIEW --- */
          <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', backgroundColor: 'white' }}>
            <img 
              /* src={`/images/${ids[currentIndex]}.webp`} */
              src={currentItem.image_url}
              alt="Dermatoscopic view" 
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} 
            />
            <div style={{ padding: '24px' }}>
              <p style={{ textAlign: 'center', color: '#444', marginBottom: '20px', fontSize: '0.95rem' }}>
                Analyze the structures. Is this lesion:
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleChoice('Benign')}
                  style={{ flex: 1, padding: '16px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                >
                  Benign
                </button>
                <button 
                  onClick={() => handleChoice('Malignant')}
                  style={{ flex: 1, padding: '16px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                >
                  Malignant
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* --- FEEDBACK VIEW --- */
          <div style={{ 
            padding: '30px', 
            borderRadius: '24px', 
            backgroundColor: userResult ? '#f0fdf4' : '#fef2f2',
            border: `2px solid ${userResult ? '#4ade80' : '#f87171'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <img 
              /* src={`/images/${ids[currentIndex]}.webp`} */
              src={currentItem.image_url}
              alt="Dermatoscopic view" 
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} 
            />
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '3rem' }}>{userResult ? '✅' : '❌'}</span>
              <h2 style={{ margin: '10px 0', color: userResult ? '#166534' : '#991b1b' }}>
                {userResult ? 'Correct Choice' : 'Incorrect Choice'}
              </h2>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Confirmed Diagnosis</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1a1a' }}>{currentItem.diagnosis}</p>
            </div>

            <p style={{ lineHeight: '1.6', color: '#374151', fontSize: '1rem', marginBottom: '25px' }}>
              <strong>Clinical Analysis:</strong> {currentItem.vlm_explanation}
            </p>

            <button 
              onClick={handleNext}
              style={{ width: '100%', padding: '18px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              Continue to Next Case
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;