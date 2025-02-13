<!-- Auth.vue -->
<template>
    <div class="auth-container">
      <div class="auth-form">
        <h2>{{ currentTab === 'login' ? 'Sign In' : 'Sign Up' }}</h2>
        <component :is="currentComponent" @switch-tab="switchTab" />
        <p>
          <h4 v-if="currentTab === 'login'">
            Don't have an Account? 
            <a href="#" @click.prevent="switchTab('register')">Register</a>
          </h4>
          <h4 v-else>
            Already have an Account? 
            <a href="#" @click.prevent="switchTab('login')">Login</a>
          </h4>
        </p>
      </div>
      <div class="auth-image">
        <img src="@/assets/flower.png" alt="Auth Image" />
      </div>
    </div>
  </template>
  
  <script>
  import Login from './Login.vue';
  import Register from './Register.vue';
  
  export default {
    components: {
      Login,
      Register,
    },
    data() {
      return {
        currentTab: 'login', // Начальный таб — login
      };
    },
    computed: {
      currentComponent() {
        return this.currentTab === 'login' ? 'Login' : 'Register';
      },
    },
    methods: {
      switchTab(tab) {
        this.currentTab = tab;
      },
    },
  };
  </script>
  
  <style scoped>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #181818;
  }
  .auth-form {
    width: 300px;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background-color: white;
  }
  h2 {
    margin-bottom: 10px;
    color: black;
  }
  h4 {
    color: black;
  }
  a {
    text-decoration: none;
    color: rgb(255, 152, 171);
  }
  .auth-image {
    position: absolute;
    bottom: 0;
    right: 0;
  }
  </style>