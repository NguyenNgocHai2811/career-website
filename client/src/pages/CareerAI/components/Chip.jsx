import React from 'react';

/**
 * Chip — variants: green | blue | outline | small | removable
 */
const Chip = ({
  children,
  green = false,
  blue = false,
  outline = false,
  small = false,
  removable = false,
  onClick,
}) => {
  const padding = small ? 'px-3 py-1' : 'px-3.5 py-2';
  const fontSize = small ? 'text-xs' : 'text-sm';

  let theme = 'bg-gray-100 text-slate-700';
  if (green) theme = 'bg-green-500 text-white';
  else if (blue) theme = 'bg-primary/10 text-primary';
  else if (outline) theme = 'bg-transparent text-slate-500 border-2 border-dashed border-gray-300';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} ${fontSize} ${theme} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
    >
      {children}
      {removable && <span className="ml-0.5 opacity-70">×</span>}
    </span>
  );
};

export default Chip;
