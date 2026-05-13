const {
  normalizeCategory,
  normalizeEmploymentType,
  normalizeExperience,
  normalizeLevel,
  normalizeText,
} = require('./normalizeJobMetadata');

const CATEGORY_RULES = [
  { value: 'IT', pattern: /\b(it|software|phan mem|developer|engineer|frontend|backend|fullstack|devops|data|qa|tester|lap trinh)\b/ },
  { value: 'Kế toán', pattern: /\b(ke toan|kiem toan|accounting|accountant|finance|tax|thue)\b/ },
  { value: 'Bán hàng', pattern: /\b(ban hang|kinh doanh|sales|account executive|business development|tu van ban hang)\b/ },
  { value: 'Marketing', pattern: /\b(marketing|seo|sem|content|social media|copywriting|performance ads|quang cao)\b/ },
  { value: 'Nhân sự', pattern: /\b(nhan su|hr|human resources|recruiter|recruitment|tuyen dung|hanh chinh)\b/ },
  { value: 'Sản xuất', pattern: /\b(san xuat|manufacturing|production|factory|qa qc|quality control|van hanh may)\b/ },
  { value: 'Thiết kế', pattern: /\b(thiet ke|designer|ui ux|graphic|photoshop|figma|creative)\b/ },
];

const LOCATION_RULES = [
  { value: 'Hà Nội', pattern: /\b(ha noi|hanoi)\b/ },
  { value: 'Hồ Chí Minh', pattern: /\b(ho chi minh|hcm|tphcm|tp hcm|sai gon|saigon)\b/ },
  { value: 'Đà Nẵng', pattern: /\b(da nang|danang)\b/ },
  { value: 'Hải Phòng', pattern: /\b(hai phong|haiphong)\b/ },
  { value: 'Cần Thơ', pattern: /\b(can tho|cantho)\b/ },
  { value: 'Bình Dương', pattern: /\b(binh duong)\b/ },
  { value: 'Đồng Nai', pattern: /\b(dong nai)\b/ },
];

const parseDecimal = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const compact = raw.replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const number = Number(compact.replace(/[^\d.]/g, ''));
  return Number.isFinite(number) ? number : null;
};

const toMillionVnd = (value) => {
  const number = parseDecimal(value);
  if (number === null) return null;
  return Math.round(number * 1000000);
};

const extractSalary = (text) => {
  if (/\b(thoa thuan|negotiable|canh tranh|competitive)\b/.test(text)) {
    return { salaryCurrency: 'VND' };
  }

  const rangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|m)?\s*(?:-|den|to)\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|m)\b/);
  if (rangeMatch) {
    return {
      salaryMin: toMillionVnd(rangeMatch[1]),
      salaryMax: toMillionVnd(rangeMatch[2]),
      salaryCurrency: 'VND',
    };
  }

  const minMatch = text.match(/\b(?:tu|min|from|tren|>=)\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|m)\b/);
  if (minMatch) {
    return {
      salaryMin: toMillionVnd(minMatch[1]),
      salaryCurrency: 'VND',
    };
  }

  const maxMatch = text.match(/\b(?:toi da|max|upto|up to|duoi|<=)\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|m)\b/);
  if (maxMatch) {
    return {
      salaryMax: toMillionVnd(maxMatch[1]),
      salaryCurrency: 'VND',
    };
  }

  const plainMillionMatch = text.match(/\b(\d+(?:[.,]\d+)?)\s*(?:trieu|tr)\b/);
  if (plainMillionMatch) {
    return {
      salaryMin: toMillionVnd(plainMillionMatch[1]),
      salaryCurrency: 'VND',
    };
  }

  return {};
};

const extractExperience = (text) => {
  if (/\b(khong yeu cau kinh nghiem|khong can kinh nghiem|no experience|fresher accepted)\b/.test(text)) {
    return { experience: normalizeExperience('Không yêu cầu'), experienceMin: 0, experienceMax: 0 };
  }

  if (/\b(fresher|entry level|internship|intern|thuc tap)\b/.test(text)) {
    return { experience: normalizeExperience('Dưới 1 năm'), experienceMin: 0, experienceMax: 1 };
  }

  const rangeMatch = text.match(/(\d+)\s*(?:nam|year|years)?\s*(?:-|den|to)\s*(\d+)\s*(?:nam|year|years)/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    return {
      experience: labelForExperience(min, max),
      experienceMin: min,
      experienceMax: max,
    };
  }

  const plusMatch = text.match(/(\d+)\s*\+?\s*(?:nam|year|years)(?:\s*kinh nghiem)?/);
  if (plusMatch) {
    const min = Number(plusMatch[1]);
    const max = min >= 5 ? null : (min < 3 ? 3 : 5);
    return {
      experience: labelForExperience(min, max),
      experienceMin: min,
      ...(max !== null ? { experienceMax: max } : {}),
    };
  }

  return {};
};

