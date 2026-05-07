import React from 'react';

const OptionChips = ({ options, onSelect, disabled }) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 ml-12">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="px-4 py-2 rounded-full border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 hover:bg-gradient-to-r hover:from-violet-500 hover:to-purple-600 hover:text-white hover:border-transparent text-violet-700 dark:text-violet-300 text-sm font-semibold transition-all duration-200 hover:shadow-md hover:shadow-violet-500/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default OptionChips;
