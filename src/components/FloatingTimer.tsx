import React, { useState } from 'react';
import { useTimer } from '../contexts/TimerContext';

export const FloatingTimer: React.FC = () => {
  const { time, isRunning, startTimer, pauseTimer, resetTimer } = useTimer();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (time === 0 && !isRunning) {
    return null;
  }

  return (
    <div className={`floating-timer ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div
        className="floating-timer-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`timer-circle ${time <= 10 && time > 0 ? 'warning' : ''}`}>
          <span className="timer-display">{formatTime(time)}</span>
        </div>
        {isRunning && <span className="timer-indicator">Running</span>}
      </div>

      {isExpanded && (
        <div className="floating-timer-controls">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="btn btn-small btn-primary"
              title="Start timer"
            >
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="btn btn-small btn-secondary"
              title="Pause timer"
            >
              Pause
            </button>
          )}
          <button
            onClick={resetTimer}
            className="btn btn-small btn-secondary"
            title="Reset timer"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};
