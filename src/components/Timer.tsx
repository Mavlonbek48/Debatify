import React, { useState, useEffect, useRef } from 'react';

export const Timer: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [preset, setPreset] = useState(300);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 0) {
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (time === 0) {
      setTime(preset);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(preset);
  };

  const handleSetPreset = (seconds: number) => {
    setPreset(seconds);
    if (!isRunning) {
      setTime(seconds);
    }
  };

  return (
    <div className="timer-container">
      <h2>Debate Timer</h2>

      <div className="timer-display">
        <div className={`timer-time ${time <= 10 && time > 0 ? 'timer-warning' : ''}`}>
          {formatTime(time)}
        </div>
      </div>

      <div className="timer-controls">
        {!isRunning ? (
          <button onClick={handleStart} className="btn btn-primary btn-large">
            Start
          </button>
        ) : (
          <button onClick={handlePause} className="btn btn-secondary btn-large">
            Pause
          </button>
        )}
        <button onClick={handleReset} className="btn btn-secondary btn-large">
          Reset
        </button>
      </div>

      <div className="timer-presets">
        <h3>Quick Presets</h3>
        <div className="presets-grid">
          <button
            onClick={() => handleSetPreset(60)}
            className={`btn ${preset === 60 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            1 min
          </button>
          <button
            onClick={() => handleSetPreset(180)}
            className={`btn ${preset === 180 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            3 min
          </button>
          <button
            onClick={() => handleSetPreset(300)}
            className={`btn ${preset === 300 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            5 min
          </button>
          <button
            onClick={() => handleSetPreset(420)}
            className={`btn ${preset === 420 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            7 min
          </button>
          <button
            onClick={() => handleSetPreset(600)}
            className={`btn ${preset === 600 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            10 min
          </button>
          <button
            onClick={() => handleSetPreset(900)}
            className={`btn ${preset === 900 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            15 min
          </button>
        </div>
      </div>

      <div className="timer-custom">
        <h3>Custom Time</h3>
        <div className="custom-input">
          <input
            type="number"
            min="1"
            max="60"
            placeholder="Minutes"
            disabled={isRunning}
            onChange={(e) => {
              const minutes = parseInt(e.target.value) || 0;
              handleSetPreset(minutes * 60);
            }}
          />
          <span>minutes</span>
        </div>
      </div>
    </div>
  );
};
