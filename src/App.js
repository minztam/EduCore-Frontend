import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AdminLayout from './admin/layout/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import CategoriesPage from './admin/pages/categories/CategoriesPage';
import CategoryForm from './admin/pages/categories/CategoryForm';
import CoursePage from './admin/pages/Course/CoursePage';
import CourseForm from './admin/pages/Course/CourseForm';
import UsersPage from './admin/pages/UsersPage';
import ChapterPage from './admin/pages/Chapter/ChapterPage';
import LessonsPage from './admin/pages/lesson/LessonsPage';
import HomeHeroPage from './admin/pages/home-hero/HomeHeroPage';
import AdminCourseReviewPage from './admin/pages/review/AdminCourseReviewPage';
import SettingsPage from './admin/pages/SettingsPage';
import NotificationPage from './admin/pages/NotificationPage';

import HomePage from './page/HomePage';
import LoginPage from './page/auth/LoginPage';
import RegisterPage from './page/auth/RegisterPage';
import CourseDetailPage from './page/course/CourseDetailPage';
import CourseClient from './page/course/CourseClient';
import LearnPage from './page/course/LearnPage';
import UserProfilePage from './page/user/UserProfilePage';
import CheckoutPage from './page/payment/CheckoutPage';
import PaymentSuccessPage from './page/payment/PaymentSuccessPage';

import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import PostManagementPage from './admin/pages/Post/PostManagementPage';
import PostFormPage from './admin/pages/Post/PostFormPage';
import BlogPage from './page/blog/BlogPage';
import BlogDetailPage from './page/blog/BlogDetailPage';
import MyLearningPage from './page/mylearning/MyLearningPage';

import ChatPage from './page/ChatPage';
import DashboardPage from './admin/pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= CLIENT ================= */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/khoa-hoc" element={<CourseClient />} />
        <Route
          path="/khoa-hoc/danh-muc/:categorySlug"
          element={<CourseClient />}
        />
        <Route path="/my-learning" element={<MyLearningPage />} />
        <Route path="/khoa-hoc/chi-tiet/:slug" element={<CourseDetailPage />} />
        <Route path="/learn/:slug" element={<LearnPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/bai-viet" element={<BlogPage />} />
        <Route path="/bai-viet/chi-tiet/:slug" element={<BlogDetailPage />} />
        <Route path="/bai-viet/:categorySlug" element={<BlogPage />} />
        <Route path="/checkout/:courseId" element={<CheckoutPage />} />
        <Route path="/payment-result" element={<PaymentSuccessPage />} />
        <Route path="/chat" element={<ChatPage isAdmin={false} />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* Categories */}
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/create" element={<CategoryForm />} />
          <Route path="categories/edit/:id" element={<CategoryForm />} />

          {/* Courses */}
          <Route path="course" element={<CoursePage />} />
          <Route path="course/create" element={<CourseForm />} />
          <Route path="course/edit/:id" element={<CourseForm />} />

          {/* Chapters */}
          <Route path="courses/:courseId/chapters" element={<ChapterPage />} />
          <Route
            path="courses/:courseId/chapters/:chapterId/lessons"
            element={<LessonsPage />}
          />

          {/* Reviews */}
          <Route path="review" element={<AdminCourseReviewPage />} />

          {/* Posts (NEW) */}
          <Route path="posts" element={<PostManagementPage />} />
          <Route path="posts/create" element={<PostFormPage />} />
          <Route path="posts/edit/:slug" element={<PostFormPage />} />

          {/* Home Hero */}
          <Route path="home-hero" element={<HomeHeroPage />} />

          {/* Users */}
          <Route path="users" element={<UsersPage />} />
          <Route path="cai-dat/:id" element={<SettingsPage />} />
          <Route path="/admin/notifications" element={<NotificationPage />} />
          <Route path="/admin/tai-chinh" element={<Dashboard />} />

          <Route path="chat" element={<ChatPage isAdmin={true} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
