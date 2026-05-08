/**
 * AI Service — Career Explorer (V2)
 *
 * Tách từng phase của Career Explorer thành 5 hàm riêng:
 *   - generateTasks: gợi ý nhiệm vụ thường ngày của 1 vị trí
 *   - generateSkills: gợi ý kỹ năng phù hợp với role + tasks
 *   - generateIdentityStatement: tổng hợp Career Identity Statement
 *   - generateCareerPaths: sinh galaxy 8-10 nghề (database + AI gợi ý)
 *   - generateCareerDetail: chi tiết 4 section của 1 nghề
 *
 * Provider: Google Gemini với responseMimeType=JSON.
 * Khi Gemini fail → mock fallback đúng schema từng phase.
 */

const geminiProvider = require('./providers/geminiProvider');

const stripFences = (text = '') =>
  text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

/**
 * Helper chung: gửi 1 prompt tới Gemini, parse JSON, fallback mock nếu fail.
 * @param {string} promptText
 * @param {object} mockFallback - object đúng schema kỳ vọng
 * @returns {Promise<object>}
 */
const callGeminiJson = async (promptText, mockFallback) => {
  let rawText = '';
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('No Gemini API Key configured');
    }
    rawText = await geminiProvider.chat([{ role: 'user', text: promptText }]);
    const parsed = JSON.parse(stripFences(rawText));
    return parsed;
  } catch (err) {
    console.warn('[aiService] Gemini failed or invalid JSON, using mock fallback:', err.message);
    return mockFallback;
  }
};

// ─── PROMPTS ────────────────────────────────────────────────────────────────

const TASKS_PROMPT = ({ role, organization }) => `Bạn là chuyên gia tư vấn nghề nghiệp Việt Nam.
Hãy liệt kê chính xác 6 nhiệm vụ chính, hàng ngày của một người ở vị trí "${role}"${organization ? ` tại "${organization}"` : ''}.
Mỗi nhiệm vụ: 1 câu tiếng Việt, ngắn gọn (≤ 25 từ), tả động từ + đối tượng cụ thể.
Trả về JSON đúng cấu trúc:
{ "tasks": ["nhiệm vụ 1", "nhiệm vụ 2", "nhiệm vụ 3", "nhiệm vụ 4", "nhiệm vụ 5", "nhiệm vụ 6"] }
Chỉ trả JSON, không thêm text khác.`;

const SKILLS_PROMPT = ({ role, tasks }) => `Bạn là chuyên gia tư vấn nghề nghiệp Việt Nam.
Vị trí: "${role}"
Các nhiệm vụ người dùng đã thực hiện:
${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Hãy liệt kê chính xác 8 kỹ năng phù hợp nhất với người ở vị trí trên. Mỗi kỹ năng:
- 1-3 từ tiếng Việt (ví dụ: "Lập trình", "Giao tiếp nhóm", "Phân tích dữ liệu").
- Mix 60% kỹ năng cứng (technical) + 40% kỹ năng mềm (soft skills).

Trả về JSON đúng cấu trúc:
{ "skills": ["kỹ năng 1", "kỹ năng 2", "kỹ năng 3", "kỹ năng 4", "kỹ năng 5", "kỹ năng 6", "kỹ năng 7", "kỹ năng 8"] }
Chỉ trả JSON, không thêm text khác.`;

const IDENTITY_PROMPT = ({ role, organization, tasks, skills, profileContext }) => `Bạn là chuyên gia tư vấn nghề nghiệp Việt Nam, viết với giọng văn chuyên nghiệp nhưng truyền cảm.

THÔNG TIN HỒ SƠ NGƯỜI DÙNG (đã xác minh từ KORRA):
${profileContext}

THÔNG TIN BỔ SUNG TỪ WIZARD:
- Vị trí gần nhất: ${role}${organization ? ` tại ${organization}` : ''}
- Các nhiệm vụ đã làm: ${tasks.join('; ')}
- Kỹ năng tự đánh giá: ${skills.join(', ')}

Hãy viết 1 đoạn "Career Identity Statement" tiếng Việt cho người dùng:
- Độ dài: 3-5 câu, khoảng 100-180 ký tự mỗi câu.
- Ngôi xưng: "Tôi" (first person).
- Cấu trúc: (1) Tôi làm gì + giá trị tạo ra. (2) Phương pháp/cách tiếp cận của tôi. (3) Kinh nghiệm cụ thể tóm tắt.
- KHÔNG sáo rỗng, KHÔNG dùng cliché ("đam mê", "thử thách bản thân"...).

Trả về JSON đúng cấu trúc:
{ "statement": "đoạn văn..." }
Chỉ trả JSON, không thêm text khác.`;

