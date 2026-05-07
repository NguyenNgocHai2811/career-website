require('dotenv').config();
const { applyToJob, hasApplied } = require('./src/repositories/jobRepository');
const recruiterRepo = require('./src/repositories/recruiterRepository');
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
);

async function runTest() {
  const session = driver.session();
  try {
    console.log("Setting up test data...");
    // 1. Create a dummy candidate
    const candidateId = 'test_candidate_' + Date.now();
    await session.run(`CREATE (u:User {userId: $id, fullName: 'Test Candidate', email: $id + '@test.com'})`, { id: candidateId });
    
    // 2. Create a dummy recruiter and company
    const recruiterId = 'test_recruiter_' + Date.now();
    await session.run(`CREATE (u:User {userId: $id, role: 'RECRUITER', fullName: 'Test Recruiter', email: $id + '@recruiter.com'})`, { id: recruiterId });
    
    const companyId = 'test_company_' + Date.now();
    await session.run(`CREATE (c:Company {companyId: $id, name: 'Test Company'})`, { id: companyId });
    await session.run(`MATCH (u:User {userId: $uid}), (c:Company {companyId: $cid}) CREATE (u)-[:WORKS_AT]->(c)`, { uid: recruiterId, cid: companyId });
    
    // 3. Post a job
    const jobId = 'test_job_' + Date.now();
    await session.run(`
      MATCH (u:User {userId: $uid}), (c:Company {companyId: $cid})
      CREATE (j:Job {jobId: $jid, title: 'Software Engineer', status: 'ACTIVE'})
      CREATE (u)-[:POSTED]->(j)
      CREATE (j)-[:BELONGS_TO]->(c)
    `, { uid: recruiterId, cid: companyId, jid: jobId });
    
    console.log("--- 1. Testing applyToJob with cvType='profile' ---");
    const applyData = {
      cvType: 'profile',
      cvUrl: '',
      coverLetter: 'I am a great fit for this role.'
    };
    const applyResult = await applyToJob(candidateId, jobId, applyData);
    console.log("Apply result:", applyResult);
    
    console.log("\n--- 2. Testing hasApplied ---");
    const hasAppliedResult = await hasApplied(candidateId, jobId);
    console.log("hasApplied result:", hasAppliedResult);
    
    console.log("\n--- 3. Testing Recruiter getApplicants ---");
    const applicants = await recruiterRepo.getApplicants(recruiterId, jobId);
    console.log(`Found ${applicants.length} applicants for job ${jobId}:`);
    console.log(applicants);
    
    console.log("\nCleaning up test data...");
    await session.run(`MATCH (u:User {userId: $uid}) DETACH DELETE u`, { uid: candidateId });
    await session.run(`MATCH (u:User {userId: $uid}) DETACH DELETE u`, { uid: recruiterId });
    await session.run(`MATCH (c:Company {companyId: $cid}) DETACH DELETE c`, { cid: companyId });
    await session.run(`MATCH (j:Job {jobId: $jid}) DETACH DELETE j`, { jid: jobId });
    console.log("Cleanup done. Test successful!");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await session.close();
    await driver.close();
    process.exit(0);
  }
}

runTest();
