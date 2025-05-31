<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Welcome!</h2>
      <h3>Sign up to Artenify</h3>
      <form @submit.prevent="register">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" v-model="username" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" required />
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" v-model="confirmPassword" required />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit">Register</button>
      </form>
      <p class="redirect">
        Already have an account?
        <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import api from '@/axios.js'

export default {
  data() {
    return {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      error: null,
    }
  },
  methods: {
    async register() {
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match'
        return
      }

      try {
        await api.post('/auth/register', {
          email: this.email,
          name: this.username,
          password: this.password,
          password_confirmation: this.confirmPassword,
        })

        this.$router.push('/login')
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Registration failed. Please try again.'
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
}

.auth-card {
  width: 320px;
  background-color: white;
  padding: 30px;
  border-radius: 10px;
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
</style>
