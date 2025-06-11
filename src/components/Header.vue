<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

// Получаем данные из хранилища
const isAuthenticated = computed(() => store.getters.isAuthenticated)
const user = computed(() => store.state.user)

// Аватар по умолчанию
const defaultAvatar = user.avatar

// Мобильное меню
const isMenuOpen = ref(false)
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
const closeMenu = () => {
  isMenuOpen.value = false
}

// Выход
async function logout(){
  await store.dispatch('logout');
  router.push('/login');
}

const goToMyProfile = (userId) => {
  if (userId != user.id)
  { router.push(`/profile/${userId}`) }
}

</script>

<template>
  <header class="header">
    <div class="container">
      <!-- Логотип -->
      <div class="left">
        <div class="logo" style="cursor: pointer;">
          <router-link to="/">
            <img src="@/assets/logo.png" alt="Логотип" />
          </router-link>
        </div>

        <!-- Навигация -->
        <nav class="nav">
          <router-link to="/" class="nav-link">Обзор</router-link>
          <router-link to="/leaders" class="nav-link">Лидеры</router-link>
          <a href="#">Ресурсы</a>
          <a href="#">artenify+</a>
        </nav>
      </div>

      <!-- Кнопки авторизации -->
      <div class="auth-buttons">
        <template v-if="isAuthenticated">
          <button class="publish-project" @click="$router.push('/publish')">Опубликовать проект</button>
          <button class="icon-btn" @click="$router.push('/messages')" aria-label="Сообщения">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#630D46" viewBox="0 0 24 24">
              <path
                d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2h-2v2zM0 6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V6zm10 7l10-5V6L10 11z" />
            </svg>
          </button>
          <button class="icon-btn" @click="$router.push('/notifications')" aria-label="Уведомления">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#630D46" viewBox="0 0 24 24">
              <path
                d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V10c0-3.07-1.63-5.64-4.5-6.32V3a1.5 1.5 0 1 0-3 0v.68C7.63 4.36 6 6.92 6 10v6l-2 2v1h16v-1l-2-2z" />
            </svg>
          </button>
          <a @click="goToMyProfile(user.id)" class="avatar-link">
            <img :src="user?.avatar || defaultAvatar" alt="Аватар" class="avatar" />
          </a>
          <button class="logout" @click="logout">Выйти</button>
        </template>
        <template v-else>
          <button class="login" @click="$router.push('/login')">Вход</button>
          <button class="register" @click="$router.push('/register')">Регистрация</button>
        </template>
      </div>

      <!-- Бургер-меню -->
      <button class="burger-btn" @click="toggleMenu" aria-label="Меню">
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </button>
    </div>

    <!-- Мобильное меню -->
    <div class="mobile-menu" :class="{ 'mobile-menu--open': isMenuOpen }">
      <nav class="mobile-nav">
        <router-link to="/" class="mobile-nav-link" @click="closeMenu">Обзор</router-link>
        <router-link to="/leaders" class="mobile-nav-link" @click="closeMenu">Лидеры</router-link>
        <a href="#" class="mobile-nav-link" @click="closeMenu">Ресурсы</a>
        <a href="#" class="mobile-nav-link" @click="closeMenu">artenify+</a>

        <template v-if="isAuthenticated">
          <button class="mobile-menu-btn" @click="navigateTo('/publish')">Опубликовать проект</button>
          <button class="mobile-menu-btn" @click="navigateTo('/messages')">Сообщения</button>
          <button class="mobile-menu-btn" @click="navigateTo('/notifications')">Уведомления</button>
          <button class="mobile-menu-btn" @click="navigateTo('/profile')">Профиль</button>
          <button class="mobile-menu-btn logout" @click="logout">Выйти</button>
        </template>
        <template v-else>
          <button class="mobile-menu-btn login" @click="navigateTo('/login')">Вход</button>
          <button class="mobile-menu-btn register" @click="navigateTo('/register')">Регистрация</button>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 65px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0 15px;
  box-sizing: border-box;
}

.container {
  width: 100%;
  height: 100%;
  max-width: 1920px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo img {
  height: 35px;
  width: auto;
}

.nav {
  display: flex;
  gap: 15px;
}

.nav a,
.nav-link {
  text-decoration: none;
  color: #630D46;
  font-weight: 500;
  font-size: 16px;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

button {
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  white-space: nowrap;
}

.login {
  background: none;
  color: #630D46;
}

.register {
  background: #ff69b4;
  color: white;
}

.publish-project {
  background: #ff69b4;
  color: white;
  margin-right: 10px;
}

.icon-btn {
  background: none;
  padding: 0 8px;
}

.avatar-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #630D46;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logout {
  background: none;
  color: #630D46;
  border: 1px solid #630D46;
  margin-left: 10px;
}

.burger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 1001;
}

.burger-line {
  display: block;
  width: 100%;
  height: 3px;
  background: #630D46;
  transition: all 0.3s ease;
}

.mobile-menu {
  position: fixed;
  top: 65px;
  left: 0;
  width: 100%;
  height: calc(100vh - 65px);
  background: white;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 999;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.mobile-menu--open {
  transform: translateX(0);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mobile-nav-link {
  text-decoration: none;
  color: #630D46;
  font-size: 18px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.mobile-menu-btn {
  width: 100%;
  padding: 12px;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 10px;
  text-align: left;
  background: none;
  border: none;
  color: #630D46;
}

.mobile-menu-btn.register {
  background: #ff69b4;
  color: white;
}

.mobile-menu-btn.logout {
  color: #630D46;
  border: 1px solid #630D46;
}

/* Адаптация */
@media (max-width: 620px) {

  .nav,
  .auth-buttons>*:not(.burger-btn) {
    display: none;
  }

  .burger-btn {
    display: flex;
  }
}

@media (max-width: 480px) {
  .header {
    height: 60px;
    padding: 0 10px;
  }

  .logo img {
    height: 35px;
  }

  .mobile-menu {
    top: 60px;
    height: calc(100vh - 60px);
  }

  button {
    padding: 8px 12px;
    font-size: 16px;
  }
}</style>