# Plan: Notification Feature (In-App + Real-Time)

## Summary
Kết nối hạ tầng thông báo đã có sẵn trong codebase với các trigger thực tế (nộp đơn, cập nhật trạng thái, kết nối mạng lưới), sửa lỗi URL hardcoded trong frontend, và bổ sung các tính năng còn thiếu (mark-all-read, icon theo loại, service layer). Phần lớn infrastructure đã tồn tại — công việc chính là kết nối các điểm và sửa bugs.

## User Story
As a user (applicant or recruiter),
I want to receive real-time in-app notifications when relevant actions occur,
So that I can stay informed without manually refreshing the page.

## Problem → Solution
Notification nodes, repository, REST endpoints, và Socket.io đã tồn tại nhưng chỉ hoạt động với `NEW_MESSAGE`. Các trigger cho job application, status change, và connection request chưa được kết nối. Frontend có hardcoded URL sai port và tạo socket connection riêng thay vì dùng service layer.

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 9 files (3 create, 6 update)

---

## UX Design

### Before
```
┌─────────────────────────────────────────────────┐
│  AppHeader                          🔔 (0)      │
│                                                 │
│  Người dùng nộp đơn → không có thông báo nào   │
│  Recruiter cập nhật status → im lặng            │
│  Ai đó gửi kết nối → không biết                 │
│                                                 │
│  Chỉ NEW_MESSAGE mới tạo notification           │
│  URL hardcoded: localhost:5000 (sai port)       │
└─────────────────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────────────────┐
│  AppHeader                          🔔 (3)      │
│                                     │           │
│                          ┌──────────▼─────────┐ │
│                          │ Thông báo       ✓  │ │
│                          │ ─────────────────  │ │
│                          │ 💼 Nguyễn A đã    │ │
│                          │    nộp đơn         │ │
│                          │ ✅ Đơn của bạn    │ │
│                          │    được duyệt      │ │
│                          │ 👤 Trần B muốn    │ │
│                          │    kết nối         │ │
│                          └────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Applicant nộp đơn | Không có gì | Recruiter nhận notification real-time | `JOB_APPLICATION` type |
| Recruiter cập nhật status | Không có gì | Applicant nhận notification real-time | `APPLICATION_STATUS_CHANGE` type |
| User gửi connection request | Không có gì | Receiver nhận notification real-time | `CONNECTION_REQUEST` type |
| User accept connection | Không có gì | Sender nhận notification real-time | `CONNECTION_ACCEPTED` type |
| Bell icon | Chỉ hiện chat | Hiện tất cả loại + icon phân biệt | Màu theo type |
| Dropdown header | Tiêu đề đơn thuần | Có nút "Mark all as read" | UX improvement |

---

## Mandatory Reading

Files PHẢI đọc trước khi implement:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `backend/src/chatSocket.js` | 60-90 | Pattern gọi `createNotification` + `sendSocketNotification` |
| P0 | `backend/src/repositories/notificationRepository.js` | all | Hiểu schema Notification node và các method có sẵn |
| P0 | `backend/src/controllers/jobController.js` | `applyToJob` function | Nơi thêm trigger JOB_APPLICATION |
| P0 | `backend/src/controllers/recruiterController.js` | `updateApplicationStatus` function | Nơi thêm trigger APPLICATION_STATUS_CHANGE |
| P0 | `backend/src/controllers/networkController.js` | `sendRequest`, `acceptRequest` | Nơi thêm triggers CONNECTION_* |
| P1 | `client/src/components/NotificationBell/NotificationBell.jsx` | all | Component hiện tại cần sửa bugs |
| P1 | `backend/src/controllers/notificationController.js` | all | Pattern controller để thêm markAllAsRead |
| P1 | `backend/src/routes/notificationRoutes.js` | all | Pattern route để thêm route mới |
| P2 | `client/src/services/chatService.js` | all | Pattern service layer để mirror cho notificationService |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Socket.io rooms | Established internal pattern | `socket.join(userId)` — mỗi user có room riêng theo userId string |

---

## Patterns to Mirror

### NAMING_CONVENTION
```js
// SOURCE: backend/src/repositories/notificationRepository.js
export const createNotification = async (userId, type, content, referenceId = null) => { ... }
export const getNotifications = async (userId, limit = 20, skip = 0) => { ... }
export const markAsRead = async (notificationIds) => { ... }
// snake_case cho Neo4j property keys, camelCase cho JS functions/variables
```

### ERROR_HANDLING
```js
// SOURCE: backend/src/controllers/notificationController.js
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id
    const notifications = await notificationRepository.getNotifications(userId)
    res.json({ success: true, data: notifications })
  } catch (err) {
    next(err)  // always next(err) — never res.status(500).json(...)
  }
}
```

### SEND_SOCKET_NOTIFICATION_PATTERN
```js
// SOURCE: backend/src/chatSocket.js (lines ~73-83)
// Đây là pattern chuẩn để push notification từ bất kỳ controller nào:
const notification = await notificationRepository.createNotification(
  receiverId,
  'NEW_MESSAGE',
  `Bạn có tin nhắn mới từ ${senderName}`,
  messageId
)
sendSocketNotification(receiverId, notification)
```

### CONTROLLER_IMPORT_PATTERN
```js
// SOURCE: backend/src/controllers/jobController.js (top of file)
import * as jobRepository from '../repositories/jobRepository.js'
// Thêm tương tự:
import * as notificationRepository from '../repositories/notificationRepository.js'
import { sendSocketNotification } from '../chatSocket.js'
```

### ROUTE_PATTERN
```js
// SOURCE: backend/src/routes/notificationRoutes.js
import { Router } from 'express'
import { verifyToken } from '../middleware/authMiddleware.js'
import * as notificationController from '../controllers/notificationController.js'

