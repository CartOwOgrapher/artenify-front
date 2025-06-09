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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import api from '@/axios.js'

const allProjects = ref([])
const displayedProjects = ref([])
const selectedProject = ref(null)

const likeCount = ref(0)
const userLiked = ref(false)

// Получаем количество лайков для одного поста
async function fetchLikeCount(postId) {
  try {
    const res = await api.get('likes/count', {
      params: { model: 'post', id: postId }
    })
    return res.data.count ?? 0
  } catch (e) {
    console.error(`Ошибка при получении лайков поста ${postId}`, e)
    return 0
  }
}

// Загружаем все проекты и добавляем поле likeCount
async function fetchProjects() {
  try {
    const res = await api.get('posts', { params: { page: 1 } })
    const projects = res.data.data || []

    // Получаем лайки для каждого проекта
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const count = await fetchLikeCount(project.id)
        return { ...project, likeCount: count }
      })
    )

    allProjects.value = enrichedProjects
    displayedProjects.value = shuffleArray(enrichedProjects).slice(0, 12)
  } catch (e) {
    console.error('Ошибка при загрузке проектов', e)
  }
}

function shuffleArray(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function loadMore() {
  if (!allProjects.value.length) return
  displayedProjects.value.push(...shuffleArray(allProjects.value).slice(0, 6))
}

function handleScroll() {
  const bottom = document.documentElement.scrollHeight - window.innerHeight
  if (window.scrollY >= bottom - 100) loadMore()
}

async function fetchLikes(postId) {
  try {
    const resCount = await api.get('likes/count', {
      params: { model: 'post', id: postId }
    })
    likeCount.value = resCount.data.count ?? 0
  } catch (e) {
    console.error('Ошибка получения количества лайков', e)
    likeCount.value = 0
  }

  try {
    const resUser = await api.get('likes', {
      params: { model: 'post', id: postId }
    })
    const arr = Array.isArray(resUser.data.like) ? resUser.data.like : []
    userLiked.value = arr.some(item => item.likeble_id === postId)
  } catch (e) {
    console.error('Ошибка проверки лайка пользователя', e)
    if (e.response?.status === 401) {
      userLiked.value = false
    }
  }
}

async function toggleLike() {
  if (!selectedProject.value) return
  const postId = selectedProject.value.id

  try {
    if (userLiked.value) {
      await api.delete('likes/delete', {
        params: { model: 'post', id: postId }
      })
    } else {
      await api.post('likes/create', {
        likeble_type: 'post',
        likeble_id: postId
      })
    }
    await fetchLikes(postId)
  } catch (e) {
    console.error('Ошибка toggleLike', e)
  }
}

watch(selectedProject, project => {
  if (project) fetchLikes(project.id)
  else {
    likeCount.value = 0
    userLiked.value = false
  }
})

function openModal(project) {
  selectedProject.value = project
}

function closeModal() {
  selectedProject.value = null
}

onMounted(() => {
  fetchProjects()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
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
</style>
