export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  rounds: number;
  darkMode: boolean;
}

export interface TimerState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  isActive: boolean;
  round: number;
}