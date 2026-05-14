const { driver } = require('../config/neo4j');

const toNumber = (value) => {
  if (value == null) return 0;
  if (typeof value.toNumber === 'function') return value.toNumber();
  if (typeof value === 'object' && 'low' in value) return value.low;
  return Number(value) || 0;
};

const getAllJobs = async (filters = {}) => {
  const session = driver.session();
  try {
    let query = `
      MATCH (j:Job)-[:BELONGS_TO]->(c:Company)
      WHERE j.status = 'ACTIVE'
    `;

    const params = {};

    // 1. Keyword / Title
    if (filters.title) {
      query += ` AND j.title =~ $titleRegex`;
      params.titleRegex = `(?i).*${filters.title}.*`;
    }

    // 2. Location
    if (filters.location) {
      query += ` AND (j.location =~ $locationRegex OR j.workMode =~ $locationRegex OR c.address =~ $locationRegex)`;
      params.locationRegex = `(?i).*${filters.location}.*`;
    }

    // 3. Employment Type (comma-separated)
    if (filters.employmentType) {
      const types = filters.employmentType.split(',').map(t => t.trim());
      const includesRemote = types.includes('Remote');
      query += includesRemote
        ? ` AND (j.employmentType IN $types OR toLower(coalesce(j.workMode, '')) = 'remote' OR toLower(coalesce(j.location, '')) CONTAINS 'remote')`
        : ` AND j.employmentType IN $types`;
      params.types = types;
    }

    // 4. Category (comma-separated, case-insensitive)
    if (filters.category) {
      const categories = filters.category
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
      query += ` AND toLower(trim(coalesce(j.category, ''))) IN $categories`;
      params.categories = categories;
    }

    // 5. Experience (comma-separated)
    if (filters.experience) {
      const expList = filters.experience.split(',').map(t => t.trim());
      query += ` AND j.experience IN $expList`;
      params.expList = expList;
    }

    // 6. Level (comma-separated)
    if (filters.level) {
      const levelList = filters.level.split(',').map(t => t.trim());
      query += ` AND j.level IN $levelList`;
      params.levelList = levelList;
    }

    // 7. Salary Range
    if (filters.salaryRange) {
      switch (filters.salaryRange) {
        case '<5':
          query += ` AND j.salaryMax <= 5000000`;
          break;
        case '5-10':
          query += ` AND j.salaryMin >= 5000000 AND j.salaryMax <= 10000000`;
          break;
        case '10-15':
          query += ` AND j.salaryMin >= 10000000 AND j.salaryMax <= 15000000`;
          break;
        case '15-20':
          query += ` AND j.salaryMin >= 15000000 AND j.salaryMax <= 20000000`;
          break;
        case '>20':
          query += ` AND j.salaryMin >= 20000000`;
          break;
        case 'negotiable':
          query += ` AND (j.salaryMin IS NULL OR j.salaryMin = 0)`;
          break;
      }
    }

    // 8. Posting Date (24h, 3d, 7d)
    if (filters.dateRange) {
      if (filters.dateRange === '24h') {
        query += ` AND j.postedAt >= datetime() - duration({days: 1})`;
      } else if (filters.dateRange === '3d') {
        query += ` AND j.postedAt >= datetime() - duration({days: 3})`;
      } else if (filters.dateRange === '7d') {
        query += ` AND j.postedAt >= datetime() - duration({days: 7})`;
      }
    }

    query += `
      RETURN j, c
      ORDER BY j.postedAt DESC
      LIMIT 100
    `;

    const result = await session.run(query, params);
    return result.records.map(record => ({
      ...record.get('j').properties,
      company: record.get('c').properties
    }));
  } finally {
    await session.close();
  }
};

