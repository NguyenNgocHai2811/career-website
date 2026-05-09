const { driver } = require('../config/neo4j');

/**
 * Creates a new Post node and connects it to the User.
 */
const createPost = async (userId, postData) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      OPTIONAL MATCH (u)-[:IS_RECRUITER_FOR]->(c:Company)
      CREATE (p:Post {
        id: randomUUID(),
        content: $content,
        mediaUrl: $mediaUrl,
        mediaType: $mediaType,
        privacy: $privacy,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (u)-[:POSTED]->(p)
      RETURN p, u, c
      `,
      {
        userId,
        content: postData.content || '',
        mediaUrl: postData.mediaUrl || null,
        mediaType: postData.mediaType || null,
        privacy: postData.privacy || 'Public'
      }
    );
    if (result.records.length === 0) return null;
    const post = result.records[0].get('p').properties;
    const user = result.records[0].get('u').properties;
    const company = result.records[0].get('c')?.properties;

    return { 
      ...post, 
      author: company ? {
        id: company.companyId,
        fullName: company.name,
        avatar: company.logoUrl,
        type: 'COMPANY'
      } : { 
        userId: user.userId, 
        fullName: user.fullName, 
        avatar: user.avatarUrl,
        type: 'USER'
      } 
    };
  } finally {
    await session.close();
  }
};

const POST_DETAILS_FRAGMENT = `
  OPTIONAL MATCH (p)<-[:COMMENTED_ON]-(c:Comment)
  WITH *, count(DISTINCT c) as commentsCount
  
  OPTIONAL MATCH (p)<-[r:REACTED_TO]-(liker:User)
  WITH *, r.type as rType, liker.userId as rUserId
  WITH *, collect(CASE WHEN rType IS NULL THEN null ELSE {type: rType, userId: rUserId} END) as rawReacts
  WITH *, [x IN rawReacts WHERE x IS NOT NULL] as reacts
  
  RETURN p, u, comp, commentsCount, size(reacts) as reactionsCount,
         head([x IN reacts WHERE x.userId = $currentUserId | x.type]) as userReactionType,
         [x IN reacts | x.type] as allTypes
`;

/**
 * Retrieves a paginated list of posts (News Feed).
 */
const getPosts = async (currentUserId, cursor, limit = 10) => {
  const session = driver.session();
  try {
    let query = `
      MATCH (u:User)-[:POSTED]->(p:Post)
      OPTIONAL MATCH (u)-[:IS_RECRUITER_FOR]->(comp:Company)
    `;
    const params = { limit: parseInt(limit, 10) || 10, currentUserId };

    if (cursor) {
      query += ` WHERE p.createdAt < datetime($cursor) `;
      params.cursor = cursor;
    }

    query += POST_DETAILS_FRAGMENT + ` ORDER BY p.createdAt DESC LIMIT toInteger($limit)`;

    const result = await session.run(query, params);
    return result.records.map(record => {
      const post = record.get('p').properties;
      if (post.createdAt) post.createdAt = new Date(post.createdAt.toString()).toISOString();
      if (post.updatedAt) post.updatedAt = new Date(post.updatedAt.toString()).toISOString();

      const author = record.get('u').properties;
      const company = record.get('comp')?.properties;
      const reactionsCount = record.get('reactionsCount');

      return {
        ...post,
        commentsCount: record.get('commentsCount').toNumber(),
        reactionsCount: typeof reactionsCount?.toNumber === 'function' ? reactionsCount.toNumber() : (reactionsCount || 0),
        userReactionType: record.get('userReactionType') || null,
        allTypes: record.get('allTypes') || [],
        author: company ? {
          id: company.companyId,
          fullName: company.name,
          avatar: company.logoUrl,
          type: 'COMPANY'
        } : {
          userId: author.userId,
          fullName: author.fullName,
          avatar: author.avatarUrl,
          type: 'USER'
        }
      };
    });
  } finally {
    await session.close();
  }
};

/**
 * Retrieves a single post by ID.
 */
const getPostById = async (postId, currentUserId = null) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User)-[:POSTED]->(p:Post {id: $postId})
      OPTIONAL MATCH (u)-[:IS_RECRUITER_FOR]->(comp:Company)
      ${POST_DETAILS_FRAGMENT}
    `;
    const result = await session.run(query, { postId, currentUserId });
    if (result.records.length === 0) return null;
    
    const record = result.records[0];
    const post = record.get('p').properties;
    const author = record.get('u').properties;
    const company = record.get('comp')?.properties;
    const reactionsCount = record.get('reactionsCount');

    return {
      ...post,
      commentsCount: record.get('commentsCount').toNumber(),
      reactionsCount: typeof reactionsCount?.toNumber === 'function' ? reactionsCount.toNumber() : (reactionsCount || 0),
      userReactionType: record.get('userReactionType') || null,
      allTypes: record.get('allTypes') || [],
      author: company ? {
        id: company.companyId,
        fullName: company.name,
        avatar: company.logoUrl,
        type: 'COMPANY'
      } : {
        id: author.userId,
        fullName: author.fullName,
        avatar: author.avatarUrl,
        type: 'USER'
      }
    };
  } finally {
    await session.close();
  }
};

