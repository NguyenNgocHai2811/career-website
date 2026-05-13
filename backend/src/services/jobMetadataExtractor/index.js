const ruleBasedExtractor = require('./ruleBasedExtractor');
const {
  METADATA_FIELDS,
  hasValue,
  isWeakDefault,
  normalizeMetadata,
} = require('./normalizeJobMetadata');

const shouldFillField = (field, currentValue, options) => {
  if (!hasValue(currentValue)) return true;
  if (options.explicitFields?.has(field)) return false;
  return options.allowWeakDefaults === true && isWeakDefault(field, currentValue);
};

const mergeJobMetadata = (jobData = {}, options = {}) => {
  const normalizedInput = normalizeMetadata(jobData);
  const extracted = normalizeMetadata(ruleBasedExtractor(jobData));
  const merged = { ...jobData, ...normalizedInput };

  METADATA_FIELDS.forEach(field => {
    if (!hasValue(extracted[field])) return;
    if (shouldFillField(field, merged[field], options)) {
      merged[field] = extracted[field];
    }
  });

  return merged;
};

const valuesDiffer = (left, right) => {
  if (typeof left === 'number' || typeof right === 'number') {
    return Number(left) !== Number(right);
  }
  return String(left || '') !== String(right || '');
};

const buildJobMetadataPatch = (jobData = {}, explicitData = {}) => {
  const explicitFields = new Set(Object.keys(explicitData || {}));
  const merged = mergeJobMetadata(jobData, {
    allowWeakDefaults: true,
    explicitFields,
  });
  const patch = {};

  METADATA_FIELDS.forEach(field => {
    if (!hasValue(merged[field])) return;
    if (explicitFields.has(field)) return;
    if (valuesDiffer(merged[field], jobData[field])) {
      patch[field] = merged[field];
    }
  });

  return patch;
};

module.exports = {
  buildJobMetadataPatch,
  mergeJobMetadata,
  ruleBasedExtractor,
};
