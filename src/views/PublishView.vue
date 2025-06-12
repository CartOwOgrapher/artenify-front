<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import api from '@/axios.js';
import router from '@/router';

const store = useStore();

const form = ref({
  title: '',
  content: '',
  images: [],
  tools: '',
  visibility: 'public',
  draft: false,
  tags: '',
  selectedCategory: ''
});

const successMessage = ref('');
const errorMessages = ref([]);
const showModal = ref(false);
const isTagModalOpen = ref(false);
const tagSearchQuery = ref('');
const searchResults = ref([]);
const canCreateTag = ref(false);
const selectedTags = ref([]);

const availableCategories = ref([]);

const canContinue = computed(() => {
  return (
    form.value.title.trim().length > 0 ||
    form.value.content.trim().length > 0 ||
    form.value.images.length > 0
  );
});

function handleImageChange(e) {
  const files = Array.from(e.target.files);
  form.value.images = files.map(file => {
    file.preview = URL.createObjectURL(file);
    return file;
  });
}

async function handleSubmit() {
  errorMessages.value = [];
  successMessage.value = '';
  showModal.value = false;

  const token = localStorage.getItem('access_token');
  if (!token) {
    errorMessages.value.push('Необходима авторизация.');
    return;
  }

  const formData = new FormData();
  formData.append('title', form.value.title);
  formData.append('content', form.value.content || '');
  formData.append('tools', form.value.tools);
  formData.append('visibility', form.value.visibility);
  formData.append('status', form.value.draft ? 1 : 2);
  formData.append('category_id', form.value.selectedCategory);

  selectedTags.value.forEach(tag => {
    formData.append('tags[]', tag.name);
  });

  form.value.images.forEach(file => {
    formData.append('images[]', file);
  });

  try {
    const res = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    successMessage.value = 'Проект опубликован!';
    form.value = {
      title: '',
      content: '',
      images: [],
      tools: '',
      visibility: 'public',
      draft: false,
      tags: '',
      selectedCategory: ''
    };
    selectedTags.value = [];
  } catch (e) {
    if (e.response && e.response.data) {
      const errors = e.response.data.errors;
      if (errors) {
        for (const key in errors) {
          errorMessages.value.push(`${key}: ${errors[key].join(', ')}`);
        }
      } else {
        errorMessages.value = [e.response.data.message || 'Ошибка сервера'];
      }
    } else {
      errorMessages.value = ['Ошибка сети или запроса'];
    }
  }
}

function openTagModal() {
  isTagModalOpen.value = true;
  tagSearchQuery.value = '';
  searchResults.value = [];
}

function closeTagModal() {
  isTagModalOpen.value = false;
}

async function handleTagSearch() {
  if (!tagSearchQuery.value.trim()) {
    searchResults.value = [];
    canCreateTag.value = false;
    return;
  }

  try {
    const res = await api.get(`/tags/search?q=${encodeURIComponent(tagSearchQuery.value)}`);
    searchResults.value = res.data.tags;
    canCreateTag.value = res.data.can_create;
  } catch (e) {
    console.error("Ошибка поиска тегов:", e);
    searchResults.value = [];
    canCreateTag.value = false;
  }
}

function selectTag(tag) {
  if (!selectedTags.value.some(t => t.id === tag.id)) {
    selectedTags.value.push(tag);
    form.value.tags = selectedTags.value.map(t => t.name).join(', ');
  }
}

function removeTag(tag) {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tag.id);
  form.value.tags = selectedTags.value.map(t => t.name).join(', ');
}

async function createAndAddTag() {
  try {
    const res = await api.post('/tags', { name: tagSearchQuery.value });
    const newTag = res.data.tag;
    selectTag(newTag);
    isTagModalOpen.value = false;
    tagSearchQuery.value = '';
    canCreateTag.value = false;
  } catch (e) {
    console.error("Ошибка создания тега:", e);
    errorMessages.value.push("Не удалось создать тег");
  }
}

onMounted(async () => {
  try {
    const res = await api.get(`/categories`);
    availableCategories.value = res.data || [];
    console.log('Категории:', availableCategories.value);
  } catch (e) {
    console.error('Ошибка загрузки категорий:', e);
  }

  if (!store.getters.user && store.getters.isAuthenticated) {
    await store.dispatch('getUser');
  }

  if (!store.getters.user) {
    router.push('/login');
    return;
  }
});
</script>

