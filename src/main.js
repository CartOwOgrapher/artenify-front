// src/main.js
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import api, { setAxiosRouter, setAxiosStore } from '@/axios'

const app = createApp(App)

setAxiosRouter(router)
setAxiosStore(store)

app.use(store)
app.use(router)

app.mount('#app')