const labelForExperience = (min, max) => {
  if (max !== null && max <= 1) return normalizeExperience('Dưới 1 năm');
  if (min < 1) return normalizeExperience('Dưới 1 năm');
  if (min < 3 && (max === null || max <= 3)) return normalizeExperience('1-3 năm');
  if (min < 5 && (max === null || max <= 5)) return normalizeExperience('3-5 năm');
  return normalizeExperience('Trên 5 năm');
};

const extractLevel = (text) => {
  if (/\b(intern|internship|thuc tap|thuc tap sinh)\b/.test(text)) {
    return normalizeLevel('Thực tập sinh');
  }
  if (/\b(team lead|lead|leader|truong nhom|tech lead)\b/.test(text)) {
    return normalizeLevel('Trưởng nhóm');
  }
  if (/\b(manager|quan ly|head of|truong phong)\b/.test(text)) {
    return normalizeLevel('Quản lý');
  }
  if (/\b(director|giam doc|vp|chief|c-level|c level)\b/.test(text)) {
    return normalizeLevel('Giám đốc');
  }
  if (/\b(junior|middle|senior|staff|nhan vien|chuyen vien|developer|engineer|specialist)\b/.test(text)) {
    return normalizeLevel('Nhân viên');
  }
  return '';
};

const extractEmploymentType = (text) => {
  if (/\b(internship|intern|thuc tap|thuc tap sinh)\b/.test(text)) return normalizeEmploymentType('Internship');
  if (/\b(contract|freelance|hop dong|temporary)\b/.test(text)) return normalizeEmploymentType('Contract');
  if (/\b(part time|part-time|ban thoi gian)\b/.test(text)) return normalizeEmploymentType('Part-time');
  if (/\b(remote|work from home|wfh|lam viec tu xa)\b/.test(text)) return normalizeEmploymentType('Remote');
  if (/\b(full time|full-time|toan thoi gian)\b/.test(text)) return normalizeEmploymentType('Full-time');
  return '';
};

const extractWorkMode = (text) => {
  if (/\b(remote|work from home|wfh|lam viec tu xa)\b/.test(text)) return 'Remote';
  if (/\b(hybrid|ket hop|linh hoat)\b/.test(text)) return 'Hybrid';
  if (/\b(on-site|onsite|tai van phong)\b/.test(text)) return 'On-site';
  return '';
};

const extractLocation = (text) => {
  if (/\b(remote|work from home|wfh|lam viec tu xa)\b/.test(text)) return 'Remote';

  const locations = LOCATION_RULES
    .filter(rule => rule.pattern.test(text))
    .map(rule => rule.value);

  return [...new Set(locations)].join(', ');
};

const extractCategory = (text) => {
  const rule = CATEGORY_RULES.find(item => item.pattern.test(text));
  return rule ? normalizeCategory(rule.value) : '';
};

const ruleBasedExtractor = (jobData = {}) => {
  const text = normalizeText([
    jobData.title,
    jobData.description,
    jobData.requirements,
    jobData.benefits,
    jobData.category,
  ].filter(Boolean).join(' '));

  if (!text) return {};

  const experience = extractExperience(text);
  const metadata = {
    ...extractSalary(text),
    ...experience,
  };

  const employmentType = extractEmploymentType(text);
  const workMode = extractWorkMode(text);
  const location = extractLocation(text);
  const category = extractCategory(text);
  const level = extractLevel(text);

  if (employmentType) metadata.employmentType = employmentType;
  if (workMode) metadata.workMode = workMode;
  if (location) metadata.location = location;
  if (category) metadata.category = category;
  if (level) metadata.level = level;

  return metadata;
};

module.exports = ruleBasedExtractor;