const getRecommendedJobsForCandidate = async (userId, options = {}) => {
  const session = driver.session();
  const limit = Math.min(Math.max(parseInt(options.limit, 10) || 20, 1), 100);

  try {
    const metaResult = await session.run(
      `MATCH (u:User {userId: $userId})
       OPTIONAL MATCH (u)-[:HAS_SKILL]->(s:Skill)
       RETURN count(DISTINCT s) AS candidateSkillCount,
              u.location AS candidateLocation`,
      { userId }
    );

    if (metaResult.records.length === 0) {
      return {
        jobs: [],
        meta: { source: 'profile', candidateSkillCount: 0, candidateLocation: '' },
      };
    }

    const metaRecord = metaResult.records[0];
    const meta = {
      source: 'profile',
      candidateSkillCount: toNumber(metaRecord.get('candidateSkillCount')),
      candidateLocation: metaRecord.get('candidateLocation') || '',
    };

    const query = `
      MATCH (u:User {userId: $userId})
      OPTIONAL MATCH (u)-[:HAS_SKILL]->(us:Skill)
      WITH u, collect(DISTINCT toLower(trim(us.name))) AS userSkills
      MATCH (j:Job)-[:BELONGS_TO]->(c:Company)
      WHERE j.status = 'ACTIVE'
        AND NOT EXISTS { MATCH (u)-[:APPLIED_TO]->(j) }
        AND NOT EXISTS { MATCH (u)-[:POSTED]->(j) }
      OPTIONAL MATCH (j)-[req:REQUIRES_SKILL]->(js:Skill)
      WITH u, j, c, userSkills,
           collect(DISTINCT {
             name: js.name,
             key: CASE WHEN js.name IS NULL THEN NULL ELSE toLower(trim(js.name)) END,
             weight: CASE coalesce(req.source, 'description')
               WHEN 'manual' THEN toInteger(coalesce(req.weight, 5))
               WHEN 'description' THEN toInteger(coalesce(
                 req.weight,
                 CASE coalesce(req.importance, 'general')
                   WHEN 'required' THEN 5
                   WHEN 'preferred' THEN 3
                   ELSE 4
                 END
               ))
               WHEN 'llm' THEN CASE coalesce(req.importance, 'general')
                 WHEN 'required' THEN 5
                 WHEN 'preferred' THEN 3
                 ELSE 4
               END
               WHEN 'title' THEN 3
               WHEN 'category' THEN 1
               ELSE toInteger(coalesce(req.weight, 1))
             END,
             source: coalesce(req.source, 'unknown'),
             importance: coalesce(req.importance, 'general'),
             confidence: coalesce(req.confidence, 1.0)
           }) AS rawRequiredSkills
      WITH u, j, c, userSkills,
           [s IN rawRequiredSkills WHERE s.name IS NOT NULL] AS requiredSkills,
           toLower(trim(coalesce(u.location, ''))) AS candidateLocationKey,
           toLower(coalesce(j.location, '') + ' ' + coalesce(c.address, '') + ' ' + coalesce(c.location, '')) AS jobLocationText,
           toLower(trim(coalesce(j.location, ''))) AS jobLocationKey
      WITH u, j, c, userSkills, requiredSkills, candidateLocationKey,
           [s IN requiredSkills WHERE s.key IN userSkills] AS matchedSkills,
           [s IN requiredSkills WHERE NOT (s.key IN userSkills)] AS missingSkills,
           (
             candidateLocationKey <> ''
             AND (
               jobLocationText CONTAINS candidateLocationKey
               OR (jobLocationKey <> '' AND candidateLocationKey CONTAINS jobLocationKey)
               OR jobLocationText CONTAINS 'remote'
             )
           ) AS locationMatch
      WITH u, j, c, userSkills, requiredSkills, matchedSkills, missingSkills, locationMatch,
           reduce(total = 0, s IN requiredSkills | total + s.weight) AS totalWeight,
           reduce(total = 0, s IN matchedSkills | total + s.weight) AS matchedWeight
      WITH u, j, c, requiredSkills, matchedSkills, missingSkills, locationMatch,
           CASE
             WHEN totalWeight > 0
             THEN toInteger(80 * matchedWeight / CASE WHEN totalWeight < 5 THEN 5 ELSE totalWeight END)
             ELSE 0
           END AS skillScore
      WITH u, j, c, requiredSkills, matchedSkills, missingSkills, locationMatch,
           toInteger(skillScore) + CASE WHEN locationMatch THEN 20 ELSE 0 END AS matchScore
      WHERE matchScore > 0
      OPTIONAL MATCH (u)-[saved:SAVED_JOB]->(j)
      RETURN j, c,
             [s IN requiredSkills | {
               name: s.name,
               weight: s.weight,
               source: s.source,
               importance: s.importance,
               confidence: s.confidence
             }] AS skills,
             [s IN matchedSkills | s.name] AS matchedSkills,
             [s IN missingSkills | s.name][0..5] AS missingSkills,
             locationMatch,
             matchScore,
             saved IS NOT NULL AS isSaved,
             false AS hasApplied
      ORDER BY matchScore DESC, size(matchedSkills) DESC, j.postedAt DESC
      LIMIT toInteger($limit)
    `;

    const result = await session.run(query, { userId, limit });
    const jobs = result.records.map(record => {
      const matchedSkills = record.get('matchedSkills') || [];
      const locationMatch = record.get('locationMatch') === true;
      const recommendationReasons = [];

      if (matchedSkills.length > 0) {
        recommendationReasons.push(`Matches ${matchedSkills.length} required skill${matchedSkills.length === 1 ? '' : 's'}`);
      }
      if (locationMatch) {
        recommendationReasons.push('Matches your location');
      }

      return {
        ...record.get('j').properties,
        company: record.get('c')?.properties || null,
        skills: (record.get('skills') || [])
          .filter(skill => skill.name)
          .map(skill => ({ ...skill, weight: toNumber(skill.weight) || 1 })),
        matchedSkills,
        missingSkills: record.get('missingSkills') || [],
        locationMatch,
        matchScore: toNumber(record.get('matchScore')),
        recommendationReasons,
        isSaved: record.get('isSaved') === true,
        hasApplied: record.get('hasApplied') === true,
      };
    });

    return { jobs, meta };
  } finally {
    await session.close();
  }
};

