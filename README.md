# EduCore Web

EduCore Web là một ứng dụng học trực tuyến được xây dựng bằng React. Dự án gồm cả giao diện học viên/front-end và giao diện quản trị/admin nhằm quản lý khóa học, danh mục, chương/bài học, bài viết, review, người dùng và thông báo.

## 🌐 Hệ sinh thái dự án

Dự án này là phần Frontend của hệ thống EduCore. Để hệ thống hoạt động đầy đủ tính năng, bạn cần kết nối với Backend API:

- **Backend Repository**: [EduCore-API](https://github.com/minztam/EduCore-API)

---

## 🚀 Công nghệ sử dụng

- **Core**: React 19, React Router v7
- **UI/UX**: Ant Design, Tailwind CSS, Lucide React
- **Data Fetching**: Axios
- **Realtime**: @microsoft/signalr (Chat & Notifications)
- **Utilities**: Recharts (Dashboard), jsPDF, xlsx (Export data), CKEditor 5

---

## 🛠 Hướng dẫn cài đặt

1. Yêu cầu

- Node.js (v18 trở lên)
- npm hoặc yarn

2. Thiết lập

# Clone dự án

````bash
git clone <your-frontend-repo-url>

# Cài đặt dependencies
```bash
npm install

3. Cấu hình môi trường
Tạo file .env.local tại thư mục gốc và điền các thông tin sau:
```bash
REACT_APP_API_URL=https://localhost:<port>/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

4. Chạy dự án
```bash
# Chạy ở chế độ phát triển
npm start

📂 Cấu trúc dự án
src/
├── admin/          # Layout và các trang quản trị (Admin)
├── api/            # Layer xử lý gọi API (Axios)
├── components/     # Các thành phần dùng chung (Header, Chat, ProtectedRoute)
├── hooks/          # Custom React Hooks
├── pages/          # Các trang dành cho học viên (Client)
├── App.js          # Định nghĩa Routing (Client & Admin)
└── index.js        # Cấu hình Providers (GoogleAuth, Redux/Context)

💡 Tính năng chính
    🎓 Client (Học viên)
        Khám phá: Xem danh sách khóa học, tìm kiếm, lọc theo danh mục/mức độ.
        Học tập: Giao diện bài học tích hợp video/tài liệu, theo dõi tiến độ.
        Thanh toán: Quy trình thanh toán tích hợp VNPAY.
        Tương tác: Chat nội bộ (1:1) và nhận thông báo theo thời gian thực.

    ⚙️ Admin (Quản trị)
        Quản trị toàn diện: Khóa học, chương, bài học, danh mục, bài viết.
        Dashboard: Xem thống kê tài chính, người dùng bằng biểu đồ (Recharts).
        Quản lý nội dung: Cấu hình trang Home (Hero section), gửi thông báo.
        Bảo mật: Các route Admin được bảo vệ bởi ProtectedAdminRoute.

📚 API Integration
Ứng dụng tương tác với Backend thông qua các Module chính:
Auth, Courses, Enrollments, Payments, Notifications, Chat, Posts, Users.
Tham khảo các hàm gọi API tại thư mục src/api/.
````
