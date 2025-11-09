import React from 'react';
import { useTimer } from '../contexts/TimerContext';

export const TimerControl: React.FC = () => {
  const { time, isRunning, preset, startTimer, pauseTimer, resetTimer, setPreset } = useTimer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <button onClick={startTimer} className="btn btn-primary btn-large">
            Start
          </button>
        ) : (
          <button onClick={pauseTimer} className="btn btn-secondary btn-large">
            Pause
          </button>
        )}
        <button onClick={resetTimer} className="btn btn-secondary btn-large">
          Reset
        </button>
      </div>

      <div className="timer-presets">
        <h3>Quick Presets</h3>
        <div className="presets-grid">
          <button
            onClick={() => setPreset(60)}
            className={`btn ${preset === 60 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            1 min
          </button>
          <button
            onClick={() => setPreset(180)}
            className={`btn ${preset === 180 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            3 min
          </button>
          <button
            onClick={() => setPreset(300)}
            className={`btn ${preset === 300 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            5 min
          </button>
          <button
            onClick={() => setPreset(420)}
            className={`btn ${preset === 420 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            7 min
          </button>
          <button
            onClick={() => setPreset(600)}
            className={`btn ${preset === 600 ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
          >
            10 min
          </button>
          <button
            onClick={() => setPreset(900)}
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
              setPreset(minutes * 60);
            }}
          />
          <span>minutes</span>
        </div>
      </div>
    </div>
  );
};
