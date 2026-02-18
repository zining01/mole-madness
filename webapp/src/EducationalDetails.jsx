import React, { useState } from 'react';
import { findingsLibrary } from './findingsLibrary';

const imageStyle = {
  maxWidth: '100%',    // Never wider than the card
  height: 'auto',       // Keep aspect ratio
  borderRadius: '8px',  // Match your app's aesthetic
  marginTop: '10px',
  display: 'block',     // Prevents weird bottom spacing
  marginLeft: 'auto',   // Center the image
  marginRight: 'auto'
};

export const EducationalDetails = ({ diagnosis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = findingsLibrary[diagnosis];

  if (!info) return null;

  return (
    <div className="educational-section">
      <button onClick={() => setIsOpen(!isOpen)} className="peek-button">
        {isOpen ? "Hide Details ▲" : "Show Details ▼"}
      </button>

      {isOpen && (
        <div className="peek-content">
          <img src={info.cartoon} alt="Clinical Schema" className="schema-img" style={imageStyle}/>
          <ul className="patterns-list">
            <div className="teaching-tip" style={{ fontSize: '0.9rem', color: '#444', lineHeight: '1.4' }}>
            <strong>💡 Clinical Pearl:</strong> {info.teachingTip}
          </div>
          </ul>
        </div>
      )}
    </div>
  );
};