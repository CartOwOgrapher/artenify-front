<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import flowerImg from '@/assets/flower.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1'

const projects = ref([])
const loading = ref(false)
const error = ref(null)
const activeTab = ref('Проекты')
const bannerImage = ref(null)
const isDragOver = ref(false)

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
const currentUserId = currentUser?.id

const fileInput = ref(null)

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get(`${API_BASE_URL}/posts`, {
      params: { page: 1 },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })

    const allPosts = response.data.data || []
    const userPosts = allPosts.filter(post => post.user_id === currentUserId)
    projects.value = userPosts.length ? userPosts : allPosts

  } finally {
    loading.value = false
  }
})

function changeTab(tabName) {
  activeTab.value = tabName
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleBannerUpload(event) {
  const file = event.target.files[0]
  if (file) {
    bannerImage.value = URL.createObjectURL(file)
    // Здесь можно сделать POST-запрос для загрузки на сервер
  }
}

function onDragOver() {
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(event) {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    bannerImage.value = URL.createObjectURL(file)
    // Здесь можно сделать POST-запрос для загрузки на сервер
  }
}
</script>

<template>
  <div class="profile-container">
    <!-- Баннер с кликом и Drag & Drop -->
    <div
      class="profile-banner"
      :class="{ 'drag-over': isDragOver }"
      :style="{ backgroundImage: bannerImage ? 'url(' + bannerImage + ')' : '' }"
      @click="triggerFileInput"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <div class="banner-placeholder" v-if="!bannerImage">
        <span>Добавить изображение баннера</span>
        <small>Оптимальные размеры 3200 x 410px</small>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleBannerUpload"
        class="banner-upload"
      />
    </div>

    <!-- Инфо пользователя -->
    <div class="profile-header">
      <img class="avatar" :src="flowerImg" alt="Avatar" />
      <div class="info">
        <h2>{{ currentUser.name || 'Пользователь' }}</h2>
        <p>Подписки: <b>228</b> | Подписчики: <b>1337</b></p>
        <div class="buttons">
          <button class="edit">✏️ Редактировать профиль</button>
          <button class="setup">⚙️ Настроить профиль <span class="tag">artenify+</span></button>
        </div>
        <p class="reg-date">Дата регистрации: 15 апреля 2022 г.</p>
      </div>
    </div>

    <!-- Вкладки -->
    <nav class="profile-tabs">
      <span
        v-for="tab in ['Проекты', 'Избранное', 'Понравившееся', 'Продвижение+', 'Статистика', 'Черновики']"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="changeTab(tab)"
      >
        {{ tab }}
      </span>
    </nav>

    <!-- Контент вкладок -->
    <div v-if="activeTab === 'Проекты'" class="projects">
      <h3>Проекты</h3>
      <div class="project-grid">
        <div
          v-for="project in projects"
          :key="project.id"
          class="project-card"
        >
          <img
            v-if="project.images && project.images.length"
            :src="project.images[0].url"
            :alt="project.title"
          />
          <div class="project-title">{{ project.title }}</div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'Избранное'" class="projects">
      <h3>Избранное</h3>
      <div class="tab-content">
        Пока нет избранного
      </div>
    </div>

    <div v-if="activeTab === 'Понравившееся'" class="projects">
      <h3>Понравившееся</h3>
      <div class="tab-content">
        Пока нет лайков
      </div>
    </div>

    <div v-if="activeTab === 'Продвижение+'" class="projects">
      <h3>Продвижение+</h3>
      <div class="tab-content">
        Продвижение в разработке
      </div>
    </div>

    <div v-if="activeTab === 'Статистика'" class="projects">
      <h3>Статистика</h3>
      <div class="tab-content">
        Статистика по проектам будет здесь
      </div>
    </div>

    <div v-if="activeTab === 'Черновики'" class="projects">
      <h3>Черновики</h3>
      <div class="tab-content">
        Черновиков пока нет
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  font-family: sans-serif;
  color: #333;
}

.profile-banner {
  background: linear-gradient(#3a3a3a, #222);
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 0 5vw;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s;
}

.profile-banner.drag-over {
  background-color: rgba(255 255 255 / 0.1);
  border: 2px dashed #a32aa1;
}

.banner-placeholder span {
  font-size: 18px;
  font-weight: 600;
}

.banner-placeholder small {
  display: block;
  font-size: 12px;
  margin-top: 4px;
}

.banner-upload {
  display: none; /* Скрываем кнопку выбора файла */
}

.profile-header {
  display: flex;
  padding: 1rem 5vw;
  align-items: flex-start;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1.5rem;
}

.info h2 {
  font-size: 24px;
  margin: 0;
}

.buttons {
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
}

.edit, .setup {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.edit {
  background: #f4b5dd;
  color: #111;
}

.setup {
  background: #3a0f3f;
  color: white;
}

.setup .tag {
  background: #ce3ad8;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  margin-left: 5px;
}

.profile-tabs {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 5vw;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.profile-tabs span {
  cursor: pointer;
  color: #555;
  white-space: nowrap;
}

.profile-tabs .active {
  color: #a32aa1;
  font-weight: bold;
}

.projects {
  padding: 0 5vw 2rem;
}

.project-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.project-card {
  width: 250px;
  height: 250px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

.project-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-title {
  position: absolute;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 100%;
  padding: 8px;
  font-weight: bold;
  text-align: center;
}
</style>
