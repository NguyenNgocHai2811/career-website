# KORRA - Career Social Network & Job Search Platform

KORRA là một hệ thống mạng xã hội nghề nghiệp và nền tảng tìm kiếm việc làm toàn diện. Dự án kết hợp các tính năng của một cổng thông tin việc làm truyền thống với sự tương tác của một mạng xã hội, cung cấp tính năng chat realtime, quản lý kết nối (connections), và cập nhật bảng tin (news feed).

## 🚀 Tech Stack (Công nghệ sử dụng)

### Client (Frontend)
- **Framework**: React 19 (với Vite bundler)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Real-time**: Socket.io-client
- **Testing**: Vitest, React Testing Library

### Backend (Server)
- **Runtime & Framework**: Node.js, Express v5
- **Database (Đồ thị)**: Neo4j (quản lý người dùng, công việc, kết nối mạng lưới bạn bè/follower)
- **Search Engine**: Elasticsearch (tối ưu hóa tìm kiếm việc làm)
- **Real-time Communication**: Socket.io
- **Authentication & Security**: JWT (JSON Web Token), BcryptJS, Helmet, Express Rate Limit
- **Storage/Media**: Cloudinary, Multer
- **Mail**: Nodemailer

---

## 📂 Tổ chức mã nguồn & Kiến trúc

Dự án được chia làm 2 phần chính độc lập (Monorepo-style):
- `/client`: Mã nguồn Frontend (React).
- `/backend`: Mã nguồn Backend (Node.js/Express).

### Cấu trúc Backend
Backend được tổ chức theo kiến trúc **Layered Architecture (Route-Controller-Service-Repository)** để đảm bảo tính phân tách và dễ bảo trì:

1. **`routes/`**: Định nghĩa các API endpoint (ví dụ: `/v1/auth`, `/v1/jobs`, `/v1/companies`).
2. **`middlewares/`**: Chứa các hàm trung gian như `authMiddleware.js` (xác thực token), xử lý lỗi chuyên sâu.
3. **`controllers/`**: Tiếp nhận Request từ người dùng, trích xuất dữ liệu, gọi Service xử lý và trả về Response JSON.
4. **`services/`**: Xử lý toàn bộ logic nghiệp vụ (Business Logic). Không tương tác trực tiếp với cơ sở dữ liệu.
5. **`repositories/`**: Lớp duy nhất chứa các câu lệnh truy vấn (Cypher của Neo4j hoặc query của Elasticsearch) để tương tác trực tiếp với Database.
6. **`config/`**: Các file cấu hình kết nối Neo4j, Elasticsearch.

### Cấu trúc Client
- **`src/pages/`**: Chứa các component ở cấp độ trang (ví dụ: `Dashboard`, `MessagingView`, `CompanyDetail`).
- **`src/components/`**: Các UI component có thể tái sử dụng.
- **`index.css`**: Cấu hình Tailwind CSS, theme và các biến màu sắc.
- **`main.jsx`**: Điểm neo đầu tiên (Entry Point) của React 19.

---

## ✨ Các tính năng chính (Core Features)

1. **Xác thực và Quản lý tài khoản**: Đăng ký, đăng nhập bảo mật với JWT và Bcrypt.
2. **Quản lý Hồ sơ (Profiles)**: 
   - Hồ sơ Người ứng tuyển (Candidates).
   - Hồ sơ Công ty (Company Profiles) với bảng điều khiển dành cho nhà tuyển dụng (Recruiter Dashboard).
3. **Mạng lưới kết nối (Social Graph)**:
   - Gửi/Nhận lời mời kết nối (Friend Requests, Follows).
   - Quản lý danh sách kết nối sử dụng Đồ thị Neo4j.
4. **Hệ thống tìm kiếm Việc làm cực nhanh**:
   - Sử dụng Elasticsearch để tìm kiếm và lập chỉ mục tin tuyển dụng.
5. **Trò chuyện trực tuyến (Real-time Chat)**:
   - Hệ thống tin nhắn 1-1, lưu lịch sử chat vào Neo4j.
   - Cập nhật thông báo theo thời gian thực (Socket.io).
