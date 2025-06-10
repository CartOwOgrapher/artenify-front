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

        <!-- Лайки в левом нижнем углу -->
        <div class="card-like-block">
          Лайки: {{ project.likeCount || 0 }}
        </div>
      </div>
    </div>

    <!-- Модальное окно -->
    <div v-if="selectedProject" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- Кнопка избранного слева -->
        <div class="favorite-block">
          <button class="favorite-btn" @click="toggleFavorite">
            <span v-if="userFavorited">⭐</span>
            <span v-else>☆</span>
          </button>
        </div>

        <img
          v-if="selectedProject.images?.length"
          :src="`${api.defaults.imageURL}/${selectedProject.images[0].path}`"
          :alt="selectedProject.title"
          class="modal-img"
        />
        <h2 class="modal-title">{{ selectedProject.title }}</h2>
        <p class="modal-description">
          {{ selectedProject.description || 'Нет описания' }}
        </p>

        <!-- Блок лайков -->
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


<script setup>
import { defineProps, ref, watch } from 'vue'
import api from '@/axios.js'

// Получаем список проектов и событие открытия модалки от родителя
const props = defineProps({
  displayedProjects: { type: Array, default: () => [] }
})

const selectedProject = ref(null)
const likeCount = ref(0)
const userLiked = ref(false)
const userFavorited = ref(false)

async function fetchFavoriteStatus(postId) {
  try {
    const res = await api.get('favorites/status', {
      params: {
        model: 'post',
        id:    postId
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    userFavorited.value = res.data.favorited;
  } catch (e) {
    userFavorited.value = false;
    console.error('Ошибка при получении избранного', e?.response?.data || e);
  }
}




async function toggleFavorite() {
  if (!selectedProject.value) return
  const postId = selectedProject.value.id
  const token  = localStorage.getItem('access_token')

  try {
    if (userFavorited.value) {
      // Удаляем из избранного через query params
      await api.delete('favorites/delete', {
        headers: {
          'Content-Type':  'application/json',
          'Accept':        'application/json',
          'Authorization': `Bearer ${token}`
        },
        params: {
          model: 'post',
          id:    postId
        }
      })
    } else {
      // Создаём через body
      await api.post('favorites/create',
        { favoriteble_type: 'post', favoriteble_id: postId },
        {
          headers: {
            'Content-Type':  'application/json',
            'Accept':        'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )
    }

    // Обновляем статус
    await fetchFavoriteStatus(postId)

  } catch (e) {
    console.error('Ошибка toggleFavorite', e?.response?.data || e)
  }
}




// Утилита для получения количества лайков
async function fetchLikeCount(postId) {
  try {
    const res = await api.get('likes/count', { params: { model: 'post', id: postId } })
    return res.data.count ?? 0
  } catch {
    return 0
  }
}

// Загрузка лайков при смене selectedProject
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
    // Обновляем локальный likeCount в props не нужно, родитель может перезагрузить
  } catch (e) {
    console.error('Ошибка toggleLike', e)
  }
}

// Открытие/закрытие модалки
function openModal(project) {
  selectedProject.value = project
  fetchLikes(project.id)
  fetchFavoriteStatus(project.id)
}

function closeModal() {
  selectedProject.value = null
}

// Слушаем закрытие модалки, сбрасываем состояние
watch(selectedProject, p => { if (!p) { likeCount.value = 0; userLiked.value = false }} )
</script>


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

</style>
