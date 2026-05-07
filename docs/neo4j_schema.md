# SCHEMA CƠ SỞ DỮ LIỆU ĐỒ THỊ (NEO4J) - CAREER SOCIAL NETWORK

Tài liệu này mô tả chi tiết các Nodes (Thực thể) và Relationships (Quan hệ) cho hệ thống Mạng xã hội tuyển dụng & Phát triển sự nghiệp.

## I. NODE LABELS (CÁC THỰC THỂ)

### 1. User (Người dùng)
Đại diện cho cả Ứng viên (Candidate) và Nhà tuyển dụng (Recruiter).
- **Properties**:
  - `userId` (String, Unique, Index): ID định danh hệ thống.
  - `email` (String): Email đăng nhập.
  - `password` (String): Hash mật khẩu.
  - `fullName` (String): Tên hiển thị.
  - `role` (String): 'CANDIDATE', 'RECRUITER', 'ADMIN'.
  - `avatarUrl`, `bio`, `phone`, `address`: Thông tin profile.
  - `createdAt` (Datetime).

### 2. Company (Công ty)
Tổ chức, doanh nghiệp. Dùng cho cả lịch sử làm việc (CV) và đơn vị tuyển dụng.
- **Properties**:
  - `companyId` (String, Unique, Index).
  - `name` (String): Tên công ty (VD: FPT Software).
  - `slug` (String): Tên định danh trên URL.
  - `logoUrl`, `websiteUrl`, `industry`, `size`, `description`.
  - `isVerified` (Boolean): Đã xác thực doanh nghiệp chưa.

### 3. Job (Tin tuyển dụng)
Bài đăng tuyển dụng cụ thể.
- **Properties**:
  - `jobId` (String, Unique, Index).
  - `title`: Tên vị trí (VD: Senior React Developer).
  - `description`: Nội dung mô tả.
  - `status`: 'ACTIVE', 'CLOSED', 'DRAFT', 'PENDING'.
  - `salaryMin`, `salaryMax`, `currency`.
  - `employmentType`: Full-time, Remote, etc.
  - `postedAt`, `expirationDate`.
  - `numApplicants` (Int): Counter cache (tùy chọn).

### 4. Skill (Kỹ năng - Cốt lõi của Roadmap)
- **Properties**:
  - `name` (String, Unique): VD: "React.js".
  - `normalizedName` (String): VD: "reactjs" (để search).

### 5. Các Node bổ trợ (Profile & Content)
- **School**: name, logoUrl.
- **Project**: name, url, description, startDate, endDate.
- **Certificate**: name, issuer, credentialUrl, issueDate.
- **Location**: name (City/Country), coordinates.
- **Post**: postId, content, mediaUrls, privacy, createdAt.
- **Comment**: commentId, content, createdAt.
- **Hashtag**: name (VD: "#OpenToWork").

---

## II. RELATIONSHIPS (CÁC MỐI QUAN HỆ)

### A. QUẢN TRỊ & TUYỂN DỤNG (UPDATED - QUAN TRỌNG)
Phần này đã được tách biệt giữa "Làm việc trong CV" và "Quyền quản trị tuyển dụng".

#### 1. Quan hệ Quản trị (Admin/Recruiter Rights)
Xác định User nào có quyền đăng bài cho Company nào.
- **Pattern**: `(:User)-[:IS_RECRUITER_FOR]->(:Company)`
- **Properties**:
  - `role`: 'ADMIN' (Sửa info công ty), 'MEMBER' (Chỉ đăng bài).
  - `status`: 'PENDING' (Chờ duyệt), 'ACTIVE' (Đang hoạt động), 'SUSPENDED'.
  - `since`: Ngày cấp quyền.
  - `type`: 'INTERNAL' (HR nội bộ) hoặc 'AGENCY' (Headhunter thuê ngoài).

#### 2. Quan hệ Đăng tuyển (Job Ownership)
Mô hình "Tam giác" để biết chính xác ai đăng và tuyển cho công ty nào.
- **Tác giả bài đăng**: `(:User)-[:POSTED {at: Datetime}]->(:Job)`
  - *Ý nghĩa*: User này chịu trách nhiệm về nội dung bài đăng (KPI nhân viên).
- **Sở hữu bài đăng**: `(:Job)-[:BELONGS_TO]->(:Company)`
  - *Ý nghĩa*: Job này xuất hiện trên trang của Công ty này.

#### 3. Quan hệ Ứng tuyển
- **Pattern**: `(:User)-[:APPLIED_TO]->(:Job)`
- **Properties**:
  - `cvUrl`: Link CV dùng để ứng tuyển.
  - `status`: 'PENDING', 'REVIEWING', 'INTERVIEWING', 'OFFERED', 'REJECTED'.
  - `appliedAt`: Thời gian nộp.

### B. HỒ SƠ ỨNG VIÊN (CV & PROFILE)

