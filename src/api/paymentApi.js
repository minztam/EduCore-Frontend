import axiosClient from './axiosClient';

export const createPaymentUrl = (data) => {
  // Thay đổi từ '/payment/create-vnpay-url' thành '/Payment/create-payment'
  return axiosClient.post('/Payment/create-payment', data);
};

export const getAllHistory = (pageIndex, pageSize) => {
  return axiosClient.get('/Payment/all-history', {
    params: { pageIndex, pageSize },
  });
};

export const approvePayment = (id) => {
  return axiosClient.post(`/Payment/approve/${id}`);
};

export const rejectPayment = (id) => {
  return axiosClient.post(`/Payment/reject/${id}`);
};
