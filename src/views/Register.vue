<template>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="username">User name:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirm Password:</label>
        <input type="password" id="confirm-password" v-model="confirmPassword" required />
      </div>
      <button type="submit">Register</button>
    </form>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
      };
    },
    methods: {
      register() {
        // Логика регистрации
        if (this.password !== this.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
        console.log('Register:', this.email, this.username, this.password);
      },
    },
  };
  </script>
  
  <style scoped>
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    margin-bottom: 5px;
    color: black;
  }
  input[type="email"],
  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #b8b7b7;
    border-radius: 4px;
  }
  button {
    width: 100%;
    padding: 10px;
    background-color: black;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: black;
  }
  </style>