import axiosClient from './axiosClient';

export const enrollCourse = (userId, courseId) =>
  axiosClient.post('/enrollment/enroll', null, {
    params: {
      userId,
      courseId,
    },
  });

export const checkEnrollment = (userId, courseId) =>
  axiosClient.get(`/enrollment/check?userId=${userId}&courseId=${courseId}`);

export const getMyCourses = (userId) =>
  axiosClient.get(`/enrollment/my-courses?userId=${userId}`);

export const updateLearningProgress = (userId, courseId, lessonId) => {
  return axiosClient.post(
    `/enrollment/progress?userId=${userId}&courseId=${courseId}&lessonId=${lessonId}`
  );
};
