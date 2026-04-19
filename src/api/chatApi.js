import axiosClient from './axiosClient';

const chatApi = {
  // Thêm dòng này để khớp với Header
  getRecentChats: () => {
    return axiosClient.get('/Chat/rooms');
  },

  // Giữ nguyên các hàm cũ của bạn
  getRooms: () => {
    return axiosClient.get('/Chat/rooms');
  },

  getMessages: (roomId, page = 1) => {
    return axiosClient.get(`/Chat/messages/${roomId}?page=${page}`);
  },

  sendMessage: (data) => {
    return axiosClient.post('/Chat/send', data);
  },

  createPrivateRoom: (receiverId) => {
    return axiosClient.post(`/Chat/private-room/${receiverId}`);
  },
};

export default chatApi;