const PATHS_PROMPT = ({ identityStatement, skills }) => `Bạn là chuyên gia bản đồ nghề nghiệp Việt Nam.

HỒ SƠ NGƯỜI DÙNG (Career Identity Statement):
"${identityStatement}"

KỸ NĂNG: ${skills.join(', ')}

Hãy gợi ý chính xác 10 lộ trình nghề nghiệp phù hợp với người dùng này, dưới dạng "galaxy map":
- 5 nghề có gắn nhãn type "db" (nghề truyền thống/database — IT, kỹ thuật, marketing...).
- 5 nghề có gắn nhãn type "ai" (nghề mới nổi/AI-driven — ML engineer, prompt engineer, AI ethicist, data scientist, automation specialist...).
- Mỗi nghề có x, y trong khoảng [0.05, 0.95]. PHẢI tránh vùng trung tâm 0.40-0.60 (đó là center orb).
- Phân tán đều xung quanh, không chồng chéo (khoảng cách giữa 2 nodes bất kỳ ≥ 0.15 trên ít nhất 1 chiều).
- id: kebab-case tiếng Anh (ví dụ "fullstack-dev", "data-engineer").
- title: tiếng Việt, súc tích.
- salary: theo định dạng "X-Y triệu/tháng" (Việt Nam thực tế 2026).
- degree: bằng cấp tối thiểu (ví dụ "Đại học CNTT", "Cao đẳng Marketing").

Trả về JSON đúng cấu trúc:
{ "paths": [
  { "id": "...", "title": "...", "type": "db", "salary": "...", "degree": "...", "x": 0.0, "y": 0.0 },
  ...
] }
Chỉ trả JSON, không thêm text khác.`;

const DETAIL_PROMPT = ({ careerId, careerTitle, profileContext }) => `Bạn là chuyên gia tư vấn nghề nghiệp Việt Nam.

NGHỀ CẦN GIẢI THÍCH: ${careerTitle} (id: ${careerId})

HỒ SƠ NGƯỜI DÙNG (để cá nhân hoá phần "sweet spots"):
${profileContext}

Hãy mô tả chi tiết nghề này theo 4 section:

1. description: 2-3 câu tiếng Việt về công việc thực tế hàng ngày + công cụ chính.
2. sweetSpots: 1-2 câu giải thích VÌ SAO nghề này phù hợp với hồ sơ người dùng (cá nhân hoá, dùng chi tiết từ profile).
3. dayInLife: array 5 việc cụ thể trong ngày làm việc (mỗi item 1 câu, có động từ chủ đạo).
4. courses: array 3 khoá học/tài nguyên thực tế:
   - title: tên khoá học (có thật, ví dụ "The Complete Web Developer Bootcamp").
   - platform: tên platform (Udemy, Coursera, edX, FreeCodeCamp, Google, Microsoft Learn...).
   - icon: 1 emoji phù hợp ("🎓", "📚", "☁️", "🤖", "💻", "📊"...).

Trả về JSON đúng cấu trúc:
{
  "description": "...",
  "sweetSpots": "...",
  "dayInLife": ["...", "...", "...", "...", "..."],
  "courses": [
    { "title": "...", "platform": "...", "icon": "..." },
    { "title": "...", "platform": "...", "icon": "..." },
    { "title": "...", "platform": "...", "icon": "..." }
  ]
}
Chỉ trả JSON, không thêm text khác.`;

// ─── MOCK FALLBACKS ─────────────────────────────────────────────────────────

const MOCK_TASKS = {
  tasks: [
    'Thiết kế và phát triển các tính năng mới cho sản phẩm.',
    'Viết code sạch, dễ bảo trì và có hiệu suất cao.',
    'Phối hợp với team để định nghĩa và triển khai yêu cầu.',
    'Review code và đảm bảo chất lượng sản phẩm.',
    'Xử lý lỗi và tối ưu hiệu năng hệ thống.',
    'Tham gia họp daily standup và sprint planning.',
  ],
};

const MOCK_SKILLS = {
  skills: [
    'Giải quyết vấn đề', 'Lập trình', 'Cấu trúc dữ liệu',
    'Thuật toán', 'Kiểm thử phần mềm', 'Quản lý phiên bản (Git)',
    'Thiết kế phần mềm', 'Giao tiếp nhóm',
  ],
};

const MOCK_IDENTITY = {
  statement: 'Tôi phát triển các giải pháp phần mềm có khả năng mở rộng bằng cách kết hợp code sạch và dễ bảo trì với nền tảng vững chắc về cấu trúc dữ liệu và kiểm thử hệ thống. Phương pháp của tôi tập trung vào việc giải quyết các thách thức kỹ thuật phức tạp thông qua phát triển cộng tác và liên tục cải tiến hệ thống hiện có. Với kinh nghiệm là chuyên gia trong lĩnh vực, tôi mang lại giá trị thực tiễn cho mọi dự án.',
};