const getJobById = async (jobId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (j:Job {jobId: $jobId})
      OPTIONAL MATCH (j)-[:BELONGS_TO]->(c:Company)
      OPTIONAL MATCH (j)-[r:REQUIRES_SKILL]->(s:Skill)
      RETURN j, c,
             collect({
               name: s.name,
               weight: r.weight,
               source: r.source,
               importance: r.importance,
               confidence: r.confidence
             }) AS skills
    `;
    const result = await session.run(query, { jobId });
    if (result.records.length === 0) return null;
    
    const record = result.records[0];
    const job = record.get('j');
    if (!job) return null;
    
    return {
      ...job.properties,
      company: record.get('c')?.properties || null,
      skills: record.get('skills').filter(s => s.name !== null)
    };
  } finally {
    await session.close();
  }
};

/**
 * Apply to a job — creates APPLIED_TO relationship between User and Job.
 * @param {string} userId
 * @param {string} jobId
 * @param {object} applicationData - { cvType, cvUrl, coverLetter }
 */
const applyToJob = async (userId, jobId, applicationData) => {
  const session = driver.session();
  try {
    // Check if already applied
    const checkResult = await session.run(
      `MATCH (u:User {userId: $userId})-[r:APPLIED_TO]->(j:Job {jobId: $jobId})
       RETURN r`,
      { userId, jobId }
    );
    if (checkResult.records.length > 0) {
      return { alreadyApplied: true };
    }

    // Create application relationship
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       MATCH (j:Job {jobId: $jobId, status: 'ACTIVE'})
       WHERE NOT (u)-[:POSTED]->(j)
       OPTIONAL MATCH (recruiter:User)-[:POSTED]->(j)
       CREATE (u)-[r:APPLIED_TO {
         cvType: $cvType,
         cvUrl: $cvUrl,
         coverLetter: $coverLetter,
         status: 'PENDING',
         appliedAt: datetime()
       }]->(j)
       RETURN r, j.title AS jobTitle, recruiter.userId AS recruiterId`,
      {
        userId,
        jobId,
        cvType: applicationData.cvType || 'profile',
        cvUrl: applicationData.cvUrl || '',
        coverLetter: applicationData.coverLetter || '',
      }
    );

    if (result.records.length === 0) return null;

    const rel = result.records[0].get('r').properties;
    const jobTitle = result.records[0].get('jobTitle');
    const recruiterId = result.records[0].get('recruiterId');

    return { ...rel, jobTitle, recruiterId };
  } finally {
    await session.close();
  }
};

