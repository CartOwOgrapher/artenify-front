<template>
  <div class="search-panel">
    <button class="filter-btn">
      <i class="icon">⚙️</i> Фильтр
    </button>
    <div class="search-input">
      <i class="icon">🔍</i>
      <input type="text" placeholder="Поиск творческих работ сообщества" v-model="searchQuery" />
      <button class="image-search">🖼 Поиск по картинке</button>
    </div>
    <button class="recommended-btn">
      Рекомендуемые ▼
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const searchQuery = ref('')
</script>

<style scoped>
.search-panel {
  position: sticky;
  top: 65px;
  margin-top: 900px;
  width: 100vw;               /* полная ширина viewport */
  height: 67px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
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
}

.search-input {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 25px;
  padding: 5px 10px;
  width: 60%;
}

.search-input input {
  border: none;
  background: transparent;
  padding: 5px;
  flex: 1;
  outline: none;
}

.image-search {
  background: #ff69b4;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
}

.icon {
  margin-right: 5px;
}
</style>
