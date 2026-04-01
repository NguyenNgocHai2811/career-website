# career-website
Dự án KORRA của bạn là một nền tảng tìm việc làm (Job Search Platform). Sau đây là phân tích vai trò các thư mục/file và luồng hoạt động từ Client đến Server:

1. Vai trò của các thư mục và file
Dự án được chia làm 2 phần chính: client (Frontend) và backend (Server).

Client (Frontend)
Thư mục client/ chứa mã nguồn giao diện người dùng, được xây dựng bằng React, Vite, và Tailwind CSS.

client/src/: Nơi chứa toàn bộ mã nguồn React.
main.jsx (hoặc index.jsx): Điểm bắt đầu (entry point) của React, nơi ứng dụng được render vào file HTML.
App.jsx: Component gốc của ứng dụng (chứa giao diện trang chủ mà chúng ta vừa tạo).
index.css: Nơi import Tailwind CSS và cấu hình các biến màu sắc, hiệu ứng animations (@theme, @layer).
client/index.html: Trang HTML gốc. Khi chạy ứng dụng, React sẽ inject giao diện vào file này. Nơi đây cũng chứa các link import Font chữ (Manrope) và Icons (Material Symbols).
client/vite.config.js: File cấu hình của Vite (bundler), bao gồm plugin @tailwindcss/vite để hỗ trợ Tailwind v4.
Backend (Server)
Thư mục backend/ chứa mã nguồn API, được xây dựng bằng Node.js, Express.js, sử dụng cơ sở dữ liệu Neo4j (Graph Database) và Elasticsearch.

backend/src/server.js: Điểm bắt đầu của Backend. Chứa logic khởi tạo ứng dụng Express, kết nối với Neo4j và Elasticsearch, sau đó lắng nghe các request từ client.
Các thư mục con trong backend/src/:
routes/: Định nghĩa các đường dẫn API (ví dụ: /v1/auth, /v1/jobs). Nhận request và chuyển đến Controller tương ứng.
controllers/: Tiếp nhận request từ Route, trích xuất dữ liệu (body, params) và gọi Service. Sau đó trả kết quả (Response) về cho Client.
services/: Chứa toàn bộ logic nghiệp vụ (business logic) của ứng dụng. Nhận dữ liệu từ Controller, xử lý, và gọi Repository. (Lưu ý: Layer này không được chứa câu lệnh Cypher).
repositories/: Lớp duy nhất tương tác trực tiếp với Database (Neo4j driver). Chứa các câu truy vấn Cypher để lấy/lưu dữ liệu và parse kết quả trả về cho Service.
middlewares/: Chứa các hàm trung gian, ví dụ authMiddleware.js để xác thực JWT token bảo vệ các API dùng nội bộ.
config/: Chứa các file cấu hình kết nối Database, môi trường.
2. Luồng hoạt động từ Client đến Server
Người dùng tương tác: Người dùng truy cập trang web (VD: Nhấn nút "Search" trên trang chủ).
Client (React):
Component React bắt sự kiện (event).
Sử dụng fetch hoặc axios để gửi một HTTP Request (VD: GET /v1/jobs?keyword=...) đến Backend.
Backend Route & Middleware:
Request đi vào backend/src/server.js, sau đó được router định tuyến đến backend/src/routes/jobRoutes.js.
Nếu API yêu cầu đăng nhập, nó sẽ đi qua authMiddleware.js để kiểm tra JWT token.
Backend Controller -> Service -> Repository:
Controller (jobController.js) nhận request, lấy ra từ khóa tìm kiếm và gọi Service.
Service (jobService.js) xử lý logic nghiệp vụ và gọi hàm trong Repository.
Repository (jobRepository.js) thực thi câu lệnh truy vấn (Cypher/Elasticsearch) xuống Database.
Database (Neo4j/Elasticsearch) -> Trả về Client:
Database trả dữ liệu về Repository -> Service -> Controller.
Controller đóng gói dữ liệu thành JSON (kèm status code như 200 OK) và gửi HTTP Response về lại cho Client.
Client (React): Nhận JSON, cập nhật state, và render lại giao diện hiển thị kết quả cho người dùng.
3. Khi chạy lệnh npm run dev thì chạy từ đâu đến đâu?
Lệnh npm run dev sẽ hoạt động khác nhau tùy thuộc vào bạn đang đứng ở thư mục nào:

Nếu bạn chạy ở thư mục client/:

Lệnh vite được thực thi.
Nó sẽ đọc cấu hình từ vite.config.js, biên dịch nhanh các file React/Tailwind, và khởi tạo một Dev Server (thường ở http://localhost:5173).
File được gọi đầu tiên là index.html, sau đó load script main.jsx, và cuối cùng render toàn bộ App.jsx lên trình duyệt. Bất cứ khi nào bạn sửa code, giao diện sẽ tự động cập nhật (Hot Module Replacement - HMR).
Nếu bạn chạy ở thư mục backend/:

Lệnh nodemon src/server.js được thực thi.
Nodemon sẽ khởi chạy file backend/src/server.js.
Nó sẽ tiến hành kết nối với Database (Neo4j, Elastic), thiết lập các Routes, và bắt đầu lắng nghe ở một cổng (ví dụ: http://localhost:5000).
Nodemon sẽ theo dõi các file trong backend, nếu có thay đổi code, server sẽ tự động khởi động lại.
Để hệ thống hoạt động đầy đủ, bạn cần mở 2 terminal và chạy npm run dev ở cả 2 thư mục client và backend cùng lúc.

Bạn có muốn tôi thực hiện thêm công việc gì với dự án này không? (Ví dụ: tạo thêm các API cho trang chủ, hay chỉnh sửa thêm giao diện?)