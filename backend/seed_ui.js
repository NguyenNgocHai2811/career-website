require('dotenv').config();
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function seed() {
  const session = driver.session();
  try {
    const recruiterEmail = 'recruiter_ui@test.com';
    const passwordHash = '$2b$10$epA1Dk5Z8n5.m2Z2aL0LVuY5O7M2x.9d1zZ.wz/XW0X.q.xV5xRZm'; // 'password'

    // Create Recruiter
    await session.run(`
      MERGE (u:User {email: $email})
      SET u.userId = 'recruiter_ui_1', u.fullName = 'Recruiter UI Test', u.password = $pass, u.role = 'RECRUITER'
    `, { email: recruiterEmail, pass: passwordHash });

    // Create Company
    await session.run(`
      MERGE (c:Company {companyId: 'company_ui_1'})
      SET c.name = 'UI Test Company', c.location = 'Ho Chi Minh'
    `);

    // Link Recruiter to Company
    await session.run(`
      MATCH (u:User {email: $email}), (c:Company {companyId: 'company_ui_1'})
      MERGE (u)-[:WORKS_AT]->(c)
    `, { email: recruiterEmail });

    // Post Job
    await session.run(`
      MATCH (u:User {email: $email}), (c:Company {companyId: 'company_ui_1'})
      MERGE (j:Job {jobId: 'job_ui_1'})
      SET j.title = 'Frontend Developer (UI Test)', j.status = 'ACTIVE', j.description = 'Test job description', j.employmentType = 'Full-time'
      MERGE (u)-[:POSTED]->(j)
      MERGE (j)-[:BELONGS_TO]->(c)
    `, { email: recruiterEmail });

    console.log("Seed complete. Recruiter: recruiter_ui@test.com / password");
  } catch (err) {
    console.error(err);
  } finally {
    await session.close();
    await driver.close();
    process.exit(0);
  }
}

seed();
