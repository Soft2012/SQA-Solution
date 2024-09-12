import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure you import the CSS file

const TypingEffect = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  // return <div className="typing-container">{displayedText}</div>;
  return <textarea 
      rows={20} 
      value={displayedText} 
      className="textarea" 
      style={{ width: '100%' }} 
    />
};

export default TypingEffect;