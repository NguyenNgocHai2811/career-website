# Implementation Plan: Realtime Notification System - Phase 1

**PRD Reference:** `.agent/PRPs/prds/realtime-notification.prd.md`
**Phase:** 1 (DB & Repository)
**Goal:** Khởi tạo cấu trúc Data Model (neo4j) và các thao tác lưu trữ (Create/Read/MarkRead) cho hệ thống Notification.

## 1. Giới thiệu Kỹ thuật (Technical Summary)
Chúng ta sẽ tạo một service tương tác trực tiếp với cơ sở dữ liệu Neo4j, sử dụng pattern repository tương tự như `chatRepository.js`. 
- **Node**: `Notification`
- **Relationship**: `(User)-[:HAS_NOTIFICATION]->(Notification)`
- **Properties của Notification**: `id` (uuid), `type` (gồm 'NEW_MESSAGE', 'NEW_JOB'), `content` (chuỗi văn bản thông báo), `referenceId` (id của bài đăng rác hoặc người tạo tin nhắn), `isRead` (boolean, mặc định: false), `createdAt` (datetime).

## 2. Các bước Thực thi (Execution Steps)

### Bước 1: Khởi tạo File Repository
- **Tạo mới file**: `backend/src/repositories/notificationRepository.js`
- Import biến kết nối: `const { driver } = require('../config/neo4j');`
- Import package sinh ID: `const { v4: uuidv4 } = require('uuid');`

### Bước 2: Viết hàm `createNotification`
- Khởi tạo transaction session.
- Viết câu truy vấn (Cypher) tìm User bằng `userId`, sau đó CREATE một Node `Notification` gắn liền với `User` qua quan hệ `HAS_NOTIFICATION`.
- **Tham số**: `userId`, `type`, `content`, `referenceId`.

### Bước 3: Viết hàm `getNotifications`
- Lấy thông báo theo phân trang (pagination / limit).
- Trả về danh sách notification, sắp xếp `createdAt` giảm dần (mới nhất đẩy lên đầu).
- **Tham số**: `userId`, `limit = 20`.

### Bước 4: Viết hàm `getUnreadCount`
- Để client có thể hiển thị số lượng chấm đỏ chính xác ở chuông thông báo (Bell Badge).
- Truy vấn đếm `count(n)` với điều kiện `n.isRead = false`.

### Bước 5: Viết hàm `markAsRead`
- Chuyển thuộc tính `isRead` của một notification (hoặc toàn bộ notification của user đó) thành `true`.
- **Tham số**: Có thể nhận mảng `notificationIds` để cập nhật đồng loạt hoặc một `id`.

### Bước 6: Viết hàm `deleteOldNotifications` (Chuẩn bị cho TTL/Phase 2)
- Xóa các node `(:Notification)` có `createdAt` cũ hơn 30 ngày (sẽ được Cronjob ở Phase 2 gọi tới).

## 3. Xác thực (Validation)
- Sau khi viết các hàm, export chúng thông qua `module.exports`.
- Đảm bảo tất cả session đều được `session.close()` trong khối `finally` để tránh nghẽn luồng truy vấn.

---
*Kế hoạch đã sẵn sàng để thực thi. Bạn có thể sử dụng lệnh `/prp-implement .agent/PRPs/plans/realtime-notification-phase-1.plan.md` để trình điều khiển Agent viết mã.*
