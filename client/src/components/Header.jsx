import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({
  logoText = "Korra",
  rightElement,
  className = "",
  ...props
}) => {
  return (
    <header className={`flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e8eaf2] dark:border-b-white/10 px-10 py-3 bg-white/70 dark:bg-background-dark/70 backdrop-blur-md sticky top-0 z-50 ${className}`} {...props}>
      <div className="flex items-center gap-4 text-[#0f111a] dark:text-white">
        <div className="flex items-center justify-center size-8 rounded-xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-2xl">diamond</span>
        </div>
        <h2 className="text-[#0f111a] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          {logoText}
        </h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        {rightElement}
      </div>
    </header>
  );
};

export default Header;