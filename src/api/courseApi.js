import axiosClient from './axiosClient';

export const getCourses = () => axiosClient.get('/course');

export const createCourse = (formData) => {
  return axiosClient.post('/course', formData);
};

export const getCourseById = (id) => axiosClient.get(`/course/${id}`);

export const getCourseBySlug = (slug) =>
  axiosClient.get(`/course/slug/${slug}`);

export const updateCourse = (id, formData) => {
  return axiosClient.put(`/course/${id}`, formData);
};

export const togglePublishCourse = (id) => {
  return axiosClient.patch(`/course/${id}/toggle-publish`);
};

export const toggleHotCourse = (id) =>
  axiosClient.post(`/course/toggle-hot/${id}`);

export const deleteCourse = (id) => {
  return axiosClient.delete(`/course/${id}`);
};

export const searchCourses = (key, page = 1, pageSize = 10) => {
  return axiosClient.get('/course/search', {
    params: { key, page, pageSize },
  });
};

export const filterCourses = (params) => {
  return axiosClient.get('/course/filter', { params });
};
