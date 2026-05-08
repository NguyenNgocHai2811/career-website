const { driver } = require('../config/neo4j');

const getStats = async () => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (u:User) WHERE u.role <> 'ADMIN'
      WITH count(u) AS totalUsers
      OPTIONAL MATCH (j:Job)
      WITH totalUsers, count(j) AS totalJobs
      OPTIONAL MATCH (p:Post)
      WITH totalUsers, totalJobs, count(p) AS totalPosts
      OPTIONAL MATCH (c:Company)
      RETURN totalUsers, totalJobs, totalPosts, count(c) AS totalCompanies
    `);
    const record = result.records[0];
    return {
      totalUsers: record.get('totalUsers').toNumber(),
      totalJobs: record.get('totalJobs').toNumber(),
      totalPosts: record.get('totalPosts').toNumber(),
      totalCompanies: record.get('totalCompanies').toNumber(),
    };
  } finally {
    await session.close();
  }
};

const getUsers = async ({ page = 1, limit = 20, search = '' }) => {
  const session = driver.session();
  const skip = (page - 1) * limit;
  try {
    const result = await session.run(`
      MATCH (u:User)
      WHERE u.role <> 'ADMIN'
        AND ($search = '' OR toLower(u.fullName) CONTAINS toLower($search)
            OR toLower(u.email) CONTAINS toLower($search))
      RETURN u.userId AS userId, u.fullName AS fullName, u.email AS email,
             u.role AS role, u.isBanned AS isBanned, u.createdAt AS createdAt
      ORDER BY u.createdAt DESC
      SKIP toInteger($skip) LIMIT toInteger($limit)
    `, { search, skip, limit });

    const countResult = await session.run(`
      MATCH (u:User)
      WHERE u.role <> 'ADMIN'
        AND ($search = '' OR toLower(u.fullName) CONTAINS toLower($search)
            OR toLower(u.email) CONTAINS toLower($search))
      RETURN count(u) AS total
    `, { search });

    return {
      users: result.records.map(r => ({
        userId: r.get('userId'),
        fullName: r.get('fullName'),
        email: r.get('email'),
        role: r.get('role'),
        isBanned: r.get('isBanned') || false,
        createdAt: r.get('createdAt'),
      })),
      total: countResult.records[0].get('total').toNumber(),
    };
  } finally {
    await session.close();
  }
};

const banUser = async (userId, isBanned) => {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {userId: $userId}) SET u.isBanned = $isBanned`,
      { userId, isBanned }
    );
    return true;
  } finally {
    await session.close();
  }
};

const deleteUser = async (userId) => {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (u:User {userId: $userId}) DETACH DELETE u`,
      { userId }
    );
    return true;
  } finally {
    await session.close();
  }
};

const getJobs = async ({ page = 1, limit = 20, search = '' }) => {
  const session = driver.session();
  const skip = (page - 1) * limit;
  try {
    const result = await session.run(`
      MATCH (j:Job)
      WHERE $search = '' OR toLower(j.title) CONTAINS toLower($search)
      OPTIONAL MATCH (j)-[:BELONGS_TO]->(c:Company)
      RETURN j.jobId AS jobId, j.title AS title, j.employmentType AS employmentType,
             j.location AS location, j.createdAt AS createdAt, c.name AS companyName
      ORDER BY j.createdAt DESC
      SKIP toInteger($skip) LIMIT toInteger($limit)
    `, { search, skip, limit });

    const countResult = await session.run(`
      MATCH (j:Job)
      WHERE $search = '' OR toLower(j.title) CONTAINS toLower($search)
      RETURN count(j) AS total
    `, { search });

    return {
      jobs: result.records.map(r => ({
        jobId: r.get('jobId'),
        title: r.get('title'),
        employmentType: r.get('employmentType'),
        location: r.get('location'),
        createdAt: r.get('createdAt'),
        companyName: r.get('companyName'),
      })),
      total: countResult.records[0].get('total').toNumber(),
    };
  } finally {
    await session.close();
  }
};

const deleteJob = async (jobId) => {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (j:Job {jobId: $jobId}) DETACH DELETE j`,
      { jobId }
    );
    return true;
  } finally {
    await session.close();
  }
};

const getPosts = async ({ page = 1, limit = 20 }) => {
  const session = driver.session();
  const skip = (page - 1) * limit;
  try {
    const result = await session.run(`
      MATCH (p:Post)
      OPTIONAL MATCH (u:User)-[:POSTED]->(p)
      RETURN p.id AS postId, p.content AS content, p.createdAt AS createdAt,
             u.fullName AS authorName, u.userId AS authorId
      ORDER BY p.createdAt DESC
      SKIP toInteger($skip) LIMIT toInteger($limit)
    `, { skip, limit });

    const countResult = await session.run(`MATCH (p:Post) RETURN count(p) AS total`);

    return {
      posts: result.records.map(r => ({
        postId: r.get('postId'),
        content: r.get('content'),
        createdAt: r.get('createdAt'),
        authorName: r.get('authorName'),
        authorId: r.get('authorId'),
      })),
      total: countResult.records[0].get('total').toNumber(),
    };
  } finally {
    await session.close();
  }
};

const deletePost = async (postId) => {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (p:Post {id: $postId}) DETACH DELETE p`,
      { postId }
    );
    return true;
  } finally {
    await session.close();
  }
};

module.exports = { getStats, getUsers, banUser, deleteUser, getJobs, deleteJob, getPosts, deletePost };
