import React, { useEffect, useState } from 'react';
import '../css/GuessTimer.css';

const GuessTimer = ({ isResultOpen, submitPredictionTimeout, timeLeft, setTimeLeft}) => {
  useEffect(() => {
    if (isResultOpen) {
      return;
    }

    if (timeLeft === 0) {
      submitPredictionTimeout(); // Timeout
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isResultOpen]);

  return (
    <div className="timer">
      <h3
        className={`nes-text ${timeLeft <= 5 && timeLeft > 0 ? 'is-error' : ''}`}
        >
        {timeLeft > 0 ? (
          <>
            <span className="emoji">⏰</span> {timeLeft} seconds left
            </>
        ) : (
            "Time's up!"
            )}
      </h3>
    </div>
  );
};

export default GuessTimer;
