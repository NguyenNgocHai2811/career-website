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
      CREATE (p:Post {
        id: randomUUID(),
        content: $content,
        mediaUrls: $mediaUrls,
        privacy: $privacy,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      CREATE (u)-[:POSTED]->(p)
      RETURN p, u
      `,
      {
        userId,
        content: postData.content || '',
        mediaUrls: postData.mediaUrls || [],
        privacy: postData.privacy || 'Public'
      }
    );
    if (result.records.length === 0) return null;
    const post = result.records[0].get('p').properties;
    const user = result.records[0].get('u').properties;
    return { ...post, author: { userId: user.userId, fullName: user.fullName, email: user.email } };
  } finally {
    await session.close();
  }
};

/**
 * Retrieves a paginated list of posts (News Feed).
 */
const getPosts = async (cursor, limit = 10) => {
  const session = driver.session();
  try {
    // If we have a cursor, fetch posts older than the cursor.
    // We order by createdAt DESC.
    let query = `
      MATCH (u:User)-[:POSTED]->(p:Post)
    `;
    
    let parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit)) {
      parsedLimit = 10;
    }
    const params = { limit: parsedLimit };

    if (cursor) {
      query += ` WHERE p.createdAt < datetime($cursor) `;
      params.cursor = cursor;
    }

    query += `
      OPTIONAL MATCH (p)<-[:LIKES]-(liker:User)
      OPTIONAL MATCH (p)<-[:COMMENTED_ON]-(c:Comment)
      RETURN p, u, count(DISTINCT liker) as likesCount, count(DISTINCT c) as commentsCount
      ORDER BY p.createdAt DESC
      LIMIT toInteger($limit)
    `;

    const result = await session.run(query, params);
    return result.records.map(record => {
      const post = record.get('p').properties;
      const author = record.get('u').properties;
      return {
        ...post,
        likesCount: record.get('likesCount').toNumber(),
        commentsCount: record.get('commentsCount').toNumber(),
        author: {
          userId: author.userId,
          fullName: author.fullName,
          email: author.email
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
const getPostById = async (postId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User)-[:POSTED]->(p:Post {id: $postId})
      OPTIONAL MATCH (p)<-[:LIKES]-(liker:User)
      OPTIONAL MATCH (p)<-[:COMMENTED_ON]-(c:Comment)
      RETURN p, u, count(DISTINCT liker) as likesCount, count(DISTINCT c) as commentsCount
      `,
      { postId }
    );
    if (result.records.length === 0) return null;
    const post = result.records[0].get('p').properties;
    const author = result.records[0].get('u').properties;
    return {
      ...post,
      likesCount: result.records[0].get('likesCount').toNumber(),
      commentsCount: result.records[0].get('commentsCount').toNumber(),
      author: {
        userId: author.userId,
        fullName: author.fullName,
        email: author.email
      }
    };
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
      MERGE (u)-[r:LIKES]->(p)
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
      MATCH (u:User {userId: $userId})-[r:LIKES]->(p:Post {id: $postId})
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
        createdAt: datetime()
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
    return {
      ...comment,
      author: { userId: author.userId, fullName: author.fullName, email: author.email }
    };
  } finally {
    await session.close();
  }
};

/**
 * Retrieves comments for a post.
 */
const getComments = async (postId, page = 1, limit = 10) => {
  const session = driver.session();
  try {
    const skip = (page - 1) * limit;
    const result = await session.run(
      `
      MATCH (u:User)-[:WROTE]->(c:Comment)-[:COMMENTED_ON]->(p:Post {id: $postId})
      RETURN c, u
      ORDER BY c.createdAt ASC
      SKIP $skip LIMIT $limit
      `,
      { postId, skip: parseInt(skip, 10), limit: parseInt(limit, 10) }
    );
    return result.records.map(record => {
      const comment = record.get('c').properties;
      const author = record.get('u').properties;
      return {
        ...comment,
        author: { userId: author.userId, fullName: author.fullName, email: author.email }
      };
    });
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
  getComments
};
