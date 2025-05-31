<template>
  <header class="header">
    <div class="container">
      <div class="left">
        <div class="logo" style="cursor: pointer;">
          <router-link to="/">
            <img src="@/assets/logo.png" alt="Логотип" />
          </router-link>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link">Обзор</router-link>
          <router-link to="/leaders" class="nav-link">Лидеры</router-link>
          <a href="#">Ресурсы</a>
          <a href="#">artenify+</a>
        </nav>
      </div>
      <div class="auth-buttons">
        <template v-if="isAuthenticated">
          <button class="publish-project" @click="$router.push('/publish')">Опубликовать проект</button>

          <button class="icon-btn" @click="$router.push('/messages')" aria-label="Сообщения">
            <!-- Иконка конверта -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#630D46" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </button>

          <button class="icon-btn" @click="$router.push('/notifications')" aria-label="Уведомления">
            <!-- Иконка колокольчика -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#630D46" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V10c0-3.07-1.63-5.64-4.5-6.32V3a1.5 1.5 0 1 0-3 0v.68C7.63 4.36 6 6.92 6 10v6l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>

          <router-link to="/profile" class="avatar-link">
            <img :src="userAvatar || defaultAvatar" alt="Аватар" class="avatar" />
          </router-link>

          <button class="logout" @click="logout">Выйти</button>
        </template>
        <template v-else>
          <button class="login" @click="$router.push('/login')">Вход</button>
          <button class="register" @click="$router.push('/register')">Регистрация</button>
        </template>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      showLogin: false,
      showRegister: false,
      username: '',
      password: '',
      newUsername: '',
      newEmail: '',
      newPassword: '',
      userName: '',
      userAvatar: '', // url аватарки пользователя
      defaultAvatar: 'https://via.placeholder.com/50?text=А', // заглушка аватарки
    };
  },
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('access_token');
    }
  },
  methods: {
    closeModal() {
      this.showLogin = false;
      this.showRegister = false;
    },
    login() {
      console.log('Login:', this.username, this.password);
      this.closeModal();
    },
    register() {
      console.log('Register:', this.newUsername, this.newEmail, this.newPassword);
      this.closeModal();
    },
    handleEscape(event) {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    },
    logout() {
      localStorage.removeItem('access_token');
      this.$router.push('/');
      location.reload(); // Обновить страницу, чтобы сбросить состояние
    },
    fetchUserInfo() {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Здесь можно сделать реальный запрос на API, чтобы получить имя и аватар
      // Пример заглушки:
      this.userName = 'Pidoras';
      this.userAvatar = 'https://i.pravatar.cc/50'; // пример случайной аватарки
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleEscape);
    this.fetchUserInfo();
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleEscape);
  }
};
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 65px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.container {
  width: 100%;
  max-width: 1920px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.left {
  display: flex;
  align-items: center;
}

.logo {
  margin-left: 20px;
}

.logo img {
  height: 100px;
  max-width: 100%;
}

.nav {
  display: flex;
  gap: 25px;
  margin-left: 20px;
}

.nav a,
.nav-link {
  text-decoration: none;
  color: #630D46;
  font-weight: 500;
  font-size: 18px;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

button {
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  font-size: 18px;
}

.login {
  background: none;
  color: #630D46;
}

.register {
  background: #ff69b4;
  color: white;
}

/* Новая кнопка "Опубликовать проект" */
.publish-project {
  background: #ff69b4;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: 500;
  font-size: 18px;
  cursor: pointer;
  border: none;
  margin-right: 10px;
}

/* Иконки сообщений и уведомлений */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Аватарка */
.avatar-link {
  display: inline-block;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: 10px;
  cursor: pointer;
  border: 2px solid #630D46;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Кнопка выхода */
.logout {
  background: none;
  color: #630D46;
  border: 1px solid #630D46;
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: 500;
  font-size: 18px;
  cursor: pointer;
  margin-left: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 350px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
</style>
