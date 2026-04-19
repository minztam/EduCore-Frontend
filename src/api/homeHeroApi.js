import axiosClient from './axiosClient';

const homeHeroApi = {
  getHomeHero: () => {
    return axiosClient.get('/HomeHero');
  },

  saveHomeHero: (formData) => {
    return axiosClient.post('/HomeHero', formData);
  },

  toggleHomeHero: () => {
    return axiosClient.post('/HomeHero/toggle');
  },
};

export default homeHeroApi;
