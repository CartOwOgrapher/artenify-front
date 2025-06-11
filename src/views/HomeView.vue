<template>
  <main>
    <!-- Фоновые картинки -->
    <img class="bg-left" src="@/assets/L_background.png" alt="Left Background" />
    <img class="bg-right" src="@/assets/R_background.png" alt="Right Background" />

    <div>
      <SearchPanel
        :available-tags="availableTags"
        @filter-changed="onFilterChanged"
        @image-search="onImageSearch"
      />

      <PlaceholderGrid
        :displayedProjects="projects"
        :loading="isLoading"
      />

      <!-- Логотип -->
      <div class="logo-container">
        <img src="@/assets/top_art_logo.png" alt="Top Art Logo" class="top-logo" />
      </div>

      <!-- Плейсхолдеры -->
      <div class="placeholders-wrapper">
        <div class="placeholder placeholder-1">
          <img src="@/assets/2.png" alt="Placeholder 1" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-2">
          <img src="@/assets/1.png" alt="Placeholder 2" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-3">
          <img src="@/assets/p_test.png" alt="Placeholder 3" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-4">
          <img src="@/assets/p_test.png" alt="Placeholder 4" class="placeholder-img" />
        </div>
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="isLoading" class="loading-indicator">
        Загрузка проектов...
      </div>

      <!-- Сообщение об отсутствии результатов -->
      <div v-if="!isLoading && projects.length === 0" class="no-results">
        <p>Проекты не найдены</p>
        <p>Попробуйте изменить критерии поиска или фильтры</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import SearchPanel from '@/components/SearchPanel.vue'
import PlaceholderGrid from '@/components/PlaceholderGrid.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1'

const projects      = ref([])
const isLoading     = ref(false)
const availableTags = ref([])

// загружаем теги из API
onMounted(async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/tags`)
    availableTags.value = res.data || []
  } catch (e) {
    console.error('Ошибка загрузки тегов:', e)
  }
})

// текущие фильтры
const filters = ref({
  search: '',
  sort: 'recommended',
  tags: []
})

async function loadProjects(page = 1) {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const params = {
      page,
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.sort !== 'recommended' && { sort: filters.value.sort }),
      ...(filters.value.tags.length && { tags: filters.value.tags.join(',') })
    }
    const { data } = await axios.get(`${API_BASE_URL}/posts`, { params })
    projects.value = page === 1
      ? data.data || []
      : [...projects.value, ...(data.data || [])]
  } catch (e) {
    console.error('Ошибка загрузки проектов:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadProjects())

function onFilterChanged({ search, sort, tags }) {
  filters.value.search = search ?? ''
  filters.value.sort   = sort   ?? 'recommended'
  filters.value.tags   = tags   ?? []
  loadProjects(1)
}

function onImageSearch() {
  console.log('Image search triggered')
}
</script>

<style scoped>
/* Фоновые картинки */
.bg-left,
.bg-right {
  position: absolute;
  top: 0;
  max-height: 100vh;
  width: auto;
  z-index: 10;
}
.bg-left { left: 0; }
.bg-right { right: 0; }

/* Логотип */
.logo-container {
  position: absolute;
  top: 105px;
  left: calc(250px + (100vw - 1120px)/2);
  transform: translateX(-50%);
  z-index: 9;
  width: 170px;
}

/* Плейсхолдеры */
.placeholders-wrapper {
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
  width: 1200px;
  z-index: 9;
}
.placeholder {
  position: absolute;
  width: 454px;
  height: 378px;
  background: url("@/assets/top_tab.png") no-repeat center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}
.placeholder-1 { left: 0; top: 0; }
.placeholder-2 { left: 438px; top: 95px; }
.placeholder-3 { left: 178px; top: 445px; }
.placeholder-4 { left: 558px; top: 517px; }

/* Загрузка */
.loading-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #ff69b4;
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  z-index: 1000;
}

/* Нет результатов */
.no-results {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
}
.no-results p { margin: 8px 0; }
</style>
