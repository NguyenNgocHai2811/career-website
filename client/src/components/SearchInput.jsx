import React from 'react';

const SearchInput = ({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
  inputClassName = "",
  iconClassName = "",
  ...props
}) => {
  return (
    <label className={`flex flex-col w-full ${className}`}>
      <div className="flex w-full items-stretch rounded-xl h-14 shadow-sm border border-black/5 dark:border-white/10 overflow-hidden bg-white dark:bg-gray-800 transition-all focus-within:ring-2 focus-within:ring-primary/40">
        <div className={`text-[#545d92] flex items-center justify-center pl-5 ${iconClassName}`}>
          <span className="material-symbols-outlined text-2xl">search</span>
        </div>
        <input
          type="text"
          className={`form-input flex w-full border-none bg-transparent focus:ring-0 text-[#0f111a] dark:text-white placeholder:text-[#545d92]/60 px-4 text-base font-normal outline-none ${inputClassName}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      </div>
    </label>
  );
};

export default SearchInput;