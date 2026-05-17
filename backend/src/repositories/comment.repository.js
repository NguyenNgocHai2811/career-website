const { driver } = require('../config/neo4j');

/**
 * Thêm một phản hồi (reply) cho một bình luận đã có.
 */
const replyToComment = async (userId, parentCommentId, content) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      MATCH (parent:Comment {id: $parentCommentId})
      CREATE (c:Comment {
        id: randomUUID(),
        content: $content,
        createdAt: datetime(),
        updatedAt: datetime(),
        isDeleted: false
      })
      CREATE (u)-[:WROTE]->(c)
      CREATE (c)-[:REPLIED_TO]->(parent)
      RETURN c, u
      `,
      { userId, parentCommentId, content }
    );
    if (result.records.length === 0) return null;
    const comment = result.records[0].get('c').properties;
    const author = result.records[0].get('u').properties;
    
    // Format dates
    if (comment.createdAt && typeof comment.createdAt.toString === 'function') {
      comment.createdAt = new Date(comment.createdAt.toString()).toISOString();
    }
    
    return {
      ...comment,
      author: { userId: author.userId, fullName: author.fullName, email: author.email, avatar: author.avatarUrl }
    };
  } finally {
    await session.close();
  }
};

/**
 * Lấy danh sách phản hồi của một bình luận.
 */
const getReplies = async (currentUserId, parentCommentId, cursor, limit = 10) => {
  const session = driver.session();
  try {
    let query = `MATCH (u:User)-[:WROTE]->(c:Comment)-[:REPLIED_TO*1..]->(parent:Comment {id: $parentCommentId})`;
    const params = { parentCommentId, limit: parseInt(limit, 10) };
    if (currentUserId) {
      params.currentUserId = currentUserId;
    } else {
      params.currentUserId = null;
    }

    if (cursor) {
      query += ` WHERE c.createdAt > datetime($cursor) `;
      params.cursor = cursor;
    }

    query += `
      OPTIONAL MATCH (c)-[:REPLIED_TO]->(target:Comment)<-[:WROTE]-(targetUser:User)
      WITH c, u, parent, targetUser, CASE WHEN target.id = parent.id THEN null ELSE targetUser END as finalTargetUser
      
      OPTIONAL MATCH (c)<-[:REPLIED_TO*1..]-(reply:Comment)
      WITH c, u, finalTargetUser, count(DISTINCT reply) as replyCount
      
      OPTIONAL MATCH (c)<-[r:REACTED_TO]-(liker:User)
      WITH c, u, finalTargetUser, replyCount, r.type as rType, liker.userId as rUserId
      WITH c, u, finalTargetUser, replyCount, collect(CASE WHEN rType IS NULL THEN null ELSE {type: rType, userId: rUserId} END) as rawReacts
      WITH c, u, finalTargetUser, replyCount, [x IN rawReacts WHERE x IS NOT NULL] as reacts
      
      RETURN c, u, finalTargetUser as targetUser, replyCount, size(reacts) as reactionsCount,
             head([x IN reacts WHERE x.userId = $currentUserId | x.type]) as userReactionType,
             [x IN reacts | x.type] as allTypes
      ORDER BY c.createdAt ASC
      LIMIT toInteger($limit)
    `;

    const result = await session.run(query, params);
    return result.records.map(record => {
      const comment = record.get('c').properties;
      const author = record.get('u').properties;
      const targetUser = record.get('targetUser') ? record.get('targetUser').properties : null;
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
        targetUser: targetUser ? { userId: targetUser.userId, fullName: targetUser.fullName, avatar: targetUser.avatarUrl } : null,
        author: { userId: author.userId, fullName: author.fullName, email: author.email, avatar: author.avatarUrl }
      };
    });
  } finally {
    await session.close();
  }
};

/**
 * Chỉnh sửa bình luận.
 */
const updateComment = async (userId, commentId, content) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[:WROTE]->(c:Comment {id: $commentId})
      WHERE c.isDeleted IS NULL OR c.isDeleted = false
      SET c.content = $content, c.updatedAt = datetime()
      RETURN c, u
      `,
      { userId, commentId, content }
    );
    if (result.records.length === 0) throw new Error('Comment not found or not authorized to edit');
    const comment = result.records[0].get('c').properties;
    return comment;
  } finally {
    await session.close();
  }
};

/**
 * Xóa mềm bình luận (Cập nhật isDeleted = true).
 */
const deleteComment = async (userId, commentId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[:WROTE]->(c:Comment {id: $commentId})
      SET c.isDeleted = true, c.content = "Bình luận này đã bị xóa", c.updatedAt = datetime()
      RETURN c
      `,
      { userId, commentId }
    );
    if (result.records.length === 0) throw new Error('Comment not found or not authorized to delete');
    return result.records[0].get('c').properties;
  } finally {
    await session.close();
  }
};

/**
 * Adds a reaction to a comment.
 */
const addReaction = async (userId, commentId, type) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})
      MATCH (c:Comment {id: $commentId})
      MERGE (u)-[r:REACTED_TO]->(c)
      SET r.type = $type, r.createdAt = datetime()
      RETURN c
      `,
      { userId, commentId, type }
    );
    if (result.records.length === 0) throw new Error('Comment not found');
    return true;
  } finally {
    await session.close();
  }
};

/**
 * Removes a reaction from a comment.
 */
const removeReaction = async (userId, commentId) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {userId: $userId})-[r:REACTED_TO]->(c:Comment {id: $commentId})
      DELETE r
      RETURN c
      `,
      { userId, commentId }
    );
    if (result.records.length === 0) throw new Error('Reaction or Comment not found');
    return true;
  } finally {
    await session.close();
  }
};

module.exports = {
  replyToComment,
  getReplies,
  updateComment,
  deleteComment,
  addReaction,
  removeReaction
};
