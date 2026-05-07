# Realtime Notification System

## Problem Statement

Hiện tại, người dùng (đặc biệt là nhà tuyển dụng và ứng viên) đang bỏ lỡ các cơ hội quan trọng như lời mời phỏng vấn hoặc tin nhắn mới. Nguyên nhân là do có quá nhiều thông tin trên internet thu hút sự chú ý của họ, khiến họ không thể liên tục tự kiểm tra trạng thái trên ứng dụng nếu không có các tín hiệu nhắc nhở cảnh báo chủ động.

## Evidence

- Người dùng thường xuyên báo cáo việc phản hồi trễ các tin nhắn quan trọng.
- Các nền tảng hiện đại đang tập trung tạo ra sự chú ý thông qua push notifications, dẫn đến nếu KORRA không có, người dùng sẽ tự động ưu tiên ứng dụng khác.

## Proposed Solution

Xây dựng hệ thống thông báo thời gian thực (Realtime Notifications) tích hợp chuông báo dội trạng thái (push) ngay lập tức khi người đang trong phiên hoạt động (online). Hệ thống này sẽ lưu trữ dữ liệu thông báo vào Database (Neo4j) để đảm bảo không mất dữ liệu, kết hợp với cơ chế dọn dẹp để ngăn chặn tình trạng phình to bộ nhớ.

## Key Hypothesis

Chúng tôi tin rằng việc thiết lập **hệ thống thông báo realtime** sẽ giúp **nhà tuyển dụng và ứng viên** giải quyết được **tình trạng phản hồi chậm trễ và bỏ lỡ cơ hội**.
Chúng ta sẽ biết mình đúng khi **tỷ lệ phản hồi trong 1 giờ đồng hồ tăng lên ít nhất 20%**.

## What We're NOT Building

- Gửi Email thông báo khi người dùng Offline - Tránh tình trạng spam hòm thư và tốn kém chi phí trong giai đoạn V1.
- Mọi loại hình báo cáo / thông báo rườm rà (System Announcements).
- Tùy chỉnh âm thanh "Ting" khi nhận thông báo.

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Tỷ lệ phản hồi tin nhắn trong vòng 1h | Tăng 20% | Phân tích logs thời gian từ lúc nhận đến lúc gửi trả lời (chatRepository) |
| Tỉ lệ xem CV/Lời mời sau khi nhận | Tăng đột biến (Spike) | Phân tích tỉ lệ Click vào thông báo (isRead chuyển sang True) |

## Open Questions

- Không có (Đã chốt thiết kế).

---

## Users & Context

**Primary User**
- **Ai**: (1) Nhà Tuyển Dụng chờ nộp CV và (2) Ứng Viên chờ lời mời phỏng vấn.
- **Hành vi hiện tại**: Thỉnh thoảng vào trang để xem có cập nhật gì mới không.
- **Kích hoạt (Trigger)**: Khi có một công ty đăng tin tuyển dụng mới khớp hồ sơ, hoặc một người dùng Gửi tin nhắn mới.
- **Trạng thái Thành Công**: Họ bấm vào ngay lập tức khi thấy chấm đỏ / popup thông báo và tiến hành tương tác.

**Job to Be Done**
Khi **một ai đó gửi tin nhắn cho tôi hoặc có công việc mới**, tôi muốn **nhận được tín hiệu trực quan ngay lập tức**, để tôi có thể **nhấp vào đọc hoặc ứng tuyển kịp thời**.

**Non-Users**
- Những thông báo không phải là hành động tương tác (như hệ thống nâng cấp, chúc mừng năm mới).

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | Kết nối Socket cho Notification | Để bắt tín hiệu theo thời gian thực (dựa trên chatSocket cũ) |
| Must | Lưu Node `(:Notification)` vào Neo4j | Cho phép ứng viên check lại lịch sử sau khi Offline. |
| Must | Đảo trạng thái isRead=true khi click | Trải nghiệm UI cơ bản với chuông báo có chấm đỏ |
| Should | Xóa tự động sau 30 ngày (TTL) | Đảm bảo giới hạn Neo4j, hệ thống không bị phình to |
| Won't | Ràng buộc báo Email (Email Push) | Nằm ngoài V1. |

