import axios from 'axios';

const envBaseURL = process.env.REACT_APP_API_BASE_URL;
console.log('Đang gọi API tại:', envBaseURL);

const axiosClient = axios.create({
  baseURL: envBaseURL || 'https://educore-api-d1v2.onrender.com/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']; // để axios tự set
  }

  return config;
});

export default axiosClient;
