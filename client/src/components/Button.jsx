import React from 'react';

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  icon,
  iconPosition = "left",
  ...props
}) => {
  const baseClasses = "group relative flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark hover:scale-[1.01] focus-visible:outline-primary",
    secondary: "bg-white dark:bg-gray-800 text-[#0f111a] dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-primary hover:scale-[1.01]",
    outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white hover:scale-[1.01]",
    ghost: "bg-transparent text-[#0f111a] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.01]"
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg"
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin mr-2">
            <span className="material-symbols-outlined text-sm">refresh</span>
          </span>
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="material-symbols-outlined mr-2 text-sm transition-transform duration-200 group-hover:translate-x-1">
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="material-symbols-outlined ml-2 text-sm transition-transform duration-200 group-hover:translate-x-1">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;