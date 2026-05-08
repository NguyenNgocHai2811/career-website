const { driver } = require('../config/neo4j');

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
      query += ` AND (j.location =~ $locationRegex OR c.address =~ $locationRegex)`;
      params.locationRegex = `(?i).*${filters.location}.*`;
    }

    // 3. Employment Type (comma-separated)
    if (filters.employmentType) {
      const types = filters.employmentType.split(',').map(t => t.trim());
      query += ` AND j.employmentType IN $types`;
      params.types = types;
    }

    // 4. Category (comma-separated)
    if (filters.category) {
      const categories = filters.category.split(',').map(t => t.trim());
      query += ` AND j.category IN $categories`;
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

const getJobById = async (jobId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (j:Job {jobId: $jobId})
      OPTIONAL MATCH (j)-[:BELONGS_TO]->(c:Company)
      OPTIONAL MATCH (j)-[r:REQUIRES_SKILL]->(s:Skill)
      RETURN j, c, collect({ name: s.name, weight: r.weight }) AS skills
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

module.exports = {
  getAllJobs,
  getJobById,
  applyToJob,
  hasApplied,
};
