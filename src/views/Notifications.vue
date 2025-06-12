<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import api from '@/axios.js'

const store = useStore()
const notifications = ref([])
const isLoading = ref(true)
const error = ref(null)

// Загрузка уведомлений
const fetchNotifications = async () => {
  try {
    isLoading.value = true
    const response = await api.get('/notifications')
    notifications.value = response.data
  } catch (err) {
    error.value = 'Ошибка загрузки уведомлений'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Пометить все как прочитанные
const markAllAsRead = async () => {
  try {
    await api.post('/notifications/mark-as-read')
    notifications.value = notifications.value.map(n => ({
      ...n,
      read_at: n.read_at || new Date().toISOString()
    }))
  } catch (err) {
    console.error('Ошибка при пометке как прочитано', err)
  }
}

// Форматирование даты
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('ru-RU', options)
}

onMounted(async () => {
  await fetchNotifications()
  await markAllAsRead()
})

onMounted(() => {
  const bg = document.getElementById('background-effect')
  if (!bg) return

  window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    bg.style.setProperty('--mouse-x', x)
    bg.style.setProperty('--mouse-y', y)
  })
})



</script>

<template>
  <div class="background-effect" id="background-effect">
    <div class="notifications-page">
      <div class="container">
      <div class="header-section">
        <h1>Уведомления</h1>
        <button 
          v-if="notifications.length > 0"
          @click="markAllAsRead"
          class="mark-read-btn"
        >
          Пометить все как прочитанные
        </button>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="loader"></div>
        <p>Загрузка уведомлений...</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="fetchNotifications" class="retry-btn">Повторить попытку</button>
      </div>

      <div v-else-if="notifications.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#630D46" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <h2>Уведомлений пока нет</h2>
        <p>Здесь будут появляться важные обновления и события</p>
      </div>

      <div v-else class="notifications-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read_at }"
        >
          <div class="content">
            <p class="message">{{ notification.data.message }}</p>
            <div class="meta">
              <span class="date">{{ formatDate(notification.created_at) }}</span>
              <span v-if="!notification.read_at" class="unread-badge">Новое</span>
            </div>
          </div>
          <div class="notification-type">
            <svg v-if="notification.data.type === 'new_post'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff69b4">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-page {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  min-width: 100vw;
  padding: 40px 20px;
}

.container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  padding: 30px;
  max-width: 700px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.background-effect {
  --mouse-x: 0.5;
  --mouse-y: 0.5;

  position: fixed;
  inset: 0;
  z-index: 0;

  background: #fdf5f9 url('https://www.transparenttextures.com/patterns/graphy.png') repeat;
  background-size: auto;

  /* наложенный динамический градиент */
}

.background-effect::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at calc(var(--mouse-x) * 100%) calc(var(--mouse-y) * 100%),
    rgba(255, 255, 255, 0.5),
    rgba(255, 255, 255, 0) 40%
  );
  transition: background 0.1s ease;
  z-index: 0;
}


.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
}

h1 {
  color: #630D46;
  font-size: 28px;
  margin: 0;
}

.mark-read-btn {
  background: #ff69b4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.mark-read-btn:hover {
  background: #e55a9e;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff69b4;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.retry-btn {
  margin-top: 15px;
  background: #ff69b4;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #630D46;
}

.empty-state svg {
  margin-bottom: 20px;
}

.empty-state h2 {
  margin: 0 0 10px;
}

.empty-state p {
  color: #888;
  margin: 0;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #eee;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #fdf5f9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.notification-item.unread {
  background: #fff9fc;
  border-left: 3px solid #ff69b4;
}

.avatar-container {
  margin-right: 15px;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.content {
  flex: 1;
}

.message {
  margin: 0 0 8px;
  color: #333;
  font-size: 15px;
  line-height: 1.4;
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date {
  color: #888;
  font-size: 13px;
}

.unread-badge {
  background: #ff69b4;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.notification-type {
  display: flex;
  align-items: center;
  padding-left: 15px;
}
</style>