// src/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/api/v1', // путь к Laravel API
  withCredentials: true,              // для работы с refresh_token cookie
});

// для формирования ссылок на картинки в компонентах
api.defaults.imageURL = 'http://localhost';

// Добавляем access_token ко всем запросам
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;
