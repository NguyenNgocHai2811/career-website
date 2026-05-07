const neo4j = require('neo4j-driver');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

const categories = [
  'IT / Phần mềm', 'Kế toán / Kiểm toán', 'Marketing / Quảng cáo', 
  'Kinh doanh / Bán hàng', 'Sản xuất / Vận hành', 'Nhân sự / Hành chính',
  'Ngân hàng / Tài chính', 'Y tế / Dược phẩm', 'Giáo dục / Đào tạo',
  'Xây dựng / Bất động sản'
];

const locations = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Đồng Nai'];

const levels = ['Nhân viên', 'Trưởng nhóm', 'Quản lý', 'Giám đốc'];

const experiences = ['Không yêu cầu', 'Dưới 1 năm', '1-3 năm', '3-5 năm', 'Trên 5 năm'];

const workTypes = ['Toàn thời gian', 'Bán thời gian', 'Làm từ xa', 'Thực tập'];

const jobTitles = {
  'IT / Phần mềm': ['Fullstack Developer', 'Frontend React Developer', 'Backend Node.js Engineer', 'Mobile Flutter Developer', 'DevOps Engineer', 'QA/QC Tester', 'Product Owner'],
  'Kế toán / Kiểm toán': ['Kế toán tổng hợp', 'Kế toán thuế', 'Trưởng phòng tài chính', 'Kiểm toán viên nội bộ'],
  'Marketing / Quảng cáo': ['Digital Marketing Specialist', 'Content Creator', 'SEO/SEM Manager', 'Social Media Manager', 'Brand Manager'],
  'Kinh doanh / Bán hàng': ['Nhân viên kinh doanh', 'Tư vấn bất động sản', 'Account Manager', 'Sales Manager'],
  'Sản xuất / Vận hành': ['Kỹ sư vận hành', 'Quản lý sản xuất', 'Giám sát chất lượng', 'Kỹ thuật viên điện'],
  'Nhân sự / Hành chính': ['Chuyên viên tuyển dụng', 'HR Manager', 'Hành chính tổng hợp', 'C&B Specialist'],
  'Giáo dục / Đào tạo': ['Giảng viên tiếng Anh', 'Tư vấn giáo dục', 'Giáo viên mầm non', 'Chuyên viên đào tạo nội bộ']
};

const companyDescriptions = [
  "Công ty công nghệ hàng đầu với môi trường năng động.",
  "Môi trường làm việc chuyên nghiệp, cơ hội thăng tiến cao.",
  "Chế độ đãi ngộ hấp dẫn, team building hàng quý.",
  "Dẫn đầu thị trường trong lĩnh vực tài chính.",
  "Startup trẻ trung, sáng tạo, không gian làm việc mở."
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSalary() {
  const types = ['Fixed', 'Range', 'Negotiable'];
  const type = getRandom(types);
  
  if (type === 'Negotiable') return 'Thỏa thuận';
  
  if (type === 'Fixed') {
    const amount = Math.floor(Math.random() * 40) + 5; // 5tr - 45tr
    return `${amount}tr`;
  }
  
  const min = Math.floor(Math.random() * 20) + 5;
  const max = min + Math.floor(Math.random() * 15) + 5;
  return `${min}-${max}tr`;
}

async function seedData() {
  const session = driver.session();
  try {
    console.log('🚀 Starting Seeding Process...');

    // 1. Get existing recruiters
    const recruitersResult = await session.run('MATCH (r:Recruiter) RETURN r.userId LIMIT 10');
    const recruiterIds = recruitersResult.records.map(rec => rec.get(0));

    if (recruiterIds.length === 0) {
      console.error('❌ No recruiters found. Please create at least one recruiter account first.');
      return;
    }

    console.log(`✅ Found ${recruiterIds.length} recruiters.`);

    // 2. Generate and Insert Jobs
    const numJobs = 60;
    console.log(`⏳ Generating ${numJobs} jobs...`);

    for (let i = 0; i < numJobs; i++) {
      const category = getRandom(categories);
      const title = getRandom(jobTitles[category] || [category + ' Specialist']);
      const location = getRandom(locations);
      const level = getRandom(levels);
      const experience = getRandom(experiences);
      const workType = getRandom(workTypes);
      const salary = getRandomSalary();
      const recruiterId = getRandom(recruiterIds);
      const jobId = uuidv4();
      
      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const query = `
        MATCH (r:Recruiter {userId: $recruiterId})
        CREATE (j:Job {
          jobId: $jobId,
          title: $title,
          category: $category,
          location: $location,
          level: $level,
          experience: $experience,
          workType: $workType,
          salary: $salary,
          description: $description,
          requirements: $requirements,
          benefits: $benefits,
          status: 'OPEN',
          createdAt: $createdAt,
          updatedAt: $createdAt
        })
        CREATE (j)-[:POSTED_BY]->(r)
        RETURN j.jobId
      `;

      await session.run(query, {
        recruiterId,
        jobId,
        title,
        category,
        location,
        level,
        experience,
        workType,
        salary,
        createdAt: createdAt.toISOString(),
        description: `Chúng tôi đang tìm kiếm một ${title} tài năng để gia nhập đội ngũ. ${getRandom(companyDescriptions)}`,
        requirements: `- Có ít nhất ${experience} kinh nghiệm ở vị trí tương đương.\n- Kỹ năng giao tiếp tốt.\n- Có khả năng làm việc độc lập và theo nhóm.`,
        benefits: `- Mức lương: ${salary}.\n- Bảo hiểm đầy đủ.\n- Thưởng lễ tết, lương tháng 13.\n- Môi trường làm việc hiện đại.`
      });

      if ((i + 1) % 10 === 0) console.log(`... Inserted ${i + 1} jobs`);
    }

    console.log('✨ Seeding Completed Successfully!');

  } catch (error) {
    console.error('❌ Seeding Error:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedData();