const MOCK_PATHS = {
  paths: [
    { id: 'fullstack-dev', title: 'Lập trình viên Fullstack', type: 'db', salary: '25-45 triệu/tháng', degree: 'Đại học CNTT', x: 0.25, y: 0.18 },
    { id: 'backend-eng',   title: 'Kỹ sư Backend',           type: 'db', salary: '22-40 triệu/tháng', degree: 'Đại học CNTT', x: 0.15, y: 0.42 },
    { id: 'frontend-dev',  title: 'Lập trình viên Frontend',  type: 'db', salary: '20-38 triệu/tháng', degree: 'Đại học CNTT', x: 0.30, y: 0.65 },
    { id: 'devops-eng',    title: 'Kỹ sư DevOps',             type: 'db', salary: '28-50 triệu/tháng', degree: 'Đại học CNTT', x: 0.68, y: 0.20 },
    { id: 'mobile-dev',    title: 'Lập trình viên Mobile',    type: 'db', salary: '22-42 triệu/tháng', degree: 'Đại học CNTT', x: 0.12, y: 0.78 },
    { id: 'ml-eng',        title: 'Kỹ sư Machine Learning',   type: 'ai', salary: '35-70 triệu/tháng', degree: 'Thạc sĩ / Đại học', x: 0.78, y: 0.44 },
    { id: 'data-eng',      title: 'Kỹ sư Dữ liệu',            type: 'ai', salary: '28-55 triệu/tháng', degree: 'Đại học CNTT',    x: 0.72, y: 0.68 },
    { id: 'product-mgr',   title: 'Quản lý Sản phẩm (PM)',    type: 'ai', salary: '30-60 triệu/tháng', degree: 'Đa ngành',        x: 0.50, y: 0.08 },
    { id: 'security-spec', title: 'Chuyên gia Bảo mật',       type: 'ai', salary: '32-65 triệu/tháng', degree: 'Đại học CNTT',    x: 0.50, y: 0.88 },
    { id: 'cloud-arch',    title: 'Kiến trúc sư Cloud',        type: 'ai', salary: '40-80 triệu/tháng', degree: 'Đại học / Chứng chỉ', x: 0.88, y: 0.32 },
  ],
};

const MOCK_DETAIL = {
  description: 'Người làm vai trò này phát triển và bảo trì các hệ thống phần mềm. Bạn sẽ làm việc với code, công cụ phát triển và hợp tác cùng team để giải quyết các vấn đề kỹ thuật. Công việc đòi hỏi tư duy logic và khả năng học hỏi liên tục.',
  sweetSpots: 'Hồ sơ của bạn cho thấy nền tảng kỹ năng và kinh nghiệm phù hợp với vai trò này. Khả năng giải quyết vấn đề và tinh thần học hỏi sẽ giúp bạn nhanh chóng thích nghi với môi trường làm việc thực tế.',
  dayInLife: [
    'Tham gia họp daily standup để cập nhật tiến độ với team.',
    'Phát triển và review các feature mới theo sprint.',
    'Debug và xử lý các issue được báo cáo.',
    'Viết unit test và cải thiện coverage.',
    'Tham gia code review và cải tiến kiến trúc hệ thống.',
  ],
  courses: [
    { title: 'The Complete Web Developer Bootcamp', platform: 'Udemy', icon: '🎓' },
    { title: 'CS50: Introduction to Computer Science', platform: 'edX (Harvard)', icon: '📚' },
    { title: 'Google Cloud Professional Developer', platform: 'Google Cloud', icon: '☁️' },
  ],
};

// ─── PUBLIC API ─────────────────────────────────────────────────────────────

const generateTasks = ({ role, organization = '' }) =>
  callGeminiJson(TASKS_PROMPT({ role, organization }), MOCK_TASKS);

const generateSkills = ({ role, tasks }) =>
  callGeminiJson(SKILLS_PROMPT({ role, tasks }), MOCK_SKILLS);

const generateIdentityStatement = ({ role, organization = '', tasks, skills, profileContext }) =>
  callGeminiJson(
    IDENTITY_PROMPT({ role, organization, tasks, skills, profileContext }),
    MOCK_IDENTITY
  );

const generateCareerPaths = ({ identityStatement, skills }) =>
  callGeminiJson(PATHS_PROMPT({ identityStatement, skills }), MOCK_PATHS);

const generateCareerDetail = ({ careerId, careerTitle, profileContext }) =>
  callGeminiJson(DETAIL_PROMPT({ careerId, careerTitle, profileContext }), MOCK_DETAIL);

module.exports = {
  generateTasks,
  generateSkills,
  generateIdentityStatement,
  generateCareerPaths,
  generateCareerDetail,
};
