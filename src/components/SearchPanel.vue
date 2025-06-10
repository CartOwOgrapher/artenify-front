<template>
  <div class="search-panel">
    <button class="filter-btn">
      <i class="icon">⚙️</i> Фильтр
    </button>

    <div class="search-input">
      <i class="icon">🔍</i>
      <input type="text" placeholder="Поиск творческих работ сообщества" v-model="searchQuery" />
 
      <button class="image-search">🖼</button>
    </div>

    <button class="recommended-btn">
      Рекомендуемые ▼
    </button>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const showMobileMenu = ref(false)

// Определяем, мобильное ли устройство
const isMobile = computed(() => {
  return window.innerWidth <= 724
})
</script>
<style>
.search-panel {
  position: sticky;
  margin-top: 910px;
  width: 100vw;
  height: 67px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  box-sizing: border-box;
}

@media (max-width: 1400px) {
  .search-panel{
    margin-top: 850px;
    
  }
}
@media (max-width: 1300px) {
  .search-panel{
    margin-top: 810px;
    
  }
}

.filter-btn,
.recommended-btn {
  background: #ff69b4;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

/* === Поисковое поле с кнопкой внутри === */
.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 25px;
  padding: 5px 10px;
  width: 100%;
  max-width: 600px;
  transition: all 0.3s ease;
}

.search-input input {
  border: none;
  background: transparent;
  padding: 5px 10px;
  flex: 1;
  outline: none;
  font-size: 16px;
  padding-right: 80px; /* Отступ для кнопки внутри */
}

/* === Кнопка "Поиск по картинке" внутри поля === */
.image-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: #ff69b4;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.icon {
  margin-right: 5px;
}

/* === Адаптивное скрытие кнопок постепенно при уменьшении ширины экрана === */

@media (max-width: 900px) {
  .search-panel .recommended-btn {
    display: none;
  }
}

@media (max-width: 360px) {
  .search-panel .image-search {
    display: none;
  }

  .search-input input {
    padding-right: 10px;
  }

  .search-input {
    flex: 1 1 100%;
    width: 100%;
    margin-top: 10px;
  }

  .search-panel {
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    padding: 10px;
  }
}

@media (max-width: 724px) {
  .search-panel .filter-btn {
    display: none;
  }

  .search-input input {
    font-size: 14px;
    padding: 4px 8px;
  }

  .search-input {
    padding: 4px 8px;
  }
}
</style>