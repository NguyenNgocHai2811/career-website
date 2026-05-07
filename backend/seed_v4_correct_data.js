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
const levels = ['Thực tập sinh', 'Nhân viên', 'Trưởng nhóm', 'Quản lý', 'Giám đốc'];
const experiences = ['Không yêu cầu', 'Dưới 1 năm', '1-3 năm', '3-5 năm', 'Trên 5 năm'];
const employmentTypes = ['Full-time', 'Part-time', 'Freelance', 'Remote', 'Internship'];

const jobTitles = {
  'IT / Phần mềm': ['Fullstack Developer', 'Frontend React Developer', 'Backend Node.js Engineer', 'Mobile Flutter Developer', 'DevOps Engineer', 'QA/QC Tester', 'Product Owner', 'Data Scientist'],
  'Kế toán / Kiểm toán': ['Kế toán tổng hợp', 'Kế toán thuế', 'Trưởng phòng tài chính', 'Kiểm toán viên nội bộ', 'Kế toán trưởng'],
  'Marketing / Quảng cáo': ['Digital Marketing Specialist', 'Content Creator', 'SEO/SEM Manager', 'Social Media Manager', 'Brand Manager', 'Media Planner'],
  'Kinh doanh / Bán hàng': ['Nhân viên kinh doanh', 'Tư vấn bất động sản', 'Account Manager', 'Sales Manager', 'Business Development Executive'],
  'Sản xuất / Vận hành': ['Kỹ sư vận hành', 'Quản lý sản xuất', 'Giám sát chất lượng', 'Kỹ thuật viên điện', 'Chuyền trưởng'],
  'Nhân sự / Hành chính': ['Chuyên viên tuyển dụng', 'HR Manager', 'Hành chính tổng hợp', 'C&B Specialist', 'Trợ lý giám đốc'],
  'Giáo dục / Đào tạo': ['Giảng viên tiếng Anh', 'Tư vấn giáo dục', 'Giáo viên mầm non', 'Chuyên viên đào tạo nội bộ', 'Giảng viên kỹ năng mềm'],
  'Ngân hàng / Tài chính': ['Chuyên viên tín dụng', 'Giao dịch viên', 'Phân tích đầu tư', 'Tư vấn tài chính'],
  'Y tế / Dược phẩm': ['Dược sĩ tư vấn', 'Trình dược viên', 'Bác sĩ đa khoa', 'Điều dưỡng'],
  'Xây dựng / Bất động sản': ['Kỹ sư xây dựng', 'Kiến trúc sư', 'Giám sát công trình', 'Nhân viên kinh doanh BĐS']
};

