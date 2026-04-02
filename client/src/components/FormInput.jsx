import React from 'react';

const FormInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  icon,
  className = "",
  labelClassName = "",
  inputClassName = "",
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`text-xs font-bold uppercase tracking-wider text-primary-dark/70 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`form-input transition-all duration-200 ease-in-out block w-full rounded-[10px] border-0 bg-slate-50/50 py-3.5 pl-4 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-white hover:ring-primary/40 sm:text-sm sm:leading-6 outline-none ${inputClassName}`}
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-primary/60 group-focus-within:text-primary transition-colors">
          {showPasswordToggle ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pointer-events-auto hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          ) : icon ? (
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FormInput;