import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'

const app = createApp(App)

app.use(store)

if (store.getters.isAuthenticated) {
    store.dispatch('getUser')
}

app.use(router)

app.mount('#app')
