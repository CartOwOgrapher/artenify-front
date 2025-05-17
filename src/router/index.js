import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ProfileView from '../views/ProfileView.vue';
import LeadersView from '../views/LeadersView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/profile', // ⬅️ Новый маршрут
    name: 'profile',
    component: ProfileView,
  },
  {
    path: '/leaders',  // <-- новый путь
    name: 'Leaders',
    component: LeadersView
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
