const { driver } = require('./src/config/neo4j');
async function run() {
  const session = driver.session();
  try {
    const res = await session.run('MATCH (u:User) RETURN u.userId LIMIT 1');
    if (res.records.length > 0) {
      const userId = res.records[0].get(0);
      console.log('Found user:', userId);
      await session.run(`
        MATCH (u:User {userId: $userId})
        MERGE (c:Company {companyId: 'comp-123'})
        ON CREATE SET c.name = 'FPT Software', c.industry = 'IT'
        MERGE (u)-[:IS_RECRUITER_FOR]->(c)
        RETURN c
      `, { userId });
      console.log('Seeded company and IS_RECRUITER_FOR relationship for the user');
    } else {
        console.log('No user found to seed');
    }
  } catch(e) {
    console.error(e);
  } finally {
    await session.close();
    process.exit(0);
  }
}
run();
