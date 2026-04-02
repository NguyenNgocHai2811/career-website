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
        <div className="size-6 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
          </svg>
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