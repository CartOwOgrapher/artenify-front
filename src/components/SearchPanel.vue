


<template>
  <div class="search-panel">
    <!-- Категории и теги -->
    <div class="filter-group">
      <button class="btn" @click="showFilterMenu = !showFilterMenu">
        <i class="icon-filter">🏷</i>
        Категории и теги
        <i class="icon-caret">▾</i>
      </button>
      <transition name="fade">
        <div v-if="showFilterMenu" class="filter-menu">
          <!-- Категории -->
          <div class="filter-section">
            <label class="filter-label">Категория</label>
            <select v-model="selectedCategory" class="filter-select">
              <option disabled value="">Выберите категорию</option>
              <option v-for="cat in categoryList" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Теги -->
          <div class="filter-section">
            <label class="filter-label">Теги</label>
            <input
              v-model="tagSearch"
              class="tag-search"
              type="text"
              placeholder="Поиск тегов..."
            />
            <div class="tag-menu-list">
              <label
                v-for="tag in filteredTags"
                :key="tag.id"
                :class="['tag-item', { selected: selectedTags.includes(tag.id) }]"
              >
                <input type="checkbox" :value="tag.id" v-model="selectedTags" />
                {{ tag.name }}
              </label>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Поиск -->
    <div class="search-group">
      <input
        v-model="searchQuery"
        class="search-input"
        type="text"
        placeholder="Поиск творческих работ сообщества"
      />
      <button class="btn image-search" @click="$emit('image-search')">
        🖼
      </button>
    </div>

    <!-- Сортировка -->
    <div class="sort-group">
      <button class="btn" @click="showSortMenu = !showSortMenu">
        {{ sortLabel }}
        <i class="icon-caret">▾</i>
      </button>
      <transition name="fade">
        <div v-if="showSortMenu" class="sort-menu">
          <div @click="applySort('recommended')" class="sort-item">Рекомендуемые</div>
          <div @click="applySort('latest')" class="sort-item">По дате (новые)</div>
          <div @click="applySort('oldest')" class="sort-item">По дате (старые)</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  availableTags: { type: Object, default: () => ({ tags: [] }) }
})
const emit = defineEmits(['filter-changed', 'image-search'])

const searchQuery = ref('')
const tagSearch = ref('')
const selectedTags = ref([])
const selectedCategory = ref('')
const sortType = ref('recommended')

const showFilterMenu = ref(false)
const showSortMenu = ref(false)

const categoryList = ['Украшения', 'Графика', 'Мода', 'Архитектура'] // Заглушка

const tagsArray = computed(() => props.availableTags.tags || [])

const filteredTags = computed(() => {
  const term = tagSearch.value.toLowerCase()
  return term
    ? tagsArray.value.filter(t => t.name.toLowerCase().includes(term))
    : tagsArray.value
})

const sortLabel = computed(() => ({
  recommended: 'Рекомендуемые',
  latest: 'По дате (новые)',
  oldest: 'По дате (старые)'
}[sortType.value]))

watch(
  [searchQuery, selectedTags, sortType, selectedCategory],
  () => {
    emit('filter-changed', {
      search: searchQuery.value,
      sort: sortType.value,
      tags: selectedTags.value,
      category: selectedCategory.value
    })
  }
)

function applySort(type) {
  sortType.value = type
  showSortMenu.value = false
}
</script>

<style scoped>
.search-panel {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  gap: 12px;
  position: sticky;
  top: 65px;
  z-index: 100;
}

/* Общие кнопки */
.btn {
  background: #ff69b4;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.btn:hover {
  background: #e055a0;
}

.filter-group,
.search-group,
.sort-group {
  position: relative;
}

/* Поиск */
.search-group {
  flex: 1;
  display: flex;
}
.search-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 20px 0 0 20px;
  outline: none;
}
.image-search {
  border-radius: 0 20px 20px 0;
}

/* Сортировка */
.sort-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  margin-top: 4px;
  overflow: hidden;
}
.sort-item {
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
}
.sort-item:hover {
  background: #f5f5f5;
}

/* Фильтры */
.filter-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-top: 6px;
  padding: 14px;
  min-width: 300px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #444;
}
.filter-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  background: #fafafa;
  outline: none;
}
.tag-search {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
}
.tag-menu-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
}
.tag-item {
  padding: 4px 10px;
  border-radius: 14px;
  background: #f0f0f0;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.2s;
}
.tag-item.selected {
  background: #ff69b4;
  color: white;
}
.tag-item input {
  display: none;
}

/* Анимация */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
