<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref(null)

const login = async () => {
  error.value = null

  try {
    const response = await store.dispatch('login', {
      email: email.value,
      password: password.value
    })

    if (response.status == 200) {
      const redirectPath = store.getters.redirect || '/'
      await router.push(redirectPath)
    }
    else {
      error.value = response.statusText
    }

  } catch (err) {
    error.value =
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Вход не выполнен. Проверьте данные.'
    console.error(err)
  }
}
</script>

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

<style scoped>
/* Стили остаются теми же */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
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

.auth-card {
  width: 100%;
  max-width: 400px;
  min-width: 300px;
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin: auto;
}

.auth-card:hover {
  transform: translateY(-5px);
}

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

.error-message {
  color: #e74c3c;
  font-size: 14px;
  margin: 15px 0;
  text-align: center;
  padding: 10px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }

  .auth-card h2 {
    font-size: 24px;
  }
}
</style>