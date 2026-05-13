const FILTER_VALUES = {
  categories: ['IT', 'Kế toán', 'Bán hàng', 'Marketing', 'Nhân sự', 'Sản xuất', 'Thiết kế'],
  employmentTypes: ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'],
  experience: ['Không yêu cầu', 'Dưới 1 năm', '1-3 năm', '3-5 năm', 'Trên 5 năm'],
  levels: ['Thực tập sinh', 'Nhân viên', 'Trưởng nhóm', 'Quản lý', 'Giám đốc'],
};

const METADATA_FIELDS = [
  'employmentType',
  'location',
  'workMode',
  'salaryMin',
  'salaryMax',
  'salaryCurrency',
  'category',
  'experience',
  'experienceMin',
  'experienceMax',
  'level',
];

const WEAK_DEFAULTS = {
  experience: new Set(['Không yêu cầu']),
  level: new Set(['Nhân viên']),
};

const stripDiacritics = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D');

const normalizeText = (value) => stripDiacritics(value)
  .toLowerCase()
  .replace(/\u2013|\u2014/g, '-')
  .replace(/\s+/g, ' ')
  .trim();

const hasValue = (value) => (
  value !== undefined
  && value !== null
  && String(value).trim() !== ''
);

const toNullableInt = (value) => {
  if (!hasValue(value)) return null;
  const number = Number(String(value).replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(number)) return null;
  return Math.round(number);
};

const canonicalByNormalized = (values) => {
  const map = new Map();
  values.forEach(value => {
    map.set(normalizeText(value), value);
  });
  return map;
};

const categoryByKey = canonicalByNormalized(FILTER_VALUES.categories);
const employmentTypeByKey = canonicalByNormalized(FILTER_VALUES.employmentTypes);
const experienceByKey = canonicalByNormalized(FILTER_VALUES.experience);
const levelByKey = canonicalByNormalized(FILTER_VALUES.levels);

const normalizeFromMap = (value, map, fallback = '') => (
  hasValue(value) ? map.get(normalizeText(value)) || String(value).trim() : fallback
);

const normalizeCategory = (value) => normalizeFromMap(value, categoryByKey);
const normalizeEmploymentType = (value) => normalizeFromMap(value, employmentTypeByKey);
const normalizeExperience = (value) => normalizeFromMap(value, experienceByKey);
const normalizeLevel = (value) => normalizeFromMap(value, levelByKey);

const isWeakDefault = (field, value) => (
  WEAK_DEFAULTS[field]?.has(value) === true
);

const normalizeMetadata = (metadata = {}) => {
  const normalized = {};

  if (hasValue(metadata.employmentType)) {
    normalized.employmentType = normalizeEmploymentType(metadata.employmentType);
  }
  if (hasValue(metadata.location)) {
    normalized.location = String(metadata.location).trim();
  }
  if (hasValue(metadata.workMode)) {
    normalized.workMode = String(metadata.workMode).trim();
  }
  if (hasValue(metadata.category)) {
    normalized.category = normalizeCategory(metadata.category);
  }
  if (hasValue(metadata.experience)) {
    normalized.experience = normalizeExperience(metadata.experience);
  }
  if (hasValue(metadata.level)) {
    normalized.level = normalizeLevel(metadata.level);
  }
  if (hasValue(metadata.salaryCurrency)) {
    normalized.salaryCurrency = String(metadata.salaryCurrency).trim().toUpperCase();
  }

  const salaryMin = toNullableInt(metadata.salaryMin);
  const salaryMax = toNullableInt(metadata.salaryMax);
  const experienceMin = toNullableInt(metadata.experienceMin);
  const experienceMax = toNullableInt(metadata.experienceMax);

  if (salaryMin !== null) normalized.salaryMin = salaryMin;
  if (salaryMax !== null) normalized.salaryMax = salaryMax;
  if (experienceMin !== null) normalized.experienceMin = experienceMin;
  if (experienceMax !== null) normalized.experienceMax = experienceMax;

  return normalized;
};

module.exports = {
  FILTER_VALUES,
  METADATA_FIELDS,
  hasValue,
  isWeakDefault,
  normalizeCategory,
  normalizeEmploymentType,
  normalizeExperience,
  normalizeLevel,
  normalizeMetadata,
  normalizeText,
  stripDiacritics,
  toNullableInt,
};
