const { driver } = require('../src/config/neo4j');
const { buildJobMetadataPatch } = require('../src/services/jobMetadataExtractor');

const backfillJobMetadata = async () => {
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (j:Job)
       RETURN j`
    );

    let updatedCount = 0;

    for (const record of result.records) {
      const job = record.get('j').properties;
      const patch = buildJobMetadataPatch(job);

      if (Object.keys(patch).length === 0) {
        continue;
      }

      await session.run(
        `MATCH (j:Job {jobId: $jobId})
         SET j += $patch, j.updatedAt = datetime()
         RETURN j`,
        { jobId: job.jobId, patch }
      );

      updatedCount += 1;
      console.log(`Backfilled metadata for ${job.title || job.jobId}: ${JSON.stringify(patch)}`);
    }

    console.log(`Backfilled metadata for ${updatedCount}/${result.records.length} jobs.`);
  } catch (error) {
    console.error('Failed to backfill job metadata:', error);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
};

backfillJobMetadata();
