<template>
    <div class="login-container">
      <div class="login-form">
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
        <p><h4>Don't have an Account? <a href="/register">Register</a></h4></p>
      </div>
      <div class="login-image">
        <img src="@/assets/flower.png" alt="Login Image" />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
        password: ''
      };
    },
    methods: {
      login() {
        // Здесь будет логика отправки данных на сервер
        console.log('Login:', this.username, this.password);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Стили для страницы входа */
  .login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #181818;
}

.login-form {
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
  color: rgb(255, 152, 171);
}
.login-image {
  position: absolute;
  bottom: 0; 
  right: 0;
}
  </style>