<template>
  <div class="publish-wrapper">
    <div class="publish-container">
      <div class="main-content">
        <!-- Левая часть - форма -->
        <div class="form-section">
          <h1 class="title">
            <span class="title-primary">ОПУБЛИКОВАТЬ ПРОЕКТ</span>
          </h1>

          <div class="form">
            <!-- Заголовок -->
            <div class="input-group">
              <label class="input-label">Название проекта</label>
              <input
                v-model="form.title"
                placeholder="Введите название проекта..."
                maxlength="30"
                class="form-input"
              />
            </div>

            <!-- Категории -->
            <div class="input-group">
              <label class="input-label">Категория</label>
              <select v-model="form.selectedCategory" class="form-select">
                <option disabled value="">Выберите категорию</option>
                <option
                  v-for="cat in availableCategories.categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Описание -->
            <div class="input-group">
              <label class="input-label">Описание</label>
              <textarea
                v-model="form.content"
                placeholder="Расскажите о вашем проекте..."
                class="form-textarea"
                rows="4"
              ></textarea>
            </div>

            <!-- Загрузка изображений -->
            <div class="input-group">
              <label class="input-label">Изображения</label>
              <label class="upload-zone">
                <div class="upload-content">
                  <div class="upload-icon">📸</div>
                  <div class="upload-text">Загрузить изображения</div>
                  <div class="upload-hint">PNG, JPG, WEBP до 5MB</div>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleImageChange"
                  class="file-input"
                />
              </label>
            </div>

            <!-- Поле для тегов -->
            <div class="input-group">
              <label class="input-label">Теги</label>
              <div class="tag-input-wrapper">
                <input
                  v-model="form.tags"
                  placeholder="Выберите теги для проекта"
                  class="form-input"
                  disabled
                />
                <button @click="openTagModal" type="button" class="tag-btn">
                  Выбрать
                </button>
              </div>
            </div>

            <!-- Отображение выбранных тегов -->
            <div v-if="selectedTags.length" class="selected-tags">
              <span
                v-for="tag in selectedTags"
                :key="tag.id"
                class="tag-item"
              >
                {{ tag.name }}
                <button @click="removeTag(tag)" class="remove-tag">×</button>
              </span>
            </div>

            <!-- Черновик -->
            <div class="checkbox-group">
              <label class="checkbox-container">
                <input type="checkbox" v-model="form.draft" class="checkbox-input" />
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">Сохранить как черновик</span>
              </label>
            </div>

            <!-- Кнопка подтверждения -->
            <button
              :disabled="!canContinue"
              @click="handleSubmit"
              class="submit-btn"
              :class="{ disabled: !canContinue }"
            >
              Опубликовать проект
            </button>
          </div>
        </div>

        <!-- Правая часть - превью -->
        <div class="preview-section">
          <div class="preview-header">
            <h2 class="preview-title">Превью изображения</h2>
            <div class="preview-status" :class="{ active: form.images.length }">
              {{ form.images.length ? 'Загружено' : 'Нет данных' }}
            </div>
          </div>

          <div v-if="form.images.length" class="preview-container">
            <!-- Основное изображение -->
            <div class="main-preview">
              <div class="image-frame">
                <img :src="form.images[0].preview" alt="Main preview" />
              </div>
            </div>

            <!-- Дополнительные размеры -->
            <div v-if="form.images.length > 1" class="additional-previews">
              <div class="preview-grid">
                <div class="preview-item" v-for="(image, index) in form.images.slice(1, 4)" :key="index">
                  <img :src="image.preview" :alt="`Preview ${index + 2}`" />
                </div>
              </div>
            </div>

            <!-- Дополнительная информация -->
            <div class="preview-stats">
              <div class="stat-item">
                <div class="stat-value">{{ form.images.length }}</div>
                <div class="stat-label">файлов</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">HD</div>
                <div class="stat-label">качество</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">RGB</div>
                <div class="stat-label">формат</div>
              </div>
            </div>
          </div>

          <!-- Плейсхолдер когда нет изображений -->
          <div v-else class="preview-placeholder">
            <div class="placeholder-icon">🎨</div>
            <div class="placeholder-text">
              <div class="placeholder-title">Нет изображений</div>
              <div class="placeholder-subtitle">Загрузите файлы для превью</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Сообщения -->
      <div v-if="successMessage" class="message success-message">
        <div class="message-icon">✨</div>
        <div class="message-text">{{ successMessage }}</div>
      </div>
      
      <div v-if="errorMessages.length" class="message error-message">
        <div class="message-icon">⚠️</div>
        <div class="message-content">
          <ul>
            <li v-for="(error, index) in errorMessages" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Модалка выбора тегов -->
      <div v-if="isTagModalOpen" class="modal-overlay" @click="closeTagModal">
        <div class="modal tag-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">Выберите теги</h2>
            <button @click="closeTagModal" class="modal-close">×</button>
          </div>
          
          <div class="modal-content">
            <input
              v-model="tagSearchQuery"
              @input="handleTagSearch"
              placeholder="Поиск тегов..."
              class="form-input"
            />
            
            <div class="tag-search-results">
              <div
                v-for="tag in searchResults"
                :key="tag.id"
                @click="selectTag(tag)"
                class="tag-result-item"
              >
                <span class="tag-name">{{ tag.name }}</span>
                <span class="tag-arrow">→</span>
              </div>
              <div v-if="canCreateTag" class="tag-create" @click="createAndAddTag">
                <span class="create-icon">+</span>
                <span>Создать "{{ tagSearchQuery }}"</span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button @click="closeTagModal" class="btn-secondary">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Основные цвета из дизайна */
