import React, { useState } from 'react';
import { OptionCard, SkillBubble, BackgroundBlobs, ProgressBar, SearchInput } from '../../components';

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


  // Can proceed logic
  let canProceed = false;
  if (currentStep === 1 && employmentType) canProceed = true;
  if (currentStep === 2 && selectedSkills) canProceed = true;
  if (currentStep === 3 && workingStyle) canProceed = true;
  if (currentStep === 4 && careerLevel) canProceed = true;
  if (currentStep === 5 && companyCulture) canProceed = true;


  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-content-slide-up relative">
            <BackgroundBlobs />
            <h1 className="text-[#0f111a] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center pb-3">
              What is your preferred employment type?
            </h1>
            <p className="text-[#4a4a4e] dark:text-gray-400 text-lg font-normal leading-relaxed text-center mb-8">
              Select the option that best fits your current goals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[
                { name: 'Full-time', color: 'bg-secondary/20', borderColor: 'border-secondary' },
                { name: 'Part-time', color: 'bg-pastel-peach/30', borderColor: 'border-pastel-peach' },
                { name: 'Remote', color: 'bg-pastel-pink/20', borderColor: 'border-pastel-pink' },
                { name: 'Freelance', color: 'bg-pastel-lavender/20', borderColor: 'border-pastel-lavender' }
              ].map((type, index) => (
                <OptionCard
                  key={type.name}
                  option={type}
                  isSelected={employmentType === type.name}
                  onClick={setEmploymentType}
                  animationDelay={index * 0.2}
                />
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
              <SearchInput
                placeholder="Search and add more skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />
            </div>

            <div className="relative w-full min-h-[400px] flex flex-wrap justify-center items-center gap-4 md:gap-6 p-4 md:p-10 mt-6 pb-32">
              <BackgroundBlobs />
              {allSkills.filter(s => s.name.toLowerCase().includes(skillSearch.toLowerCase())).map((skill, index) => (
                <SkillBubble
                  key={skill.name}
                  skill={skill}
                  isSelected={selectedSkills.includes(skill.name)}
                  onClick={toggleSkill}
                  animationDelay={(index % 5) * 0.3}
                />
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-content-slide-up relative">
            <BackgroundBlobs />
            <h1 className="text-[#0f111a] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center pb-3">
              What is your ideal working style?
            </h1>
            <p className="text-[#4a4a4e] dark:text-gray-400 text-lg font-normal leading-relaxed text-center mb-8">
              Help us find the environment where you'll thrive.
            </p>
            <div className="flex flex-col gap-4 w-full">
              {[
                { id: 'A', text: 'Prefer clear and stable processes', color: 'bg-secondary/20', borderColor: 'border-secondary' },
                { id: 'B', text: 'Thrive in a fast-paced, flexible environment with new challenges', color: 'bg-pastel-peach/30', borderColor: 'border-pastel-peach' },
                { id: 'C', text: 'Value autonomy and independent work', color: 'bg-pastel-pink/20', borderColor: 'border-pastel-pink' }
              ].map((style, index) => (
                <div
                  key={style.id}
                  onClick={() => setWorkingStyle(style.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 animate-float
                    ${workingStyle === style.id
                      ? 'border-primary bg-primary/10 shadow-soft transform scale-[1.02]'
                      : `border-transparent ${style.color} hover:scale-105 hover:-translate-y-1`}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
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
           <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-content-slide-up relative">
            <BackgroundBlobs />
            <h1 className="text-[#0f111a] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center pb-3">
              What is your current career level?
            </h1>
             <p className="text-[#4a4a4e] dark:text-gray-400 text-lg font-normal leading-relaxed text-center mb-8">
              This helps us match you with appropriate opportunities.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {[
                { name: 'Entry-level', color: 'bg-secondary/20', borderColor: 'border-secondary' },
                { name: 'Mid-level', color: 'bg-pastel-peach/30', borderColor: 'border-pastel-peach' },
                { name: 'Senior', color: 'bg-pastel-pink/20', borderColor: 'border-pastel-pink' },
                { name: 'Lead/Manager', color: 'bg-pastel-lavender/20', borderColor: 'border-pastel-lavender' },
                { name: 'Executive', color: 'bg-secondary/20', borderColor: 'border-secondary' }
              ].map((level, index) => (
                <div
                  key={level.name}
                  onClick={() => setCareerLevel(level.name)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center animate-float
                    ${careerLevel === level.name
                      ? 'border-primary bg-primary/10 shadow-soft font-bold'
                      : `border-transparent ${level.color} hover:scale-105 hover:-translate-y-1`}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <span className="text-lg text-[#0f111a] dark:text-white">{level.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center animate-content-slide-up relative">
            <BackgroundBlobs />
            <h1 className="text-[#0f111a] dark:text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight text-center pb-3">
              What kind of company culture do you prefer?
            </h1>
            <p className="text-[#4a4a4e] dark:text-gray-400 text-lg font-normal leading-relaxed text-center mb-8">
              Select the culture that aligns with your values.
            </p>
            <div className="flex flex-wrap justify-center gap-4 w-full">
              {[
                { name: 'Startup', color: 'bg-secondary/20', borderColor: 'border-secondary' },
                { name: 'Corporate', color: 'bg-pastel-peach/30', borderColor: 'border-pastel-peach' },
                { name: 'Agency', color: 'bg-pastel-pink/20', borderColor: 'border-pastel-pink' },
                { name: 'Non-profit', color: 'bg-pastel-lavender/20', borderColor: 'border-pastel-lavender' },
                { name: 'Innovation-driven', color: 'bg-secondary/20', borderColor: 'border-secondary' },
                { name: 'Work-life balance', color: 'bg-pastel-peach/30', borderColor: 'border-pastel-peach' }
              ].map((culture, index) => (
                <div
                  key={culture.name}
                  onClick={() => setCompanyCulture(culture.name)}
                  className={`px-8 py-4 rounded-full border-2 cursor-pointer transition-all duration-300 animate-float
                    ${companyCulture === culture.name
                      ? 'border-primary bg-primary text-white shadow-lg transform scale-110'
                      : `border-transparent ${culture.color} hover:scale-105 hover:-translate-y-1 text-[#0f111a] dark:text-white`}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <span className="text-lg font-medium">{culture.name}</span>
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
          <ProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
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
