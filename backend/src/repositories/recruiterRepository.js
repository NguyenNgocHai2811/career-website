const { v4: uuidv4 } = require('uuid');
const { driver } = require('../config/neo4j');

const getDashboardMetrics = async (userId) => {
  const session = driver.session();
  try {
    // We assume the user is a recruiter for some companies. 
    // Get metrics for all jobs belonging to companies where this user is a recruiter.
    // Or simpler: get metrics for all jobs posted by this user.
    // Schema says: `(:User)-[:POSTED]->(:Job)`
    // and `(:User)-[:IS_RECRUITER_FOR]->(:Company)` 
    
    // Total applicants for my jobs
    const applicantsQuery = `
      MATCH (u:User {userId: $userId})-[:POSTED]->(j:Job)<-[r:APPLIED_TO]-(c:User)
      RETURN count(r) AS totalApplicants
    `;
    const applicantsRes = await session.run(applicantsQuery, { userId });
    const totalApplicants = applicantsRes.records.length > 0 ? applicantsRes.records[0].get('totalApplicants').toNumber() : 0;

    // Active jobs
    const activeJobsQuery = `
      MATCH (u:User {userId: $userId})-[:POSTED]->(j:Job {status: 'ACTIVE'})
      RETURN count(j) AS activeJobs
    `;
    const activeJobsRes = await session.run(activeJobsQuery, { userId });
    const activeJobs = activeJobsRes.records.length > 0 ? activeJobsRes.records[0].get('activeJobs').toNumber() : 0;

    // Recent applicants (mock 98% match for now, just latest applicants)
    const recentApplicantsQuery = `
      MATCH (u:User {userId: $userId})-[:POSTED]->(j:Job)<-[r:APPLIED_TO]-(c:User)
      RETURN c.userId AS applicantId, c.fullName AS fullName, c.avatarUrl AS avatarUrl, j.title AS jobTitle, r.appliedAt AS appliedAt
      ORDER BY r.appliedAt DESC
      LIMIT 3
    `;
    const recentRes = await session.run(recentApplicantsQuery, { userId });
    const recentApplicants = recentRes.records.map(rec => ({
      applicantId: rec.get('applicantId'),
      fullName: rec.get('fullName'),
      avatarUrl: rec.get('avatarUrl'),
      jobTitle: rec.get('jobTitle'),
      appliedAt: rec.get('appliedAt') || new Date().toISOString()
    }));

    // hired count (stub)
    const hiredThisMonth = 0; // Requires status='HIRED' logic

    return {
      totalApplicants,
      activeJobs,
      hiredThisMonth,
      recentApplicants
    };

  } finally {
    await session.close();
  }
};

const getMyCompanies = async (userId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User {userId: $userId})-[:IS_RECRUITER_FOR]->(c:Company)
      RETURN c
    `;
    const result = await session.run(query, { userId });
    return result.records.map(rec => rec.get('c').properties);
  } finally {
    await session.close();
  }
}

const postJob = async (userId, jobData) => {
  const session = driver.session();
  try {
    const jobId = uuidv4();
    const query = `
      MATCH (u:User {userId: $userId})-[:IS_RECRUITER_FOR]->(c:Company {companyId: $companyId})
      CREATE (j:Job {
        jobId: $jobId,
        title: $title,
        description: $description,
        employmentType: $employmentType,
        location: $location,
        salaryMin: $salaryMin,
        salaryMax: $salaryMax,
        category: $category,
        experience: $experience,
        level: $level,
        status: 'ACTIVE',
        postedAt: datetime()
      })
      CREATE (u)-[:POSTED {at: datetime()}]->(j)
      CREATE (j)-[:BELONGS_TO]->(c)
      RETURN j
    `;
    // The IS_RECRUITER_FOR check ensures only authorized users can post jobs for this company.
    
    const result = await session.run(query, {
      userId,
      companyId: jobData.companyId,
      jobId,
      title: jobData.title,
      description: jobData.description || '',
      employmentType: jobData.employmentType || '',
      location: jobData.location || '',
      salaryMin: jobData.salaryMin ? parseInt(jobData.salaryMin) : null,
      salaryMax: jobData.salaryMax ? parseInt(jobData.salaryMax) : null,
      category: jobData.category || 'Khác',
      experience: jobData.experience || 'Không yêu cầu',
      level: jobData.level || 'Nhân viên',
    });

    if (result.records.length === 0) return null;
    return result.records[0].get('j').properties;
  } finally {
    await session.close();
  }
};

const getApplicants = async (userId, jobId = null) => {
  const session = driver.session();
  try {
    // List all applicants to jobs posted by this user (optionally filter by jobId)
    const query = `
      MATCH (u:User {userId: $userId})-[:POSTED]->(j:Job)<-[r:APPLIED_TO]-(c:User)
      ${jobId ? 'WHERE j.jobId = $jobId' : ''}
      RETURN 
        c.userId AS id, 
        c.fullName AS fullName, 
        c.avatarUrl AS avatarUrl, 
        c.headline AS currentRole,
        c.email AS email,
        j.jobId AS jobId, 
        j.title AS jobTitle, 
        r.appliedAt AS appliedAt, 
        r.status AS status,
        r.cvUrl AS cvUrl,
        r.cvType AS cvType,
        r.coverLetter AS coverLetter
      ORDER BY r.appliedAt DESC
    `;
    const result = await session.run(query, { userId, jobId: jobId || null });
    return result.records.map(rec => ({
      id: rec.get('id'),
      fullName: rec.get('fullName'),
      avatarUrl: rec.get('avatarUrl'),
      currentRole: rec.get('currentRole'),
      email: rec.get('email'),
      jobId: rec.get('jobId'),
      jobTitle: rec.get('jobTitle'),
      appliedAt: rec.get('appliedAt')?.toString() || null,
      status: rec.get('status') || 'PENDING',
      cvUrl: rec.get('cvUrl'),
      cvType: rec.get('cvType'),
      coverLetter: rec.get('coverLetter'),
    }));
  } finally {
    await session.close();
  }
};

const getApplicantResume = async (recruiterId, applicantId, jobId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (recruiter:User {userId: $recruiterId})-[:POSTED]->(j:Job {jobId: $jobId})<-[r:APPLIED_TO]-(applicant:User {userId: $applicantId})
      RETURN r.cvUrl AS cvUrl, r.cvType AS cvType
      LIMIT 1
    `;
    const result = await session.run(query, { recruiterId, applicantId, jobId });
    if (result.records.length === 0) return null;
    return {
      cvUrl: result.records[0].get('cvUrl'),
      cvType: result.records[0].get('cvType'),
    };
  } finally {
    await session.close();
  }
};

