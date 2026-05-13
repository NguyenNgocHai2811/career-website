const { skillCatalog } = require('./skillCatalog');

const ALLOWED_SOURCES = new Set(['manual', 'description', 'title', 'category', 'llm']);
const ALLOWED_IMPORTANCE = new Set(['required', 'preferred', 'general']);
const SOURCE_PRIORITY = {
  manual: 5,
  description: 4,
  llm: 3,
  title: 2,
  category: 1,
};

const DEFAULT_CONFIDENCE = {
  manual: 1,
  description: 0.88,
  llm: 0.78,
  title: 0.72,
  category: 0.55,
};

const stripDiacritics = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D');

const skillKey = (value) => stripDiacritics(value)
  .toLowerCase()
  .replace(/[._/-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const aliasToName = new Map();

skillCatalog.forEach(skill => {
  [skill.name, ...(skill.aliases || [])].forEach(alias => {
    aliasToName.set(skillKey(alias), skill.name);
  });
});

const canonicalName = (value) => {
  const name = String(value || '').trim().replace(/\s+/g, ' ');
  return aliasToName.get(skillKey(name)) || name;
};

const defaultWeight = (source, importance) => {
  if (source === 'manual') return 5;
  if (source === 'category') return 1;
  if (source === 'title') return 3;
  if (source === 'llm') return importance === 'preferred' ? 3 : 5;
  if (importance === 'required') return 5;
  if (importance === 'preferred') return 3;
  return 4;
};

const normalizeSource = (source) => (
  ALLOWED_SOURCES.has(source) ? source : 'description'
);

const normalizeImportance = (importance, source) => {
  if (ALLOWED_IMPORTANCE.has(importance)) return importance;
  if (source === 'manual') return 'required';
  if (source === 'category' || source === 'title') return 'general';
  return 'general';
};

const clampConfidence = (value, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, 0), 1);
};

const normalizeRecord = (skill) => {
  const rawName = typeof skill === 'string' ? skill : skill?.name;
  const name = canonicalName(rawName);
  if (!name) return null;

  const source = normalizeSource(skill?.source);
  const importance = normalizeImportance(skill?.importance, source);
  const confidence = clampConfidence(skill?.confidence, DEFAULT_CONFIDENCE[source]);
  const parsedWeight = Number(skill?.weight);
  const weight = Number.isFinite(parsedWeight)
    ? parsedWeight
    : defaultWeight(source, importance);

  return {
    name,
    source,
    importance,
    confidence,
    weight,
  };
};

const compareStrength = (left, right) => {
  if (left.weight !== right.weight) return left.weight - right.weight;
  if (SOURCE_PRIORITY[left.source] !== SOURCE_PRIORITY[right.source]) {
    return SOURCE_PRIORITY[left.source] - SOURCE_PRIORITY[right.source];
  }
  if (left.confidence !== right.confidence) return left.confidence - right.confidence;
  return 0;
};

const normalizeSkills = (skills) => {
  const records = Array.isArray(skills) ? skills : [];
  const byName = new Map();

  records
    .map(normalizeRecord)
    .filter(Boolean)
    .forEach(record => {
      const key = skillKey(record.name);
      const existing = byName.get(key);
      if (!existing || compareStrength(record, existing) > 0) {
        byName.set(key, record);
      }
    });

  return Array.from(byName.values())
    .sort((left, right) => compareStrength(right, left));
};

module.exports = normalizeSkills;
module.exports.canonicalName = canonicalName;
module.exports.skillKey = skillKey;
module.exports.stripDiacritics = stripDiacritics;
