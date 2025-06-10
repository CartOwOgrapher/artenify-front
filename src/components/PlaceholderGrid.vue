<template>
  <div class="grid-wrapper">
    <div class="grid-container">
      <div
        v-for="(project, index) in displayedProjects"
        :key="project.id + '-' + index"
        class="placeholder"
      >
        <img
          v-if="project.images && project.images.length"
          :src="`${api.defaults.imageURL}/${project.images[0].path}`" 
          :alt="project.title"
          class="placeholder-img"
        />
        <div v-else class="placeholder-img">Нет изображения</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/axios.js'


const allProjects = ref([])         // Все проекты, полученные с сервера
const displayedProjects = ref([])   // Проекты для показа в гриде

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
const currentUserId = currentUser?.id

// Функция для случайной перестановки массива (Fisher-Yates shuffle)
function shuffleArray(array) {
  const arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Добавляет очередную порцию проектов в displayedProjects
function loadMore() {
  if (allProjects.value.length === 0) return

  // Возьмём 6 случайных элементов из allProjects (с перемешиванием)
  const shuffled = shuffleArray(allProjects.value)

  // Добавляем их в конец displayedProjects
  displayedProjects.value.push(...shuffled.slice(0, 6))
}

async function fetchProjects() {
  try {
    const response = await api.get('/posts', {
      params: { page: 1 },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    const posts = response.data.data || []
    // Фильтруем по user_id, если есть
    const userPosts = posts.filter(p => p.user_id === currentUserId)
    allProjects.value = userPosts.length ? userPosts : posts

    // Инициализируем первые 12 элементов в displayedProjects
    displayedProjects.value = shuffleArray(allProjects.value).slice(0, 12)
  } catch (e) {
    console.error('Ошибка при загрузке проектов', e)
  }
}

function handleScroll() {
  const bottomOffset = document.documentElement.scrollHeight - window.innerHeight
  if (window.scrollY >= bottomOffset - 100) {
    loadMore()
  }
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
  width: 100vw;
  background: white;
  z-index: 12;
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
  width: 350px;
  height: 300px;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  overflow: hidden;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
