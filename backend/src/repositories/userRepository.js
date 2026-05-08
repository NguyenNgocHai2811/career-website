const { driver } = require('../config/neo4j');

// ===========================
// USER CORE
// ===========================

const getAllUsers = async () => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (u:User) RETURN u');
    return result.records.map(record => record.get('u').properties);
  } finally {
    await session.close();
  }
};

const createUser = async (userData) => {
  const session = driver.session();
  try {
    const result = await session.run(
      'CREATE (u:User {id: randomUUID(), name: $name, email: $email, role: $role}) RETURN u',
      { name: userData.name, email: userData.email, role: userData.role || 'Candidate' }
    );
    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
};

const completeOnboarding = async (userId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (u:User {userId: $userId}) SET u.isOnboarded = true RETURN u',
      { userId }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
};

// ===========================
// GET FULL PROFILE
// ===========================

const getUserProfile = async (userId) => {
  const session = driver.session();
  try {
    // Main user node + (for RECRUITER) auto-pick first company so Profile can redirect to Company page.
    const userResult = await session.run(
      `MATCH (u:User {userId: $userId})
       OPTIONAL MATCH (u)-[:IS_RECRUITER_FOR]->(c:Company)
       WITH u, c ORDER BY c.createdAt ASC
       WITH u, collect(c)[0] AS firstCompany
       RETURN u { .userId, .role, .fullName, .email, .phone, .address,
                  .headline, .location, .status, .about,
                  .avatarUrl, .bannerUrl, .pronouns, .website, .birthday } AS user,
              CASE WHEN firstCompany IS NULL THEN NULL
                   ELSE { companyId: firstCompany.companyId, name: firstCompany.name }
              END AS activeCompany`,
      { userId }
    );
    if (userResult.records.length === 0) return null;
    const user = userResult.records[0].get('user');
    const activeCompany = userResult.records[0].get('activeCompany');

    // Experiences
    const expResult = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_EXPERIENCE]->(e:Experience)
       RETURN e ORDER BY e.startDate DESC`,
      { userId }
    );
    const experiences = expResult.records.map(r => r.get('e').properties);

    // Education
    const eduResult = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_EDUCATION]->(e:Education)
       RETURN e ORDER BY e.startYear DESC`,
      { userId }
    );
    const education = eduResult.records.map(r => r.get('e').properties);

    // Skills
    const skillResult = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_SKILL]->(s:Skill)
       RETURN s.name AS name ORDER BY s.name`,
      { userId }
    );
    const skills = skillResult.records.map(r => r.get('name'));

    // Projects
    const projResult = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_PROJECT]->(p:Project)
       RETURN p ORDER BY p.year DESC`,
      { userId }
    );
    const projects = projResult.records.map(r => r.get('p').properties);

    // Certifications
    const certResult = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_CERTIFICATION]->(c:Certification)
       RETURN c ORDER BY c.issueDate DESC`,
      { userId }
    );
    const certifications = certResult.records.map(r => r.get('c').properties);

    return {
      userId: user.userId,
      role: user.role || '',
      activeCompany,
      fullName: user.fullName || '',
      email: user.email || '',
      pronouns: user.pronouns || '',
      headline: user.headline || '',
      location: user.location || '',
      status: user.status || '',
      about: user.about || '',
      avatarUrl: user.avatarUrl || '',
      bannerUrl: user.bannerUrl || '',
      contactInfo: {
        website: user.website || '',
        email: user.email || '',
        phone: user.phone || '',
        birthday: user.birthday || '',
      },
      connectionsCount: 0, // TODO: implement follow phase
      followersCount: 0,
      experiences,
      education,
      skills,
      totalSkillsCount: skills.length,
      projects,
      certifications,
    };
  } finally {
    await session.close();
  }
};

// ===========================
// GET USER ACTIVITIES
// ===========================

const getUserActivities = async (userId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User)
      WHERE u.userId = $userId OR u.id = $userId
      
      // 1. Fetch Likes/Reactions
      OPTIONAL MATCH (u)-[rLike:REACTED_TO]->(pLike:Post)
      WITH u, collect(CASE WHEN rLike IS NULL THEN null ELSE {
        id: 'like_' + pLike.id,
        type: 'like', 
        actionText: 'reacted ' + COALESCE(rLike.type, 'LIKE') + ' to a post',
        createdAt: rLike.createdAt,
        contentPreview: substring(COALESCE(pLike.content, 'Post'), 0, 100)
      } END) as likes
      
      // 2. Fetch Comments
      OPTIONAL MATCH (u)-[:WROTE]->(c:Comment)-[:COMMENTED_ON]->(pComment:Post)
      WITH u, likes, collect(CASE WHEN c IS NULL THEN null ELSE {
        id: c.id,
        type: 'comment',
        actionText: 'commented on a post',
        createdAt: c.createdAt,
        contentPreview: substring(COALESCE(c.content, 'Comment'), 0, 100)
      } END) as comments
      
      // Combine & Filter
      WITH likes + comments AS combined
      UNWIND combined AS activity
      WITH activity WHERE activity IS NOT NULL
      RETURN activity
      ORDER BY activity.createdAt DESC
      LIMIT 50
    `;
    const result = await session.run(query, { userId });
    return result.records.map(record => {
      const act = record.get('activity');
      if (act.createdAt) act.createdAt = new Date(act.createdAt.toString()).toISOString();
      return act;
    });
  } finally {
    await session.close();
  }
};

