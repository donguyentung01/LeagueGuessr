import React from 'react';

const GuessTracker = ({ guessesLeft }) => {
  const totalGuesses = 3;  // Total number of guesses
  const guessesLost = totalGuesses - guessesLeft;  // Calculate guesses lost

  // Create an array of heart icons for guesses left
  const heartsLeft = Array(guessesLeft).fill(<i className="nes-icon is-large heart"></i>);
  
  // Create an array of empty heart icons for guesses lost
  const heartsLost = Array(guessesLost).fill(<i className="nes-icon is-large heart is-empty"></i>);

  return (
    <div id="guesses">
      {/* Render all hearts (both left and lost) */}
      {heartsLeft}
      {heartsLost}
    </div>
  );
};

export default GuessTracker;