### MVP Scope

- Chỉ xử lý 2 loại logic bắn thông báo: (1) **Tin nhắn mới** & (2) **Tin tuyển dụng mới**.
- Database lưu trữ bản ngắn của thông báo và link điều hướng.

### User Flow

1. Người A nhắn tin / Post Job -> 2. Backend lưu DB -> 3. Backend bắn sự kiện Socket `receive_notification` -> 4. Client của người B phát hiện -> 5. App tăng số lượng điểm đỏ ở chuông -> 6. Người B bấm vào -> isRead = true -> Update lại DB.

---

## Technical Approach

**Feasibility**: HIGH

**Architecture Notes**
- **Tận dụng File Cũ**: Mở rộng trực tiếp từ module `backend/src/chatSocket.js`. Socket Session đã có sẵn `userSockets` Map, chỉ cần gửi qua đúng `socketId`.
- **Database Model (Neo4j)**: Sẽ tạo relationship: `(u:User)-[:HAS_NOTIFICATION]->(n:Notification)`. 
- **Chống phình to**: Triển khai Limit 50-100 Notifications truy xuất mỗi lần (Pagination) và lên lịch định kỳ xóa Notification cũ (Cypher trigger hoặc CronJob Nodejs).

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Neo4j Bùng nổ Node nếu spam CV | Medium | Set up Node.js CronJob xóa định kỳ các node mang label `Notification` có createdAt > 30 ngày, hoặc giới hạn count. |

---

## Implementation Phases

<!--
  STATUS: pending | in-progress | complete
  PARALLEL: phases that can run concurrently (e.g., "with 3" or "-")
  DEPENDS: phases that must complete first (e.g., "1, 2" or "-")
  PRP: link to generated plan file once created
-->

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | DB & Repository | Khởi tạo Notification Data Model, Hàm Create/Read/MarkRead Neo4j | complete | - | - | .agent/PRPs/plans/realtime-notification-phase-1.plan.md |
| 2 | Socket.io API | Bổ sung emit `receive_notification` vào `chatSocket.js` + cronjob dọn dẹp | complete | - | 1 | - |
| 3 | Frontend UI (Chuông) | Tích hợp Socket-client, Component Chuông, Dropdown danh sách | complete | with 4 | 2 | - |
| 4 | Kích hoạt (Triggers) | Cắm sự kiện gửi notification vào luồng tin nhắn và đăng việc | complete | with 3 | 2 | - |

### Phase Details

**Phase 1: Database & Repository**
- **Goal**: Xác định cấu trúc lưu trữ và các thao tác (Repo).
- **Scope**: `notificationRepository.js` (Lưu thông báo, lấy danh sách, đánh dấu Read).

**Phase 2: Realtime Socket**
- **Goal**: Hoàn thiện backend đẩy dữ liệu.
- **Scope**: Cập nhật `chatSocket.js`, bổ sung Job xóa rác 30 ngày.

**Phase 3: Frontend Component**
- **Goal**: Dựng cục diện trực quan.
- **Scope**: Chỉnh sửa Navbar hiện tại, thêm Bell icon, hiển thị Red badge với số lượng unread.

**Phase 4: Tích hợp logic (Hooks)**
- **Goal**: Hệ thống có khả năng tự động báo khi ai đó chạy các Route API liên quan.
- **Scope**: Hook vào `CompanyController` (tạo job) và `chatRepository` (tạo message).

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Xử lý chống tràn Database | Xóa tự động sau 30 ngày | Giới hạn 100 thông báo gần nhất | Cronjob xóa theo thời gian an toàn hơn và tính nhất quán cao hơn. |

---

## Research Summary

**Market Context**
Sự chú ý là tài sản lớn nhất. Người dùng đang quen với việc bị "Push". Nền tảng thiếu push tự động sẽ bị thay thế. Tách Notification riêng biệt thay vì dồn vào Chat list.

**Technical Context**
Kiến trúc `chatSocket.js` với `Map(userId -> socketId)` đang được viết rất tốt, tận dụng tái sử dụng để phát cho thông báo. Vấn đề chỉ nằm ở quản lý bộ nhớ của Neo4j.

---

*Generated: 2026-04-09*
*Status: DRAFT - needs validation*
