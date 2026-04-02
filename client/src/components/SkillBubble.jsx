import React from 'react';

const SkillBubble = ({
  skill,
  isSelected,
  onClick,
  animationDelay = 0,
  className = ""
}) => {
  return (
    <div
      onClick={() => onClick(skill.name)}
      className={`skill-bubble animate-float flex min-h-[3.5rem] shrink-0 items-center justify-center gap-x-2 rounded-full px-6 md:px-8 border-2 transition-all duration-300 cursor-pointer ${className}
        ${isSelected
          ? `border-primary bg-primary/10 shadow-[0_10px_15px_-3px_rgba(108,126,225,0.2)] transform scale-110 z-10`
          : `border-transparent ${skill.color} hover:scale-105 hover:-translate-y-1`
        }`}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <p className={`text-[#0f111a] dark:text-white font-semibold ${isSelected ? 'text-lg' : 'text-base'}`}>
        {skill.name}
      </p>
      {isSelected && (
        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
      )}
    </div>
  );
};

export default SkillBubble;