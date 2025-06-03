<template>
  <div class="publish-container">
    <h1>Опубликовать проект</h1>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <input
        v-model="form.title"
        placeholder="Заголовок"
        maxlength="30"
        required
      />
      <textarea v-model="form.content" placeholder="Описание"></textarea>
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        @change="handleImageChange"
      />

      <button type="submit">Отправить</button>
    </form>

    <div v-if="successMessage" style="color: green;">{{ successMessage }}</div>
    <div v-if="errorMessages.length" style="color: red; margin-top: 1em;">
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
        images: []
      },
      successMessage: '',
      errorMessages: []
    };
  },
  methods: {
    handleImageChange(e) {
      this.form.images = Array.from(e.target.files);
      console.log('Выбраны файлы:', this.form.images);
    },
    async handleSubmit() {
      this.errorMessages = [];
      this.successMessage = '';
      console.log('Начинаем отправку формы...');

      // Валидация
      if (!this.form.title || this.form.title.length > 30) {
        this.errorMessages.push('Заголовок обязателен и должен быть не длиннее 30 символов.');
        console.warn('Ошибка валидации: заголовок');
        return;
      }

      if (this.form.images.some(img => img.size > 5120 * 1024)) {
        this.errorMessages.push('Одна из картинок превышает размер 5 МБ.');
        console.warn('Ошибка валидации: размер картинки');
        return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        this.errorMessages.push('Необходима авторизация.');
        console.warn('Ошибка: нет токена');
        return;
      }

      const formData = new FormData();
      formData.append('title', this.form.title);
      if (this.form.content) {
        formData.append('content', this.form.content);
      }
      this.form.images.forEach(file => {
        formData.append('images[]', file);
      });

      console.log('Данные формы для отправки:', {
        title: this.form.title,
        content: this.form.content,
        imagesCount: this.form.images.length,
      });

      try {
        console.log('Отправляем запрос на сервер...');
        const res = await api.post('/posts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        });
        console.log('Ответ сервера:', res.data);

        this.successMessage = 'Проект опубликован!';
        this.form.title = '';
        this.form.content = '';
        this.form.images = [];
      } catch (e) {
        console.error('Ошибка при отправке запроса:', e);
        if (e.response) {
          console.warn('Ответ сервера с ошибкой:', e.response);
          if (e.response.status === 422 && e.response.data.errors) {
            const errors = e.response.data.errors;
            this.errorMessages = [];
            for (const key in errors) {
              if (errors.hasOwnProperty(key)) {
                this.errorMessages.push(`${key}: ${errors[key].join(', ')}`);
              }
            }
          } else if (e.response.data && e.response.data.message) {
            this.errorMessages = [e.response.data.message];
          } else {
            this.errorMessages = ['Ошибка сервера: ' + e.response.status];
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
  padding: 80px 20px;
  max-width: 600px;
  margin: auto;
}
</style>
