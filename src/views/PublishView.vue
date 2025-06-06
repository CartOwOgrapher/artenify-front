<template>
  <div class="publish-container">
    <h1 class="title">Опубликовать проект</h1>

    <div class="form">
      <input
        v-model="form.title"
        placeholder="Заголовок проекта"
        maxlength="30"
        class="input"
      />

      <textarea
        v-model="form.content"
        placeholder="Опиши, что ты создал..."
        class="textarea"
        rows="5"
      ></textarea>

      <label class="upload-label">
        <span>Загрузить изображения</span>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          @change="handleImageChange"
          class="file-input"
        />
      </label>

      <div v-if="form.images.length" class="preview">
        <div
          v-for="(image, index) in form.images"
          :key="index"
          class="image-thumb"
        >
          <img :src="image.preview" />
        </div>
      </div>

      <button
        :disabled="!canContinue"
        @click="showModal = true"
        class="continue-btn"
      >
        Продолжить
      </button>
    </div>

    <!-- Модалка -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal behance-style-modal">
        <div class="modal-left">
          <div class="cover-preview">
            <img :src="form.images[0]?.preview || 'https://via.placeholder.com/300x200?text=Обложка'" alt="Preview" />
          </div>
          <h3 class="project-title">{{ form.title || 'Безымянный проект' }}</h3>
          <p class="project-author">Автор: Artur Ploskov</p>
          <div class="project-stats">
            <span>❤️ 0</span>
            <span>👁 0</span>
            <span>💬 0</span>
          </div>
        </div>

        <div class="modal-right">
          <h2>Публикация проекта</h2>
          <input v-model="form.title" class="input" placeholder="Название проекта" />
          <input v-model="form.tags" class="input" placeholder="Теги (через запятую)" />
          <input v-model="form.tools" class="input" placeholder="Инструменты (например, Figma, PS)" />

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
    </div>

    <!-- Сообщения -->
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
    <div v-if="errorMessages.length" class="errors">
      <ul>
        <li v-for="(error, index) in errorMessages" :key="index">{{ error }}</li>
      </ul>
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
        tags: '',
        tools: '',
        visibility: 'public',
        isAdult: false
      },
      successMessage: '',
      errorMessages: [],
      showModal: false
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
      formData.append('tags', this.form.tags);
      formData.append('tools', this.form.tools);
      formData.append('visibility', this.form.visibility);
      formData.append('is_adult', this.form.isAdult);

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
          tags: '',
          tools: '',
          visibility: 'public',
          isAdult: false
        };
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
    }
  }
};
</script>

<style scoped>
.publish-container {
  max-width: 600px;
  margin: auto;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
}

.title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 30px;
}

.input,
.textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 16px;
}

.upload-label {
  display: inline-block;
  background: #f3f3f3;
  border: 1px dashed #aaa;
  padding: 12px;
  cursor: pointer;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.file-input {
  display: none;
}

.preview {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.image-thumb {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.continue-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}

/* Стиль модалки в стиле Behance */
.behance-style-modal {
  display: flex;
  flex-direction: row;
  max-width: 900px;
  width: 90%;
  overflow: hidden;
  border-radius: 16px;
}

.modal-left {
  width: 40%;
  background: #f3f3f3;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
}

.cover-preview img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.project-title {
  margin-top: 15px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

.project-author {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.project-stats {
  display: flex;
  gap: 10px;
  font-size: 14px;
}

.modal-right {
  width: 60%;
  padding: 30px;
  text-align: left;
}

.select-group,
.checkbox-group {
  margin-top: 20px;
}

.modal-actions {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.confirm-btn {
  flex: 1;
  background: #4ade80;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.cancel-btn {
  flex: 1;
  background: #f87171;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.success {
  margin-top: 20px;
  color: green;
}

.errors {
  margin-top: 20px;
  color: red;
}
</style>
