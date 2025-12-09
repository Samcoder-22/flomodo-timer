import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, TimerSettings, TimerState } from '../types';
import { playNotificationSound, sendNotification } from '../utils/sound';

export const useTimer = (settings: TimerSettings) => {
  const [state, setState] = useState<TimerState>(() => {
    // Load state from local storage
    const savedState = localStorage.getItem('flomodoro-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Ensure timer doesn't start automatically on refresh
        return { ...parsed, isActive: false };
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    
    return {
      mode: TimerMode.FOCUS,
      timeLeft: settings.focusDuration * 60,
      isActive: false,
      round: 1,
    };
  });

  const timerRef = useRef<number | null>(null);

  // Helper to get duration based on mode
  const getDurationForMode = useCallback((mode: TimerMode) => {
    switch (mode) {
      case TimerMode.FOCUS: return settings.focusDuration * 60;
      case TimerMode.SHORT_BREAK: return settings.shortBreakDuration * 60;
      case TimerMode.LONG_BREAK: return settings.longBreakDuration * 60;
      default: return 0;
    }
  }, [settings]);

  // Persist state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('flomodoro-state', JSON.stringify(state));
  }, [state]);

  // Update timer when settings change, but NOT when pausing/playing (fixing the bug)
  // Only depend on specific duration settings
  useEffect(() => {
    if (!state.isActive) {
      setState(prev => ({
        ...prev,
        timeLeft: getDurationForMode(prev.mode),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, getDurationForMode]);

  const switchMode = useCallback(() => {
    playNotificationSound();
    
    setState((prev) => {
      let nextMode = prev.mode;
      let nextRound = prev.round;
      let title = "Timer Finished";

      if (prev.mode === TimerMode.FOCUS) {
        if (prev.round >= settings.rounds) {
          nextMode = TimerMode.LONG_BREAK;
          nextRound = 1; 
          title = "Focus complete! Time for a long break.";
        } else {
          nextMode = TimerMode.SHORT_BREAK;
          title = "Focus complete! Take a short break.";
        }
      } else if (prev.mode === TimerMode.SHORT_BREAK) {
        nextMode = TimerMode.FOCUS;
        nextRound = prev.round + 1;
        title = "Break over! Back to focus.";
      } else if (prev.mode === TimerMode.LONG_BREAK) {
        nextMode = TimerMode.FOCUS;
        nextRound = 1; 
        title = "Long break over! Let's focus.";
      }

      sendNotification("Flomodoro", title);

      return {
        mode: nextMode,
        timeLeft: getDurationForMode(nextMode),
        isActive: false,
        round: nextRound,
      };
    });
  }, [settings, getDurationForMode]);

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.timeLeft <= 0) {
        return prev; // Logic handled in effect
      }
      return { ...prev, timeLeft: prev.timeLeft - 1 };
    });
  }, []);

  useEffect(() => {
    if (state.isActive && state.timeLeft > 0) {
      timerRef.current = window.setInterval(tick, 1000);
    } else if (state.timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      switchMode();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isActive, state.timeLeft, tick, switchMode]);

  const toggleTimer = () => {
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const skipTimer = () => {
    switchMode();
  };

  return {
    state,
    toggleTimer,
    skipTimer,
    currentDuration: getDurationForMode(state.mode),
  };
};