const getMyJobs = async (userId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User {userId: $userId})-[:POSTED]->(j:Job)-[:BELONGS_TO]->(c:Company)
      OPTIONAL MATCH (j)<-[r:APPLIED_TO]-(applicant:User)
      RETURN j, c, count(r) AS applicantCount
      ORDER BY j.postedAt DESC
    `;
    const result = await session.run(query, { userId });
    return result.records.map(rec => ({
      ...rec.get('j').properties,
      company: rec.get('c').properties,
      applicantCount: rec.get('applicantCount').toNumber(),
    }));
  } finally {
    await session.close();
  }
};

const updateApplicationStatus = async (recruiterId, applicantId, jobId, newStatus) => {
  const session = driver.session();
  try {
    // Ensure the recruiter owns the job before updating
    const result = await session.run(
      `MATCH (recruiter:User {userId: $recruiterId})-[:POSTED]->(j:Job {jobId: $jobId})<-[r:APPLIED_TO]-(applicant:User {userId: $applicantId})
       SET r.status = $newStatus, r.updatedAt = datetime()
       RETURN r`,
      { recruiterId, applicantId, jobId, newStatus }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('r').properties;
  } finally {
    await session.close();
  }
};

const createCompany = async (userId, companyData) => {
  const session = driver.session();
  try {
    const companyId = uuidv4();
    const query = `
      MATCH (u:User {userId: $userId})
      CREATE (c:Company {
        companyId: $companyId,
        name: $name,
        industry: $industry,
        size: $size,
        logoUrl: $logoUrl,
        createdAt: datetime()
      })
      CREATE (u)-[:IS_RECRUITER_FOR]->(c)
      RETURN c
    `;
    const result = await session.run(query, {
      userId,
      companyId,
      name: companyData.name || 'My Company',
      industry: companyData.industry || 'Technology',
      size: companyData.size || '1-10',
      logoUrl: companyData.logoUrl || ''
    });
    if (result.records.length === 0) return null;
    return result.records[0].get('c').properties;
  } finally {
    await session.close();
  }
};

const updateCompany = async (userId, companyId, companyData) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User {userId: $userId})-[:IS_RECRUITER_FOR]->(c:Company {companyId: $companyId})
      SET c += $data
      RETURN c
    `;
    const result = await session.run(query, {
      userId,
      companyId,
      data: companyData
    });
    if (result.records.length === 0) return null;
    return result.records[0].get('c').properties;
  } finally {
    await session.close();
  }
};

const updateJob = async (userId, jobId, jobData) => {
  const session = driver.session();
  try {
    const allowedFields = ['title', 'description', 'employmentType', 'location', 'salaryMin', 'salaryMax', 'category', 'experience', 'level'];
    const updates = {};
    allowedFields.forEach(f => {
      if (jobData[f] !== undefined) updates[f] = jobData[f];
    });
    if (updates.salaryMin !== undefined) updates.salaryMin = updates.salaryMin ? parseInt(updates.salaryMin) : null;
    if (updates.salaryMax !== undefined) updates.salaryMax = updates.salaryMax ? parseInt(updates.salaryMax) : null;

    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:POSTED]->(j:Job {jobId: $jobId})
       SET j += $updates, j.updatedAt = datetime()
       RETURN j`,
      { userId, jobId, updates }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('j').properties;
  } finally {
    await session.close();
  }
};

const setJobStatus = async (userId, jobId, status) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:POSTED]->(j:Job {jobId: $jobId})
       SET j.status = $status, j.updatedAt = datetime()
       RETURN j`,
      { userId, jobId, status }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('j').properties;
  } finally {
    await session.close();
  }
};

const deleteJob = async (userId, jobId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:POSTED]->(j:Job {jobId: $jobId})
       DETACH DELETE j
       RETURN count(j) AS deleted`,
      { userId, jobId }
    );
    return result.records.length > 0;
  } finally {
    await session.close();
  }
};

module.exports = {
  getDashboardMetrics,
  getMyCompanies,
  postJob,
  getApplicants,
  getApplicantResume,
  getMyJobs,
  updateApplicationStatus,
  createCompany,
  updateCompany,
  updateJob,
  setJobStatus,
  deleteJob,
};
