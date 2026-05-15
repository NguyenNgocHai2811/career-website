const llmExtractor = require('./llmExtractor');
const normalizeSkills = require('./normalizeSkills');
const ruleBasedExtractor = require('./ruleBasedExtractor');

const hasApiKey = () => {
  const provider = (process.env.JOB_SKILL_LLM_PROVIDER || 'deepseek').toLowerCase();

  if (provider === 'deepseek') return Boolean(process.env.DEEPSEEK_API_KEY);
  if (provider === 'gemini') return Boolean(process.env.GEMINI_API_KEY);
  return false;
};

const shouldUseLLM = (ruleBasedSkills, options = {}) => (
  options.useLLM === true
  && process.env.JOB_SKILL_LLM_ENABLED === 'true'
  && hasApiKey()
  && ruleBasedSkills.length < 3
);

const extractJobSkills = async (jobData, options = {}) => {
  let ruleBasedSkills = [];

  try {
    ruleBasedSkills = ruleBasedExtractor(jobData);
  } catch (error) {
    console.error('Rule-based job skill extraction failed:', error);
    return [];
  }

  if (!shouldUseLLM(ruleBasedSkills, options)) {
    return normalizeSkills(ruleBasedSkills);
  }

  try {
    const llmSkills = await llmExtractor(jobData, options);
    return normalizeSkills([...llmSkills, ...ruleBasedSkills]);
  } catch (error) {
    console.error('LLM skill extraction failed:', error);
    return normalizeSkills(ruleBasedSkills);
  }
};

module.exports = {
  extractJobSkills,
  normalizeSkills,
  ruleBasedExtractor,
  shouldUseLLM,
};
