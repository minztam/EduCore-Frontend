import axiosClient from './axiosClient';

export const getLessonsByChapterId = async (chapterId) => {
  return await axiosClient.get(`/lesson/chapter/${chapterId}`);
};

export const getLessonById = (id) => {
  return axiosClient.get(`/lesson/${id}`);
};

export const createLesson = async (formData) => {
  return await axiosClient.post('/lesson', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateLesson = (formData) => {
  return axiosClient.put(`/lesson`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteLesson = (id) => {
  return axiosClient.delete(`/lesson/${id}`);
};
