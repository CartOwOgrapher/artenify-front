<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Welcome back!</h2>
      <h3>Login to Artenify</h3>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit">Login</button>
      </form>
      <p class="redirect">
        Don't have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import api from '@/axios.js'

export default {
  props: ['redirect'],
  data() {
    return {
      email: '',
      password: '',
      error: null,
    }
  },
  methods: {
    async login() {
      this.error = null
      try {
        const response = await api.post(
          '/auth/login',
          {
            email: this.email,
            password: this.password,
          },
          { withCredentials: true }
        )
        const token = response.data.token
        localStorage.setItem('access_token', token)
        const redirectPath = this.redirect || '/profile'
        this.$router.push(redirectPath)
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Login failed. Please try again.'
        console.error(err)
      }
    },
  },
}
</script>

<style scoped>
/* Base styles */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;  /* Изменено с sticky на fixed для надежности */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #181818;
  z-index: 100;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
}

/* Карточка с формой */
.auth-card {
  width: 100%;
  max-width: 400px;  /* Фиксированная максимальная ширина */
  min-width: 300px;  /* Минимальная ширина для маленьких экранов */
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: auto;  /* Дополнительный margin для подстраховки */
}

.auth-card:hover {
  transform: translateY(-5px);
}

/* Typography */
.auth-card h2 {
  font-size: 28px;
  font-weight: 700;
  color: #222;
  margin: 0 0 5px 0;
  line-height: 1.2;
}

.auth-card h3 {
  font-size: 16px;
  font-weight: 400;
  color: #666;
  margin: 0 0 30px 0;
}

/* Form elements */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #444;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #555;
  outline: none;
}

/* Button styles */
button[type="submit"] {
  width: 100%;
  padding: 14px;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

button[type="submit"]:hover {
  background-color: #333;
}

/* Additional links */
.redirect {
  text-align: center;
  margin-top: 25px;
  font-size: 14px;
  color: #666;
}

.redirect a {
  color: #ff98ab;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.redirect a:hover {
  color: #ff6b8b;
}

/* Error message */
.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin: 15px 0;
  text-align: center;
  padding: 10px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }
  
  .auth-card h2 {
    font-size: 24px;
  }
}
</style>
