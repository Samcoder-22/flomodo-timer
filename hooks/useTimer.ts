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
        
        // If the timer was running when saved, check if it should still be running or finished
        if (parsed.isActive && parsed.endTime) {
            const now = Date.now();
            const left = Math.ceil((parsed.endTime - now) / 1000);
            
            if (left > 0) {
                // Timer is still running, sync timeLeft
                return { ...parsed, timeLeft: left };
            } else {
                // Timer finished while app was closed. 
                // We return timeLeft: 0 so the effect triggers the switchMode logic immediately.
                return { ...parsed, timeLeft: 0 };
            }
        }
        
        return { ...parsed, isActive: false, endTime: null };
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    
    return {
      mode: TimerMode.FOCUS,
      timeLeft: settings.focusDuration * 60,
      isActive: false,
      round: 1,
      endTime: null,
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

  // Update timer when settings change, but NOT when active
  useEffect(() => {
    if (!state.isActive) {
      setState(prev => ({
        ...prev,
        timeLeft: getDurationForMode(prev.mode),
        endTime: null, // Ensure clean state
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
        endTime: null,
      };
    });
  }, [settings, getDurationForMode]);

  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev.isActive || !prev.endTime) return prev;

      const now = Date.now();
      const secondsLeft = Math.ceil((prev.endTime - now) / 1000);

      // If we are finished or past finished
      if (secondsLeft <= 0) {
        return { ...prev, timeLeft: 0 };
      }

      // Only update if the second has actually changed to avoid unnecessary renders
      if (secondsLeft !== prev.timeLeft) {
        return { ...prev, timeLeft: secondsLeft };
      }
      
      return prev;
    });
  }, []);

  useEffect(() => {
    if (state.isActive && state.timeLeft > 0) {
        // We use a shorter interval (250ms) to ensure the UI updates close to the actual second change
        // This makes the timer feel more responsive and less prone to "skipping" a visual second
        timerRef.current = window.setInterval(tick, 250);
    } else if (state.timeLeft === 0) {
      // Handle completion
      if (timerRef.current) clearInterval(timerRef.current);
      // Small delay to ensure the user sees "00:00" briefly before switching? 
      // Or switch immediately. Let's switch immediately to avoid "stuck at 0" confusion.
      switchMode();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isActive, state.timeLeft, tick, switchMode]);

  const toggleTimer = useCallback(() => {
    setState(prev => {
        const now = Date.now();
        
        if (prev.isActive) {
            // Pausing: Calculate exact remaining time and clear endTime
            // We trust the timeLeft from the last tick OR recalculate for precision
            const remaining = prev.endTime 
                ? Math.max(0, Math.ceil((prev.endTime - now) / 1000))
                : prev.timeLeft;

            return { 
                ...prev, 
                isActive: false, 
                timeLeft: remaining,
                endTime: null 
            };
        } else {
            // Playing: Calculate new endTime based on current timeLeft
            const newEndTime = now + (prev.timeLeft * 1000);
            return { 
                ...prev, 
                isActive: true, 
                endTime: newEndTime 
            };
        }
    });
  }, []);

  const skipTimer = useCallback(() => {
    switchMode();
  }, [switchMode]);

  return {
    state,
    toggleTimer,
    skipTimer,
    currentDuration: getDurationForMode(state.mode),
  };
};
