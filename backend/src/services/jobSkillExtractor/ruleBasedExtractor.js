const { categoryFallbacks, skillCatalog } = require('./skillCatalog');
const normalizeSkills = require('./normalizeSkills');
const { stripDiacritics } = require('./normalizeSkills');

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeSearchText = (value) => stripDiacritics(value)
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

const containsAlias = (text, alias) => {
  const normalizedText = normalizeSearchText(text);
  const normalizedAlias = normalizeSearchText(alias);
  if (!normalizedText || !normalizedAlias) return false;

  const tokenChars = normalizedAlias.length <= 2 ? 'a-z0-9+#.' : 'a-z0-9+#';
  const pattern = new RegExp(`(^|[^${tokenChars}])${escapeRegExp(normalizedAlias)}(?=$|[^${tokenChars}])`, 'i');
  return pattern.test(normalizedText);
};

const parseSkillHints = (input) => {
  if (!input) return [];
  const rawSkills = Array.isArray(input)
    ? input
    : String(input).split(',');

  return rawSkills
    .map(skill => {
      if (typeof skill === 'string') return skill.trim();
      if (skill?.name) return String(skill.name).trim();
      return '';
    })
    .filter(Boolean);
};

const addSkill = (skills, name, source, importance, confidence, weight) => {
  skills.push({ name, source, importance, confidence, weight });
};

const addImpliedSkills = (skills, skill, source, importance, confidence, weight) => {
  (skill.implies || []).forEach(name => {
    addSkill(
      skills,
      name,
      source,
      importance === 'required' ? 'preferred' : importance,
      Math.max(confidence - 0.2, 0.5),
      Math.max(weight - 2, 1)
    );
  });
};

const detectCatalogSkill = (skill, fields) => {
  const aliases = [skill.name, ...(skill.aliases || [])];

  if (aliases.some(alias => containsAlias(fields.requirements, alias))) {
    return { source: 'description', importance: 'required', confidence: 0.95, weight: 5 };
  }

  if (aliases.some(alias => containsAlias(fields.description, alias))) {
    return { source: 'description', importance: 'general', confidence: 0.9, weight: 4 };
  }

  if (aliases.some(alias => containsAlias(fields.benefits, alias))) {
    return { source: 'description', importance: 'preferred', confidence: 0.78, weight: 3 };
  }

  if (
    skill.title?.test(fields.title)
    || aliases.some(alias => containsAlias(fields.title, alias))
  ) {
    return { source: 'title', importance: 'general', confidence: 0.72, weight: 3 };
  }

  return null;
};

const addCategoryFallbacks = (skills, categoryText) => {
  const normalizedCategory = normalizeSearchText(categoryText);
  const fallback = categoryFallbacks.find(item => item.pattern.test(normalizedCategory));

  if (fallback) {
    fallback.skills.forEach(name => {
      addSkill(skills, name, 'category', 'general', 0.55, 1);
    });
  }
};

const ruleBasedExtractor = (jobData = {}) => {
  const skills = [];
  const manualSkillHints = [
    ...parseSkillHints(jobData.skills),
    ...parseSkillHints(jobData.requiredSkills),
    ...parseSkillHints(jobData.skillHints),
  ];

  manualSkillHints.forEach(name => {
    addSkill(skills, name, 'manual', 'required', 1, 5);
  });

  const fields = {
    title: String(jobData.title || ''),
    description: String(jobData.description || ''),
    requirements: String(jobData.requirements || ''),
    benefits: String(jobData.benefits || ''),
  };

  skillCatalog.forEach(skill => {
    const detection = detectCatalogSkill(skill, fields);
    if (!detection) return;

    addSkill(
      skills,
      skill.name,
      detection.source,
      detection.importance,
      detection.confidence,
      detection.weight
    );
    addImpliedSkills(
      skills,
      skill,
      detection.source,
      detection.importance,
      detection.confidence,
      detection.weight
    );
  });

  const enoughSpecificSkills = normalizeSkills(skills)
    .filter(skill => skill.source !== 'category')
    .length >= 3;

  if (!enoughSpecificSkills) {
    addCategoryFallbacks(skills, `${jobData.category || ''} ${jobData.title || ''}`);
  }

  return normalizeSkills(skills).slice(0, 12);
};

module.exports = ruleBasedExtractor;
