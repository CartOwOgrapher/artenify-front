import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import ProfileView from '../views/ProfileView.vue';
import LeadersView from '../views/LeadersView.vue';
import PublishView from '@/views/PublishView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
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
    // ✅ Передаём параметр редиректа
    props: route => ({ redirect: route.query.redirect }),
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  },
  { 
    path: '/publish', 
    name: 'Publish', 
    component: PublishView },
  {
    path: '/leaders',
    name: 'Leaders',
    component: LeadersView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// ✅ Middleware для проверки авторизации
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    // ⏪ Сохраняем, куда пользователь пытался попасть
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
});

export default router;
