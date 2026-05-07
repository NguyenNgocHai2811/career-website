const { driver } = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

const sendConnectionRequest = async (senderId, receiverId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (s:User {userId: $senderId})
      MATCH (r:User {userId: $receiverId})
      MERGE (s)-[rel:CONNECTED_WITH]->(r)
      ON CREATE SET rel.status = 'PENDING', rel.since = datetime()
      RETURN rel
    `;
    const result = await session.run(query, { senderId, receiverId });
    return result.records[0]?.get('rel').properties;
  } finally {
    await session.close();
  }
};

const acceptConnectionRequest = async (userId, senderId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (s:User {userId: $senderId})-[rel:CONNECTED_WITH]->(r:User {userId: $userId})
      SET rel.status = 'ACCEPTED'
      // Create reverse connection for undirected graph feel
      MERGE (r)-[r_rel:CONNECTED_WITH]->(s)
      ON CREATE SET r_rel.status = 'ACCEPTED', r_rel.since = datetime()
      ON MATCH SET r_rel.status = 'ACCEPTED'
      RETURN rel
    `;
    const result = await session.run(query, { userId, senderId });
    return result.records[0]?.get('rel').properties;
  } finally {
    await session.close();
  }
};

const getConnections = async (userId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (u:User {userId: $userId})-[:CONNECTED_WITH {status: 'ACCEPTED'}]-(friend:User)
      RETURN DISTINCT friend.userId AS id, friend.fullName AS fullName, friend.avatarUrl AS avatarUrl, friend.headline AS headline
    `;
    const result = await session.run(query, { userId });
    return result.records.map(r => ({
      id: r.get('id'),
      fullName: r.get('fullName'),
      avatarUrl: r.get('avatarUrl'),
      headline: r.get('headline')
    }));
  } finally {
    await session.close();
  }
};

const searchUsersToConnect = async (userId, term) => {
  const session = driver.session();
  try {
    // Exclude self and already connected
    const query = `
      MATCH (u:User)
      WHERE u.userId <> $userId 
      AND toLower(u.fullName) CONTAINS toLower($term)
      AND NOT (u)-[:CONNECTED_WITH]-(:User {userId: $userId})
      RETURN u.userId AS id, u.fullName AS fullName, u.avatarUrl AS avatarUrl, u.headline AS headline
      LIMIT 10
    `;
    const result = await session.run(query, { userId, term });
    return result.records.map(r => ({
      id: r.get('id'),
      fullName: r.get('fullName'),
      avatarUrl: r.get('avatarUrl'),
      headline: r.get('headline')
    }));
  } finally {
    await session.close();
  }
}

const rejectConnectionRequest = async (userId, senderId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (s:User {userId: $senderId})-[rel:CONNECTED_WITH]->(r:User {userId: $userId})
      DELETE rel
    `;
    await session.run(query, { userId, senderId });
    return true;
  } finally {
    await session.close();
  }
};

const getPendingConnections = async (userId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (s:User)-[rel:CONNECTED_WITH {status: 'PENDING'}]->(u:User {userId: $userId})
      RETURN s.userId AS id, s.fullName AS fullName, s.avatarUrl AS avatarUrl, s.headline AS headline, rel.since AS requestedAt
    `;
    const result = await session.run(query, { userId });
    return result.records.map(r => ({
      id: r.get('id'),
      fullName: r.get('fullName'),
      avatarUrl: r.get('avatarUrl'),
      headline: r.get('headline'),
      requestedAt: r.get('requestedAt')
    }));
  } finally {
    await session.close();
  }
};

const removeConnection = async (userId, friendId) => {
  const session = driver.session();
  try {
    const query = `
      MATCH (a:User {userId: $userId})-[r:CONNECTED_WITH]-(b:User {userId: $friendId})
      DELETE r
    `;
    await session.run(query, { userId, friendId });
    return true;
  } finally {
    await session.close();
  }
};

const getConnectionStatus = async (currentUserId, targetUserId) => {
  const session = driver.session();
  try {
    const query = `
      OPTIONAL MATCH (me:User {userId: $currentUserId})-[sent:CONNECTED_WITH]->(target:User {userId: $targetUserId})
      OPTIONAL MATCH (target2:User {userId: $targetUserId})-[received:CONNECTED_WITH]->(me2:User {userId: $currentUserId})
      RETURN sent.status AS sentStatus, received.status AS receivedStatus
    `;
    const result = await session.run(query, { currentUserId, targetUserId });
    const record = result.records[0];
    const sentStatus = record?.get('sentStatus');
    const receivedStatus = record?.get('receivedStatus');

    if (sentStatus === 'ACCEPTED' || receivedStatus === 'ACCEPTED') return 'CONNECTED';
    if (sentStatus === 'PENDING') return 'PENDING_SENT';
    if (receivedStatus === 'PENDING') return 'PENDING_RECEIVED';
    return 'NONE';
  } finally {
    await session.close();
  }
};

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getConnectionStatus,
  getPendingConnections,
  getConnections,
  searchUsersToConnect
};
