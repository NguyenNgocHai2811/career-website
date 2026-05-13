const { v4: uuidv4 } = require('uuid');
const { driver } = require('../config/neo4j');
const { buildJobMetadataPatch, mergeJobMetadata } = require('../services/jobMetadataExtractor');
const { extractJobSkills } = require('../services/jobSkillExtractor');

const hasJobSkillsField = (jobData) => (
  Object.prototype.hasOwnProperty.call(jobData, 'skills')
  || Object.prototype.hasOwnProperty.call(jobData, 'requiredSkills')
);

const shouldInferJobSkills = (jobData) => (
  hasJobSkillsField(jobData)
  || ['title', 'description', 'requirements', 'benefits', 'category'].some(field =>
    Object.prototype.hasOwnProperty.call(jobData, field)
  )
);

const safelyExtractJobSkills = async (jobData) => {
  try {
    return await extractJobSkills(jobData);
  } catch (error) {
    console.error('Job skill extraction failed:', error);
    return [];
  }
};

const toNullableInt = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? parseInt(number, 10) : null;
};

const syncJobSkills = async (session, jobId, skills) => {
  await session.run(
    `MATCH (j:Job {jobId: $jobId})
     OPTIONAL MATCH (j)-[old:REQUIRES_SKILL]->(:Skill)
     DELETE old
     WITH j
     UNWIND $skills AS skill
     MERGE (s:Skill {name: skill.name})
     MERGE (j)-[r:REQUIRES_SKILL]->(s)
     SET r.weight = skill.weight,
         r.source = skill.source,
         r.importance = skill.importance,
         r.confidence = skill.confidence,
         r.updatedAt = datetime()`,
    { jobId, skills }
  );
};

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
    const enrichedJobData = mergeJobMetadata(jobData);
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
        experienceMin: $experienceMin,
        experienceMax: $experienceMax,
        level: $level,
        workMode: $workMode,
        salaryCurrency: $salaryCurrency,
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
      companyId: enrichedJobData.companyId,
      jobId,
      title: enrichedJobData.title,
      description: enrichedJobData.description || '',
      employmentType: enrichedJobData.employmentType || '',
      location: enrichedJobData.location || '',
      salaryMin: toNullableInt(enrichedJobData.salaryMin),
      salaryMax: toNullableInt(enrichedJobData.salaryMax),
      category: enrichedJobData.category || 'Khác',
      experience: enrichedJobData.experience || 'Không yêu cầu',
      experienceMin: toNullableInt(enrichedJobData.experienceMin),
      experienceMax: toNullableInt(enrichedJobData.experienceMax),
      level: enrichedJobData.level || 'Nhân viên',
      workMode: enrichedJobData.workMode || '',
      salaryCurrency: enrichedJobData.salaryCurrency || '',
    });

    if (result.records.length === 0) return null;
    const inferredSkills = await safelyExtractJobSkills(enrichedJobData);
    if (inferredSkills.length > 0) {
      await syncJobSkills(session, jobId, inferredSkills);
    }

    return {
      ...result.records[0].get('j').properties,
      skills: inferredSkills,
    };
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
      OPTIONAL MATCH (j)-[skillRel:REQUIRES_SKILL]->(skill:Skill)
      RETURN j, c, count(DISTINCT r) AS applicantCount,
             collect(DISTINCT {
               name: skill.name,
               weight: skillRel.weight,
               source: skillRel.source,
               importance: skillRel.importance,
               confidence: skillRel.confidence
             }) AS skills
      ORDER BY j.postedAt DESC
    `;
    const result = await session.run(query, { userId });
    return result.records.map(rec => ({
      ...rec.get('j').properties,
      company: rec.get('c').properties,
      applicantCount: rec.get('applicantCount').toNumber(),
      skills: rec.get('skills').filter(skill => skill.name !== null),
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
    const shouldSyncSkills = shouldInferJobSkills(jobData);
    const allowedFields = [
      'title',
      'description',
      'employmentType',
      'location',
      'salaryMin',
      'salaryMax',
      'salaryCurrency',
      'category',
      'experience',
      'experienceMin',
      'experienceMax',
      'level',
      'workMode',
    ];
    const updates = {};
    allowedFields.forEach(f => {
      if (jobData[f] !== undefined) updates[f] = jobData[f];
    });
    if (updates.salaryMin !== undefined) updates.salaryMin = toNullableInt(updates.salaryMin);
    if (updates.salaryMax !== undefined) updates.salaryMax = toNullableInt(updates.salaryMax);
    if (updates.experienceMin !== undefined) updates.experienceMin = toNullableInt(updates.experienceMin);
    if (updates.experienceMax !== undefined) updates.experienceMax = toNullableInt(updates.experienceMax);

    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:POSTED]->(j:Job {jobId: $jobId})
       SET j += $updates, j.updatedAt = datetime()
       RETURN j`,
      { userId, jobId, updates }
    );
    if (result.records.length === 0) return null;
    let updatedJob = result.records[0].get('j').properties;
    const metadataPatch = buildJobMetadataPatch(updatedJob, jobData);
    if (Object.keys(metadataPatch).length > 0) {
      const metadataResult = await session.run(
        `MATCH (j:Job {jobId: $jobId})
         SET j += $metadataPatch, j.updatedAt = datetime()
         RETURN j`,
        { jobId, metadataPatch }
      );
      updatedJob = metadataResult.records[0].get('j').properties;
    }

    const inferredSkills = shouldSyncSkills
      ? await safelyExtractJobSkills({ ...updatedJob, skills: jobData.skills, requiredSkills: jobData.requiredSkills })
      : [];
    if (shouldSyncSkills) {
      await syncJobSkills(session, jobId, inferredSkills);
    }

    return {
      ...updatedJob,
      ...(shouldSyncSkills ? { skills: inferredSkills } : {}),
    };
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
