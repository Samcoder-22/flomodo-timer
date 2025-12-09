import { TimerMode, TimerSettings } from './types';

export const MODE_COLORS = {
  [TimerMode.FOCUS]: 'text-focus stroke-focus bg-focus',
  [TimerMode.SHORT_BREAK]: 'text-shortBreak stroke-shortBreak bg-shortBreak',
  [TimerMode.LONG_BREAK]: 'text-longBreak stroke-longBreak bg-longBreak',
};

export const MODE_LABELS = {
  [TimerMode.FOCUS]: 'Focus',
  [TimerMode.SHORT_BREAK]: 'Short Break',
  [TimerMode.LONG_BREAK]: 'Long Break',
};

export const CIRCLE_RADIUS = 120;
export const STROKE_WIDTH = 12;
export const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  rounds: 4,
  darkMode: false,
};