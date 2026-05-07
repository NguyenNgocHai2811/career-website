# Hướng dẫn Xử lý Lỗi (Error Handling) - Team Backend Korra

<!-- AUTO-GENERATED -->

Tài liệu này hướng dẫn cách sử dụng hệ thống xử lý lỗi tập trung mới được triển khai. Hệ thống này giúp code sạch hơn, đồng nhất mã lỗi HTTP (400, 404, 500) và dễ dàng debug.

## 🏗️ Cấu trúc hệ thống
Hệ thống gồm 3 thành phần chính:
1. **Custom Error Classes**: Định nghĩa loại lỗi và mã HTTP tương ứng.
2. **catchAsync Wrapper**: Loại bỏ `try-catch` lặp lại.
3. **Global Error Middleware**: Nơi tập trung và phản hồi lỗi cho Client.

---

## 🛠️ Cách sử dụng

### 1. Sử dụng trong Tầng Service
Thay vì ném lỗi `Error` chung chung, hãy sử dụng các Class chuyên biệt từ `@/utils/errors`.

```javascript
const { NotFoundError, BadRequestError } = require('../utils/errors');

const getUser = async (id) => {
  const user = await userRepository.findById(id);
  
  // Ném lỗi 404 thay vì 500
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng với ID này');
  }
  
  return user;
};
```

**Các Class có sẵn:**
- `BadRequestError(message)` -> Trả về mã **400**
- `UnauthorizedError(message)` -> Trả về mã **401**
- `ForbiddenError(message)` -> Trả về mã **403**
- `NotFoundError(message)` -> Trả về mã **404**

### 2. Sử dụng trong Tầng Controller
Sử dụng `catchAsync` để bao bọc các hàm `async`. Bạn **KHÔNG CẦN** viết `try-catch` nữa.

```javascript
const catchAsync = require('../utils/catchAsync');

// Bọc hàm async bằng catchAsync
const getUserProfile = catchAsync(async (req, res, next) => {
  const user = await userService.getUser(req.params.id);
  res.status(200).json(user);
});
```

### 3. Cách thức hoạt động
Khi một lỗi được `throw` từ Service, `catchAsync` trong Controller sẽ bắt được và tự động chuyển nó tới `next(err)`. Express sẽ chuyển lỗi đó tới **Global Error Middleware** tại `server.js` để trả về phản hồi chuẩn hóa cho Client.

---

## 🛡️ Chú ý Quan trọng
- **IsOperational**: Mọi Custom Error đều có thuộc tính `isOperational = true`. Điều này giúp hệ thống phân biệt được đâu là lỗi do chúng ta chủ động bắt (như sai mật khẩu, thiếu dữ liệu) và đâu là lỗi hệ thống đột ngột (như crash database).
- **Môi trường Development**: Server sẽ trả về đầy đủ `stack trace` để chúng ta dễ debug.
- **Môi trường Production**: Server chỉ trả về thông báo lỗi an toàn (Message), không lộ cấu trúc code.

---

### 📏 Checklist cho Developer:
- [ ] Luôn bọc Controller bằng `catchAsync`.
- [ ] Luôn sử dụng đúng loại Error Class trong Service.
- [ ] Không sử dụng `res.status(500)` thủ công trừ trường hợp đặc biệt.

<!-- END AUTO-GENERATED -->