const router = Router()
router.use(verifyToken)
router.get('/', notificationController.getNotifications)
router.post('/mark-read', notificationController.markAsRead)
// Thêm:
router.post('/mark-all-read', notificationController.markAllAsRead)
export default router
```

### FRONTEND_SERVICE_PATTERN
```js
// SOURCE: client/src/services/chatService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const fetchNotifications = async (token) => {
  const res = await fetch(`${API_URL}/v1/notifications`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch notifications')
  return res.json()
}
```

### FRONTEND_SOCKET_PATTERN
```js
// SOURCE: client/src/components/NotificationBell/NotificationBell.jsx (current, to be refactored)
// Thay thế localhost:5000 bằng:
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const socket = io(SOCKET_URL, { auth: { token } })
```

### NEO4J_WRITE_PATTERN
```js
// SOURCE: backend/src/repositories/notificationRepository.js
const session = driver.session()
try {
  const result = await session.run(`...`, params)
  return result.records[0]?.get('n').properties
} finally {
  await session.close()
}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `backend/src/repositories/notificationRepository.js` | UPDATE | Thêm `markAllAsRead` method |
| `backend/src/controllers/notificationController.js` | UPDATE | Thêm `markAllAsRead` handler |
| `backend/src/routes/notificationRoutes.js` | UPDATE | Thêm `POST /mark-all-read` route |
| `backend/src/controllers/jobController.js` | UPDATE | Thêm trigger `JOB_APPLICATION` trong `applyToJob` |
| `backend/src/controllers/recruiterController.js` | UPDATE | Thêm trigger `APPLICATION_STATUS_CHANGE` trong `updateApplicationStatus` |
| `backend/src/controllers/networkController.js` | UPDATE | Thêm triggers `CONNECTION_REQUEST` và `CONNECTION_ACCEPTED` |
| `client/src/services/notificationService.js` | CREATE | Service layer cho notification API calls |
| `client/src/hooks/useSocket.js` | CREATE | Shared socket hook (tránh duplicate connections) |
| `client/src/components/NotificationBell/NotificationBell.jsx` | UPDATE | Sửa URL bugs, dùng service layer, thêm icons, mark-all-read button |

## NOT Building
- Email notifications
- Push notifications (browser/mobile)
- Notification settings/preferences per user
- Notification categories/filters
- Pagination trong dropdown (max 20 items đã đủ theo repo default)
- Deep link navigation khi click notification (chỉ mark as read)
- Admin broadcast notifications

---

## Step-by-Step Tasks

### Task 1: Thêm `markAllAsRead` vào repository
- **ACTION**: Mở `backend/src/repositories/notificationRepository.js`, thêm function mới ở cuối file
- **IMPLEMENT**:
```js
export const markAllAsRead = async (userId) => {
  const session = driver.session()
  try {
    await session.run(
      `MATCH (:User {id: $userId})-[:HAS_NOTIFICATION]->(n:Notification {isRead: false})
       SET n.isRead = true`,
      { userId }
    )
  } finally {
    await session.close()
  }
}
```
- **MIRROR**: NEO4J_WRITE_PATTERN
- **IMPORTS**: Không cần import mới — `driver` đã available trong file
- **GOTCHA**: Dùng `MATCH` với `{isRead: false}` để chỉ update unread, tránh unnecessary writes
- **VALIDATE**: Gọi thủ công qua API sau Task 3, kiểm tra tất cả notification đổi sang `isRead: true` trong Neo4j Browser

