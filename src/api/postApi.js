import api from './axiosClient';

export const getPosts = (params) => api.get('/post', { params });

export const getPostById = (id) => api.get(`/post/${id}`);
export const getPostBySlug = (slug) => api.get(`/post/slug/${slug}`);

export const createPost = (data) =>
  api.post('/post', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updatePost = (id, data) =>
  api.put(`/post/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deletePost = (id) => api.delete(`/post/${id}`);

export const togglePublishPost = (id) => api.patch(`/post/${id}/publish`);

export const getFeaturedPosts = (count = 5) =>
  api.get(`/post/featured?count=${count}`);

export const toggleFeaturedPost = (id) => api.patch(`/post/${id}/featured`);
