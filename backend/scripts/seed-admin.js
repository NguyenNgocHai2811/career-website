require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { driver } = require('../src/config/neo4j');
const bcrypt = require('bcryptjs');
const { generateUUID } = require('../src/utils/uuid');

async function seedAdmin() {
  const session = driver.session();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@careersite.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  try {
    const existing = await session.run(
      'MATCH (u:User {email: $email}) RETURN u',
      { email: adminEmail }
    );

    if (existing.records.length > 0) {
      console.log('Admin user already exists:', adminEmail);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await session.run(`
      CREATE (u:User:Admin {
        userId: $userId,
        role: 'ADMIN',
        fullName: 'System Admin',
        email: $email,
        password: $password,
        isOnboarded: true
      })
    `, { userId: generateUUID(), email: adminEmail, password: hashedPassword });

    console.log('✓ Admin user created:', adminEmail);
    console.log('  Password:', adminPassword);
    console.log('  Login at /admin after starting the server');
  } finally {
    await session.close();
    await driver.close();
  }
}

seedAdmin().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
