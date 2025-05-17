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
        <button class="login" @click="showLogin = true">Вход</button>
        <button class="register" @click="showRegister = true">Регистрация</button>
      </div>
    </div>
  </header>

  <!-- Модальное окно логина -->
  <transition name="modal-fade">
    <div v-if="showLogin" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">✖</button>
        <h2>Welcome!</h2>
        <h3>Sign in to Artenify</h3>
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="username">Login:</label>
            <input type="text" id="username" v-model="username" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  </transition>

  <!-- Модальное окно регистрации -->
  <transition name="modal-fade">
    <div v-if="showRegister" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">✖</button>
        <h2>Join Artenify!</h2>
        <h3>Create your account</h3>
        <form @submit.prevent="register">
          <div class="form-group">
            <label for="new-username">Username:</label>
            <input type="text" id="new-username" v-model="newUsername" required />
          </div>
          <div class="form-group">
            <label for="new-email">Email:</label>
            <input type="email" id="new-email" v-model="newEmail" required />
          </div>
          <div class="form-group">
            <label for="new-password">Password:</label>
            <input type="password" id="new-password" v-model="newPassword" required />
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  </transition>
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
      newPassword: ''
    };
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
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleEscape);
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

.nav a {
  text-decoration: none;
  color: #630D46;
  font-weight: 500;
  font-size: 18px;
}

.auth-buttons {
  display: flex;
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
