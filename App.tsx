import React, { useState, useEffect } from 'react';
import { MoreVertical, Play, Pause, SkipForward } from 'lucide-react';
import CircularTimer from './components/CircularTimer';
import SettingsModal from './components/SettingsModal';
import { useTimer } from './hooks/useTimer';
import { DEFAULT_SETTINGS, MODE_COLORS } from './constants';
import { TimerSettings } from './types';
import { requestNotificationPermission } from './utils/sound';

function App() {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    // Attempt to load settings from local storage
    const saved = localStorage.getItem('flomodoro-settings');
    // Merge saved settings with defaults to ensure new properties (like darkMode) exist
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { state, toggleTimer, skipTimer, currentDuration } = useTimer(settings);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('flomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply Dark Mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const currentColorClass = MODE_COLORS[state.mode].split(' ')[0]; // text-color
  const bgClass = MODE_COLORS[state.mode].split(' ')[2]; // bg-color (not used for bg, used for buttons)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-500">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
           {/* Simple Logo/Title */}
           <div className={`w-3 h-3 rounded-full ${bgClass.replace('bg-', 'bg-')}`}></div>
           <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Flomodoro</h1>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Settings"
        >
          <MoreVertical size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto relative">
        
        {/* Timer */}
        <div className="mb-12 w-full flex justify-center">
            <CircularTimer 
                timeLeft={state.timeLeft} 
                totalTime={currentDuration} 
                mode={state.mode} 
            />
        </div>

        {/* Rounds Indicator */}
        <div className="absolute top-[15%] md:top-[15%] flex gap-2">
            {Array.from({length: settings.rounds}).map((_, i) => (
                <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        i < state.round 
                        ? 'bg-gray-800 dark:bg-gray-200' 
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                />
            ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Play/Pause - Big Button */}
          <button
            onClick={toggleTimer}
            className={`
                group relative flex items-center justify-center w-24 h-24 rounded-full 
                shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300
                bg-white dark:bg-gray-800
            `}
          >
            {/* Colored background ring on hover */}
            <div className={`absolute inset-0 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${bgClass}`}></div>
            
            {state.isActive ? (
              <Pause className={`w-10 h-10 ${currentColorClass} fill-current`} />
            ) : (
              <Play className={`w-10 h-10 ${currentColorClass} fill-current ml-1`} />
            )}
          </button>
        </div>

        {/* Skip Button */}
        <div className="fixed bottom-8 right-8 md:absolute md:bottom-0 md:right-0 md:relative md:self-end md:mt-[-4rem] md:mr-8">
            <button
                onClick={skipTimer}
                className="p-4 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-800 dark:hover:text-white shadow-lg hover:shadow-xl rounded-2xl active:scale-95 transition-all"
                aria-label="Skip"
            >
                <SkipForward size={24} />
            </button>
        </div>

      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={setSettings}
      />
    </div>
  );
}

export default App;