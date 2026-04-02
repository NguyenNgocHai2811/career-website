import React from 'react';

const ProgressBar = ({
  currentStep,
  totalSteps,
  className = "",
  showPercentage = true,
  showStepText = true,
  ...props
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const stepText = `Step ${currentStep} of ${totalSteps}`;

  return (
    <div className={`w-full max-w-md ${className}`} {...props}>
      <div className="flex justify-between items-center mb-3 px-2">
        {showStepText && (
          <span className="text-sm font-semibold text-[#545d92]">{stepText}</span>
        )}
        {showPercentage && (
          <span className="text-sm font-bold text-primary">{percentage}%</span>
        )}
      </div>
      <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(108,126,225,0.4)] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;