// ===========================
// UPDATE BASIC INFO
// ===========================

const updateBasicInfo = async (userId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       SET u.fullName    = COALESCE($fullName, u.fullName),
           u.headline    = COALESCE($headline, u.headline),
           u.pronouns    = COALESCE($pronouns, u.pronouns),
           u.location    = COALESCE($location, u.location),
           u.about       = COALESCE($about, u.about),
           u.website     = COALESCE($website, u.website),
           u.phone       = COALESCE($phone, u.phone),
           u.birthday    = COALESCE($birthday, u.birthday)
       RETURN u { .userId, .fullName, .headline, .location, .about } AS user`,
      {
        userId,
        fullName: data.fullName ?? null,
        headline: data.headline ?? null,
        pronouns: data.pronouns ?? null,
        location: data.location ?? null,
        about: data.about ?? null,
        website: data.website ?? null,
        phone: data.phone ?? null,
        birthday: data.birthday ?? null,
      }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('user');
  } finally {
    await session.close();
  }
};

// Hàm hỗ trợ nội bộ để giảm code lặp lại
const updateUserField = async (userId, fieldName, value) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId}) SET u.${fieldName} = $value RETURN u.${fieldName} AS url`,
      { userId, value }
    );
    return result.records[0]?.get('url');
  } finally {
    await session.close();
  }
};

const updateAvatar = async (userId, avatarUrl) => updateUserField(userId, 'avatarUrl', avatarUrl);
const updateBanner = async (userId, bannerUrl) => updateUserField(userId, 'bannerUrl', bannerUrl);

// ===========================
// EXPERIENCE CRUD
// ===========================

const addExperience = async (userId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       CREATE (u)-[:HAS_EXPERIENCE]->(e:Experience {
         expId: randomUUID(),
         title: $title,
         company: $company,
         type: $type,
         startDate: $startDate,
         endDate: $endDate,
         isCurrent: $isCurrent,
         location: $location,
         description: $description,
         skills: $skills,
         logoUrl: $logoUrl
       })
       RETURN e`,
      {
        userId,
        title: data.title || '',
        company: data.company || '',
        type: data.type || 'Full-time',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        isCurrent: data.isCurrent || false,
        location: data.location || '',
        description: data.description || '',
        skills: data.skills || [],
        logoUrl: data.logoUrl || '',
      }
    );
    return result.records[0].get('e').properties;
  } finally {
    await session.close();
  }
};

const updateExperience = async (userId, expId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_EXPERIENCE]->(e:Experience {expId: $expId})
       SET e.title       = COALESCE($title, e.title),
           e.company     = COALESCE($company, e.company),
           e.type        = COALESCE($type, e.type),
           e.startDate   = COALESCE($startDate, e.startDate),
           e.endDate     = COALESCE($endDate, e.endDate),
           e.isCurrent   = COALESCE($isCurrent, e.isCurrent),
           e.location    = COALESCE($location, e.location),
           e.description = COALESCE($description, e.description),
           e.skills      = COALESCE($skills, e.skills),
           e.logoUrl     = COALESCE($logoUrl, e.logoUrl)
       RETURN e`,
      {
        userId, expId,
        title: data.title ?? null,
        company: data.company ?? null,
        type: data.type ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        isCurrent: data.isCurrent ?? null,
        location: data.location ?? null,
        description: data.description ?? null,
        skills: data.skills ?? null,
        logoUrl: data.logoUrl ?? null,
      }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('e').properties;
  } finally {
    await session.close();
  }
};

