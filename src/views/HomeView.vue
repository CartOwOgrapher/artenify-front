<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import SearchPanel from '@/components/SearchPanel.vue'
import PlaceholderGrid from '@/components/PlaceholderGrid.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1'

// Полный список проектов
const projects = ref([])

// Фильтры
const filters = ref({
  search: '',
  sort: ''
})

// Отфильтрованный список
const filtered = computed(() => {
  let list = projects.value

  // Поиск по заголовку
  if (filters.value.search) {
    const term = filters.value.search.toLowerCase()
    list = list.filter(p => p.title.toLowerCase().includes(term))
  }

  // Сортировка (если понадобится)
  if (filters.value.sort === 'date') {
    list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  // доп. ветки sort...

  return list
})

// Fetch проектов при старте
onMounted(async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/posts`, {
      params: { page: 1 }
    })
    projects.value = data.data || []
  } catch (e) {
    console.error('Ошибка загрузки проектов:', e)
  }
})

// Хендлер из SearchPanel
function onFilterChanged({ search, sort }) {
  filters.value.search = search
  filters.value.sort = sort
}

// Поиск по картинке (пример)
function onImageSearch() {
  console.log('Image search triggered')
}
</script>

<template>
  <main>
    <!-- Фоновые картинки -->
    <img class="bg-left" src="@/assets/L_background.png" alt="Left Background" />
    <img class="bg-right" src="@/assets/R_background.png" alt="Right Background" />

    <!-- Основной контент -->
    <div>
          <SearchPanel
      @filter-changed="onFilterChanged"
      @image-search="onImageSearch"
    />

    <PlaceholderGrid
      :displayedProjects="filtered"
    />

      <!-- Логотип -->
      <div class="logo-container">
        <img src="@/assets/top_art_logo.png" alt="Top Art Logo" class="top-logo" />
      </div>

      <!-- Контейнер с плейсхолдерами -->
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
    </div>
  </main>
</template>

<style scoped>
/* Фоновые картинки */
.bg-left,
.bg-right {
  position: absolute;
  top: 0;
  height: auto;
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
  left: calc(250px + (100vw - 1120px) / 2);
  transform: translateX(-50%);
  z-index: 9;
  width: 170px;
  height: auto;
}

/* Контейнер плейсхолдеров */
.placeholders-wrapper {
  position: absolute;
  top: 200px;
  left: 45%;
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
  z-index: 9;
}

.placeholder:hover .placeholder-img {
  filter: brightness(0.7);
  z-index: 9;
}

.placeholder-img {
  width: 77%;
  height: 77%;
  object-fit: cover;
}

/* Позиции конкретных плейсхолдеров */
.placeholder-1 {
  left: 0;
  top: 0;
  z-index: 11;
}
.placeholder-2 {
  left: calc(0px + 418px + 20px);
  top: 95px;
  z-index: 11;
}
.placeholder-3 {
  left: calc(0px + 454px + 40px - 320px);
  top: calc(95px + 350px);
  z-index: 11;
}
.placeholder-4 {
  left: calc(0px + 454px + 40px - 260px + 380px);
  top: calc(95px + 27px + 400px);
  z-index: 11;
}
</style>
