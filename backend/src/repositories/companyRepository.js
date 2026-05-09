const { driver } = require('../config/neo4j');

const getCompanyById = async (companyId, currentUserId = null) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (c:Company {companyId: $companyId})
      OPTIONAL MATCH (owner:User)-[:IS_RECRUITER_FOR {role: 'OWNER'}]->(c)
      OPTIONAL MATCH (:User)-[:FOLLOWS]->(c)
      WITH c, owner, count(*) AS followerCount
      RETURN c, owner.userId AS ownerId, followerCount
    `;
    const result = await session.run(query, { companyId });
    if (result.records.length === 0) return null;
    const rec = result.records[0];

    let isFollowing = false;
    if (currentUserId) {
      const followCheck = await session.run(
        `MATCH (u:User {userId: $currentUserId})-[:FOLLOWS]->(c:Company {companyId: $companyId}) RETURN c`,
        { currentUserId, companyId }
      );
      isFollowing = followCheck.records.length > 0;
    }

    return {
      ...rec.get('c').properties,
      ownerId: rec.get('ownerId'),
      followerCount: rec.get('followerCount').toNumber(),
      isFollowing,
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

const getCompanyPosts = async (companyId, currentUserId = null) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (u:User)-[:IS_RECRUITER_FOR]->(c:Company {companyId: $companyId})
      MATCH (u)-[:POSTED]->(p:Post)
      OPTIONAL MATCH (u)-[:IS_RECRUITER_FOR]->(comp:Company)
      OPTIONAL MATCH (p)<-[:COMMENTED_ON]-(cm:Comment)
      WITH p, u, comp, count(DISTINCT cm) AS commentsCount
      OPTIONAL MATCH (p)<-[r:REACTED_TO]-(liker:User)
      WITH p, u, comp, commentsCount, r.type AS rType, liker.userId AS rUserId
      WITH p, u, comp, commentsCount,
           collect(CASE WHEN rType IS NULL THEN null ELSE {type: rType, userId: rUserId} END) AS rawReacts
      WITH p, u, comp, commentsCount, [x IN rawReacts WHERE x IS NOT NULL] AS reacts
      RETURN p, u, comp, commentsCount,
             size(reacts) AS reactionsCount,
             head([x IN reacts WHERE x.userId = $currentUserId | x.type]) AS userReactionType,
             [x IN reacts | x.type] AS allTypes
      ORDER BY p.createdAt DESC
    `, { companyId, currentUserId: currentUserId || '' });

    return result.records.map(rec => {
      const post = rec.get('p').properties;
      if (post.createdAt) post.createdAt = new Date(post.createdAt.toString()).toISOString();
      if (post.updatedAt) post.updatedAt = new Date(post.updatedAt.toString()).toISOString();
      const author = rec.get('u').properties;
      const company = rec.get('comp')?.properties;
      const reactionsCount = rec.get('reactionsCount');
      return {
        ...post,
        commentsCount: rec.get('commentsCount').toNumber(),
        reactionsCount: typeof reactionsCount?.toNumber === 'function' ? reactionsCount.toNumber() : (reactionsCount || 0),
        userReactionType: rec.get('userReactionType') || null,
        allTypes: rec.get('allTypes') || [],
        author: company ? {
          id: company.companyId, fullName: company.name, avatar: company.logoUrl, type: 'COMPANY'
        } : {
          userId: author.userId, fullName: author.fullName, avatar: author.avatarUrl, type: 'USER'
        },
      };
    });
  } finally {
    await session.close();
  }
};

const followCompany = async (userId, companyId) => {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {userId: $userId}), (c:Company {companyId: $companyId})
       MERGE (u)-[:FOLLOWS]->(c)`,
      { userId, companyId }
    );
    return true;
  } finally {
    await session.close();
  }
};

const unfollowCompany = async (userId, companyId) => {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {userId: $userId})-[r:FOLLOWS]->(c:Company {companyId: $companyId})
       DELETE r`,
      { userId, companyId }
    );
    return true;
  } finally {
    await session.close();
  }
};

module.exports = {
  getCompanyById,
  getCompanyJobs,
  getCompanyEmployees,
  getCompanyPosts,
  followCompany,
  unfollowCompany,
};