/**
 * Check if user has already applied to a job.
 */
const hasApplied = async (userId, jobId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[r:APPLIED_TO]->(j:Job {jobId: $jobId})
       RETURN r`,
      { userId, jobId }
    );
    return result.records.length > 0;
  } finally {
    await session.close();
  }
};

const saveJob = async (userId, jobId) => {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {userId: $userId}), (j:Job {jobId: $jobId})
       MERGE (u)-[r:SAVED_JOB]->(j)
       ON CREATE SET r.savedAt = datetime()
       RETURN r`,
      { userId, jobId }
    );
    return true;
  } finally {
    await session.close();
  }
};

const unsaveJob = async (userId, jobId) => {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {userId: $userId})-[r:SAVED_JOB]->(j:Job {jobId: $jobId})
       DELETE r`,
      { userId, jobId }
    );
    return true;
  } finally {
    await session.close();
  }
};

const getSavedJobs = async (userId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[r:SAVED_JOB]->(j:Job)-[:BELONGS_TO]->(c:Company)
       RETURN j, c, r.savedAt AS savedAt
       ORDER BY r.savedAt DESC`,
      { userId }
    );
    return result.records.map(record => ({
      ...record.get('j').properties,
      company: record.get('c').properties,
      savedAt: record.get('savedAt'),
      isSaved: true,
    }));
  } finally {
    await session.close();
  }
};

const isSaved = async (userId, jobId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[r:SAVED_JOB]->(j:Job {jobId: $jobId})
       RETURN r`,
      { userId, jobId }
    );
    return result.records.length > 0;
  } finally {
    await session.close();
  }
};

// ─── Candidate Application Tracker ────────────────────────────────────────────

const toDateString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value.toString === 'function') return value.toString();
  return null;
};

const CANDIDATE_ALLOWED_FIELDS = [
  'candidateStatus', 'notes', 'followUpAt', 'interviewAt',
  'contactName', 'contactEmail', 'contactPhone', 'externalUrl', 'archived',
];

const mapApplicationRecord = (record) => {
  const j = record.get('j').properties;
  const c = record.get('c');
  const r = record.get('r').properties;
  return {
    jobId: j.jobId,
    title: j.title,
    location: j.location || null,
    employmentType: j.employmentType || null,
    salaryMin: j.salaryMin ? toNumber(j.salaryMin) : null,
    salaryMax: j.salaryMax ? toNumber(j.salaryMax) : null,
    source: r.source || 'internal',
    officialStatus: r.status || 'PENDING',
    candidateStatus: r.candidateStatus || 'APPLIED',
    appliedAt: toDateString(r.appliedAt),
    updatedAt: toDateString(r.updatedAt),
    candidateUpdatedAt: toDateString(r.candidateUpdatedAt),
    followUpAt: toDateString(r.followUpAt),
    interviewAt: toDateString(r.interviewAt),
    archived: r.archived || false,
    notes: r.notes || '',
    contactName: r.contactName || '',
    contactEmail: r.contactEmail || '',
    contactPhone: r.contactPhone || '',
    externalUrl: r.externalUrl || j.externalUrl || '',
    cvType: r.cvType || '',
    cvUrl: r.cvUrl || '',
    coverLetter: r.coverLetter || '',
    company: c ? { ...c.properties } : null,
  };
};

const getMyApplications = async (userId, filters = {}) => {
  const session = driver.session();
  try {
    const showArchived = filters.archived === 'true' || filters.archived === true;
    const params = { userId, archived: showArchived };
    let cypher = `
      MATCH (u:User {userId: $userId})-[r:APPLIED_TO]->(j:Job)
      OPTIONAL MATCH (j)-[:BELONGS_TO]->(c:Company)
      WHERE coalesce(r.archived, false) = $archived
    `;
    if (filters.candidateStatus) {
      cypher += ` AND r.candidateStatus = $candidateStatus`;
      params.candidateStatus = filters.candidateStatus;
    }
    if (filters.source) {
      cypher += ` AND coalesce(r.source, 'internal') = $source`;
      params.source = filters.source;
    }
    if (filters.search) {
      cypher += ` AND (toLower(j.title) CONTAINS toLower($search) OR toLower(c.name) CONTAINS toLower($search))`;
      params.search = filters.search;
    }
    cypher += `
      RETURN j, c, r
      ORDER BY coalesce(r.followUpAt, r.appliedAt) ASC, r.appliedAt DESC
    `;
    const result = await session.run(cypher, params);
    return result.records.map(mapApplicationRecord);
  } finally {
    await session.close();
  }
};

const updateMyApplication = async (userId, jobId, data) => {
  const session = driver.session();
  try {
    const updates = {};
    CANDIDATE_ALLOWED_FIELDS.forEach(field => {
      if (data[field] !== undefined) updates[field] = data[field];
    });
    if (Object.keys(updates).length === 0) return null;
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[r:APPLIED_TO]->(j:Job {jobId: $jobId})
       SET r += $updates, r.candidateUpdatedAt = datetime()
       OPTIONAL MATCH (j)-[:BELONGS_TO]->(c:Company)
       RETURN j, c, r`,
      { userId, jobId, updates }
    );
    if (result.records.length === 0) return null;
    return mapApplicationRecord(result.records[0]);
  } finally {
    await session.close();
  }
};

