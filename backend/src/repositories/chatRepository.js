const { driver } = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

const saveMessage = async (senderId, receiverId, content) => {
  const session = driver.session();
  try {
    const msgId = uuidv4();
    const query = `
      MATCH (s:User {userId: $senderId})
      MATCH (r:User {userId: $receiverId})
      CREATE (s)-[:SENT]->(m:Message {
        messageId: $msgId,
        content: $content,
        createdAt: datetime()
      })-[:TO]->(r)
      // Update or create CHATS_WITH relation
      MERGE (s)-[rel1:CHATS_WITH]->(r)
      ON CREATE SET rel1.lastMessageAt = datetime()
      ON MATCH SET rel1.lastMessageAt = datetime()
      MERGE (r)-[rel2:CHATS_WITH]->(s)
      ON CREATE SET rel2.lastMessageAt = datetime()
      ON MATCH SET rel2.lastMessageAt = datetime()
      
      RETURN m, s.userId AS senderId, r.userId AS receiverId
    `;
    const result = await session.run(query, { senderId, receiverId, content });
    if (result.records.length === 0) return null;
    
    const msgData = result.records[0].get('m').properties;
    return {
      messageId: msgData.messageId,
      content: msgData.content,
      createdAt: msgData.createdAt,
      senderId,
      receiverId
    };
  } finally {
    await session.close();
  }
};

const getChatHistory = async (userId, friendId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (s:User)-[:SENT]->(m:Message)-[:TO]->(r:User)
      WHERE (s.userId = $userId AND r.userId = $friendId)
         OR (s.userId = $friendId AND r.userId = $userId)
      RETURN m.messageId AS id, m.content AS content, m.createdAt AS createdAt, s.userId AS senderId
      ORDER BY m.createdAt ASC
      LIMIT 100
    `;
    const result = await session.run(query, { userId, friendId });
    return result.records.map(rec => ({
      id: rec.get('id'),
      content: rec.get('content'),
      createdAt: rec.get('createdAt'),
      senderId: rec.get('senderId')
    }));
  } finally {
    await session.close();
  }
};

const getRecentChats = async (userId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User {userId: $userId})-[rel:CHATS_WITH]->(friend:User)
      OPTIONAL MATCH (s)-[:SENT]->(m:Message)-[:TO]->(r)
      WHERE (s.userId = $userId AND r.userId = friend.userId)
         OR (s.userId = friend.userId AND r.userId = $userId)
      WITH friend, rel.lastMessageAt AS lastMessageAt, m
      ORDER BY m.createdAt DESC
      WITH friend, lastMessageAt, collect(m)[0] AS lastMessage
      RETURN DISTINCT friend.userId AS id, friend.fullName AS fullName, friend.avatarUrl AS avatarUrl, 
             lastMessageAt, lastMessage.content AS lastMessageContent
      ORDER BY lastMessageAt DESC
    `;
    const result = await session.run(query, { userId });
    return result.records.map(rec => ({
      id: rec.get('id'),
      fullName: rec.get('fullName'),
      avatarUrl: rec.get('avatarUrl'),
      lastMessageAt: rec.get('lastMessageAt'),
      lastMessageContent: rec.get('lastMessageContent') || ''
    }));
  } finally {
    await session.close();
  }
};

module.exports = {
  saveMessage,
  getChatHistory,
  getRecentChats
};
