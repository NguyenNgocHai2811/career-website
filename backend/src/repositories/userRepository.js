const { driver } = require('../config/neo4j');

// Get all users from Neo4j
const getAllUsers = async () => {
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (u:User) RETURN u'
    );
    return result.records.map(record => record.get('u').properties);
  } finally {
    await session.close();
  }
};

// Create a new user in Neo4j
const createUser = async (userData) => {
  const session = driver.session();
  try {
    const result = await session.run(
      'CREATE (u:User {id: randomUUID(), name: $name, email: $email, role: $role}) RETURN u',
      {
        name: userData.name,
        email: userData.email,
        role: userData.role || 'Candidate' // Default role
      }
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

module.exports = {
  getAllUsers,
  createUser,
  completeOnboarding
};
