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

const findUserByEmail = async (email) => {
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (u:User) WHERE u.email = $email RETURN u',
      { email }
    );
    if (result.records.length === 0) return null;
    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
};

// Create a new user in Neo4j
const createUser = async (userData) => {
  const session = driver.session();
  try {
    // Determine the additional label based on role
    // Role comes in as 'CANDIDATE' or 'RECRUITER' (uppercase from user input/service)
    // Map to TitleCase labels: Candidate, Recruiter
    let roleLabel = 'Candidate';
    if (userData.role === 'RECRUITER') {
      roleLabel = 'Recruiter';
    } else if (userData.role === 'CANDIDATE') {
      roleLabel = 'Candidate';
    }

    // Dynamic Label Injection (Safe because we control roleLabel values above)
    const query = `
      CREATE (u:User:${roleLabel} {
        userId: randomUUID(),
        email: $email,
        password: $password,
        fullName: $fullName,
        role: $role,
        avatarUrl: $avatarUrl,
        createdAt: datetime()
      })
      RETURN u
    `;

    const result = await session.run(query, {
      email: userData.email,
      password: userData.password, // Hashed password
      fullName: userData.fullName,
      role: userData.role || 'CANDIDATE',
      avatarUrl: userData.avatarUrl || ''
    });

    return result.records[0].get('u').properties;
  } finally {
    await session.close();
  }
};

module.exports = {
  getAllUsers,
  findUserByEmail,
  createUser
};