### Task 2: Thêm `markAllAsRead` controller handler
- **ACTION**: Mở `backend/src/controllers/notificationController.js`, thêm export function mới
- **IMPLEMENT**:
```js
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id
    await notificationRepository.markAllAsRead(userId)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
```
- **MIRROR**: ERROR_HANDLING pattern
- **IMPORTS**: `notificationRepository` đã được import ở đầu file
- **GOTCHA**: `req.user.id` — user được gán bởi `verifyToken` middleware, không cần parse lại
- **VALIDATE**: `markAllAsRead` export có trong file

### Task 3: Thêm route `POST /mark-all-read`
- **ACTION**: Mở `backend/src/routes/notificationRoutes.js`, thêm 1 dòng route
- **IMPLEMENT**:
```js
router.post('/mark-all-read', notificationController.markAllAsRead)
```
- **MIRROR**: ROUTE_PATTERN
- **IMPORTS**: `notificationController` đã được import
- **GOTCHA**: Đặt trước `export default router` — thứ tự không quan trọng nhưng giữ nhóm với routes liên quan
- **VALIDATE**: `curl -X POST http://localhost:3000/v1/notifications/mark-all-read -H "Authorization: Bearer <token>"` trả về `{ success: true }`

### Task 4: Trigger `JOB_APPLICATION` notification trong jobController
- **ACTION**: Mở `backend/src/controllers/jobController.js`, tìm function `applyToJob`, thêm notification sau khi application được tạo thành công
- **IMPLEMENT**: Sau dòng tạo application thành công, thêm:
```js
// Lấy recruiterId của job — đã có trong job object từ query trước đó
const recruiterIdResult = await jobRepository.getJobRecruiterId(jobId)
if (recruiterIdResult) {
  const notification = await notificationRepository.createNotification(
    recruiterIdResult,
    'JOB_APPLICATION',
    `${req.user.name || 'Một ứng viên'} đã nộp đơn vào vị trí của bạn`,
    jobId
  )
  sendSocketNotification(recruiterIdResult, notification)
}
```
- **MIRROR**: SEND_SOCKET_NOTIFICATION_PATTERN, CONTROLLER_IMPORT_PATTERN
- **IMPORTS**: Thêm vào đầu file:
```js
import * as notificationRepository from '../repositories/notificationRepository.js'
import { sendSocketNotification } from '../chatSocket.js'
```
- **GOTCHA**: Phải kiểm tra `recruiterIdResult` trước khi gọi — không để notification failure làm crash toàn bộ apply flow. Wrap trong `try/catch` riêng nếu cần
- **GOTCHA**: Nếu `jobRepository` chưa có `getJobRecruiterId`, đọc lại code `applyToJob` — recruiterId có thể đã được query trong function. Dùng giá trị đó thay vì query thêm.
- **VALIDATE**: Applicant nộp đơn → recruiter nhận notification qua socket (kiểm tra browser console)

### Task 5: Trigger `APPLICATION_STATUS_CHANGE` trong recruiterController
- **ACTION**: Mở `backend/src/controllers/recruiterController.js`, tìm `updateApplicationStatus`, thêm notification sau khi update thành công
- **IMPLEMENT**:
```js
const notification = await notificationRepository.createNotification(
  applicantId,  // lấy từ application object đã query
  'APPLICATION_STATUS_CHANGE',
  `Đơn ứng tuyển của bạn đã được cập nhật: ${status}`,
  applicationId
)
sendSocketNotification(applicantId, notification)
```
- **MIRROR**: SEND_SOCKET_NOTIFICATION_PATTERN, CONTROLLER_IMPORT_PATTERN
- **IMPORTS**: Thêm import giống Task 4 nếu chưa có
- **GOTCHA**: `applicantId` phải được lấy từ application node đã query trong function — không query thêm
- **VALIDATE**: Recruiter cập nhật status → applicant nhận notification

