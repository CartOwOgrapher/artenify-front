<template>
    <div class="register-container">
      <div class="register-form">
        <h2>Welcome!</h2>
        <h3>Sign up to Artenify</h3>
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
        <p><h4>Already have an Account? <a href="/login">Login</a></h4></p>
      </div>
      <div class="register-image">
        <img src="@/assets/flower.png" alt="Register Image" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      };
    },
    methods: {
      register() {
        // Здесь будет логика отправки данных на сервер
        console.log('Register:', this.email, this.username, this.password, this.confirmPassword);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Стили для страницы регистрации */
  .register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #181818;
}

.register-form {
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

h3 {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: black;
}

h4 {
    color: black;
}

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

a {
  text-decoration: none;
  color: rgb(255, 152, 171);;
}

.register-image {
  position: absolute;
  bottom: 0; 
  right: 0;
}
  </style>