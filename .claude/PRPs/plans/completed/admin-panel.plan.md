# Plan: Admin Panel

## Summary
Thêm trang quản trị (admin panel) vào career website để quản lý người dùng, tin tuyển dụng, bài đăng và công ty. Cần thêm role ADMIN vào hệ thống auth hiện có (hiện chỉ có CANDIDATE và RECRUITER), tạo các API admin trên backend, và xây dựng giao diện admin dashboard trên frontend với sidebar navigation.

## User Story
As an admin,
I want a dashboard to manage all users, jobs, posts, and companies on the platform,
So that I can moderate content, handle user issues, and monitor platform health.

## Problem → Solution
Hiện tại không có cơ chế quản trị nào → Thêm role ADMIN + backend API admin + frontend admin panel với dashboard, quản lý users, jobs, posts.

## Metadata
- **Complexity**: Large
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 15 files (4 backend + 7 frontend + 4 modified)

---

## UX Design

### Before
```
┌─────────────────────────┐
│  Không có admin panel   │
│  Không có role ADMIN    │
│  Không quản lý được     │
│  nội dung platform      │
└─────────────────────────┘
```

### After
```
┌───────────────────────────────────────────────────────┐
│  /admin/* — Protected (ADMIN role only)               │
│  ┌──────────────┬──────────────────────────────────┐  │
│  │   SIDEBAR    │         MAIN CONTENT             │  │
│  │              │                                  │  │
│  │ 📊 Dashboard  │  Dashboard: Stats cards +        │  │
│  │ 👥 Users      │  recent activity table           │  │
│  │ 💼 Jobs       │                                  │  │
│  │ 📝 Posts      │  Users: Table với search,        │  │
│  │ 🏢 Companies  │  filter, ban/unban, delete       │  │
│  │              │                                  │  │
│  │ [Logout]     │  Jobs: List, approve/delete       │  │
│  └──────────────┴──────────────────────────────────┘  │
└───────────────────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Login với ADMIN role | Redirect về `/feed` | Redirect về `/admin` | Detect role sau login |
| URL `/admin` | Redirect về `/` | Admin dashboard | Chỉ cho ADMIN |
| JWT payload | `{ userId, role: 'CANDIDATE/RECRUITER' }` | `{ userId, role: 'ADMIN' }` hợp lệ | Thêm vào validRoles |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `backend/src/middlewares/authMiddleware.js` | 1-40 | Pattern cho verifyAdmin middleware |
| P0 | `backend/src/services/auth.service.js` | 1-50 | Cần thêm ADMIN vào validRoles |
| P0 | `backend/src/controllers/recruiterController.js` | 1-50 | Controller pattern để mirror |
| P0 | `backend/src/server.js` | 74-86 | Nơi mount routes |
| P1 | `client/src/App.jsx` | all | Nơi thêm admin routes |
| P1 | `client/src/services/careerExplorerService.js` | all | Service fetch pattern |
| P1 | `client/src/pages/CareerAI/CareerExplorer.jsx` | 1-50 | Auth guard pattern (useEffect + localStorage) |
| P2 | `backend/src/repositories/recruiterRepository.js` | all | Cypher query pattern |
| P2 | `client/src/index.css` | 1-50 | Design tokens |

## External Documentation
| Topic | Source | Key Takeaway |
|---|---|---|
| Neo4j COUNT queries | Internal patterns | Dùng `MATCH (n:Label) RETURN count(n) AS total` |

---

## Patterns to Mirror

### NAMING_CONVENTION
```js
// SOURCE: backend/src/controllers/recruiterController.js:5-12
const getDashboardMetrics = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const metrics = await recruiterRepository.getDashboardMetrics(userId);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};
```

### ERROR_HANDLING
```js
// SOURCE: backend/src/controllers/recruiterController.js:5-12
// Pattern: try/catch, pass error to next() cho global error handler
try {
  // logic
  res.status(200).json({ success: true, data: result });
} catch (error) {
  next(error);
}
```

### MIDDLEWARE_PATTERN
```js
// SOURCE: backend/src/middlewares/authMiddleware.js:5-20
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
```

### ROUTE_MOUNTING
```js
// SOURCE: backend/src/server.js:75-85
app.use('/v1/auth', authRoutes);
app.use('/v1/recruiter', require('./routes/recruiterRoutes'));
// Pattern: require inline hoặc require ở đầu file, mount với prefix
```

### FRONTEND_AUTH_GUARD
```jsx
// SOURCE: client/src/pages/CareerAI/CareerExplorer.jsx (auth guard pattern)
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login', { replace: true });
    return;
  }
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'ADMIN') {
    navigate('/', { replace: true });
  }
}, [navigate]);
```

### FRONTEND_SERVICE_PATTERN
```js
// SOURCE: client/src/services/careerExplorerService.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function fetchSomething(token, data) {
  const res = await fetch(`${API_BASE}/v1/endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}
```

### CYPHER_REPOSITORY_PATTERN
```js
// SOURCE: backend/src/repositories/recruiterRepository.js (inferred pattern)
const { getDriver } = require('../config/neo4j');

const getDashboardMetrics = async (userId) => {
  const driver = getDriver();
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (u:User {userId: $userId}) RETURN u`,
      { userId }
    );
    return result.records.map(r => r.get('u').properties);
  } finally {
    await session.close();
  }
};
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `backend/src/services/auth.service.js` | UPDATE | Thêm 'ADMIN' vào validRoles |
| `backend/src/middlewares/authMiddleware.js` | UPDATE | Thêm `verifyAdmin` middleware |
| `backend/src/repositories/adminRepository.js` | CREATE | Tất cả Cypher queries cho admin |
| `backend/src/services/adminService.js` | CREATE | Business logic cho admin |
| `backend/src/controllers/adminController.js` | CREATE | HTTP handlers cho admin API |
| `backend/src/routes/adminRoutes.js` | CREATE | Express routes cho `/v1/admin` |
| `backend/src/server.js` | UPDATE | Mount `/v1/admin` routes |
| `backend/scripts/seed-admin.js` | CREATE | Script tạo admin user đầu tiên |
| `client/src/services/adminService.js` | CREATE | Fetch helpers cho admin API |
| `client/src/pages/Admin/AdminLayout.jsx` | CREATE | Sidebar + header layout |
| `client/src/pages/Admin/AdminDashboard.jsx` | CREATE | Stats dashboard |
| `client/src/pages/Admin/AdminUsers.jsx` | CREATE | User management table |
| `client/src/pages/Admin/AdminJobs.jsx` | CREATE | Job management table |
| `client/src/pages/Admin/AdminPosts.jsx` | CREATE | Post moderation table |
| `client/src/App.jsx` | UPDATE | Thêm `/admin/*` routes |

