<script setup>
import { defineProps, ref, watch } from 'vue'
import api from '@/axios.js'
import { useRouter } from 'vue-router'

const router = useRouter()

// Получаем список проектов
const props = defineProps({
  displayedProjects: { type: Array, default: () => [] }
})

// Состояния
const ownerPost = ref(null)
const selectedProject = ref(null)
const likeCount = ref(0)
const userLiked = ref(false)
const userFavorited = ref(false)

// Утилита для получения количества лайков
async function fetchLikeCount(postId) {
  try {
    const res = await api.get('likes/count', { params: { model: 'post', id: postId } })
    return res.data.count ?? 0
  } catch {
    return 0
  }
}

// Получаем лайки и статус лайка
async function fetchLikes(postId) {
  likeCount.value = await fetchLikeCount(postId)
  try {
    const resUser = await api.get('likes', { params: { model: 'post', id: postId } })
    const arr = Array.isArray(resUser.data.like) ? resUser.data.like : []
    userLiked.value = arr.some(item => item.likeble_id === postId)
  } catch {
    userLiked.value = false
  }
}

// Переключение лайка
async function toggleLike() {
  if (!selectedProject.value) return
  const postId = selectedProject.value.id
  try {
    if (userLiked.value) {
      await api.delete('likes/delete', { params: { model: 'post', id: postId } })
    } else {
      await api.post('likes/create', { likeble_type: 'post', likeble_id: postId })
    }
    await fetchLikes(postId)
  } catch (e) {
    console.error('Ошибка toggleLike', e)
  }
}

// Получаем данные владельца
async function getOwnerPost(userId) {
  try {
    const owner = await api.get(`profile/user/${userId}`)
    ownerPost.value = owner.data
  } catch (e) {
    console.error('Ошибка getOwnerPost', e)
  }
}

function goToOwnerProfile(id) {
  router.push(`/profile/${id}`)
}

// Статус избранного
async function fetchFavoriteStatus(postId) {
  try {
    const res = await api.get('favorites/status', {
      params: { model: 'post', id: postId },
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    userFavorited.value = res.data.favorited
  } catch (e) {
    userFavorited.value = false
    console.error('Ошибка fetchFavoriteStatus', e)
  }
}

// Переключение избранного
async function toggleFavorite() {
  if (!selectedProject.value) return
  const postId = selectedProject.value.id
  const token = localStorage.getItem('access_token')

  try {
    if (userFavorited.value) {
      await api.delete('favorites/delete', {
        params: { model: 'post', id: postId },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
    } else {
      await api.post('favorites/create',
        { favoriteble_type: 'post', favoriteble_id: postId },
        { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } }
      )
    }
    await fetchFavoriteStatus(postId)
  } catch (e) {
    console.error('Ошибка toggleFavorite', e)
  }
}

// Открытие/закрытие модалки
function openModal(project) {
  selectedProject.value = project
  getOwnerPost(project.user_id)
  fetchLikes(project.id)
  fetchFavoriteStatus(project.id)
}
function closeModal() {
  selectedProject.value = null
}

// Сброс при закрытии
watch(selectedProject, p => {
  if (!p) {
    likeCount.value = 0
    userLiked.value = false
    userFavorited.value = false
    ownerPost.value = null
  }
})
</script>

<template>
  <div class="grid-wrapper" :style="{ zIndex: selectedProject ? 555 : 12 }">
    <div class="grid-container">
      <div
        v-for="(project, index) in displayedProjects"
        :key="project.id + '-' + index"
        class="placeholder"
        @click="openModal(project)"
      >
        <img
          v-if="project.images?.length"
          :src="`${api.defaults.imageURL}/${project.images[0].path}`"
          :alt="project.title"
          class="placeholder-img"
        />
        <div v-else class="placeholder-img">Нет изображения</div>
        <div class="card-like-block">Лайки: {{ project.likes }}</div>
      </div>
    </div>

    <div v-if="selectedProject" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="favorite-block">
          <button class="favorite-btn" @click="toggleFavorite">
            <span v-if="userFavorited">⭐</span>
            <span v-else>☆</span>
          </button>
        </div>

        <div class="modal-img-wrapper">
          <img
            v-if="selectedProject.images?.length"
            :src="`${api.defaults.imageURL}/${selectedProject.images[0].path}`"
            :alt="selectedProject.title"
            class="modal-img"
          />
          <div class="modal-hover-title">{{ selectedProject.title }}</div>
        </div>

        <h2 class="modal-title">{{ selectedProject.title }}</h2>
        <p class="modal-description">{{ selectedProject.content || 'Нет описания' }}</p>

        <div class="owner-block">
          <img
            v-if="ownerPost?.avatar"
            :src="ownerPost.avatar"
            class="owner-avatar"
            @click="goToOwnerProfile(ownerPost.id)"
          />
          <a v-else @click="goToOwnerProfile(ownerPost.id)">{{ ownerPost?.name }}</a>
        </div>

        <div class="like-block">
          <button class="like-btn" @click="toggleLike">
            <span v-if="userLiked">❤️</span>
            <span v-else>🤍</span>
          </button>
          <span class="like-count">{{ likeCount }}</span>
        </div>

        <button class="modal-close" @click="closeModal">Закрыть</button>
      </div>
    </div>
  </div>
</template>



<style scoped>
.grid-wrapper {
  position: relative;
  width: 100%;
  background: white;
  padding: 20px 0;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 55px 20px;
  max-width: 1920px;
  margin: 0 auto;
}

.placeholder {
  position: relative;
  width: 350px; height: 300px;
  background-color: #ddd;
  display: flex; align-items: center; justify-content: center;
  border-radius: 7px; overflow: hidden; cursor: pointer;
  transition: transform 0.2s ease;
}
.placeholder:hover { transform: scale(1.02) }

.placeholder-img { width: 100%; height: 100%; object-fit: cover; }

.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: #fff; padding: 30px; border-radius: 12px;
  max-width: 600px; width: 90%;
  box-shadow: 0 2px 20px rgba(0,0,0,0.2);
  text-align: center;
}

.modal-img {
  width: 100%; max-height: 300px;
  object-fit: cover; margin-bottom: 20px; border-radius: 8px;
}

.modal-title { font-size: 24px; margin-bottom: 10px; }
.modal-description {
  font-size: 16px; color: #333; white-space: pre-wrap;
}

.like-block {
  position: absolute; bottom: 16px; right: 16px;
  display: flex; align-items: center; gap: 8px;
}

.like-btn {
  background: none; border: none; font-size: 24px;
  cursor: pointer; padding: 0;
}

.like-count { font-size: 16px; color: #333; }

.modal-close {
  margin-top: 40px; padding: 10px 20px;
  background: #333; color: white; border: none;
  border-radius: 8px; cursor: pointer;
}
.favorite-block {
  position: absolute;
  left: 20px;
  top: 20px;
}

.favorite-btn {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}

.card-like-block {
  position: absolute;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
}

.modal-img-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 8px;
}

.modal-hover-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  user-select: none;
  white-space: nowrap;
}

.modal-img-wrapper:hover .modal-hover-title {
  opacity: 1;
  pointer-events: auto;
}

</style>
