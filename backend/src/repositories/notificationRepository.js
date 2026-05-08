const { driver } = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

const createNotification = async (userId, type, content, referenceId = null) => {
  const session = driver.session();
  try {
    const notificationId = uuidv4();
    const query = `
      MATCH (u:User {userId: $userId})
      CREATE (u)-[:HAS_NOTIFICATION]->(n:Notification {
        id: $notificationId,
        type: $type,
        content: $content,
        referenceId: $referenceId,
        isRead: false,
        createdAt: datetime()
      })
      RETURN n
    `;
    const result = await session.run(query, { userId, type, content, referenceId, notificationId });
    if (result.records.length === 0) return null;
    return result.records[0].get('n').properties;
  } finally {
    await session.close();
  }
};

const getNotifications = async (userId, limit = 20, skip = 0) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User {userId: $userId})-[:HAS_NOTIFICATION]->(n:Notification)
      RETURN n
      ORDER BY n.createdAt DESC
      SKIP toInteger($skip) LIMIT toInteger($limit)
    `;
    const result = await session.run(query, { userId, limit, skip });
    return result.records.map(r => r.get('n').properties);
  } finally {
    await session.close();
  }
};

const getUnreadCount = async (userId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User {userId: $userId})-[:HAS_NOTIFICATION]->(n:Notification)
      WHERE n.isRead = false
      RETURN count(n) AS unreadCount
    `;
    const result = await session.run(query, { userId });
    if (result.records.length === 0) return 0;
    return result.records[0].get('unreadCount').toNumber();
  } finally {
    await session.close();
  }
};

const markAsRead = async (notificationIds) => {
  const session = driver.session();
  try {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    const query = `
      MATCH (n:Notification)
      WHERE n.id IN $ids
      SET n.isRead = true
      RETURN count(n) AS updatedCount
    `;
    const result = await session.run(query, { ids });
    if (result.records.length === 0) return 0;
    return result.records[0].get('updatedCount').toNumber();
  } finally {
    await session.close();
  }
};

const markAllAsRead = async (userId) => {
  const session = driver.session();
  try {
    await session.run(
      `MATCH (:User {userId: $userId})-[:HAS_NOTIFICATION]->(n:Notification {isRead: false})
       SET n.isRead = true`,
      { userId }
    );
  } finally {
    await session.close();
  }
};

const deleteOldNotifications = async (days = 30) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (n:Notification)
      WHERE duration.between(n.createdAt, datetime()).days > $days
      DETACH DELETE n
      RETURN count(n) AS deletedCount
    `;
    const result = await session.run(query, { days });
    if (result.records.length === 0) return 0;
    return result.records[0].get('deletedCount').toNumber();
  } finally {
    await session.close();
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteOldNotifications
};
