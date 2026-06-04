# EduCore Web

Giao diện quản lý khóa học và học tập trực tuyến (Frontend).

Demo: https://edu-core-frontend-topaz.vercel.app/

## 🚀 Tổng quan

EduCore Web là phần frontend của hệ thống EduCore — cung cấp giao diện học viên và quản trị để quản lý khóa học, chương, bài học, bài viết, review, người dùng và thông báo.

Backend: https://github.com/minztam/EduCore-API

## 📦 Công nghệ chính

- React 19, React Router v7
- Ant Design, Tailwind CSS
- Axios, CKEditor 5
- Recharts, jsPDF, xlsx
- @react-oauth/google, lucide-react, react-icons
- @microsoft/signalr (realtime)

## ⚙️ Cài đặt nhanh

Yêu cầu: Node.js v18+, `npm` hoặc `yarn`.

1. Clone repo

```bash
git clone <your-frontend-repo-url>
cd educore.web
```

2. Cài dependencies

```bash
npm install
```

3. Tạo file cấu hình môi trường `.env.local` tại thư mục gốc với nội dung:

```env
REACT_APP_API_URL=https://localhost:<port>/api
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
```

4. Chạy ứng dụng (development)

```bash
npm start
```

## 🗂️ Cấu trúc thư mục (tóm tắt)

```
src/
├── admin/        # admin layout & pages
├── api/          # axios wrappers
├── components/   # shared components (Header, Chat, ProtectedAdminRoute)
├── hooks/        # custom hooks
├── page/         # client pages
├── App.js        # routes
└── index.js      # app bootstrap (Google OAuth provider)
```

## 🧩 Tính năng chính

### Client

- Danh sách & tìm kiếm khóa học, lọc theo danh mục/level/price
- Trang chi tiết khóa học, preview video, đăng ký
- Trang học tập cho học viên đã đăng ký (`/learn/:slug`)
- Thanh toán & kết quả thanh toán
- Chat nội bộ và thông báo realtime

### Admin

- Quản lý categories, courses, chapters, lessons
- Quản lý posts, reviews, home-hero, users, notifications
- Dashboard (Recharts) và trang tài chính
- Route admin được bảo vệ (`ProtectedAdminRoute`)

## 🔗 API backend

Frontend tương tác với các module backend: `auth`, `courses`, `categories`, `chapters`, `lessons`, `reviews`, `enrollments`, `payments`, `notifications`, `users`, `posts`, `home-hero`, `chat`.

## 📝 Ghi chú

- `src/index.js` đã cấu hình `GoogleOAuthProvider` với `clientId`.
- Kiểm tra `src/api/` để biết cấu trúc các endpoint và cách gọi API.
- Admin routes yêu cầu `localStorage.token` và `user.role === 'Admin'`.

---
