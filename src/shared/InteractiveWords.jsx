import React from 'react';
import ttsService from '../services/ttsService';

const InteractiveWords = ({ text, timestamps = null, onWordClick, rate = 1.0 }) => {
  // Genera arreglo de palabras con info de tiempo si existe
  const words = timestamps
    ? timestamps
    : text.split(' ').map((w) => ({ text: w, start: null, end: null, translation: '' }));

  const handleClick = (word) => {
    ttsService.speak(word.text, { rate });
    if (onWordClick) onWordClick(word);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {words.map((word, idx) => (
        <span
          key={idx}
          onClick={() => handleClick(word)}
          className="cursor-pointer transition-all duration-200 inline-block hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 hover:scale-110"
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};

export default InteractiveWords;
