import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/api', // путь к Laravel API
  withCredentials: true, // для работы с refresh_token cookie
});

// Добавляем access_token ко всем запросам
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Автоматическое обновление access_token по refresh_token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          'http://localhost/api/v1/auth/refresh-token',
          {},
          { withCredentials: true }
        );

        const newToken = res.data.token;
        localStorage.setItem('access_token', newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
