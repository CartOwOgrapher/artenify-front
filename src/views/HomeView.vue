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
  height: 100vh;        /* тянем на всю высоту окна */
  width: 40vw;          /* оставляем вашу логику по ширине */
   /* если это img — кадрирует по центру без искажений */
  z-index: 10;
}
.bg-left { left: 0; }
.bg-right { right: 0; }


/* 1) Большие экраны > 1200px — 20vw (дефолт) */
/* 2) Средние экраны 1200px — 901px */
@media (max-width: 1200px) and (min-width: 901px) {
  .bg-left,
  .bg-right {
    width: 15vw;
  }
}
/* 5) Супер-малые экраны < 400px */
@media (max-width: 1200px) {
  .bg-left,
  .bg-right {
    display: none;
  }
}

/* Логотип */
.logo-container {
  position: absolute;
  top: 65px;
  /* центр от 0 до 66.666% ширины окна = 66.666% / 2 = 33.333% */
  left: 33.333vw;
  transform: translateX(-50%);
  z-index: 9;
  width: 170px;
  height: auto;
}

/* ================================================
   Десктопные стили для плейсхолдеров
   ================================================ */
.placeholders-wrapper {
  position: absolute;
  left: calc((50vw * 2 / 3) / 2);
  box-sizing: border-box;
  z-index: 9;
}

/* Общие стили для каждого плейсхолдера */
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

/* Позиции конкретных плейсхолдеров (десктоп) */
.placeholder-1 {
  left: 0;
  top: -1045px;
  z-index: 11;
}
.placeholder-2 {
  left: calc(0px + 418px + 20px);
  top: calc(-1045px + 95px);
  z-index: 11;
}
.placeholder-3 {
  left: calc(0px + 454px + 40px - 320px);
  top: calc(-1045px + 95px + 350px);
  z-index: 11;
}
.placeholder-4 {
  left: calc(0px + 454px + 40px - 260px + 380px);
  top: calc(-1045px + 95px + 27px + 400px);
  z-index: 11;
}


/* ================================================
   Мобильные экраны < 1200px
   ================================================ */
@media (max-width: 1200px) {
  .logo-container {
    position: relative;
    top: -1600px;
    left: auto;
    transform: none;
    margin: 0 auto 20px;
    display: flex;
    justify-content: center;
  }

  .placeholders-wrapper {
    display: flex;
    flex-wrap: wrap;
    left: auto;
    top: -1600px;
    gap: 11px;
 
    margin: 45px;
    width: 100vw;
    max-width: none;
    height: auto;
    position: relative;
  }

  .placeholder {
    position: static;
    width: 150px;
    height: 120px;
  }

  .placeholder-img {
    width: 80%;
    height: 80%;
  }
}

/* Предотвращаем горизонтальную прокрутку */
main {
  overflow-x: hidden;
}
</style>