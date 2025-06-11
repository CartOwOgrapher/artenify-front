<template>
  <div class="publish-container">
    <h1 class="title">Опубликовать проект</h1>

    <div class="form">
      <!-- Заголовок -->
      <input
        v-model="form.title"
        placeholder="Заголовок проекта"
        maxlength="30"
        class="input"
      />

      <!-- Описание -->
      <textarea
        v-model="form.content"
        placeholder="Опиши, что ты создал..."
        class="textarea"
        rows="5"
      ></textarea>

      <!-- Загрузка изображений -->
      <label class="upload-label">
        Загрузить изображения
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          @change="handleImageChange"
          class="file-input"
        />
      </label>

      <!-- Превью изображений -->
      <div v-if="form.images.length" class="preview">
        <div
          v-for="(image, index) in form.images"
          :key="index"
          class="image-thumb"
        >
          <img :src="image.preview" />
        </div>
      </div>

      <!-- Поле для тегов -->
      <div class="tag-input">
        <input
          v-model="form.tags"
          placeholder="Теги (через запятую)"
          class="input"
          disabled
        />
        <button @click="openTagModal" type="button" class="tag-btn">
          Выбрать
        </button>
      </div>

      <!-- Отображение выбранных тегов -->
      <div v-if="selectedTags.length" class="selected-tags">
        <span
          v-for="tag in selectedTags"
          :key="tag.id"
          class="tag-pill"
        >
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
        <label><input type="checkbox" v-model="form.isAdult" /> Контент 18+</label>
      </div>

      <!-- Кнопка продолжения -->
      <button
        :disabled="!canContinue"
        @click="showModal = true"
        class="continue-btn"
      >
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
          <label><input type="checkbox" v-model="form.isAdult" /> Контент 18+</label>
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
        <input
          v-model="tagSearchQuery"
          placeholder="Поиск или создание тега"
          class="input"
          @input="handleTagSearch"
        />
        <div class="search-results">
          <div
            v-for="tag in searchResults"
            :key="tag.id"
            class="tag-result"
            @click="selectTag(tag)"
          >
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

<script>
import api from '/src/axios.js';

export default {
  data() {
    return {
      form: {
        title: '',
        content: '',
        images: [],
        tools: '',
        visibility: 'public',
        isAdult: false,
        tags: '' // Отображение тегов в поле ввода
      },
      successMessage: '',
      errorMessages: [],
      showModal: false,
      isTagModalOpen: false,
      tagSearchQuery: '',
      searchResults: [],
      canCreateTag : false,
      selectedTags: [] // Список выбранных тегов
    };
  },
  computed: {
    canContinue() {
      return (
        this.form.title.trim().length > 0 ||
        this.form.content.trim().length > 0 ||
        this.form.images.length > 0
      );
    }
  },
  methods: {
    handleImageChange(e) {
      const files = Array.from(e.target.files);
      this.form.images = files.map(file => {
        file.preview = URL.createObjectURL(file);
        return file;
      });
    },
    async handleSubmit() {
      this.errorMessages = [];
      this.successMessage = '';
      this.showModal = false;

      const token = localStorage.getItem('access_token');
      if (!token) {
        this.errorMessages.push('Необходима авторизация.');
        return;
      }

      const formData = new FormData();
      formData.append('title', this.form.title);
      formData.append('content', this.form.content || '');
      formData.append('tools', this.form.tools);
      formData.append('visibility', this.form.visibility);
      formData.append('is_adult', this.form.isAdult);



     
      this.selectedTags.forEach(tag => {
        formData.append('tags[]', tag.name);
      });

     
      this.form.images.forEach(file => {
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

        this.successMessage = 'Проект опубликован!';
        this.form = {
          title: '',
          content: '',
          images: [],
          tools: '',
          visibility: 'public',
          isAdult: false,
          tags: ''
        };
        this.selectedTags = [];
      } catch (e) {
        if (e.response && e.response.data) {
          const errors = e.response.data.errors;
          if (errors) {
            for (const key in errors) {
              this.errorMessages.push(`${key}: ${errors[key].join(', ')}`);
            }
          } else {
            this.errorMessages = [e.response.data.message || 'Ошибка сервера'];
          }
        } else {
          this.errorMessages = ['Ошибка сети или запроса'];
        }
      }
    },
    openTagModal() {
      this.isTagModalOpen = true;
      this.tagSearchQuery = '';
      this.searchResults = [];
    },
    closeTagModal() {
      this.isTagModalOpen = false;
    },
    async handleTagSearch() {
      if (!this.tagSearchQuery.trim()) {
        this.searchResults = [];
        this.canCreateTag = false;
        return;
      }

      try {
        const res = await api.get(`/tags/search?q=${encodeURIComponent(this.tagSearchQuery)}`);
        this.searchResults = res.data.tags;
        this.canCreateTag = res.data.can_create;
      } catch (e) {
        console.error("Ошибка поиска тегов:", e);
        this.searchResults = [];
        this.canCreateTag = false;
      }
    },
    selectTag(tag) {
      if (!this.selectedTags.some(t => t.id === tag.id)) {
        this.selectedTags.push(tag);
        this.form.tags = this.selectedTags.map(t => t.name).join(', ');
      }
    },
    removeTag(tag) {
      this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
      this.form.tags = this.selectedTags.map(t => t.name).join(', ');
    },
    async createAndAddTag() {
      try {
        const res = await api.post('/tags', { name: this.tagSearchQuery });
        const newTag = res.data.tag;

        this.selectedTags.push(newTag);
        this.searchResults.push(newTag);
        this.form.tags = this.selectedTags.map(t => t.name).join(', ');

        this.tagSearchQuery = '';
        this.canCreateTag = false;
      } catch (e) {
        console.error("Ошибка создания тега:", e);
        this.errorMessages.push("Не удалось создать тег");
      }
    }
  }
};
</script>

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