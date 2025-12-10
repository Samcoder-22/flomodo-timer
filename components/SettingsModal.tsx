import React from 'react';
import { X, Moon, Sun } from 'lucide-react';
import { TimerSettings } from '../types';
import SettingsInput from './SettingsInput';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TimerSettings;
  updateSettings: (newSettings: TimerSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
}) => {
  if (!isOpen) return null;

  const handleChange = <K extends keyof TimerSettings>(key: K, value: any) => {
    updateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          {/* Dark Mode Toggle */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="font-bold text-lg text-gray-800 dark:text-gray-200">Dark Mode</span>
            </div>
            <button
              onClick={() => handleChange('darkMode', !settings.darkMode)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out ${settings.darkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}
            >
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <SettingsInput
            label="Focus Duration"
            value={settings.focusDuration}
            min={1}
            max={60}
            onChange={(v) => handleChange('focusDuration', v)}
            colorClass="text-focus"
          />
          <SettingsInput
            label="Short Break"
            value={settings.shortBreakDuration}
            min={1}
            max={30}
            onChange={(v) => handleChange('shortBreakDuration', v)}
            colorClass="text-shortBreak"
          />
          <SettingsInput
            label="Long Break"
            value={settings.longBreakDuration}
            min={1}
            max={60}
            onChange={(v) => handleChange('longBreakDuration', v)}
            colorClass="text-longBreak"
          />
          <SettingsInput
            label="Rounds"
            value={settings.rounds}
            min={1}
            max={12}
            onChange={(v) => handleChange('rounds', v)}
            colorClass="text-rounds"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl active:scale-[0.98] transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;