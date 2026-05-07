const { driver } = require('./src/config/neo4j');

const categories = ['IT', 'Kế toán', 'Bán hàng', 'Marketing', 'Nhân sự', 'Sản xuất', 'Thiết kế'];
const experiences = ['Không yêu cầu', 'Dưới 1 năm', '1-3 năm', '3-5 năm', 'Trên 5 năm'];
const levels = ['Thực tập sinh', 'Nhân viên', 'Trưởng nhóm', 'Quản lý', 'Giám đốc'];

const seedData = async () => {
  const session = driver.session();
  try {
    console.log('Fetching all jobs to patch...');
    const result = await session.run('MATCH (j:Job) RETURN j.jobId AS jobId');
    
    const jobIds = result.records.map(r => r.get('jobId'));
    console.log(`Found ${jobIds.length} jobs.`);

    for (const jobId of jobIds) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const experience = experiences[Math.floor(Math.random() * experiences.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      
      // Randomly assign a salary if not present or just override for testing
      // Salary ranges: 3M-5M, 5M-10M, 10M-15M, 15M-20M, 20M+
      const minSalaries = [3000000, 5000000, 10000000, 15000000, 20000000];
      const salaryMin = minSalaries[Math.floor(Math.random() * minSalaries.length)];
      const salaryMax = salaryMin + Math.floor(Math.random() * 5000000) + 1000000;

      await session.run(`
        MATCH (j:Job {jobId: $jobId})
        SET j.category = $category,
            j.experience = $experience,
            j.level = $level,
            j.salaryMin = $salaryMin,
            j.salaryMax = $salaryMax
      `, { jobId, category, experience, level, salaryMin, salaryMax });
    }
    
    console.log('Successfully patched jobs with V2 filter data.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await session.close();
    process.exit(0);
  }
};

seedData();
