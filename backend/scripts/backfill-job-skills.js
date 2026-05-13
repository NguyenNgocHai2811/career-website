const { driver } = require('../src/config/neo4j');
const { extractJobSkills } = require('../src/services/jobSkillExtractor');

const syncSkills = async (session, jobId, skills) => {
  await session.run(
    `MATCH (j:Job {jobId: $jobId})
     UNWIND $skills AS skill
     MERGE (s:Skill {name: skill.name})
     MERGE (j)-[r:REQUIRES_SKILL]->(s)
     SET r.weight = skill.weight,
         r.source = skill.source,
         r.importance = skill.importance,
         r.confidence = skill.confidence,
         r.updatedAt = datetime()`,
    { jobId, skills }
  );
};

const backfillJobSkills = async () => {
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (j:Job {status: 'ACTIVE'})
       WHERE NOT (j)-[:REQUIRES_SKILL]->(:Skill)
       RETURN j`
    );

    for (const record of result.records) {
      const job = record.get('j').properties;
      const skills = await extractJobSkills(job);

      if (skills.length === 0) {
        console.log(`Skipped ${job.title || job.jobId}: no skills detected`);
        continue;
      }

      await syncSkills(session, job.jobId, skills);
      console.log(`Backfilled ${job.title || job.jobId}: ${skills.map(skill => skill.name).join(', ')}`);
    }

    console.log(`Checked ${result.records.length} jobs for skill backfill.`);
  } catch (error) {
    console.error('Failed to backfill job skills:', error);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
};

backfillJobSkills();