### Task 6: Trigger `CONNECTION_REQUEST` và `CONNECTION_ACCEPTED` trong networkController
- **ACTION**: Mở `backend/src/controllers/networkController.js`, tìm `sendRequest` và `acceptRequest`
- **IMPLEMENT** (trong `sendRequest`):
```js
const notification = await notificationRepository.createNotification(
  receiverId,
  'CONNECTION_REQUEST',
  `${req.user.name || 'Ai đó'} muốn kết nối với bạn`,
  req.user.id  // senderId làm referenceId
)
sendSocketNotification(receiverId, notification)
```
- **IMPLEMENT** (trong `acceptRequest`):
```js
const notification = await notificationRepository.createNotification(
  originalSenderId,
  'CONNECTION_ACCEPTED',
  `${req.user.name || 'Ai đó'} đã chấp nhận kết nối của bạn`,
  req.user.id
)
sendSocketNotification(originalSenderId, notification)
```
- **MIRROR**: SEND_SOCKET_NOTIFICATION_PATTERN, CONTROLLER_IMPORT_PATTERN
- **IMPORTS**: Thêm import giống Task 4 nếu chưa có
- **GOTCHA**: Đọc kỹ function trước — `receiverId` và `originalSenderId` có thể đã có sẵn trong local variables
- **VALIDATE**: Gửi/chấp nhận kết nối → đối phương nhận notification

### Task 7: Tạo `notificationService.js` (frontend service layer)
- **ACTION**: Tạo file mới `client/src/services/notificationService.js`
- **IMPLEMENT**:
```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

export const fetchNotifications = async (token) => {
  const res = await fetch(`${API_URL}/v1/notifications`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Failed to fetch notifications')
  return res.json()
}

export const markAsRead = async (token, ids) => {
  const res = await fetch(`${API_URL}/v1/notifications/mark-read`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error('Failed to mark as read')
  return res.json()
}

export const markAllAsRead = async (token) => {
  const res = await fetch(`${API_URL}/v1/notifications/mark-all-read`, {
    method: 'POST',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Failed to mark all as read')
  return res.json()
}
```
- **MIRROR**: FRONTEND_SERVICE_PATTERN
- **IMPORTS**: Không cần import gì
- **GOTCHA**: Không dùng axios — codebase dùng native `fetch` nhất quán
- **VALIDATE**: File tồn tại, export 3 functions

### Task 8: Tạo `useSocket.js` custom hook
- **ACTION**: Tạo file mới `client/src/hooks/useSocket.js`
- **IMPLEMENT**:
```js
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useSocket = (token) => {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) return
    const socket = io(SOCKET_URL, { auth: { token } })
    socketRef.current = socket
    return () => socket.disconnect()
  }, [token])

  return socketRef
}
```
- **MIRROR**: FRONTEND_SOCKET_PATTERN
- **IMPORTS**: `import { useEffect, useRef } from 'react'`, `import { io } from 'socket.io-client'`
- **GOTCHA**: Dùng `useRef` để giữ socket reference ổn định qua renders — không dùng `useState` (tránh re-render)
- **GOTCHA**: Cleanup `socket.disconnect()` trong return của useEffect — tránh memory leak
- **VALIDATE**: File tồn tại, export `useSocket`

### Task 9: Refactor `NotificationBell.jsx`
- **ACTION**: Mở `client/src/components/NotificationBell/NotificationBell.jsx`, áp dụng các thay đổi sau:
- **IMPLEMENT**:
  1. Xóa hardcoded URLs (`localhost:5000`) — thay bằng import từ `notificationService`
  2. Xóa `io(...)` call trực tiếp — thay bằng `useSocket(token)`
  3. Dùng `fetchNotifications`, `markAsRead`, `markAllAsRead` từ service
  4. Thêm icon mapping:
```js
const NOTIFICATION_ICONS = {
  NEW_MESSAGE: 'chat',
  JOB_APPLICATION: 'work',
  APPLICATION_STATUS_CHANGE: 'task_alt',
  CONNECTION_REQUEST: 'person_add',
  CONNECTION_ACCEPTED: 'how_to_reg',
}
const getIcon = (type) => NOTIFICATION_ICONS[type] || 'notifications'
```
  5. Thêm nút "Mark all as read" trong header dropdown:
```jsx
<button onClick={handleMarkAllAsRead} className="text-xs text-blue-500 hover:underline">
  Đánh dấu tất cả đã đọc
</button>
```
  6. Handler `handleMarkAllAsRead`:
