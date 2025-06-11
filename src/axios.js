import axios from 'axios';
import { useStore } from 'vuex'; // Для доступа к хранилищу
import router from '@/router';   // Для навигации

const api = axios.create({
  baseURL: 'http://localhost/api/v1',
  withCredentials: true,
});

api.defaults.imageURL = 'http://localhost';

// Перехватчик запросов (добавляет токен)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export default api;