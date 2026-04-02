import React, { useState } from 'react';

const Onboarding = () => {
  // State for step tracking (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Screen 1 State
  const [employmentType, setEmploymentType] = useState('');

  // Screen 2 State (Skills)
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const allSkills = [
    { name: 'React', color: 'bg-secondary/20', borderColor: 'border-secondary' },
    { name: 'UI/UX', color: 'bg-pastel-peach/30', borderColor: 'border-pastel-peach' },
    { name: 'Python', color: 'bg-pastel-pink/20', borderColor: 'border-pastel-pink' },
    { name: 'Java', color: 'bg-pastel-lavender/20', borderColor: 'border-pastel-lavender' },
    { name: 'Project Management', color: 'bg-secondary/20', borderColor: 'border-secondary' },
    { name: 'Data Science', color: 'bg-pastel-peach/30', borderColor: 'border-pastel-peach' },
    { name: 'Figma', color: 'bg-pastel-pink/20', borderColor: 'border-pastel-pink' },
    { name: 'Node.js', color: 'bg-pastel-lavender/20', borderColor: 'border-pastel-lavender' },
    { name: 'Marketing', color: 'bg-secondary/20', borderColor: 'border-secondary' },
    { name: 'SEO', color: 'bg-pastel-peach/20', borderColor: 'border-pastel-peach' },
    { name: 'TypeScript', color: 'bg-pastel-pink/20', borderColor: 'border-pastel-pink' },
    { name: 'Swift', color: 'bg-pastel-lavender/20', borderColor: 'border-pastel-lavender' },
  ];

  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  // Screen 3 State
  const [workingStyle, setWorkingStyle] = useState('');

  // Screen 4 State
  const [careerLevel, setCareerLevel] = useState('');

  // Screen 5 State
  const [companyCulture, setCompanyCulture] = useState('');

  // Progress percentage (custom logic for step 2)
  let displayProgress = (currentStep / totalSteps) * 100;
  let progressText = `Step ${currentStep} of ${totalSteps}`;

  if (currentStep === 2) {
    displayProgress = Math.min((selectedSkills.length / 5) * 100, 100);
    progressText = `${selectedSkills.length} of 5 skills selected`;
  }

  // Can proceed logic
  let canProceed = false;
  if (currentStep === 1 && employmentType) canProceed = true;
  if (currentStep === 2 && selectedSkills.length >= 5) canProceed = true;
  if (currentStep === 3 && workingStyle) canProceed = true;
  if (currentStep === 4 && careerLevel) canProceed = true;
  if (currentStep === 5 && companyCulture) canProceed = true;


  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-content-slide-up">
            <h1 className="text-[#0f111a] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center pb-3">
              What is your preferred employment type?
            </h1>
            <p className="text-[#4a4a4e] dark:text-gray-400 text-lg font-normal leading-relaxed text-center mb-8">
              Select the option that best fits your current goals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {['Full-time', 'Part-time', 'Remote', 'Freelance'].map((type) => (
                <div
                  key={type}
                  onClick={() => setEmploymentType(type)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between
                    ${employmentType === type
                      ? 'border-primary bg-primary/5 shadow-soft transform scale-105'
                      : 'border-black/5 dark:border-white/10 hover:border-primary/50 bg-white dark:bg-gray-800'}`}
                >
                  <span className="text-lg font-semibold text-[#0f111a] dark:text-white">{type}</span>
                  {employmentType === type && (
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full flex flex-col items-center animate-content-slide-up">
            <h1 className="text-[#0f111a] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center pb-3">
              What are your core strengths?
            </h1>
            <p className="text-[#4a4a4e] dark:text-gray-400 text-lg font-normal leading-relaxed text-center max-w-2xl px-4">
              Select at least 5 skills to personalize your career feed and connect with the right mentors.
            </p>

            <div className="w-full max-w-xl mt-8 px-4">
              <label className="flex flex-col w-full">
                <div className="flex w-full items-stretch rounded-xl h-14 shadow-sm border border-black/5 dark:border-white/10 overflow-hidden bg-white dark:bg-gray-800 transition-all focus-within:ring-2 focus-within:ring-primary/40">
                  <div className="text-[#545d92] flex items-center justify-center pl-5">
                    <span className="material-symbols-outlined text-2xl">search</span>
                  </div>
                  <input
                    className="form-input flex w-full border-none bg-transparent focus:ring-0 text-[#0f111a] dark:text-white placeholder:text-[#545d92]/60 px-4 text-base font-normal outline-none"
                    placeholder="Search and add more skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div className="relative w-full min-h-[400px] flex flex-wrap justify-center items-center gap-4 md:gap-6 p-4 md:p-10 mt-6 pb-32">
              {/* Floating Background Blobs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-pastel-pink/10 rounded-full blur-3xl"></div>
              </div>

              {allSkills.filter(s => s.name.toLowerCase().includes(skillSearch.toLowerCase())).map((skill, index) => {
                const isSelected = selectedSkills.includes(skill.name);
                // Varying sizes based on text length roughly, or randomly if preferred. Here we just use a base style.
                // In a real scenario we could use the predefined classes from HTML.
                return (
                  <div
                    key={skill.name}
                    onClick={() => toggleSkill(skill.name)}
                    className={`skill-bubble animate-float flex min-h-[3.5rem] shrink-0 items-center justify-center gap-x-2 rounded-full px-6 md:px-8 border-2 transition-all duration-300 cursor-pointer
                      ${isSelected
                        ? `border-primary bg-primary/10 shadow-[0_10px_15px_-3px_rgba(108,126,225,0.2)] transform scale-110 z-10`
                        : `border-transparent ${skill.color} hover:scale-105 hover:-translate-y-1`
                      }`}
                    style={{ animationDelay: `${(index % 5) * 0.3}s` }}
                  >
                    <p className={`text-[#0f111a] dark:text-white font-semibold ${isSelected ? 'text-lg' : 'text-base'}`}>
                      {skill.name}
                    </p>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-content-slide-up">
            <h1 className="text-[#0f111a] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center pb-3">
              What is your ideal working style?
            </h1>
            <p className="text-[#4a4a4e] dark:text-gray-400 text-lg font-normal leading-relaxed text-center mb-8">
              Help us find the environment where you'll thrive.
            </p>
            <div className="flex flex-col gap-4 w-full">
              {[
                { id: 'A', text: 'Prefer clear and stable processes' },
                { id: 'B', text: 'Thrive in a fast-paced, flexible environment with new challenges' },
                { id: 'C', text: 'Value autonomy and independent work' }
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => setWorkingStyle(style.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4
                    ${workingStyle === style.id
                      ? 'border-primary bg-primary/5 shadow-soft transform scale-[1.02]'
                      : 'border-black/5 dark:border-white/10 hover:border-primary/50 bg-white dark:bg-gray-800'}`}
                >
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${workingStyle === style.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {style.id}
                   </div>
                  <span className="text-lg font-medium text-[#0f111a] dark:text-white">{style.text}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
           <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-content-slide-up">
            <h1 className="text-[#0f111a] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center pb-3">
              What is your current career level?
            </h1>
             <p className="text-[#4a4a4e] dark:text-gray-400 text-lg font-normal leading-relaxed text-center mb-8">
              This helps us match you with appropriate opportunities.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {['Entry-level', 'Mid-level', 'Senior', 'Lead/Manager', 'Executive'].map((level) => (
                <div
                  key={level}
                  onClick={() => setCareerLevel(level)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center
                    ${careerLevel === level
                      ? 'border-primary bg-primary/10 shadow-soft font-bold'
                      : 'border-black/5 dark:border-white/10 hover:border-primary/50 bg-white dark:bg-gray-800'}`}
                >
                  <span className="text-lg text-[#0f111a] dark:text-white">{level}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center animate-content-slide-up">
            <h1 className="text-[#0f111a] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center pb-3">
              What kind of company culture do you prefer?
            </h1>
            <p className="text-[#4a4a4e] dark:text-gray-400 text-lg font-normal leading-relaxed text-center mb-8">
              Select the culture that aligns with your values.
            </p>
            <div className="flex flex-wrap justify-center gap-4 w-full">
              {['Startup', 'Corporate', 'Agency', 'Non-profit', 'Innovation-driven', 'Work-life balance'].map((culture) => (
                <div
                  key={culture}
                  onClick={() => setCompanyCulture(culture)}
                  className={`px-8 py-4 rounded-full border-2 cursor-pointer transition-all duration-300
                    ${companyCulture === culture
                      ? 'border-primary bg-primary text-white shadow-lg transform scale-110'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary bg-white dark:bg-gray-800 text-[#0f111a] dark:text-white hover:scale-105'}`}
                >
                  <span className="text-lg font-medium">{culture}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col overflow-x-hidden relative">
      {/* TopNavBar Component */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-black/5 px-6 md:px-20 py-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-[#0f111a] dark:text-white text-xl font-bold leading-tight tracking-tight">Korra</h2>
        </div>
        <button className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:text-white text-[#0f111a] text-sm font-semibold transition-colors">
          <span className="truncate">Skip for now</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start max-w-5xl mx-auto w-full px-6 py-10 md:py-16 pb-48">
        {renderStepContent()}
      </main>

      {/* Progress Indicator Component - Fixed at bottom above footer */}
      <div className="fixed bottom-[120px] left-0 right-0 flex justify-center z-40 px-6 pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto">
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="text-sm font-semibold text-[#545d92]">{progressText}</span>
            <span className="text-sm font-bold text-primary">{Math.round(displayProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(108,126,225,0.4)] transition-all duration-500"
              style={{ width: `${displayProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-black/5 flex justify-center z-50">
        <button
          className={`w-full max-w-lg flex items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-8 text-lg font-bold transition-all shadow-lg
            ${canProceed
              ? 'bg-primary text-white cursor-pointer hover:bg-primary-dark card-hover-effect'
              : 'bg-primary/40 text-white/50 cursor-not-allowed'
            }`}
          disabled={!canProceed}
          onClick={() => {
            if (canProceed && currentStep < totalSteps) {
              setCurrentStep(currentStep + 1);
            } else if (canProceed && currentStep === totalSteps) {
              // Handle completion (e.g., redirect)
              window.location.href = '/';
            }
          }}
        >
          <span>{currentStep === totalSteps ? 'Finish Setup' : 'Continue'}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};

export default Onboarding;
