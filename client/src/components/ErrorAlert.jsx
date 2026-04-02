import React from 'react';

const ErrorAlert = ({
  message,
  title = "Error",
  className = "",
  onClose,
  ...props
}) => {
  if (!message) return null;

  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`} {...props}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="material-symbols-outlined text-red-400">error</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;