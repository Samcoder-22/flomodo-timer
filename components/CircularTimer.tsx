import React from 'react';
import { CIRCLE_RADIUS, CIRCLE_CIRCUMFERENCE, STROKE_WIDTH, MODE_COLORS, MODE_LABELS } from '../constants';
import { TimerMode } from '../types';

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  mode: TimerMode;
}

const CircularTimer: React.FC<CircularTimerProps> = ({ timeLeft, totalTime, mode }) => {
  // Calculate progress
  const progress = timeLeft / totalTime;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine color class based on mode
  const colorClass = MODE_COLORS[mode].split(' ')[1]; // Extract stroke color class
  const textColorClass = MODE_COLORS[mode].split(' ')[0]; // Extract text color class

  // SVG Size calculation
  const size = (CIRCLE_RADIUS + STROKE_WIDTH) * 2;
  const center = size / 2;

  return (
    <div className="relative flex items-center justify-center w-full max-w-[90vw] md:max-w-[400px] aspect-square mx-auto">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 w-full h-full drop-shadow-xl"
      >
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={CIRCLE_RADIUS}
          fill="transparent"
          stroke="currentColor" 
          className="text-gray-200 dark:text-gray-700 transition-colors duration-300"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress Circle */}
        <circle
          cx={center}
          cy={center}
          r={CIRCLE_RADIUS}
          fill="transparent"
          className={`${colorClass} transition-all duration-1000 ease-linear`}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Centered Text */}
      <div className="absolute flex flex-col items-center justify-center inset-0 pointer-events-none">
        <span className={`text-6xl md:text-8xl font-bold tracking-tight ${textColorClass} tabular-nums`}>
          {formatTime(timeLeft)}
        </span>
        <span className={`mt-2 text-xl md:text-2xl font-semibold text-gray-400 dark:text-gray-500 tracking-wide uppercase`}>
          {MODE_LABELS[mode]}
        </span>
      </div>
    </div>
  );
};

export default CircularTimer;