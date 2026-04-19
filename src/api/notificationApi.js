import axiosClient from './axiosClient';

const notificationApi = {
  getHeaderNotifications: async () => {
    const res = await axiosClient.get('/notification/header');
    return res.data;
  },

  getNotificationsForPage: async (page = 1, pageSize = 10) => {
    const res = await axiosClient.get('/notification/page', {
      params: { page, pageSize },
    });
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await axiosClient.put(`/notification/mark-as-read/${id}`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await axiosClient.put('/notification/mark-all-as-read');
    return res.data;
  },
};

export default notificationApi;
