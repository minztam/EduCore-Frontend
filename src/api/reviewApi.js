import axiosClient from './axiosClient';

// =========================
// PUBLIC / STUDENT
// =========================

// Homepage featured reviews
export const getFeaturedReviews = () => axiosClient.get('/reviews');

// Reviews by course
export const getReviewsByCourse = (courseId) =>
  axiosClient.get(`/reviews/course/${courseId}`);

// Create review
export const createReview = (studentId, payload) =>
  axiosClient.post(`/reviews?studentId=${studentId}`, payload);

// Update own review
export const updateReview = (id, studentId, payload) =>
  axiosClient.put(`/reviews/${id}?studentId=${studentId}`, payload);

// Delete own review
export const deleteOwnReview = (id, studentId) =>
  axiosClient.delete(`/reviews/${id}?studentId=${studentId}`);

// =========================
// ADMIN
// =========================

// Get all reviews
export const getAllReviewsAdmin = (params = {}) => {
  return axiosClient.get('/reviews/admin', { params });
};

// Approve review
export const approveReview = (id) =>
  axiosClient.patch(`/reviews/admin/${id}/approve`);

// Toggle featured
export const toggleFeaturedReview = (id) =>
  axiosClient.patch(`/reviews/admin/${id}/featured`);

// Admin delete review
export const deleteReview = (id) => axiosClient.delete(`/reviews/admin/${id}`);

// Dashboard stats
export const getReviewStats = () => axiosClient.get('/reviews/admin/stats');
