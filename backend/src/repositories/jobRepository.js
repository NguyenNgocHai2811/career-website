const { driver } = require('../config/neo4j');

const getAllJobs = async (filters = {}) => {
  const session = driver.session();
  try {
    let query = `
      MATCH (j:Job)-[:BELONGS_TO]->(c:Company)
      WHERE j.status = 'ACTIVE'
      RETURN j, c
      ORDER BY j.postedAt DESC
      LIMIT 100
    `;
    const result = await session.run(query);
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
       CREATE (u)-[r:APPLIED_TO {
         cvType: $cvType,
         cvUrl: $cvUrl,
         coverLetter: $coverLetter,
         status: 'PENDING',
         appliedAt: datetime()
       }]->(j)
       RETURN r, j.title AS jobTitle`,
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

    return { ...rel, jobTitle };
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
