import React from 'react';

interface SettingsInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  colorClass: string; // Tailwind class for color (e.g. text-orange-500)
}

const SettingsInput: React.FC<SettingsInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  colorClass,
}) => {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex justify-between items-center">
        <label className={`font-bold text-lg ${colorClass}`}>{label}</label>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1 font-mono font-bold text-gray-700 dark:text-gray-200 transition-colors">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) onChange(Math.max(min, Math.min(max, val)));
            }}
            className="bg-transparent w-12 text-right outline-none"
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-current ${colorClass.replace('text-', 'accent-')}`}
      />
    </div>
  );
};

export default SettingsInput;