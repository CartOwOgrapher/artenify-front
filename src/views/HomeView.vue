<template>
  <main>
    <!-- Фоновые картинки -->
    <img class="bg-left" src="@/assets/L_background.png" alt="Left Background" />
    <img class="bg-right" src="@/assets/R_background.png" alt="Right Background" />

    <header>
      <!-- Здесь ваш хедер: навигация, логотип в шапке и т.д. -->
    </header>

    <div>
      <!-- Логотип -->
      <div class="logo-container">
        <img src="@/assets/top_art_logo.png" alt="Top Art Logo" class="top-logo" />
      </div>

      <!-- Кнопка “Leaders” (только для мобильной версии) -->
      <router-link to="/leaders" class="leaders-button">
        Перейти к лидерам
      </router-link>

      <!-- SearchPanel с классом для мобильного порядка -->
      <SearchPanel
        class="search-panel-wrapper"
        :available-tags="availableTags"
        :availableCategories="availableCategories"
        @filter-changed="onFilterChanged"
        @image-search="onImageSearch"
      />

      <!-- PlaceholderGrid с классом для мобильного порядка -->
      <PlaceholderGrid
        class="placeholder-grid-wrapper"
        :displayedProjects="projects"
        :loading="isLoading"
      />

      <!-- Плейсхолдеры (скрыты на мобильной) -->
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
import { useRouter } from 'vue-router'
import SearchPanel from '@/components/SearchPanel.vue'
import PlaceholderGrid from '@/components/PlaceholderGrid.vue'

const router = useRouter()
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1'

const projects      = ref([])
const isLoading     = ref(false)
const availableTags = ref([])
const availableCategories = ref([])

onMounted(async () => {
  try {
    const res  = await axios.get(`${API_BASE_URL}/tags`)
    availableTags.value = res.data || []
    const res2 = await axios.get(`${API_BASE_URL}/categories`)
    availableCategories.value = res2.data || []
  } catch (e) {
    console.error('Ошибка загрузки тегов:', e)
  }
})

const filters = ref({
  search: '',
  sort: 'recommended',
  tags: [],
  category: ''
})

async function loadProjects(page = 1) {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const params = {
      page,
      ...(filters.value.search    && { search: filters.value.search }),
      ...(filters.value.sort !== 'recommended' && { sort: filters.value.sort }),
      ...(filters.value.tags.length && { tags: filters.value.tags.join(',') }),
      ...(filters.value.category     && { category: filters.value.category })
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

function onFilterChanged({ search, sort, tags, category }) {
  filters.value.search   = search   ?? ''
  filters.value.sort     = sort     ?? 'recommended'
  filters.value.tags     = tags     ?? []
  filters.value.category = category ?? ''
  loadProjects(1)
}

function onImageSearch() {
  console.log('Image search triggered')
}
</script>

<style>
/* Глобальные переменные и хедер */
:root {
  --header-offset: 60px;
}

header {
  position: relative;
  z-index: 20;
}

/* Фоновые картинки */
.bg-left,
.bg-right {
  position: absolute;
  top: 0;
  height: 100vh;
  width: 40vw;
  z-index: 10;
}
.bg-left { left: 0; }
.bg-right { right: 0; }

@media (max-width: 1200px) {
  .bg-left,
  .bg-right {
    display: none;
  }
}
@media (max-width: 1200px) and (min-width: 901px) {
  .bg-left,
  .bg-right {
    width: 15vw;
  }
}

/* Логотип */
.logo-container {
  position: absolute;
  top: var(--header-offset);
  left: 37.666vw;
  transform: translateX(-90%);
  width: max-content;
  height: max-content;
  z-index: 9;
  cursor: pointer;
  transition: transform .2s;
}
.logo-container:hover {
  transform: translateX(-90%) scale(1.03);
}
.logo-container .top-logo {
  display: block;
  width: 170px;
  height: auto;
}

/* Кнопка “Leaders” */
.leaders-button {
  display: none;
}

/* Плейсхолдеры (десктоп) */
.placeholders-wrapper {
  position: absolute;
  top: calc(var(--header-offset) + 100px);
  left: 11.666vw;
  transform: translateX(-90%);
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
  cursor: pointer;
  transition: transform .2s;
}
.placeholder:hover {
  transform: scale(1.03);
}
.placeholder-img {
  width: 77%;
  height: 77%;
  object-fit: cover;
}
.placeholder-1 { left: 0;   top: 0; }
.placeholder-2 { left: 438px; top: 95px; }
.placeholder-3 { left: 174px; top: 445px; }
.placeholder-4 { left: 614px; top: 522px; }

/* === MOBILE ONLY: ПЕРЕСТАВКА ПОРЯДКА И СКРЫТИЕ ПЛЕЙСХОЛДЕРОВ === */
@media (max-width: 1200px) {
  main > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
    margin-top: var(--header-offset);
  }

  /* Логотип первым */
  .logo-container {
    order: -3;
    position: relative !important;
    top: 0; left: 0; transform: none !important;
    margin: 0 auto;
  }

  /* Кнопка сразу после логотипа */
  .leaders-button {
    display: inline-flex;
    order: -2;
    align-items: center;
    justify-content: center;
    width: auto;               /* не растягиваем на всю ширину */
    padding: 10px 20px;        /* чуть меньше */
    font-size: 14px;           /* уменьшенный шрифт */
    font-weight: 500;
    color: #500;               /* белый текст для контраста */
    background-color: #ffc55; /* пастельно-розовый фон */
    /* легкая текстура с розовыми полосками */
    background-image: 
      url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6 L6 0 M-1 1 L1 -1 M5 7 L7 5' stroke='%23f8c0d0' stroke-width='1'/%3E%3C/svg%3E");
    background-repeat: repeat;
    border: none;
    border-radius: 10px;
    box-shadow: 
      inset 0 0 0 1px rgba(255,204,213,0.6),
      0 3px 6px rgba(0, 0, 0, 0.03);
    text-decoration: none;
    transition: transform .2s, box-shadow .2s;
  }
  .leaders-button:hover {
    transform: translateY(-1px);
    box-shadow: 
      inset 0 0 0 1px rgba(255,204,213,0.8),
      0 4px 8px rgba(0, 0, 0, 0.05);
  }
  .leaders-button svg {
    margin-left: 6px;
    width: 18px;
    height: 18px;
    fill: none;
    stroke: #fff;              /* белая стрелка */
    stroke-width: 2;
    transition: transform .2s;
  }
  .leaders-button:hover svg {
    transform: translateX(3px);
  }

  /* SearchPanel третьим */
  .search-panel-wrapper {
    order: 0;
    width: 100%;
  }

  /* PlaceholderGrid последним */
  .placeholder-grid-wrapper {
    order: 1;
    width: 100%;
  }

  /* Скрываем картинки-плейсхолдеры */
  .placeholders-wrapper {
    display: none !important;
  }
}

/* Предотвращаем горизонтальную прокрутку */
main {
  overflow-x: hidden;
}
</style>
