<script setup>
import flowerImg from '@/assets/flower.png'
import img1 from '@/assets/1.png'
import img2 from '@/assets/2.png'
import pTest from '@/assets/p_test.png'
import conveyor from '@/assets/p_test.png'

const projects = [
  { title: 'V Clock', image: img1 },
  { title: 'Flowers', image: img2 },
  { title: 'BDSR LITE | Course | Sept 2023', image: pTest, likes: 92, views: 594 },
  { title: 'Gold Conveyor', image: conveyor },
]
</script>

<template>
  <div class="profile-container">
    <!-- Banner -->
    <div class="profile-banner">
      <div class="banner-placeholder">
        <span>Добавить изображение баннера</span>
        <small>Оптимальные размеры 3200 x 410px</small>
      </div>
    </div>

    <!-- User Info -->
    <div class="profile-header">
      <img class="avatar" :src="flowerImg" alt="Avatar" />
      <div class="info">
        <h2>Artur Ploskov</h2>
        <p>Подписки: <b>228</b> | Подписчики: <b>1337</b></p>
        <div class="buttons">
          <button class="edit">✏️ Редактировать профиль</button>
          <button class="setup">⚙️ Настроить профиль <span class="tag">artenify+</span></button>
        </div>
        <p class="reg-date">Дата регистрации: 15 апреля 2022 г.</p>
      </div>
    </div>

    <!-- Tabs -->
    <nav class="profile-tabs">
      <span class="active">Проекты</span>
      <span>Избранное</span>
      <span>Понравившееся</span>
      <span>Сообщения</span>
      <span>Продвижение+</span>
      <span>Статистика</span>
      <span>Черновики</span>
    </nav>

    <!-- Projects -->
    <div class="projects">
      <h3>Проекты</h3>
      <div class="project-grid">
        <div v-for="(project, index) in projects" :key="index" class="project-card">
          <img :src="project.image" :alt="project.title" />
          <div class="project-meta" v-if="project.likes">
            ❤️ {{ project.likes }} 👁 {{ project.views }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  position: absolute;
  top: 60px; /* сдвигаем весь контейнер вниз */
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
  width: 100%;
  padding-left: 5vw;
  padding-right: 5vw;
  box-sizing: border-box;
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

.profile-header {
  display: flex;
  padding: 1rem 5vw;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
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
  flex-wrap: wrap;
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
  width: 100%;
  box-sizing: border-box;
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
  box-sizing: border-box;
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

.project-meta {
  position: absolute;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  color: white;
  width: 100%;
  padding: 4px 8px;
  font-size: 14px;
}
</style>