```js
const handleMarkAllAsRead = async () => {
  await markAllAsRead(token)
  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  setUnreadCount(0)
}
```
- **MIRROR**: FRONTEND_SERVICE_PATTERN, FRONTEND_SOCKET_PATTERN
- **IMPORTS**:
```js
import { fetchNotifications, markAsRead, markAllAsRead } from '../../services/notificationService'
import { useSocket } from '../../hooks/useSocket'
```
- **GOTCHA**: Khi dùng `useSocket`, lấy socket qua `socketRef.current` để đăng ký event listeners — đặt trong `useEffect` riêng với `[socketRef]` dependency
- **GOTCHA**: State update phải immutable — `prev.map(n => ...)` không `n.isRead = true`
- **VALIDATE**: Bell icon load đúng notifications, không còn lỗi port 5000, real-time notification hiện ngay khi trigger

---

## Testing Strategy

### Manual Test Cases

| Test | Trigger | Expected | Notes |
|---|---|---|---|
| JOB_APPLICATION | Applicant nộp đơn | Recruiter nhận notification ngay lập tức | Kiểm tra cả socket và sau khi refresh |
| APPLICATION_STATUS_CHANGE | Recruiter cập nhật trạng thái | Applicant nhận notification | Với nội dung status mới |
| CONNECTION_REQUEST | User A gửi request cho User B | User B nhận notification | |
| CONNECTION_ACCEPTED | User B chấp nhận | User A nhận notification | |
| Mark as read | Click notification | isRead = true, badge giảm | Immutable update |
| Mark all as read | Click nút header | Tất cả isRead = true, badge = 0 | |
| Badge count | Sau khi có unread | Số đỏ hiển thị trên bell | |
| Reconnect | Refresh trang | Notifications vẫn đầy đủ từ REST | |

### Edge Cases Checklist
- [ ] User không có notification nào — dropdown hiện "Không có thông báo"
- [ ] Notification khi người nhận offline — lưu vào DB, hiện khi login lại
- [ ] Gọi `markAllAsRead` khi không có unread — không lỗi
- [ ] Socket disconnect/reconnect — không duplicate notifications
- [ ] Token expired — fetch trả về 401, component xử lý gracefully

---

## Validation Commands

### Backend start
```bash
cd backend && npm run dev
```
EXPECT: Server running on port 3000, no import errors

### Frontend start
```bash
cd client && npm run dev
```
EXPECT: Vite dev server starts, no import errors

### Manual Validation
- [ ] Mở 2 tab browser: Tab A là recruiter, Tab B là applicant
- [ ] Tab B nộp đơn → Tab A thấy notification ngay (real-time)
- [ ] Tab A cập nhật trạng thái → Tab B thấy notification ngay
- [ ] Click notification → isRead = true, badge giảm
- [ ] Click "Đánh dấu tất cả đã đọc" → badge về 0
- [ ] Refresh trang → notifications vẫn đầy đủ (REST)
- [ ] Kiểm tra Network tab: không còn requests tới `localhost:5000`

---

## Acceptance Criteria
- [ ] Tất cả 4 loại notification được trigger đúng sự kiện
- [ ] Real-time delivery qua Socket.io hoạt động
- [ ] Badge count hiển thị và cập nhật đúng
- [ ] Mark as read hoạt động (single và all)
- [ ] Không còn hardcoded `localhost:5000`
- [ ] Mỗi loại notification có icon phân biệt
- [ ] Không có regression cho tính năng chat

## Completion Checklist
- [ ] Code follow patterns đã discovered
- [ ] Error handling dùng `next(err)` ở backend
- [ ] State updates là immutable ở frontend
- [ ] Notification failure không làm crash feature chính (apply, status update, connect)
- [ ] Không có hardcoded values

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `jobController.applyToJob` không có `recruiterId` sẵn | Medium | Cần query thêm | Đọc kỹ function trước Task 4, tránh N+1 query |
| Socket event listener duplicate khi component re-render | Low | Notification hiện nhiều lần | `useEffect` cleanup đúng cách |
| Circular import `chatSocket.js` → `notificationRepository.js` → ... | Low | Build fail | `notificationRepository` đã được import trong `chatSocket.js` — controllers import cả hai là OK |
| `req.user.name` undefined | Medium | Nội dung notification thiếu tên | Dùng `|| 'Người dùng'` fallback |

## Notes
- `deleteOldNotifications` cron đã chạy trong `server.js` — thông báo cũ hơn 30 ngày tự xóa
- `sendSocketNotification` export từ `chatSocket.js` — safe to import từ bất kỳ controller nào
- Không cần thêm Socket.io event mới — `receive_notification` đã được `NotificationBell` lắng nghe
- Nếu cần thêm navigation khi click notification trong tương lai: thêm `referenceId` vào routing logic
