# Hướng dẫn Đóng góp (Contributing Guide) - Backend Korra

<!-- AUTO-GENERATED -->

Chào mừng bạn đến với đội ngũ phát triển backend của dự án! Tài liệu này mô tả các tiêu chuẩn lập trình và quy trình phát triển mà chúng tôi đang áp dụng.

## 🏗️ Cấu trúc thư mục (Folder Structure)

Chúng ta tuân thủ mô hình **Controller - Service - Repository**:

- **`/controllers`**: Tiếp nhận request, gọi Service và trả về response.
- **`/services`**: Xử lý logic kinh doanh (Business Logic).
- **`/repositories`**: Truy cập dữ liệu (Data Access Layer - Neo4j).
- **`/utils`**: Chứa các hàm tiện ích dùng chung.
- **`/middlewares`**: Các bộ lọc (Auth, Error Handling, Validation).

---

## 🛡️ Tiêu chuẩn Xử lý Lỗi (Strict Standards)

**Không bao giờ sử dụng `try-catch` lặp lại trong Controller.** Bạn LUÔN PHẢI:
1.  Bọc tất cả các hàm Controller bằng `catchAsync`.
2.  Sử dụng các Custom Error classes (`NotFoundError`, `BadRequestError`, v.v.) trong tầng Service.
3.  Xem chi tiết tại: [ERROR_HANDLING.md](./ERROR_HANDLING.md)

---

## 🛠️ Quy trình phát triển (Dev Workflow)

| Lệnh | Mục đích |
|---------|-------------|
| `npm start` | Chạy Production |
| `npm run dev` | Chạy Development với Nodemon |
| `npx ecc-review` | Tự động kiểm tra code chuẩn ECC |

---

## 📝 Quy tắc đặt tên và Code Style

- **Biến/Hàm**: `camelCase` (ví dụ: `getUserProfile`).
- **Tên File**: `camelCase` (ví dụ: `userRepository.js`).
- **Bất đồng bộ**: Luôn ưu tiên dùng `async/await` thay vì `.then()`.

---

### 📏 Checklist trước khi Submit PR:
- [ ] Code không còn `console.log`.
- [ ] Các hàm Service đều có validation dữ liệu đầu vào.
- [ ] API mới đã được cập nhật vào tài liệu này hoặc Swagger (nếu có).

<!-- END AUTO-GENERATED -->
