import React, { useState, useEffect, useRef} from 'react';
import useTypingEffect from './useTypingEffect';
import './App.css'; // Ensure you import the CSS file

// TypingEffectComponent using the custom hook to handle an array of texts
const TypingEffectComponent = ({ texts, speed, delayBetweenMessages }) => {
  const displayedText = useTypingEffect(texts, speed, delayBetweenMessages);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [displayedText]);

  // return <div className="typing-container">{displayedText}</div>;
  return <textarea 
      rows={20} 
      value={displayedText} 
      readOnly 
      ref={textAreaRef} 
      className="textarea" 
      style={{ width: '100%' }} 
    />
};

export default TypingEffectComponent;