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
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #181818;
  height: 100vh;
  position: relative;
}

.auth-card {
  width: 320px;
  background-color: white;
  padding: 30px;
  border-radius: 3px;
  z-index: 10;
}

h2,
h3 {
  color: black;
  margin: 0;
}

h2 {
  font-size: 24px;
}

h3 {
  font-size: 16px;
  margin-bottom: 20px;
  color: #555;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  color: black;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #b8b7b7;
  border-radius: 4px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background-color: #333;
}

.redirect {
  margin-top: 15px;
  font-size: 14px;
  color: #333;
}

.redirect a {
  color: rgb(255, 152, 171);
  text-decoration: none;
}

.error-message {
  color: red;
  margin-bottom: 10px;
}

.auth-image {
  position: absolute;
  bottom: 0;
  right: 0;
  height: 200px;
  z-index: 5;
}
</style>
