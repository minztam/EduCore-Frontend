import axiosClient from './axiosClient';

// ===== GET BY COURSE =====
export const getChaptersByCourse = (courseId) => {
  return axiosClient.get(`/chapter/course/${courseId}`);
};

// ===== CREATE =====
// export const createChapter = (data) => {
//   return
// axiosClient.post('/chapter', {
//   title: data.title,
//   order: Number(data.order),
//   courseId: data.courseId,
// });
// };

export const createChapter = (data) => {
  return axiosClient.post(
    `/chapter?title=${data.title}&order=${data.order}&courseId=${data.courseId}`
  );
};

// ===== UPDATE =====
export const updateChapter = (id, data) => {
  return axiosClient.put(`/chapter/${id}`, data);
};

// ===== DELETE =====
export const deleteChapter = (id) => {
  return axiosClient.delete(`/chapter/${id}`);
};