const companiesData = [
  { 
    companyId: 'comp_fpt', 
    name: 'FPT Software', 
    industry: 'IT / Phần mềm', 
    address: 'Hòa Lạc, Hà Nội',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo.svg'
  },
  { 
    companyId: 'comp_vng', 
    name: 'VNG Corporation', 
    industry: 'IT / Phần mềm', 
    address: 'Quận 7, TP. HCM',
    logoUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VNG-V.png'
  },
  { 
    companyId: 'comp_viettel', 
    name: 'Viettel Group', 
    industry: 'IT / Phần mềm', 
    address: 'Cầu Giấy, Hà Nội',
    logoUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Viettel.png'
  },
  { 
    companyId: 'comp_vin', 
    name: 'Vingroup', 
    industry: 'Xây dựng / Bất động sản', 
    address: 'Gia Lâm, Hà Nội',
    logoUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Vingroup-V.png'
  },
  { 
    companyId: 'comp_shb', 
    name: 'SHB Bank', 
    industry: 'Ngân hàng / Tài chính', 
    address: 'Hoàn Kiếm, Hà Nội',
    logoUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-SHB.png'
  },
  { 
    companyId: 'comp_vnpt', 
    name: 'VNPT', 
    industry: 'IT / Phần mềm', 
    address: 'Quận 1, TP. HCM',
    logoUrl: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VNPT.png'
  },
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedData() {
  const session = driver.session();
  try {
    console.log('🚀 Starting Corrected Seeding Process...');

    // 1. Create/Ensure Companies exist
    console.log('🏢 Creating companies...');
    for (const comp of companiesData) {
      await session.run(`
        MERGE (c:Company {companyId: $companyId})
        SET c.name = $name, c.industry = $industry, c.address = $address, c.logoUrl = $logoUrl, c.status = 'ACTIVE'
      `, comp);
    }
    console.log('✅ Companies ready.');

    // 2. Get existing recruiters
    const recruitersResult = await session.run('MATCH (r:Recruiter) RETURN r.userId LIMIT 20');
    const recruiterIds = recruitersResult.records.map(rec => rec.get(0));

    if (recruiterIds.length === 0) {
      console.error('❌ No recruiters found. Please create at least one recruiter account first.');
      return;
    }

    // 3. Clear old "OPEN" jobs from previous bad seed if any
    console.log('🧹 Cleaning up old incorrect seed data...');
    await session.run("MATCH (j:Job {status: 'OPEN'}) DETACH DELETE j");

    // 4. Generate and Insert Jobs
    const numJobs = 60;
    console.log(`⏳ Generating ${numJobs} high-quality jobs...`);

    const companyIds = companiesData.map(c => c.companyId);

    for (let i = 0; i < numJobs; i++) {
      const category = getRandom(categories);
      const title = getRandom(jobTitles[category] || [category + ' Specialist']);
      const location = getRandom(locations);
      const level = getRandom(levels);
      const experience = getRandom(experiences);
      const employmentType = getRandom(employmentTypes);
      const recruiterId = getRandom(recruiterIds);
      const companyId = getRandom(companyIds);
      const jobId = uuidv4();
      
      // Random salary
      const salaryMin = (Math.floor(Math.random() * 25) + 5) * 1000000; // 5tr - 30tr
      const salaryMax = salaryMin + (Math.floor(Math.random() * 15) + 5) * 1000000; // +5tr - 20tr
      
      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const postedAt = new Date();
      postedAt.setDate(postedAt.getDate() - daysAgo);

      const query = `
        MATCH (r:Recruiter {userId: $recruiterId})
        MATCH (c:Company {companyId: $companyId})
        CREATE (j:Job {
          jobId: $jobId,
          title: $title,
          category: $category,
          location: $location,
          level: $level,
          experience: $experience,
          employmentType: $employmentType,
          salaryMin: $salaryMin,
          salaryMax: $salaryMax,
          description: $description,
          requirements: $requirements,
          benefits: $benefits,
          status: 'ACTIVE',
          postedAt: datetime($postedAt),
          createdAt: datetime($postedAt),
          updatedAt: datetime($postedAt)
        })
        CREATE (j)-[:POSTED_BY]->(r)
        CREATE (j)-[:BELONGS_TO]->(c)
        RETURN j.jobId
      `;

      await session.run(query, {
        recruiterId,
        companyId,
        jobId,
        title,
        category,
        location,
        level,
        experience,
        employmentType,
        salaryMin,
        salaryMax,
        postedAt: postedAt.toISOString(),
        description: `Cơ hội nghề nghiệp tuyệt vời cho vị trí ${title}. Chúng tôi mong muốn tìm kiếm ứng viên có tâm huyết và kỹ năng tốt.`,
        requirements: `- Có ít nhất ${experience} kinh nghiệm.\n- Tốt nghiệp đại học chuyên ngành liên quan.\n- Thành thạo các công cụ làm việc.`,
        benefits: `- Lương thưởng hấp dẫn: ${salaryMin/1000000}-${salaryMax/1000000} triệu VNĐ.\n- Chế độ bảo hiểm, phúc lợi đầy đủ.\n- Môi trường làm việc quốc tế.`
      });

      if ((i + 1) % 10 === 0) console.log(`... Inserted ${i + 1} jobs`);
    }

    console.log('✨ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('🚀 Now check the Job Search page on the frontend.');

  } catch (error) {
    console.error('❌ Seeding Error:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedData();
