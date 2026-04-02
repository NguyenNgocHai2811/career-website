import React from 'react';

const OptionCard = ({
  option,
  isSelected,
  onClick,
  animationDelay = 0,
  showCheckIcon = true,
  className = ""
}) => {
  return (
    <div
      onClick={() => onClick(option.name || option.id)}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between animate-float ${className}
        ${isSelected
          ? 'border-primary bg-primary/10 shadow-soft transform scale-105'
          : `border-transparent ${option.color || 'bg-gray-100'} hover:scale-105 hover:-translate-y-1`}`}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <span className="text-lg font-semibold text-[#0f111a] dark:text-white">
        {option.name || option.text}
      </span>
      {isSelected && showCheckIcon && (
        <span className="material-symbols-outlined text-primary">check_circle</span>
      )}
    </div>
  );
};

export default OptionCard;