/**
 * Retrieves posts created by a specific user.
 */
const getUserPosts = async (userId, currentUserId = null) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User)
      WHERE u.userId = $userId OR u.id = $userId
      MATCH (u)-[:POSTED]->(p:Post)
      OPTIONAL MATCH (u)-[:IS_RECRUITER_FOR]->(comp:Company)
      ${POST_DETAILS_FRAGMENT}
      ORDER BY p.createdAt DESC
    `;
    const result = await session.run(query, { userId, currentUserId });
    return result.records.map(record => {
      const post = record.get('p').properties;
      if (post.createdAt) post.createdAt = new Date(post.createdAt.toString()).toISOString();
      if (post.updatedAt) post.updatedAt = new Date(post.updatedAt.toString()).toISOString();

      const author = record.get('u').properties;
      const company = record.get('comp')?.properties;
      const reactionsCount = record.get('reactionsCount');

      return {
        ...post,
        commentsCount: record.get('commentsCount').toNumber(),
        reactionsCount: typeof reactionsCount?.toNumber === 'function' ? reactionsCount.toNumber() : (reactionsCount || 0),
        userReactionType: record.get('userReactionType') || null,
        allTypes: record.get('allTypes') || [],
        author: company ? {
          id: company.companyId,
          fullName: company.name,
          avatar: company.logoUrl,
          type: 'COMPANY'
        } : {
          userId: author.userId,
          fullName: author.fullName,
          avatar: author.avatarUrl,
          type: 'USER'
        }
      };
    });
  } finally {
    await session.close();
  }
};

/**
 * Adds a LIKE reaction to a post.
 */
const addReaction = async (userId, postId, type) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      MATCH (p:Post {id: $postId})
      MERGE (u)-[r:REACTED_TO]->(p)
      SET r.type = $type, r.createdAt = datetime()
      RETURN p
      `,
      { userId, postId, type }
    );
    return result.records.length > 0;
  } finally {
    await session.close();
  }
};

/**
 * Removes a LIKE reaction from a post.
 */
const removeReaction = async (userId, postId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[r:REACTED_TO]->(p:Post {id: $postId})
      DELETE r
      RETURN p
      `,
      { userId, postId }
    );
    return result.records.length > 0;
  } finally {
    await session.close();
  }
};

/**
 * Adds a comment to a post.
 */
const addComment = async (userId, postId, content) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      MATCH (p:Post {id: $postId})
      CREATE (c:Comment {
        id: randomUUID(),
        content: $content,
        createdAt: datetime(),
        updatedAt: datetime(),
        isDeleted: false
      })
      CREATE (u)-[:WROTE]->(c)
      CREATE (c)-[:COMMENTED_ON]->(p)
      RETURN c, u
      `,
      { userId, postId, content }
    );
    if (result.records.length === 0) return null;
    const comment = result.records[0].get('c').properties;
    const author = result.records[0].get('u').properties;

    if (comment.createdAt && typeof comment.createdAt.toString === 'function') {
      comment.createdAt = new Date(comment.createdAt.toString()).toISOString();
    }
    if (comment.updatedAt && typeof comment.updatedAt.toString === 'function') {
      comment.updatedAt = new Date(comment.updatedAt.toString()).toISOString();
    }

    return {
      ...comment,
      author: { userId: author.userId, fullName: author.fullName, email: author.email }
    };
  } finally {
    await session.close();
  }
};