6. **Bảng tin (News Feed)**:
   - Cập nhật thông tin từ mạng lưới kết nối và công ty đã theo dõi.

---

## 💻 Hướng dẫn chạy dự án (Getting Started)

### 1. Yêu cầu hệ thống thiết yếu
- Node.js (phiên bản khuyến nghị >= 18.x)
- Neo4j Desktop / Neo4j Aura (đã khởi chạy database)
- Elasticsearch instance
- Tài khoản Cloudinary (cho tính năng upload ảnh/CV)

### 2. Cài đặt các biến môi trường (Environment Variables)

<!-- AUTO-GENERATED:ENV -->
| Biến | Ý nghĩa | Ví dụ |
|------|---------|-------|
| `NEO4J_URI` | Địa chỉ kết nối cơ sở dữ liệu Neo4j | `bolt://localhost:7687` |
| `NEO4J_USERNAME` | Tên đăng nhập Neo4j | `neo4j` |
| `NEO4J_PASSWORD` | Mật khẩu Neo4j | `password123` |
| `JWT_SECRET` | Mã bí mật để mã hóa Token JWT | `your-secret-key` |
| `FRONTEND_URL` | Địa chỉ của ứng dụng Frontend | `http://localhost:5173` |
| `SMTP_HOST` | Địa chỉ máy chủ Email (SMTP) | `smtp.gmail.com` |
| `SMTP_PORT` | Cổng máy chủ Email | `587` |
| `SMTP_USER` | Email gửi thông báo | `example@gmail.com` |
| `SMTP_PASS` | Mật khẩu ứng dụng Email | `abcd efgh ijkl mnop` |
| `CLOUDINARY_CLOUD_NAME` | Tên Cloudinary account | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | API Key của Cloudinary | `123456789` |
| `CLOUDINARY_API_SECRET` | API Secret của Cloudinary | `secret-cloudinary-key` |
<!-- /AUTO-GENERATED:ENV -->

### 3. Các lệnh chính (Available Scripts)

#### Backend
<!-- AUTO-GENERATED:SCRIPTS_BACKEND -->
| Lệnh | Mô tả |
|------|-------|
| `npm start` | Chạy Server bằng node (Production) |
| `npm run dev` | Chạy Server với Nodemon (Development) |
<!-- /AUTO-GENERATED:SCRIPTS_BACKEND -->

#### Frontend
<!-- AUTO-GENERATED:SCRIPTS_FRONTEND -->
| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Khởi chạy Vite Dev Server |
| `npm run build` | Build dự án cho Production |
| `npm run lint` | Chạy ESLint kiểm tra code |
| `npm run preview` | Xem trước bản Build |
<!-- /AUTO-GENERATED:SCRIPTS_FRONTEND -->

### 4. Cài đặt Dependencies & Khởi chạy

Bạn cần chạy đồng thời cả Client và Backend ở 2 terminal khác nhau.

**Terminal 1: Khởi chạy Backend**
```bash
cd backend
npm install
npm run dev
```
*Backend sẽ chạy tại http://localhost:5000*

**Terminal 2: Khởi chạy Client**
```bash
cd client
npm install
npm run dev
```
*Client (Vite) sẽ chạy tại http://localhost:5173* (Có hỗ trợ Hot Module Replacement).

---

## 🔄 Luồng hoạt động cơ bản (Ví dụ: Tìm việc)

1. **Trình duyệt (Client)**: Người dùng nhập từ khóa và nhấn "Tìm kiếm". React component gọi API qua `fetch` / `axios` ví dụ: `GET /v1/jobs?keyword=react`.
2. **Backend Route & Middleware**: Express nhận request ở `jobRoutes` và kiểm tra xác thực (nếu cần).
3. **Controller & Service**: `jobController` chuyển từ khóa tìm kiếm sang `jobService`.
4. **Repository**: `jobRepository` tạo câu query gửi đến Elasticsearch hoặc thẻ tìm kiếm đồ thị trên Neo4j.
5. **Phản hồi**: Dữ liệu việc làm trả về dạng dữ liệu JSON. Client cập nhật State và hiển thị kết quả ra UI.