const archiveMyApplication = async (userId, jobId, archived = true) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[r:APPLIED_TO]->(j:Job {jobId: $jobId})
       SET r.archived = $archived, r.candidateUpdatedAt = datetime()
       OPTIONAL MATCH (j)-[:BELONGS_TO]->(c:Company)
       RETURN j, c, r`,
      { userId, jobId, archived }
    );
    if (result.records.length === 0) return null;
    return mapApplicationRecord(result.records[0]);
  } finally {
    await session.close();
  }
};

const createExternalApplication = async (userId, data) => {
  const { v4: uuidv4 } = require('uuid');
  const session = driver.session();
  try {
    const jobId = uuidv4();
    const companyId = uuidv4();
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       MERGE (c:Company {name: $companyName})
         ON CREATE SET c.companyId = $companyId, c.createdAt = datetime(), c.source = 'external'
       CREATE (j:Job {
         jobId: $jobId,
         title: $title,
         location: $location,
         status: 'TRACKED',
         source: 'external',
         externalUrl: $externalUrl,
         postedAt: datetime()
       })
       CREATE (j)-[:BELONGS_TO]->(c)
       CREATE (u)-[r:APPLIED_TO {
         cvType: 'external',
         cvUrl: '',
         coverLetter: '',
         status: 'PENDING',
         source: 'external',
         candidateStatus: $candidateStatus,
         notes: $notes,
         followUpAt: $followUpAt,
         interviewAt: $interviewAt,
         contactName: $contactName,
         contactEmail: $contactEmail,
         contactPhone: $contactPhone,
         externalUrl: $externalUrl,
         archived: false,
         appliedAt: coalesce($appliedAt, datetime())
       }]->(j)
       RETURN j, c, r`,
      {
        userId,
        jobId,
        companyId,
        companyName: data.companyName || 'Unknown Company',
        title: data.title || 'Unknown Position',
        location: data.location || '',
        externalUrl: data.externalUrl || '',
        candidateStatus: data.candidateStatus || 'APPLIED',
        notes: data.notes || '',
        followUpAt: data.followUpAt || null,
        interviewAt: data.interviewAt || null,
        contactName: data.contactName || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        appliedAt: data.appliedAt || null,
      }
    );
    if (result.records.length === 0) return null;
    return mapApplicationRecord(result.records[0]);
  } finally {
    await session.close();
  }
};

module.exports = {
  getAllJobs,
  getRecommendedJobsForCandidate,
  getJobById,
  applyToJob,
  hasApplied,
  saveJob,
  unsaveJob,
  getSavedJobs,
  isSaved,
  getMyApplications,
  updateMyApplication,
  archiveMyApplication,
  createExternalApplication,
};
