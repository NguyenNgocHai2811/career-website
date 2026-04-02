import React from 'react';

const RadioButtonGroup = ({
  options = [],
  selectedValue,
  onChange,
  name,
  className = "",
  optionClassName = "",
  ...props
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`} {...props}>
      {options.map((option) => (
        <label
          key={option.id}
          className={`relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none transition-all ${optionClassName}
            ${selectedValue === option.id
              ? 'border-primary bg-primary/5'
              : 'border-[#d2d5e5] dark:border-white/10 bg-transparent hover:border-primary/50'}`}
        >
          <input
            checked={selectedValue === option.id}
            onChange={() => onChange(option.id)}
            className="sr-only"
            name={name}
            type="radio"
            value={option.id}
          />
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg
                ${selectedValue === option.id
                  ? 'bg-primary text-white'
                  : 'bg-[#d2d5e5] dark:bg-white/10 text-[#545d92] dark:text-white'}`}>
                <span className="material-symbols-outlined text-xl">{option.icon}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0f111a] dark:text-white">{option.title}</p>
                <p className="text-xs text-[#545d92] dark:text-slate-400">{option.description}</p>
              </div>
            </div>
            <div className={selectedValue === option.id ? 'text-primary' : 'text-transparent'}>
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
};

export default RadioButtonGroup;