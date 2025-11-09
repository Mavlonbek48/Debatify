import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface TimerContextType {
  time: number;
  isRunning: boolean;
  preset: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setPreset: (preset: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

const STORAGE_KEY = 'debatify_timer';

interface TimerState {
  time: number;
  preset: number;
  isRunning: boolean;
  startTime?: number;
}

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [preset, setPreset] = useState(300);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const timerState: TimerState = JSON.parse(stored);
        setPreset(timerState.preset);
        setIsRunning(timerState.isRunning);

        if (timerState.isRunning && timerState.startTime) {
          const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
          const remaining = Math.max(0, timerState.time - elapsed);
          setTime(remaining);

          if (remaining <= 0) {
            setIsRunning(false);
            localStorage.removeItem(STORAGE_KEY);
          }
        } else {
          setTime(timerState.time);
        }
      } catch (error) {
        console.error('Failed to restore timer state:', error);
      }
    }
  }, []);

  useEffect(() => {
    const saveState = () => {
      const state: TimerState = {
        time,
        preset,
        isRunning,
        startTime: isRunning ? Date.now() : undefined,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    };

    saveState();
  }, [time, preset, isRunning]);

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

  const startTimer = () => {
    if (time === 0) {
      setTime(preset);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(preset);
  };

  const handleSetPreset = (seconds: number) => {
    setPreset(seconds);
    if (!isRunning) {
      setTime(seconds);
    }
  };

  const value = {
    time,
    isRunning,
    preset,
    startTimer,
    pauseTimer,
    resetTimer,
    setPreset: handleSetPreset,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
