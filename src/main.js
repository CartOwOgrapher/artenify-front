// src/main.js
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'

const app = createApp(App)

app.use(store)
app.use(router)

if (store.getters.isAuthenticated) {
    store.dispatch('getUser')
}

app.mount('#app')
