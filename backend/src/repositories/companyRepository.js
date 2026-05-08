const { driver } = require('../config/neo4j');

const getCompanyById = async (companyId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (c:Company {companyId: $companyId})
      OPTIONAL MATCH (owner:User)-[:IS_RECRUITER_FOR {role: 'OWNER'}]->(c)
      RETURN c, owner.userId AS ownerId
    `;
    const result = await session.run(query, { companyId });
    if (result.records.length === 0) return null;
    return {
      ...result.records[0].get('c').properties,
      ownerId: result.records[0].get('ownerId'),
    };
  } finally {
    await session.close();
  }
};

const getCompanyJobs = async (companyId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (j:Job)-[:BELONGS_TO]->(c:Company {companyId: $companyId})
      WHERE j.status = 'ACTIVE'
      RETURN j
      ORDER BY j.postedAt DESC
    `;
    const result = await session.run(query, { companyId });
    return result.records.map(r => r.get('j').properties);
  } finally {
    await session.close();
  }
};

const getCompanyEmployees = async (companyId) => {
  const session = driver.session();
  try {
    // Both users that are registered as working there -> OR recruiters
    const query = `
      MATCH (u:User)-[r:IS_RECRUITER_FOR]->(c:Company {companyId: $companyId})
      RETURN DISTINCT u.userId AS id, u.fullName AS fullName, u.avatarUrl AS avatarUrl, u.headline AS headline, 'Recruiter' AS role
      UNION
      MATCH (u:User)-[r:WORKS_AT]->(c:Company {companyId: $companyId})
      RETURN DISTINCT u.userId AS id, u.fullName AS fullName, u.avatarUrl AS avatarUrl, u.headline AS headline, r.role AS role
    `;
    const result = await session.run(query, { companyId });
    return result.records.map(r => ({
      id: r.get('id'),
      fullName: r.get('fullName'),
      avatarUrl: r.get('avatarUrl'),
      headline: r.get('headline'),
      role: r.get('role')
    }));
  } finally {
    await session.close();
  }
};

module.exports = {
  getCompanyById,
  getCompanyJobs,
  getCompanyEmployees
};
