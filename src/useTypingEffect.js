import { useState, useEffect } from 'react';

const useTypingEffect = (texts, speed, delayBetweenMessages = 1000) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!texts || texts.length === 0 || speed <= 0) return;

    let index = 0;
    const typeWriter = () => {
      if (index < texts[currentIndex].length) {
        setDisplayedText(prev => prev + texts[currentIndex][index]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => { // Delay before starting the next text
          setDisplayedText(''); // Clear displayed text for the next message
          setCurrentIndex(prev => (prev + 1) % texts.length);
        }, delayBetweenMessages);
      }
    };

    const interval = setInterval(typeWriter, speed);

    return () => clearInterval(interval);
  }, [texts, speed, currentIndex, delayBetweenMessages]);

  return displayedText;
};

export default useTypingEffect;