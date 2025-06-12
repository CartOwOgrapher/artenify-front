import axios from 'axios';
import { useStore } from 'vuex'; // Для доступа к хранилищу
import router from '@/router';   // Для навигации

let appRouter = null;
let appStore = null;

// Для установки роутера и стора извне
export const setAxiosRouter = (router) => {
  appRouter = router;
};

export const setAxiosStore = (store) => {
  appStore = store;
};

const api = axios.create({
  baseURL: 'http://localhost/api/v1',
  withCredentials: true,
});

// URL для картинок
api.defaults.imageURL = 'http://localhost';

// Очередь запросов, ожидающих обновления токена
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Добавляем access_token ко всем запросам
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Обработка ответов и ошибок
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Проверяем, что это ошибка истекшего токена и это не повторный запрос
    if (
      ((error.response?.data?.message === "Token expired") || (error.response?.status == 401)) &&
      !originalRequest._retry
    ) {

      if (isRefreshing) {
        // Если уже идёт обновление — добавляем в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh-token');
        const newToken = data.token;

        // Сохраняем новый токен
        localStorage.setItem('access_token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Продолжаем выполнение запросов из очереди
        processQueue(null, newToken);
        return api(originalRequest);

      } catch (refreshError) {
        // Очищаем данные
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        console.error('Ошибка при обновлении токена:', refreshError);

        // Перенаправляем через Vue Router, если доступен
        if (appStore) {
          appStore.commit('clearUser')
        }

        if (appRouter && appRouter.currentRoute.value.path !== '/login') {
          const redirectPath = appRouter.currentRoute.value.fullPath;

          appRouter.push({
            path: '/login',
            query: { redirect: redirectPath },
          });
        }

        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;