#### 1. Kinh nghiệm làm việc (Work History)
Chỉ mang ý nghĩa hiển thị trên Profile, không cấp quyền Admin.
- **Pattern**: `(:User)-[:WORKED_AT]->(:Company)`
- **Properties**:
  - `title`: Chức danh (VD: Developer).
  - `startDate`, `endDate`: Thời gian.
  - `isCurrent` (Boolean): Đang làm việc?
  - `description`: Mô tả công việc.

#### 2. Kỹ năng & Học vấn
- `(:User)-[:HAS_SKILL {level: '...'}]->(:Skill)`
- `(:User)-[:STUDIED_AT {degree: '...', major: '...'}]->(:School)`
- `(:User)-[:HAS_CERTIFICATE]->(:Certificate)`
- `(:User)-[:WORKED_ON {role: '...'}]->(:Project)`
- `(:Project)-[:USES_SKILL]->(:Skill)` (Để biết project dùng công nghệ gì).

### C. TÍNH NĂNG ROADMAP & GỢI Ý

#### 1. Yêu cầu của Job
- **Pattern**: `(:Job)-[:REQUIRES_SKILL]->(:Skill)`
- **Properties**:
  - `weight` (Integer): Độ quan trọng (VD: 5 = Bắt buộc, 1 = Nên có). Dùng để tính % phù hợp (Matching Score).

#### 2. Quan hệ giữa các Skill (Knowledge Graph)
Giúp hệ thống gợi ý lộ trình học.
- **Pattern**: `(:Skill)-[:RELATED_TO {strength: Int}]->(:Skill)`
  - *VD*: `(React)-[:RELATED_TO]->(JavaScript)`.
- **Pattern**: `(:Skill)-[:PREREQUISITE_FOR]->(:Skill)` (Tùy chọn nâng cao).

### D. MẠNG XÃ HỘI (SOCIAL ENGAGEMENT)

#### 1. Kết nối & Theo dõi
- **Kết bạn**: `(:User)-[:CONNECTED_WITH {status: 'ACCEPTED', since: Date}]->(:User)`
- **Theo dõi người khác**: `(:User)-[:FOLLOWS]->(:User)`
- **Theo dõi công ty**: `(:User)-[:FOLLOWS]->(:Company)`

#### 2. Tương tác Nội dung
- **Đăng bài**: `(:User)-[:CREATED]->(:Post)`
- **Chia sẻ**:
  - `(:Post)-[:SHARED_FROM]->(:Post)` (Share bài viết).
  - `(:Post)-[:SHARES_JOB]->(:Job)` (Share tin tuyển dụng).
- **Hashtag**: `(:Post)-[:TAGGED_WITH]->(:Hashtag)`
- **Like/Tim**: `(:User)-[:REACTED {type: 'LIKE'|'LOVE'}]->(:Post)`
- **Comment**:
  - `(:User)-[:WROTE]->(:Comment)`
  - `(:Comment)-[:BELONGS_TO]->(:Post)`
  - `(:Comment)-[:REPLY_TO]->(:Comment)` (Nested comments).

#### 3. Chat (Hybrid)
- **Pattern**: `(:User)-[:CHATS_WITH {lastMessageAt: Datetime}]->(:User)`
- **Lưu ý**: Chỉ lưu quan hệ để hiển thị danh sách chat gần đây. Nội dung tin nhắn lưu tại MongoDB/Firebase.

---

## III. VÍ DỤ TRUY VẤN (CYPHER EXAMPLES)

### 1. Kiểm tra quyền đăng bài
*Kịch bản*: User A muốn đăng Job cho Công ty B. Hệ thống kiểm tra xem có được phép không.
```cypher
MATCH (u:User {userId: 'user_A_id'})
MATCH (c:Company {companyId: 'company_B_id'})
RETURN EXISTS( (u)-[:IS_RECRUITER_FOR {status: 'ACTIVE'}]->(c) ) as hasPermission
```

### 2. Tìm ứng viên phù hợp cho Job (Job Matching)
*Kịch bản*: Tìm người có Skill trùng với yêu cầu của Job.
```cypher
MATCH (j:Job {jobId: 'target_job_id'})-[:REQUIRES_SKILL]->(s:Skill)
MATCH (u:User)-[:HAS_SKILL]->(s)
WHERE u.role = 'CANDIDATE'
RETURN u.fullName, count(s) as matchingSkills
ORDER BY matchingSkills DESC
LIMIT 10
```

### 3. Lấy Newsfeed cho User
*Kịch bản*: Lấy bài viết từ bạn bè và các công ty đang follow.
```cypher
MATCH (me:User {userId: 'current_user'})
MATCH (me)-[:CONNECTED_WITH|FOLLOWS]->(source)
MATCH (source)-[:CREATED|POSTED|SHARED_FROM]->(content)
RETURN content
ORDER BY content.createdAt DESC
LIMIT 20
```
