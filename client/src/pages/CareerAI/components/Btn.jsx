import React from 'react';

/**
 * Btn — Shared button cho Career Explorer.
 * primary=true → tone xanh project (#6C7EE1).
 */
const Btn = ({ children, primary = false, disabled = false, onClick, type = 'button' }) => {
  const base =
    'px-7 py-3 rounded-full text-[15px] font-semibold transition-all duration-150 select-none';

  let style = '';
  if (disabled) {
    style = 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none';
  } else if (primary) {
    style =
      'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/30 active:scale-[0.98]';
  } else {
    style =
      'bg-white text-slate-700 border border-gray-200 hover:bg-gray-50 shadow-sm active:scale-[0.98]';
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${style}`}>
      {children}
    </button>
  );
};

export default Btn;