const deleteExperience = async (userId, expId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_EXPERIENCE]->(e:Experience {expId: $expId})
       DETACH DELETE e RETURN count(e) AS deleted`,
      { userId, expId }
    );
    return result.records[0].get('deleted').toNumber() > 0;
  } finally {
    await session.close();
  }
};

// ===========================
// EDUCATION CRUD
// ===========================

const addEducation = async (userId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       CREATE (u)-[:HAS_EDUCATION]->(e:Education {
         eduId: randomUUID(),
         schoolName: $schoolName,
         degree: $degree,
         field: $field,
         startYear: $startYear,
         endYear: $endYear,
         grade: $grade,
         activities: $activities,
         description: $description,
         logoUrl: $logoUrl
       })
       RETURN e`,
      {
        userId,
        schoolName: data.schoolName || '',
        degree: data.degree || '',
        field: data.field || '',
        startYear: data.startYear || '',
        endYear: data.endYear || '',
        grade: data.grade || '',
        activities: data.activities || '',
        description: data.description || '',
        logoUrl: data.logoUrl || '',
      }
    );
    return result.records[0].get('e').properties;
  } finally {
    await session.close();
  }
};

const updateEducation = async (userId, eduId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_EDUCATION]->(e:Education {eduId: $eduId})
       SET e.schoolName  = COALESCE($schoolName, e.schoolName),
           e.degree      = COALESCE($degree, e.degree),
           e.field       = COALESCE($field, e.field),
           e.startYear   = COALESCE($startYear, e.startYear),
           e.endYear     = COALESCE($endYear, e.endYear),
           e.grade       = COALESCE($grade, e.grade),
           e.description = COALESCE($description, e.description),
           e.logoUrl     = COALESCE($logoUrl, e.logoUrl)
       RETURN e`,
      {
        userId, eduId,
        schoolName: data.schoolName ?? null,
        degree: data.degree ?? null,
        field: data.field ?? null,
        startYear: data.startYear ?? null,
        endYear: data.endYear ?? null,
        grade: data.grade ?? null,
        description: data.description ?? null,
        logoUrl: data.logoUrl ?? null,
      }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('e').properties;
  } finally {
    await session.close();
  }
};

const deleteEducation = async (userId, eduId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_EDUCATION]->(e:Education {eduId: $eduId})
       DETACH DELETE e RETURN count(e) AS deleted`,
      { userId, eduId }
    );
    return result.records[0].get('deleted').toNumber() > 0;
  } finally {
    await session.close();
  }
};

// ===========================
// SKILLS
// ===========================

const addSkill = async (userId, skillName) => {
  const session = driver.session();
  try {
    // MERGE prevents duplicates globally, then link to user
    await session.run(
      `MATCH (u:User {userId: $userId})
       MERGE (s:Skill {name: $skillName})
       MERGE (u)-[:HAS_SKILL]->(s)`,
      { userId, skillName }
    );
    return { name: skillName };
  } finally {
    await session.close();
  }
};