const getComments = async (postId, page = 1, limit = 10) => {
  const session = driver.session();
  try {
    const skip = (page - 1) * limit;
    const result = await session.run(
      `
      MATCH (u:User)-[:WROTE]->(c:Comment)-[:COMMENTED_ON]->(p:Post {id: $postId})
      
      OPTIONAL MATCH (c)<-[:REPLIED_TO*1..]-(reply:Comment)
      WITH c, u, count(DISTINCT reply) as replyCount
      
      OPTIONAL MATCH (c)<-[r:REACTED_TO]-(liker:User)
      WITH c, u, replyCount, r.type as rType, liker.userId as rUserId
      WITH c, u, replyCount, collect(CASE WHEN rType IS NULL THEN null ELSE {type: rType, userId: rUserId} END) as rawReacts
      WITH c, u, replyCount, [x IN rawReacts WHERE x IS NOT NULL] as reacts
      
      RETURN c, u, replyCount, size(reacts) as reactionsCount,
             head([x IN reacts WHERE x.userId = $currentUserId | x.type]) as userReactionType,
             [x IN reacts | x.type] as allTypes
      ORDER BY c.createdAt ASC
      SKIP toInteger($skip) LIMIT toInteger($limit)
      `,
      { postId, skip: parseInt(skip, 10), limit: parseInt(limit, 10), currentUserId: null } // We can update controller later to pass user ID if needed, hardcode null for now so it works without crash.
    );
    return result.records.map(record => {
      const comment = record.get('c').properties;
      const author = record.get('u').properties;
      const replyCount = record.get('replyCount').toNumber();
      
      const reactionsCount = record.get('reactionsCount');
      const userReactionType = record.get('userReactionType');
      const allTypes = record.get('allTypes');

      if (comment.createdAt && typeof comment.createdAt.toString === 'function') {
        comment.createdAt = new Date(comment.createdAt.toString()).toISOString();
      }
      if (comment.updatedAt && typeof comment.updatedAt.toString === 'function') {
        comment.updatedAt = new Date(comment.updatedAt.toString()).toISOString();
      }

      return {
        ...comment,
        replyCount,
        reactionsCount: typeof reactionsCount?.toNumber === 'function' ? reactionsCount.toNumber() : (reactionsCount || 0),
        userReactionType: userReactionType || null,
        allTypes: allTypes || [],
        author: { userId: author.userId, fullName: author.fullName, email: author.email }
      };
    });
  } finally {
    await session.close();
  }
};

const updatePost = async (userId, postId, { content, privacy }) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:POSTED]->(p:Post {id: $postId})
       SET p.content = $content, p.privacy = $privacy, p.updatedAt = datetime()
       RETURN p`,
      { userId, postId, content, privacy }
    );
    if (result.records.length === 0) return null;
    const post = result.records[0].get('p').properties;
    if (post.updatedAt) post.updatedAt = new Date(post.updatedAt.toString()).toISOString();
    return post;
  } finally {
    await session.close();
  }
};

const deletePost = async (userId, postId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId})-[:POSTED]->(p:Post {id: $postId})
       DETACH DELETE p
       RETURN count(p) AS deleted`,
      { userId, postId }
    );
    return result.records.length > 0;
  } finally {
    await session.close();
  }
};

const reportPost = async (userId, postId, reason) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId}), (p:Post {id: $postId})
       MERGE (u)-[r:REPORTED]->(p)
       ON CREATE SET r.reportId = randomUUID(), r.reason = $reason,
                     r.targetType = 'POST', r.status = 'PENDING', r.createdAt = datetime()
       RETURN r.reportId AS reportId, r.createdAt AS createdAt`,
      { userId, postId, reason }
    );
    if (result.records.length === 0) return null;
    return { reportId: result.records[0].get('reportId') };
  } finally {
    await session.close();
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  addReaction,
  removeReaction,
  addComment,
  getComments,
  getUserPosts,
  updatePost,
  deletePost,
  reportPost,
};