## NOT Building
- Admin có thể tạo/edit content (chỉ view và delete)
- Admin analytics charts/graphs nâng cao
- Multi-admin role levels (super admin vs moderator)
- Admin audit log
- Bulk operations nâng cao (chỉ single item actions)
- Admin notifications system
- Email notifications khi ban user

---

## Step-by-Step Tasks

### Task 1: Thêm ADMIN vào hệ thống auth (backend)
- **ACTION**: Sửa `backend/src/services/auth.service.js` thêm 'ADMIN' vào validRoles
- **IMPLEMENT**: 
  ```js
  // Dòng 28 trong auth.service.js - thêm 'ADMIN' vào mảng
  const validRoles = ['CANDIDATE', 'RECRUITER', 'ADMIN'];
  ```
- **MIRROR**: NAMING_CONVENTION
- **IMPORTS**: không cần thêm
- **GOTCHA**: ADMIN user sẽ không tự đăng ký được qua UI — dùng seed script. Không cần sửa auth.repository.js vì nó dùng generic `createUser`
- **VALIDATE**: Chạy seed script tạo admin, đăng nhập kiểm tra JWT có `role: 'ADMIN'`

### Task 2: Thêm verifyAdmin middleware
- **ACTION**: Thêm `verifyAdmin` vào `backend/src/middlewares/authMiddleware.js`
- **IMPLEMENT**:
  ```js
  // Thêm sau verifyTokenOptional, trước module.exports
  const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
  
  // Thêm vào module.exports:
  module.exports = { verifyToken, verifyTokenOptional, verifyAdmin };
  ```
- **MIRROR**: MIDDLEWARE_PATTERN
- **IMPORTS**: JWT_SECRET đã được khai báo trong file
- **GOTCHA**: Cần thêm cả vào `module.exports`
- **VALIDATE**: Test với token ADMIN và CANDIDATE — chỉ ADMIN được qua