:root {
  --bg-primary: #2A2D47;
  --bg-secondary: #353759;
  --bg-card: #404463;
  --accent-teal: #4FD1C7;
  --accent-pink: #FF69B4;
  --text-primary: #FFFFFF;
  --text-secondary: #B8BCC8;
  --text-muted: #9CA0AB;
  --border-light: rgba(255, 255, 255, 0.1);
  --border-medium: rgba(255, 255, 255, 0.2);
}

.publish-wrapper {
  margin-top: 100px;
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 20px 0;
}

.publish-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  align-items: start;
}

/* ЛЕВАЯ ЧАСТЬ - ФОРМА */
.form-section {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid var(--border-light);
}

.title {
  text-align: center;
  margin-bottom: 32px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1.2;
}

.title-primary {
  color: var(--accent-teal);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 12px 16px;
  background: #d9e5ee;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: var(--accent-teal);
  box-shadow: 0 0 0 3px rgba(79, 209, 199, 0.1);
}

.form-select {
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%234FD1C7' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  appearance: none;
  cursor: pointer;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Зона загрузки файлов */
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border: 2px dashed var(--border-medium);
  border-radius: 12px;
  background: rgba(79, 209, 199, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-zone:hover {
  border-color: var(--accent-teal);
  background: rgba(79, 209, 199, 0.1);
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
  opacity: 0.8;
}

.upload-text {
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 4px;
}

.upload-hint {
  color: var(--text-muted);
  font-size: 12px;
}

.file-input {
  display: none;
}

/* Теги */
.tag-input-wrapper {
  display: flex;
  gap: 12px;
}

.tag-btn {
  background: #fa97c8;
  color: #FFFFFF;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tag-btn:hover {
  background: #ff73b9;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  background: rgba(79, 209, 199, 0.15);
  border: 1px solid rgba(79, 209, 199, 0.3);
  color: var(--accent-teal);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.remove-tag {
  background: none;
  border: none;
  color: var(--accent-pink);
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.remove-tag:hover {
  transform: scale(1.2);
}

/* Чекбокс */
.checkbox-group {
  margin: 16px 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid ;
  border-radius: 4px;
  margin-right: 10px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--accent-teal);
  border-color: var(--accent-teal);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-size: 12px;
  font-weight: bold;
}

/* Главная кнопка */
.submit-btn {
  background: #fa97c8;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.submit-btn:hover:not(.disabled) {
  background: #ff73b9;
  transform: translateY(-1px);
}

.submit-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ПРАВАЯ ЧАСТЬ - ПРЕВЬЮ */
.preview-section {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--border-light);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.preview-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.preview-status.active {
  background: rgba(57, 245, 110, 0.15);
  color: #3ce26b;
  border-color: rgba(57, 245, 110, 0.3);
}

/* Основное превью */
.main-preview {
  margin-bottom: 20px;
}

.image-frame {
  border-radius: 12px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
}

.image-frame img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

/* Дополнительные превью */
.additional-previews {
  margin-bottom: 20px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-item {
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  height: 60px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Статистика превью */
.preview-stats {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: rgba(79, 209, 199, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(79, 209, 199, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-teal);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Плейсхолдер */
.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 280px;
  border: 2px dashed var(--border-light);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.placeholder-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.placeholder-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.placeholder-subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

/* МОДАЛЬНЫЕ ОКНА */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(128, 128, 128, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal {
  background: rgba(255, 255, 255);
  border: 1px solid var(--border-medium);
  border-radius: 16px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Продолжение стилей с момента обрыва */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.modal-close:hover {
  color: var(--accent-pink);
  background: rgba(255, 105, 180, 0.1);
  transform: scale(1.1);
}

.modal-content {
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-teal), #45BAB1);
  color: var(--text-primary);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 209, 199, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #45BAB1, var(--accent-teal));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 209, 199, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--bg-card);
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

/* Модалка тегов */
.tag-modal {
  max-width: 600px;
}

.tag-search-results {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-card);
}

.tag-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-light);
}

.tag-result-item:hover {
  background: rgba(79, 209, 199, 0.1);
  color: var(--accent-teal);
}

.tag-result-item:last-child {
  border-bottom: none;
}

.tag-name {
  font-size: 14px;
  font-weight: 500;
}

.tag-arrow {
  color: var(--text-muted);
  font-size: 12px;
  transition: all 0.2s ease;
}

.tag-result-item:hover .tag-arrow {
  color: var(--accent-teal);
  transform: translateX(4px);
}

.tag-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(79, 209, 199, 0.05);
  border-top: 1px solid var(--border-light);
  color: var(--accent-teal);
  font-weight: 500;
}

.tag-create:hover {
  background: rgba(79, 209, 199, 0.15);
}

.create-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-teal);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* Сообщения */
.message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 500;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.success-message {
  background: rgba(79, 209, 199, 0.15);
  color: var(--accent-teal);
  border-color: rgba(79, 209, 199, 0.3);
}

.error-message {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.3);
}

.message-icon {
  font-size: 18px;
  opacity: 0.9;
}

.message-text {
  font-size: 14px;
}

.message-content ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.message-content li {
  font-size: 14px;
  margin-bottom: 4px;
}

.message-content li:last-child {
  margin-bottom: 0;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .preview-section {
    position: static;
    order: -1;
  }
  
  .form-section, .preview-section {
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
    margin-bottom: 24px;
  }
  
  .upload-zone {
    padding: 24px;
  }
  
  .tag-input-wrapper {
    flex-direction: column;
  }
  
  .modal {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
  
  .message {
    position: fixed;
    top: 10px;
    left: 10px;
    right: 10px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .publish-container {
    padding: 0 16px;
  }
  
  .form-section, .preview-section {
    padding: 16px;
    border-radius: 12px;
  }
  
  .preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tag-modal {
    max-width: 90vw;
  }
}

/* Плавные переходы для интерактивных элементов */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

/* Кастомный скроллбар */
.tag-search-results::-webkit-scrollbar,
.modal::-webkit-scrollbar {
  width: 6px;
}

.tag-search-results::-webkit-scrollbar-track,
.modal::-webkit-scrollbar-track {
  background: var(--bg-card);
  border-radius: 3px;
}

.tag-search-results::-webkit-scrollbar-thumb,
.modal::-webkit-scrollbar-thumb {
  background: var(--accent-teal);
  border-radius: 3px;
}

.tag-search-results::-webkit-scrollbar-thumb:hover,
.modal::-webkit-scrollbar-thumb:hover {
  background: #45BAB1;
}

/* Улучшенные фокус-состояния для доступности */
.form-input:focus,
.form-textarea:focus,
.form-select:focus,
.tag-btn:focus,
.btn-primary:focus,
.btn-secondary:focus {
  outline: 2px solid var(--accent-teal);
  outline-offset: 2px;
}

/* Анимация для загрузки */
.upload-zone.uploading {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Улучшенный hover для превью изображений */
.preview-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(79, 209, 199, 0.2);
}

.image-frame:hover {
  transform: scale(1.01);
  box-shadow: 0 6px 20px rgba(79, 209, 199, 0.15);
}

/* Дополнительные эффекты для кнопок */
.submit-btn:active {
  transform: translateY(0);
}

.btn-primary:active {
  transform: translateY(-1px);
}

/* Улучшенная типографика */
.form-input,
.form-textarea,
.form-select {
  line-height: 1.5;
}

/* Глобальные улучшения */
.publish-wrapper {
  background: linear-gradient(135deg, var(--bg-primary) 0%, #252845 50%, var(--bg-primary) 100%);
  min-height: 100vh;
}
</style>