const removeSkill = async (userId, skillName) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[r:HAS_SKILL]->(s:Skill {name: $skillName})
       DELETE r RETURN count(r) AS deleted`,
      { userId, skillName }
    );
    return result.records[0].get('deleted').toNumber() > 0;
  } finally {
    await session.close();
  }
};

// ===========================
// PROJECTS CRUD
// ===========================

const addProject = async (userId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       CREATE (u)-[:HAS_PROJECT]->(p:Project {
         projId: randomUUID(),
         name: $name,
         description: $description,
         year: $year,
         category: $category,
         link: $link,
         thumbnailUrl: $thumbnailUrl
       })
       RETURN p`,
      {
        userId,
        name: data.name || '',
        description: data.description || '',
        year: data.year || '',
        category: data.category || '',
        link: data.link || '',
        thumbnailUrl: data.thumbnailUrl || '',
      }
    );
    return result.records[0].get('p').properties;
  } finally {
    await session.close();
  }
};

const updateProject = async (userId, projId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_PROJECT]->(p:Project {projId: $projId})
       SET p.name         = COALESCE($name, p.name),
           p.description  = COALESCE($description, p.description),
           p.year         = COALESCE($year, p.year),
           p.category     = COALESCE($category, p.category),
           p.link         = COALESCE($link, p.link),
           p.thumbnailUrl = COALESCE($thumbnailUrl, p.thumbnailUrl)
       RETURN p`,
      {
        userId, projId,
        name: data.name ?? null,
        description: data.description ?? null,
        year: data.year ?? null,
        category: data.category ?? null,
        link: data.link ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
      }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('p').properties;
  } finally {
    await session.close();
  }
};

const deleteProject = async (userId, projId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_PROJECT]->(p:Project {projId: $projId})
       DETACH DELETE p RETURN count(p) AS deleted`,
      { userId, projId }
    );
    return result.records[0].get('deleted').toNumber() > 0;
  } finally {
    await session.close();
  }
};

// ===========================
// CERTIFICATIONS CRUD
// ===========================

const addCertification = async (userId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       CREATE (u)-[:HAS_CERTIFICATION]->(c:Certification {
         certId: randomUUID(),
         name: $name,
         organization: $organization,
         issueDate: $issueDate,
         expiryDate: $expiryDate,
         credentialId: $credentialId,
         credentialUrl: $credentialUrl,
         logoUrl: $logoUrl
       })
       RETURN c`,
      {
        userId,
        name: data.name || '',
        organization: data.organization || '',
        issueDate: data.issueDate || '',
        expiryDate: data.expiryDate || '',
        credentialId: data.credentialId || '',
        credentialUrl: data.credentialUrl || '',
        logoUrl: data.logoUrl || '',
      }
    );
    return result.records[0].get('c').properties;
  } finally {
    await session.close();
  }
};

const updateCertification = async (userId, certId, data) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_CERTIFICATION]->(c:Certification {certId: $certId})
       SET c.name          = COALESCE($name, c.name),
           c.organization  = COALESCE($organization, c.organization),
           c.issueDate     = COALESCE($issueDate, c.issueDate),
           c.expiryDate    = COALESCE($expiryDate, c.expiryDate),
           c.credentialId  = COALESCE($credentialId, c.credentialId),
           c.credentialUrl = COALESCE($credentialUrl, c.credentialUrl),
           c.logoUrl       = COALESCE($logoUrl, c.logoUrl)
       RETURN c`,
      {
        userId, certId,
        name: data.name ?? null,
        organization: data.organization ?? null,
        issueDate: data.issueDate ?? null,
        expiryDate: data.expiryDate ?? null,
        credentialId: data.credentialId ?? null,
        credentialUrl: data.credentialUrl ?? null,
        logoUrl: data.logoUrl ?? null,
      }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('c').properties;
  } finally {
    await session.close();
  }
};

const deleteCertification = async (userId, certId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:HAS_CERTIFICATION]->(c:Certification {certId: $certId})
       DETACH DELETE c RETURN count(c) AS deleted`,
      { userId, certId }
    );
    return result.records[0].get('deleted').toNumber() > 0;
  } finally {
    await session.close();
  }
};

module.exports = {
  getAllUsers,
  createUser,
  completeOnboarding,
  getUserProfile,
  updateBasicInfo,
  updateAvatar,
  updateBanner,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
  addSkill, removeSkill,
  addProject, updateProject, deleteProject,
  addCertification, updateCertification, deleteCertification,
  getUserActivities,
};
