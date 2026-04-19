import axiosClient from './axiosClient';

// ================= USER MANAGEMENT =================

// GET users (Admin)
export const getUsers = (params) => axiosClient.get('/users', { params });

// Toggle status
export const toggleUser = (id) => axiosClient.post(`/users/${id}/toggle`);

// Search users
export const searchUsers = (keyword) =>
  axiosClient.post('/users/search', null, {
    params: { key: keyword },
  });

// Register
export const registerUser = (data) => {
  return axiosClient.post('/users/register', null, {
    params: {
      email: data.email,
      password: data.password,
      name: data.name,
    },
  });
};

export const createUser = (data) => axiosClient.post('/users/register', data);

// Login
export const loginUser = (data) => axiosClient.post('/users/login', data);

// Google login
export const googleLogin = (token) =>
  axiosClient.post('/users/google-login', { token });

// Statistics
export const getUserStats = () => axiosClient.post('/users/statistics');

// ================= USER PROFILE =================

// Get user by id
export const getUserById = (id) => axiosClient.get(`/users/${id}`);

// Update profile
export const updateUserProfile = (id, formData) =>
  axiosClient.put(`/users/profile/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const changeUserRole = (id, newRole) =>
  axiosClient.put(`/users/${id}/role`, newRole, {
    headers: { 'Content-Type': 'application/json' },
  });

// Xóa người dùng (Mới)
export const deleteUser = (id) => axiosClient.delete(`/users/${id}`);

// Thao tác khóa/mở hàng loạt (Mới)
export const bulkToggleUsers = (ids) =>
  axiosClient.post('/users/bulk-toggle', ids);
