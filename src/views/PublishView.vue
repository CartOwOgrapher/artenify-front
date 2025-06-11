<script setup>
import { ref, computed, onMounted } from 'vue';
import {useStore } from 'vuex'
import api from '@/axios.js';

const store = useStore()

// --- Reactive State ---
const form = ref({
  title: '',
  content: '',
  images: [],
  tools: '',
  visibility: 'public',
  draft: false,
  tags: ''
});

const successMessage = ref('');
const errorMessages = ref([]);
const showModal = ref(false);
const isTagModalOpen = ref(false);
const tagSearchQuery = ref('');
const searchResults = ref([]);
const canCreateTag = ref(false);
const selectedTags = ref([]);

// --- Computed ---
const canContinue = computed(() => {
  return (
    form.value.title.trim().length > 0 ||
    form.value.content.trim().length > 0 ||
    form.value.images.length > 0
  );
});

// --- Methods ---

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
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
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
      tags: ''
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

    selectedTags.value.push(newTag);
    searchResults.value.push(newTag);
    form.value.tags = selectedTags.value.map(t => t.name).join(', ');

    tagSearchQuery.value = '';
    canCreateTag.value = false;
  } catch (e) {
    console.error("Ошибка создания тега:", e);
    errorMessages.value.push("Не удалось создать тег");
  }
}

onMounted(async () => {
  // Если юзер не загружен, но авторизован — загружаем
  if (!store.getters.user && store.getters.isAuthenticated) {
    await store.dispatch('getUser');
  }

  // Если после загрузки всё равно null — редиректим
  if (!store.getters.user) {
    router.push('/login');
    return;
  }
});

</script>

<template>
  <div class="publish-container">
    <h1 class="title">Опубликовать проект</h1>

    <div class="form">
      <!-- Заголовок -->
      <input v-model="form.title" placeholder="Заголовок проекта" maxlength="30" class="input" />

      <!-- Описание -->
      <textarea v-model="form.content" placeholder="Опиши, что ты создал..." class="textarea" rows="5"></textarea>

      <!-- Загрузка изображений -->
      <label class="upload-label">
        Загрузить изображения
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" @change="handleImageChange"
          class="file-input" />
      </label>

      <!-- Превью изображений -->
      <div v-if="form.images.length" class="preview">
        <div v-for="(image, index) in form.images" :key="index" class="image-thumb">
          <img :src="image.preview" />
        </div>
      </div>

      <!-- Поле для тегов -->
      <div class="tag-input">
        <input v-model="form.tags" placeholder="Теги (через запятую)" class="input" disabled />
        <button @click="openTagModal" type="button" class="tag-btn">
          Выбрать
        </button>
      </div>

      <!-- Отображение выбранных тегов -->
      <div v-if="selectedTags.length" class="selected-tags">
        <span v-for="tag in selectedTags" :key="tag.id" class="tag-pill">
          {{ tag.name }}
          <button @click="removeTag(tag)" class="remove-tag">×</button>
        </span>
      </div>

      <!-- Инструменты -->
      <input v-model="form.tools" class="input" placeholder="Инструменты (например, Figma)" />

      <!-- Видимость -->
      <div class="select-group">
        <label>Видимость проекта</label>
        <select v-model="form.visibility" class="input">
          <option value="public">Публичный</option>
          <option value="private">Приватный</option>
          <option value="unlisted">По ссылке</option>
        </select>
      </div>

      <!-- Контент 18+ -->
      <div class="checkbox-group">
        <label><input type="checkbox" v-model="form.draft" /> Черновик</label>
      </div>

      <!-- Кнопка продолжения -->
      <button :disabled="!canContinue" @click="showModal = true" class="continue-btn">
        Продолжить
      </button>
    </div>

    <!-- Модалка подтверждения -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Публикация проекта</h2>
        <input v-model="form.title" class="input" placeholder="Название проекта" />
        <input v-model="form.tools" class="input" placeholder="Инструменты (например, Figma)" />
        <div class="select-group">
          <label>Видимость проекта</label>
          <select v-model="form.visibility" class="input">
            <option value="public">Публичный</option>
            <option value="private">Приватный</option>
            <option value="unlisted">По ссылке</option>
          </select>
        </div>
        <div class="checkbox-group">
          <label><input type="checkbox" v-model="form.draft" /> Черновик</label>
        </div>
        <div class="modal-actions">
          <button @click="handleSubmit" class="confirm-btn">Опубликовать</button>
          <button @click="showModal = false" class="cancel-btn">Отмена</button>
        </div>
      </div>
    </div>

    <!-- Сообщения -->
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
    <div v-if="errorMessages.length" class="errors">
      <ul>
        <li v-for="(error, index) in errorMessages" :key="index">{{ error }}</li>
      </ul>
    </div>

    <!-- Модалка выбора тегов -->
    <div v-if="isTagModalOpen" class="modal-overlay">
      <div class="modal tag-modal">
        <h2>Выберите теги</h2>
        <input v-model="tagSearchQuery" placeholder="Поиск или создание тега" class="input" @input="handleTagSearch" />
        <div class="search-results">
          <div v-for="tag in searchResults" :key="tag.id" class="tag-result" @click="selectTag(tag)">
            {{ tag.name }}
          </div>
        </div>
        <div v-if="canCreateTag" class="create-tag">
          <p>Тег "{{ tagSearchQuery }}" не найден. Создать новый?</p>
          <button @click="createAndAddTag" class="confirm-btn">
            Создать и добавить
          </button>
        </div>
        <div class="modal-actions">
          <button @click="closeTagModal" class="cancel-btn">Готово</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Общие стили */
.publish-container {
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input,
.textarea,
.select-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.input:focus,
.textarea:focus,
.select-group select:focus {
  border-color: #4f46e5;
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.upload-label {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.file-input {
  display: none;
}

.tag-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tag-btn {
  padding: 12px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.tag-btn:hover {
  background: #3b39d9;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tag-pill {
  background: #4f46e5;
  color: white;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.remove-tag {
  background: none;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.checkbox-group label {
  font-size: 16px;
  color: #333;
}

.continue-btn {
  padding: 12px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.continue-btn:hover {
  background: #3b39d9;
}

.continue-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
}

.modal h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.confirm-btn,
.cancel-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.confirm-btn {
  background: #4f46e5;
  color: white;
}

.confirm-btn:hover {
  background: #3b39d9;
}

.cancel-btn {
  background: #ccc;
  color: #333;
}

.cancel-btn:hover {
  background: #bbb;
}

.success {
  color: green;
  font-size: 16px;
  margin-top: 20px;
}

.errors {
  color: red;
  font-size: 16px;
  margin-top: 20px;
}

.errors ul {
  list-style: none;
  padding: 0;
}

.errors li {
  margin-bottom: 8px;
}

.image-thumb {
  display: inline-block;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.image-thumb img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.tag-modal .input {
  margin-bottom: 16px;
}

.search-results {
  margin-bottom: 16px;
}

.tag-result {
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.tag-result:hover {
  background: #e0e0e0;
}

.create-tag {
  text-align: center;
  margin-top: 16px;
}

.create-tag p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.create-tag .confirm-btn {
  margin-top: 8px;
}
</style>