### Task 3: Tạo adminRepository.js
- **ACTION**: Tạo `backend/src/repositories/adminRepository.js` với các Cypher queries
- **IMPLEMENT**:
  ```js
  const { getDriver } = require('../config/neo4j');
  
  const getStats = async () => {
    const driver = getDriver();
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (u:User) WITH count(u) AS totalUsers
        MATCH (j:Job) WITH totalUsers, count(j) AS totalJobs
        MATCH (p:Post) WITH totalUsers, totalJobs, count(p) AS totalPosts
        MATCH (c:Company) RETURN totalUsers, totalJobs, totalPosts, count(c) AS totalCompanies
      `);
      const record = result.records[0];
      return {
        totalUsers: record.get('totalUsers').toNumber(),
        totalJobs: record.get('totalJobs').toNumber(),
        totalPosts: record.get('totalPosts').toNumber(),
        totalCompanies: record.get('totalCompanies').toNumber(),
      };
    } finally {
      await session.close();
    }
  };
  
  const getUsers = async ({ page = 1, limit = 20, search = '' }) => {
    const driver = getDriver();
    const session = driver.session();
    const skip = (page - 1) * limit;
    try {
      const result = await session.run(`
        MATCH (u:User)
        WHERE u.role <> 'ADMIN'
          AND ($search = '' OR toLower(u.fullName) CONTAINS toLower($search) 
              OR toLower(u.email) CONTAINS toLower($search))
        RETURN u.userId AS userId, u.fullName AS fullName, u.email AS email,
               u.role AS role, u.isBanned AS isBanned, u.createdAt AS createdAt
        ORDER BY u.createdAt DESC
        SKIP $skip LIMIT $limit
      `, { search, skip: neo4j.int(skip), limit: neo4j.int(limit) });
      
      const countResult = await session.run(`
        MATCH (u:User)
        WHERE u.role <> 'ADMIN'
          AND ($search = '' OR toLower(u.fullName) CONTAINS toLower($search)
              OR toLower(u.email) CONTAINS toLower($search))
        RETURN count(u) AS total
      `, { search });
      
      return {
        users: result.records.map(r => ({
          userId: r.get('userId'),
          fullName: r.get('fullName'),
          email: r.get('email'),
          role: r.get('role'),
          isBanned: r.get('isBanned') || false,
          createdAt: r.get('createdAt'),
        })),
        total: countResult.records[0].get('total').toNumber(),
      };
    } finally {
      await session.close();
    }
  };
  
  const banUser = async (userId, isBanned) => {
    const driver = getDriver();
    const session = driver.session();
    try {
      await session.run(
        `MATCH (u:User {userId: $userId}) SET u.isBanned = $isBanned`,
        { userId, isBanned }
      );
      return true;
    } finally {
      await session.close();
    }
  };
  
  const deleteUser = async (userId) => {
    const driver = getDriver();
    const session = driver.session();
    try {
      await session.run(
        `MATCH (u:User {userId: $userId}) DETACH DELETE u`,
        { userId }
      );
      return true;
    } finally {
      await session.close();
    }
  };
  
  const getJobs = async ({ page = 1, limit = 20, search = '' }) => {
    const driver = getDriver();
    const session = driver.session();
    const skip = (page - 1) * limit;
    try {
      const result = await session.run(`
        MATCH (j:Job)
        WHERE $search = '' OR toLower(j.title) CONTAINS toLower($search)
        OPTIONAL MATCH (j)<-[:POSTED]-(c:Company)
        RETURN j.jobId AS jobId, j.title AS title, j.employmentType AS employmentType,
               j.location AS location, j.createdAt AS createdAt, c.name AS companyName
        ORDER BY j.createdAt DESC
        SKIP $skip LIMIT $limit
      `, { search, skip: neo4j.int(skip), limit: neo4j.int(limit) });
      
      const countResult = await session.run(`
        MATCH (j:Job)
        WHERE $search = '' OR toLower(j.title) CONTAINS toLower($search)
        RETURN count(j) AS total
      `, { search });
      
      return {
        jobs: result.records.map(r => ({
          jobId: r.get('jobId'),
          title: r.get('title'),
          employmentType: r.get('employmentType'),
          location: r.get('location'),
          createdAt: r.get('createdAt'),
          companyName: r.get('companyName'),
        })),
        total: countResult.records[0].get('total').toNumber(),
      };
    } finally {
      await session.close();
    }
  };
  
  const deleteJob = async (jobId) => {
    const driver = getDriver();
    const session = driver.session();
    try {
      await session.run(
        `MATCH (j:Job {jobId: $jobId}) DETACH DELETE j`,
        { jobId }
      );
      return true;
    } finally {
      await session.close();
    }
  };
  
  const getPosts = async ({ page = 1, limit = 20 }) => {
    const driver = getDriver();
    const session = driver.session();
    const skip = (page - 1) * limit;
    try {
      const result = await session.run(`
        MATCH (p:Post)
        OPTIONAL MATCH (p)<-[:POSTED]-(u:User)
        RETURN p.postId AS postId, p.content AS content, p.createdAt AS createdAt,
               u.fullName AS authorName, u.userId AS authorId
        ORDER BY p.createdAt DESC
        SKIP $skip LIMIT $limit
      `, { skip: neo4j.int(skip), limit: neo4j.int(limit) });
      
      const countResult = await session.run(`MATCH (p:Post) RETURN count(p) AS total`);
      
      return {
        posts: result.records.map(r => ({
          postId: r.get('postId'),
          content: r.get('content'),
          createdAt: r.get('createdAt'),
          authorName: r.get('authorName'),
          authorId: r.get('authorId'),
        })),
        total: countResult.records[0].get('total').toNumber(),
      };
    } finally {
      await session.close();
    }
  };
  
  const deletePost = async (postId) => {
    const driver = getDriver();
    const session = driver.session();
    try {
      await session.run(
        `MATCH (p:Post {postId: $postId}) DETACH DELETE p`,
        { postId }
      );
      return true;
    } finally {
      await session.close();
    }
  };
  
  const neo4j = require('neo4j-driver');
  
  module.exports = { getStats, getUsers, banUser, deleteUser, getJobs, deleteJob, getPosts, deletePost };
  ```
- **MIRROR**: CYPHER_REPOSITORY_PATTERN
- **IMPORTS**: `const { getDriver } = require('../config/neo4j');` và `const neo4j = require('neo4j-driver');`
- **GOTCHA**: Neo4j trả về integers dưới dạng `neo4j.Integer` — phải dùng `.toNumber()`. Dùng `neo4j.int(skip)` khi truyền int vào params. Import `neo4j-driver` để dùng `neo4j.int()`.
- **VALIDATE**: Test từng query với dữ liệu thật

### Task 4: Tạo adminService.js
- **ACTION**: Tạo `backend/src/services/adminService.js`
- **IMPLEMENT**:
  ```js
  const adminRepository = require('../repositories/adminRepository');
  
  const getStats = async () => {
    return adminRepository.getStats();
  };
  
  const getUsers = async (params) => {
    return adminRepository.getUsers(params);
  };
  
  const banUser = async (userId, isBanned) => {
    return adminRepository.banUser(userId, isBanned);
  };
  
  const deleteUser = async (userId) => {
    return adminRepository.deleteUser(userId);
  };
  
  const getJobs = async (params) => {
    return adminRepository.getJobs(params);
  };
  
  const deleteJob = async (jobId) => {
    return adminRepository.deleteJob(jobId);
  };
  
  const getPosts = async (params) => {
    return adminRepository.getPosts(params);
  };
  
  const deletePost = async (postId) => {
    return adminRepository.deletePost(postId);
  };
  
  module.exports = { getStats, getUsers, banUser, deleteUser, getJobs, deleteJob, getPosts, deletePost };
  ```
- **MIRROR**: NAMING_CONVENTION
- **IMPORTS**: adminRepository
- **GOTCHA**: Service layer thin — chỉ ủy quyền cho repository; không có business logic phức tạp ở tầng này
- **VALIDATE**: Import không lỗi

### Task 5: Tạo adminController.js
- **ACTION**: Tạo `backend/src/controllers/adminController.js`
- **IMPLEMENT**:
  ```js
  const adminService = require('../services/adminService');
  
  const getStats = async (req, res, next) => {
    try {
      const stats = await adminService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };
  
  const getUsers = async (req, res, next) => {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await adminService.getUsers({ 
        page: parseInt(page), 
        limit: parseInt(limit), 
        search 
      });
      res.status(200).json({ success: true, data: result.users, meta: { total: result.total, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      next(error);
    }
  };
  
  const banUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { isBanned } = req.body;
      if (typeof isBanned !== 'boolean') {
        return res.status(400).json({ success: false, message: 'isBanned must be a boolean' });
      }
      await adminService.banUser(userId, isBanned);
      res.status(200).json({ success: true, message: isBanned ? 'User banned' : 'User unbanned' });
    } catch (error) {
      next(error);
    }
  };
  
  const deleteUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
      await adminService.deleteUser(userId);
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  };
  
  const getJobs = async (req, res, next) => {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await adminService.getJobs({ page: parseInt(page), limit: parseInt(limit), search });
      res.status(200).json({ success: true, data: result.jobs, meta: { total: result.total, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      next(error);
    }
  };
  
  const deleteJob = async (req, res, next) => {
    try {
      const { jobId } = req.params;
      await adminService.deleteJob(jobId);
      res.status(200).json({ success: true, message: 'Job deleted' });
    } catch (error) {
      next(error);
    }
  };
  
  const getPosts = async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await adminService.getPosts({ page: parseInt(page), limit: parseInt(limit) });
      res.status(200).json({ success: true, data: result.posts, meta: { total: result.total, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
      next(error);
    }
  };
  
  const deletePost = async (req, res, next) => {
    try {
      const { postId } = req.params;
      await adminService.deletePost(postId);
      res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = { getStats, getUsers, banUser, deleteUser, getJobs, deleteJob, getPosts, deletePost };
  ```
- **MIRROR**: ERROR_HANDLING, NAMING_CONVENTION
- **IMPORTS**: adminService
- **GOTCHA**: Parse query params sang int trước khi truyền vào service
- **VALIDATE**: Tất cả routes trả về đúng format `{ success, data, meta }`

### Task 6: Tạo adminRoutes.js
- **ACTION**: Tạo `backend/src/routes/adminRoutes.js`
- **IMPLEMENT**:
  ```js
  const express = require('express');
  const router = express.Router();
  const { verifyAdmin } = require('../middlewares/authMiddleware');
  const adminController = require('../controllers/adminController');
  
  router.get('/stats', verifyAdmin, adminController.getStats);
  router.get('/users', verifyAdmin, adminController.getUsers);
  router.patch('/users/:userId/ban', verifyAdmin, adminController.banUser);
  router.delete('/users/:userId', verifyAdmin, adminController.deleteUser);
  router.get('/jobs', verifyAdmin, adminController.getJobs);
  router.delete('/jobs/:jobId', verifyAdmin, adminController.deleteJob);
  router.get('/posts', verifyAdmin, adminController.getPosts);
  router.delete('/posts/:postId', verifyAdmin, adminController.deletePost);
  
  module.exports = router;
  ```
- **MIRROR**: ROUTE_MOUNTING
- **IMPORTS**: express, verifyAdmin, adminController
- **GOTCHA**: Tất cả routes đều cần `verifyAdmin` — không route nào public
- **VALIDATE**: `node -e "require('./backend/src/routes/adminRoutes.js')"` không lỗi

### Task 7: Mount admin routes trong server.js
- **ACTION**: Thêm 1 dòng vào `backend/src/server.js` sau dòng `app.use('/v1/ai', ...)`
- **IMPLEMENT**:
  ```js
  app.use('/v1/admin', require('./routes/adminRoutes'));
  ```
- **MIRROR**: ROUTE_MOUNTING
- **IMPORTS**: không cần — dùng require inline
- **GOTCHA**: Phải đặt TRƯỚC `app.use(errorMiddleware)` 
- **VALIDATE**: Server khởi động không lỗi, GET /v1/admin/stats trả về 401

### Task 8: Tạo seed script cho admin user
- **ACTION**: Tạo `backend/scripts/seed-admin.js`
- **IMPLEMENT**:
  ```js
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const { getDriver } = require('../src/config/neo4j');
  const bcrypt = require('bcryptjs');
  const { generateUUID } = require('../src/utils/uuid');
  
  async function seedAdmin() {
    const driver = getDriver();
    const session = driver.session();
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@careersite.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    
    try {
      const existing = await session.run(
        'MATCH (u:User {email: $email}) RETURN u',
        { email: adminEmail }
      );
      
      if (existing.records.length > 0) {
        console.log('Admin user already exists:', adminEmail);
        return;
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await session.run(`
        CREATE (u:User:Admin {
          userId: $userId,
          role: 'ADMIN',
          fullName: 'System Admin',
          email: $email,
          password: $password,
          isOnboarded: true
        })
      `, { userId: generateUUID(), email: adminEmail, password: hashedPassword });
      
      console.log('Admin user created:', adminEmail);
      console.log('Password:', adminPassword);
    } finally {
      await session.close();
      await driver.close();
    }
  }
  
  seedAdmin().catch(console.error);
  ```
- **MIRROR**: CYPHER_REPOSITORY_PATTERN
- **IMPORTS**: dotenv, neo4j driver, bcryptjs, uuid util
- **GOTCHA**: Chạy bằng `node backend/scripts/seed-admin.js` từ thư mục root. Cần Neo4j đang chạy.
- **VALIDATE**: Chạy script, sau đó login với admin credentials

### Task 9: Tạo client/src/services/adminService.js
- **ACTION**: Tạo frontend service
- **IMPLEMENT**:
  ```js
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const authHeaders = (token) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  });
  
  export async function fetchStats(token) {
    const res = await fetch(`${API_BASE}/v1/admin/stats`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }
  
  export async function fetchUsers(token, { page = 1, limit = 20, search = '' } = {}) {
    const params = new URLSearchParams({ page, limit, search });
    const res = await fetch(`${API_BASE}/v1/admin/users?${params}`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }
  
  export async function banUser(token, userId, isBanned) {
    const res = await fetch(`${API_BASE}/v1/admin/users/${userId}/ban`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ isBanned }),
    });
    if (!res.ok) throw new Error('Failed to update user ban status');
    return res.json();
  }
  
  export async function deleteUser(token, userId) {
    const res = await fetch(`${API_BASE}/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  }
  
  export async function fetchJobs(token, { page = 1, limit = 20, search = '' } = {}) {
    const params = new URLSearchParams({ page, limit, search });
    const res = await fetch(`${API_BASE}/v1/admin/jobs?${params}`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  }
  
  export async function deleteJob(token, jobId) {
    const res = await fetch(`${API_BASE}/v1/admin/jobs/${jobId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete job');
    return res.json();
  }
  
  export async function fetchPosts(token, { page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({ page, limit });
    const res = await fetch(`${API_BASE}/v1/admin/posts?${params}`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  }
  
  export async function deletePost(token, postId) {
    const res = await fetch(`${API_BASE}/v1/admin/posts/${postId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete post');
    return res.json();
  }
  ```
- **MIRROR**: FRONTEND_SERVICE_PATTERN
- **IMPORTS**: chỉ dùng native fetch, import.meta.env
- **GOTCHA**: Không dùng Axios — project dùng native fetch
- **VALIDATE**: Import trong component không lỗi

### Task 10: Tạo AdminLayout.jsx
- **ACTION**: Tạo `client/src/pages/Admin/AdminLayout.jsx` — sidebar + main layout
- **IMPLEMENT**:
  ```jsx
  import React from 'react';
  import { NavLink, useNavigate } from 'react-router-dom';
  
  const NAV_ITEMS = [
    { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/admin/users', label: 'Users', icon: 'group' },
    { to: '/admin/jobs', label: 'Jobs', icon: 'work' },
    { to: '/admin/posts', label: 'Posts', icon: 'article' },
  ];
  
  export default function AdminLayout({ children }) {
    const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    };
  
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
        {/* Sidebar */}
        <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <span className="text-lg font-bold text-[#6C7EE1]">Admin Panel</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#6C7EE1]/10 text-[#6C7EE1]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </button>
          </div>
        </aside>
        {/* Main */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }
  ```
- **MIRROR**: FRONTEND_AUTH_GUARD, NAMING_CONVENTION
- **IMPORTS**: React, NavLink, useNavigate từ react-router-dom
- **GOTCHA**: Dùng Material Symbols icons (đã có trong project) thay vì import thêm library
- **VALIDATE**: Render trong browser, sidebar hiển thị đúng active state

### Task 11: Tạo AdminDashboard.jsx
- **ACTION**: Tạo `client/src/pages/Admin/AdminDashboard.jsx`
- **IMPLEMENT**:
  ```jsx
  import React, { useEffect, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import AdminLayout from './AdminLayout';
  import { fetchStats } from '../../services/adminService';
  
  const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <span className="material-symbols-outlined text-white">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  );
  
  export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || user.role !== 'ADMIN') {
        navigate('/login', { replace: true });
        return;
      }
      fetchStats(token)
        .then(res => setStats(res.data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, [navigate]);
  
    return (
      <AdminLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>
          {loading && <p className="text-gray-500">Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon="group" label="Total Users" value={stats.totalUsers} color="bg-[#6C7EE1]" />
              <StatCard icon="work" label="Total Jobs" value={stats.totalJobs} color="bg-emerald-500" />
              <StatCard icon="article" label="Total Posts" value={stats.totalPosts} color="bg-amber-500" />
              <StatCard icon="business" label="Total Companies" value={stats.totalCompanies} color="bg-rose-500" />
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }
  ```
- **MIRROR**: FRONTEND_AUTH_GUARD, NAMING_CONVENTION
- **IMPORTS**: React, useEffect, useState, useNavigate, AdminLayout, fetchStats
- **GOTCHA**: Auth guard kiểm tra cả token và role === 'ADMIN'
- **VALIDATE**: Hiển thị 4 stats cards với data từ API

### Task 12: Tạo AdminUsers.jsx
- **ACTION**: Tạo `client/src/pages/Admin/AdminUsers.jsx` — bảng quản lý users
- **IMPLEMENT**: Component với:
  - Auth guard (useEffect, check token + role ADMIN)
  - State: `users`, `loading`, `error`, `page`, `search`, `total`
  - `fetchUsers(token, { page, search })` on mount và khi page/search thay đổi
  - Table columns: Tên, Email, Role, Trạng thái (banned/active), Ngày tạo, Actions
  - Actions: Ban/Unban button (gọi `banUser`), Delete button (confirm + gọi `deleteUser`)
  - Search input với debounce
  - Pagination: Prev/Next buttons
  - Confirm dialog native `window.confirm` trước khi delete
  ```jsx
  import React, { useEffect, useState, useCallback } from 'react';
  import { useNavigate } from 'react-router-dom';
  import AdminLayout from './AdminLayout';
  import { fetchUsers, banUser, deleteUser } from '../../services/adminService';
  
  export default function AdminUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const LIMIT = 20;
  
    const token = localStorage.getItem('token');
  
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || user.role !== 'ADMIN') {
        navigate('/login', { replace: true });
      }
    }, [navigate, token]);
  
    const loadUsers = useCallback(() => {
      setLoading(true);
      fetchUsers(token, { page, limit: LIMIT, search })
        .then(res => { setUsers(res.data); setTotal(res.meta?.total || 0); })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, [token, page, search]);
  
    useEffect(() => { loadUsers(); }, [loadUsers]);
  
    const handleBan = async (userId, currentBanned) => {
      try {
        await banUser(token, userId, !currentBanned);
        loadUsers();
      } catch (err) {
        alert(err.message);
      }
    };
  
    const handleDelete = async (userId) => {
      if (!window.confirm('Xóa user này? Hành động không thể hoàn tác.')) return;
      try {
        await deleteUser(token, userId);
        loadUsers();
      } catch (err) {
        alert(err.message);
      }
    };
  
    const totalPages = Math.ceil(total / LIMIT);
  
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users ({total})</h1>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C7EE1]"
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-left font-medium">Role</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : users.map(u => (
                  <tr key={u.userId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{u.fullName}</td>
                    <td className="px-6 py-4 text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'RECRUITER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.isBanned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>{u.isBanned ? 'Banned' : 'Active'}</span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button
                        onClick={() => handleBan(u.userId, u.isBanned)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          u.isBanned
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >{u.isBanned ? 'Unban' : 'Ban'}</button>
                      <button
                        onClick={() => handleDelete(u.userId)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-4 mt-4 justify-end">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40">Prev</button>
              <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }
  ```
- **MIRROR**: FRONTEND_AUTH_GUARD, FRONTEND_SERVICE_PATTERN
- **IMPORTS**: React, useEffect, useState, useCallback, useNavigate, AdminLayout, adminService functions
- **GOTCHA**: Reset page về 1 khi search thay đổi. Dùng `window.confirm` native thay vì custom dialog
- **VALIDATE**: Table hiển thị users, search hoạt động, ban/unban cập nhật status

### Task 13: Tạo AdminJobs.jsx
- **ACTION**: Tạo `client/src/pages/Admin/AdminJobs.jsx` — tương tự AdminUsers nhưng cho jobs
- **IMPLEMENT**: Giống AdminUsers pattern:
  - Auth guard
  - Table: Title, Company, Type, Location, Date, Actions (Delete only)
  - Search theo title
  - Pagination
  - Confirm trước khi delete
- **MIRROR**: AdminUsers.jsx pattern (Task 12)
- **IMPORTS**: React, useEffect, useState, useCallback, useNavigate, AdminLayout, fetchJobs, deleteJob từ adminService
- **GOTCHA**: Không có ban cho jobs — chỉ delete
- **VALIDATE**: Table jobs hiển thị đúng

### Task 14: Tạo AdminPosts.jsx
- **ACTION**: Tạo `client/src/pages/Admin/AdminPosts.jsx` — moderation bài đăng
- **IMPLEMENT**: Giống AdminUsers pattern:
  - Auth guard
  - Table: Author, Content (truncated 100 chars), Date, Actions (Delete)
  - Pagination (không có search vì posts không có title)
  - Confirm trước khi delete
- **MIRROR**: AdminUsers.jsx pattern (Task 12)
- **IMPORTS**: React, useEffect, useState, useCallback, useNavigate, AdminLayout, fetchPosts, deletePost từ adminService
- **GOTCHA**: Content cần truncate: `content?.substring(0, 100) + '...'`
- **VALIDATE**: Table posts hiển thị đúng

### Task 15: Cập nhật App.jsx thêm admin routes
- **ACTION**: Thêm admin routes vào `client/src/App.jsx`
- **IMPLEMENT**:
  ```jsx
  // Thêm imports ở đầu file:
  import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
  import AdminUsers from './pages/Admin/AdminUsers.jsx';
  import AdminJobs from './pages/Admin/AdminJobs.jsx';
  import AdminPosts from './pages/Admin/AdminPosts.jsx';
  
  // Thêm routes trong <Routes> trước Route path="*":
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/users" element={<AdminUsers />} />
  <Route path="/admin/jobs" element={<AdminJobs />} />
  <Route path="/admin/posts" element={<AdminPosts />} />
  ```
- **MIRROR**: App.jsx existing pattern (flat routes, không nest)
- **IMPORTS**: 4 admin page components
- **GOTCHA**: Không dùng `/admin/*` nested route vì layout được handle trong mỗi component qua AdminLayout wrapper
- **VALIDATE**: Navigate tới `/admin` trong browser hiển thị dashboard

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| verifyAdmin — valid ADMIN token | Bearer token với role ADMIN | next() được gọi | No |
| verifyAdmin — CANDIDATE token | Bearer token với role CANDIDATE | 403 Forbidden | Yes |
| verifyAdmin — no token | No Authorization header | 401 Unauthorized | Yes |
| getStats endpoint | Valid admin token | `{ success: true, data: { totalUsers, totalJobs, totalPosts, totalCompanies } }` | No |
| banUser endpoint | userId + `{ isBanned: true }` | 200 + User banned | No |
| banUser — invalid body | `{ isBanned: 'yes' }` | 400 Bad Request | Yes |
| deleteUser endpoint | valid userId | 200 + User deleted | No |

### Edge Cases Checklist
- [ ] Admin cố xóa chính mình (không có server-side protection — NOT building)
- [ ] search param rỗng trả về tất cả users
- [ ] page vượt quá tổng số trang — trả về empty array
- [ ] Neo4j Integer overflow với .toNumber()
- [ ] Token hết hạn → 401 → frontend redirect về login

---

## Validation Commands

### Static Analysis
```bash
node -e "require('./backend/src/routes/adminRoutes.js'); console.log('OK')"
```
EXPECT: "OK" không lỗi

### Start Server
```bash
cd backend && node src/server.js
```
EXPECT: Server khởi động không lỗi

### Seed Admin
```bash
node backend/scripts/seed-admin.js
```
EXPECT: "Admin user created: admin@careersite.com"

### Test Admin API (sau khi login lấy token)
```bash
# Login lấy token
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@careersite.com","password":"Admin@123456"}'

# Test stats (thay TOKEN bằng token từ bước trên)
curl http://localhost:3000/v1/admin/stats \
  -H "Authorization: Bearer TOKEN"
```
EXPECT: `{ success: true, data: { totalUsers: N, ... } }`

### Frontend Dev Server
```bash
cd client && npm run dev
```
EXPECT: Mở `/admin` trong browser → redirect về `/login` nếu chưa đăng nhập ADMIN

### Manual Validation
- [ ] Seed admin user thành công
- [ ] Đăng nhập với admin@careersite.com → redirect về `/admin`
- [ ] Dashboard hiển thị 4 stat cards với số liệu thực
- [ ] /admin/users hiển thị danh sách users (không có admin)
- [ ] Search users theo tên hoạt động
- [ ] Ban user → status đổi sang "Banned"
- [ ] Unban user → status đổi sang "Active"  
- [ ] Delete user (confirm → xóa → user biến khỏi danh sách)
- [ ] /admin/jobs hiển thị danh sách jobs
- [ ] Delete job hoạt động
- [ ] /admin/posts hiển thị danh sách posts với nội dung truncated
- [ ] Delete post hoạt động
- [ ] Logout → redirect về /login
- [ ] Truy cập /admin với CANDIDATE token → redirect về /login

---

## Acceptance Criteria
- [ ] ADMIN role hoạt động trong JWT auth
- [ ] verifyAdmin middleware chặn non-admin users
- [ ] Tất cả 8 admin API endpoints hoạt động
- [ ] Frontend admin panel hiển thị đúng trên /admin
- [ ] Sidebar navigation hoạt động với active state
- [ ] Users table: search, ban/unban, delete
- [ ] Jobs table: search, delete
- [ ] Posts table: delete
- [ ] Auth guard chặn non-admin trên frontend

## Completion Checklist
- [ ] Code follows Controller → Service → Repository pattern
- [ ] Tất cả routes dùng verifyAdmin middleware
- [ ] Error handling dùng try/catch + next(error)
- [ ] Frontend dùng native fetch (không Axios)
- [ ] Design dùng Tailwind CSS v4 + color #6C7EE1
- [ ] Material Symbols icons cho sidebar
- [ ] No hardcoded credentials (seed script dùng env vars)
- [ ] Seed script có thể chạy nhiều lần an toàn (idempotent)

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Neo4j query `MATCH (j:Job)` sai label | Medium | High | Kiểm tra label thực trong DB bằng `MATCH (n) RETURN labels(n), count(n)` trước khi implement |
| `Post` node label có thể khác (vd: `BlogPost`) | Medium | Medium | Grep codebase tìm `:Post` trong các repository files |
| Cypher `MATCH` trong getStats dùng multiple MATCH sai | Low | Medium | Test từng MATCH riêng lẻ trước, sau đó gộp |
| Frontend redirect loop nếu role check logic sai | Low | High | Test kỹ auth guard với cả 3 cases: no token, CANDIDATE token, ADMIN token |

## Notes
- Seed script tạo admin user với Neo4j label `Admin` (ngoài `User`) — không ảnh hưởng các query hiện tại vì chúng MATCH trên `User` label
- Không thêm admin vào danh sách users trên admin panel (filter `u.role <> 'ADMIN'` trong getUsers)
- `isBanned` property cần được check trong `verifyToken` nếu muốn thực sự block banned users — đây là enhancement sau (NOT building trong scope này)
- Để deploy: Cần chạy seed script một lần trên production, set `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong env
