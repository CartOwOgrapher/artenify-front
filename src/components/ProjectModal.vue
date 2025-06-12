<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div v-if="project" class="modal-body">
        <!-- Изображение с блоком избранного -->
        <div class="modal-img-wrapper">
          <img 
            :src="project.images ? `${api.defaults.imageURL}/${project.images[0].path}` : flowerImg" 
            :alt="project.title" 
            class="modal-img"
          />
          <div class="modal-hover-title">{{ project.title }}</div>
          
          <!-- Кнопка избранного (закладка в левом верхнем углу) -->
          <div class="favorite-block">
            <button 
              class="favorite-btn" 
              @click="toggleFavorite"
              :title="userFavorited ? 'Удалить из избранного' : 'Добавить в избранное'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M5 2C3.9 2 3 2.9 3 4V22L12 18L21 22V4C21 2.9 20.1 2 19 2H5Z" 
                  :fill="userFavorited ? '#ffd700' : 'none'"
                  :stroke="userFavorited ? '#ffd700' : '#ffffff'"
                  stroke-width="2"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Заголовок -->
        <h2 class="modal-title">{{ project.title }}</h2>

        <!-- Описание -->
        <p class="modal-description">{{ project.description }}</p>

        <!-- Информация о владельце -->
        <div v-if="ownerPost" class="owner-block" @click="goToOwnerProfile(ownerPost.id)">
          <img 
            :src="ownerPost.avatar ? `${api.defaults.imageURL}/${ownerPost.avatar}` : flowerImg" 
            :alt="ownerPost.name" 
            class="owner-avatar"
          />
          <span class="owner-name">{{ ownerPost.name }}</span>
        </div>

        <!-- Дата создания -->
        <p v-if="project.created_at" class="modal-date">
          Создано: {{ formatDate(project.created_at) }}
        </p>

        <!-- Блок лайков (перемещен в правый угол перед комментариями) -->
        <div class="content-actions">
          <div class="like-block">
            <button class="like-btn" @click="toggleLike">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                  :fill="userLiked ? '#ff3040' : 'none'"
                  :stroke="userLiked ? '#ff3040' : '#666'"
                  stroke-width="2"
                />
              </svg>
            </button>
            <span class="like-count">{{ likeCount }}</span>
          </div>
        </div>

        <!-- Секция комментариев -->
        <div class="modal-comments-section">
          <h4>Комментарии</h4>
          
          <!-- Форма добавления комментария -->
          <div class="new-comment-form">
            <textarea
              v-model="newCommentText"
              placeholder="Написать комментарий..."
              class="comment-textarea"
            ></textarea>
            <button 
              @click="postComment"
              :disabled="!newCommentText.trim()"
              class="comment-submit-btn"
            >
              Отправить
            </button>
          </div>

          <!-- Загрузка комментариев -->
          <div v-if="loadingComments" class="comments-loading">
            <div class="spinner"></div>
            Загрузка комментариев...
          </div>

          <!-- Список комментариев -->
          <div v-else class="comments-list">
            <div v-if="!comments.length" class="no-comments">
              Комментариев пока нет. Будьте первым!
            </div>
            
            <div v-for="comment in comments" :key="comment.id" class="comment" :class="{ 'has-replies': comment.replies.length }">
              <!-- Заголовок комментария -->
              <div class="comment-header">
                <img :src="comment.comment_owner.avatar" :alt="comment.comment_owner.name" class="comment-avatar" />
                <span class="comment-author">{{ comment.comment_owner.name }}</span>
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              </div>

              <!-- Содержимое комментария -->
              <div class="comment-content">{{ comment.content }}</div>

              <!-- Действия с комментарием -->
              <div class="comment-actions">
                <button 
                  v-if="!comment.deleted" 
                  @click="replyingTo = replyingTo === comment.id ? null : comment.id"
                  class="reply-btn"
                >
                  Ответить
                </button>
                <button 
                  v-if="currentUser && currentUser.id === comment.comment_owner.id && !comment.deleted"
                  @click="softDeleteComment(comment.id)"
                  class="delete-btn"
                >
                  Удалить
                </button>
              </div>

              <!-- Форма ответа -->
              <div v-if="replyingTo === comment.id" class="reply-form">
                <textarea
                  v-model="replyText"
                  :placeholder="`Ответить ${comment.comment_owner.name}...`"
                  class="reply-textarea"
                ></textarea>
                <button 
                  @click="postReply(comment.id)"
                  :disabled="!replyText.trim()"
                  class="reply-submit-btn"
                >
                  Отправить ответ
                </button>
              </div>

              <!-- Ответы на комментарий -->
              <div v-if="comment.replies.length" class="replies">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply">
                  <div class="comment-header">
                    <img :src="reply.comment_owner.avatar" :alt="reply.comment_owner.name" class="comment-avatar" />
                    <span class="comment-author">{{ reply.comment_owner.name }}</span>
                    <span class="comment-date">{{ formatDate(reply.created_at) }}</span>
                  </div>
                  
                  <div v-if="reply.reply_to" class="reply-to">
                    в ответ {{ reply.reply_to }}
                  </div>
                  
                  <div class="comment-content">{{ reply.content }}</div>
                  
                  <button 
                    v-if="currentUser && currentUser.id === reply.comment_owner.id && !reply.deleted"
                    @click="softDeleteComment(reply.id)"
                    class="delete-btn reply-delete-btn"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка закрытия -->
      <button class="modal-close" @click="$emit('close')">
        Закрыть
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import flowerImg from '@/assets/flower.png'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import api from '@/axios.js'

const router = useRouter()
const store = useStore()

const currentUser = computed(() => store.getters.user)

// Props
const props = defineProps({
  isVisible: { type: Boolean, default: false },
  project: { type: Object, default: null }
})

// Emits
const emit = defineEmits(['close'])

// Состояния
const ownerPost = ref(null)
const likeCount = ref(0)
const userLiked = ref(false)
const userFavorited = ref(false)

// Состояние комментариев
const comments = ref([])
const newCommentText = ref('')
const replyText = ref('')
const replyingTo = ref(null)
const loadingComments = ref(false)

// Кеш пользователей для комментариев
const usersCache = ref({})

// Утилита для получения количества лайков
async function fetchLikeCount(postId) {
  try {
    const res = await api.get('likes/count', { params: { model: 'post', id: postId } })
    return res.data.count ?? 0
  } catch {
    return 0
  }
}

// Получаем лайки и статус лайка
async function fetchLikes(postId) {
  likeCount.value = await fetchLikeCount(postId)
  try {
    const resUser = await api.get('likes', { params: { model: 'post', id: postId } })
    const arr = Array.isArray(resUser.data.like) ? resUser.data.like : []
    userLiked.value = arr.some(item => item.likeble_id === postId)
  } catch {
    userLiked.value = false
  }
}

// Переключение лайка
async function toggleLike() {
  if (!props.project) return
  const postId = props.project.id
  try {
    if (userLiked.value) {
      await api.delete('likes/delete', { params: { model: 'post', id: postId } })
    } else {
      await api.post('likes/create', { likeble_type: 'post', likeble_id: postId })
    }
    await fetchLikes(postId)
  } catch (e) {
    console.error('Ошибка toggleLike', e)
  }
}

// Получаем данные владельца
async function getOwnerPost(userId) {
  try {
    const owner = await api.get(`profile/user/${userId}`)
    ownerPost.value = owner.data
  } catch (e) {
    console.error('Ошибка getOwnerPost', e)
  }
}

function goToOwnerProfile(id) {
  router.push(`/profile/${id}`)
}

// Статус избранного
async function fetchFavoriteStatus(userId) {
  const token = localStorage.getItem('access_token')
  if (!token) {
    userFavorited.value = false
    return
  }

  try {
    const response = await api.get(`/favorites/${userId}`, {
      params: { model: 'post' },
    })

    const favoritedPosts = response.data.favorite || [];
    userFavorited.value = favoritedPosts.some(fav => fav.favoriteble_id == props.project.id);
  
  } catch (e) {
    console.error('Ошибка fetchFavoriteStatus:', e)
    userFavorited.value = false
  }
}

async function countViewsPost(postId) {
  try {
    const res = await api.get(`posts/count/${postId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
  } catch (e) {
    userFavorited.value = false
    console.error('Ошибка fetchFavoriteStatus', e)
  }
}

// Переключение избранного
async function toggleFavorite() {
  if (!props.project) return
  const postId = props.project.id
  const token = localStorage.getItem('access_token')
  if (!token) return

  try {
    if (userFavorited.value) {
      await api.delete('/favorites/delete', {
        params: { model: 'post', id: postId }
      });
      userFavorited.value = false;
    } else {
      await api.post('/favorites/create', {
        favoriteble_type: 'post',
        favoriteble_id: postId
      });
      userFavorited.value = true;
    }

    await fetchFavoriteStatus(currentUser.value.id)
  } catch (e) {
    console.error('Ошибка при изменении избранного:', e)
  }
}

// Функции для комментариев
async function getUserInfo(userId) {
  if (usersCache.value[userId]) {
    return usersCache.value[userId];
  }

  try {
    const res = await api.get(`/profile/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (!res.data || !res.data.name) {
      throw new Error('Некорректные данные пользователя');
    }

    const userData = {
      id: userId,
      name: res.data.name,
      avatar: res.data.avatar
        ? `${api.defaults.imageURL}/${res.data.avatar}`
        : flowerImg
    };

    usersCache.value[userId] = userData;
    return userData;
  } catch (err) {
    console.error(`Ошибка загрузки пользователя ${userId}`, err);
    return {
      id: userId,
      name: 'Неизвестный пользователь',
      avatar: flowerImg
    };
  }
}

async function fetchComments(postId) {
  loadingComments.value = true;

  try {
    const res = await api.get('/comments', {
      params: { model: 'post', id: postId }
    });

    const flatComments = res.data.comments || [];

    const userIds = new Set(flatComments.map(c => c.comment_owner));
    const userList = await Promise.all([...userIds].map(id => getUserInfo(id)));

    const userMap = {};
    userList.forEach(user => { userMap[user.id] = user; });

    const enriched = flatComments.map(comment => {
      const isDeleted = comment.deleted;
      const owner = userMap[comment.comment_owner];

      return {
        ...comment,
        comment_owner: isDeleted
          ? { id: comment.comment_owner, name: 'Удалено', avatar: flowerImg }
          : (owner || { id: comment.comment_owner, name: 'Неизвестный', avatar: flowerImg }),
        content: isDeleted ? 'Комментарий удалён' : comment.content,
        replies: [],
        reply_to: null
      };
    });

    const commentMap = {};
    enriched.forEach(c => { commentMap[c.id] = c; });

    const tree = [];
    enriched.forEach(comment => {
      if (comment.parent_comment) {
        const parent = commentMap[comment.parent_comment];
        if (parent) {
          comment.reply_to = parent.comment_owner.name;
          parent.replies.push(comment);
        } else {
          tree.push(comment);
        }
      } else {
        tree.push(comment);
      }
    });

    comments.value = tree;
  } catch (err) {
    console.error('Ошибка загрузки комментариев', err);
    comments.value = [];
  } finally {
    loadingComments.value = false;
  }
}

// Функция создания комментария
async function postComment() {
  if (!newCommentText.value.trim() || !props.project) return
  try {
    await api.post('/comments/create', {
      commentable_type: 'post',
      commentable_id: props.project.id,
      content: newCommentText.value
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    newCommentText.value = ''
    await fetchComments(props.project.id)
  } catch (err) {
    console.error('Ошибка отправки комментария', err)
  }
}

// Функция ответа на комментарий
async function postReply(commentId) {
  if (!replyText.value.trim() || !props.project) return
  try {
    await api.post('/comments/create', {
      commentable_type: 'post',
      commentable_id: props.project.id,
      content: replyText.value,
      parent_comment: commentId
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    replyText.value = ''
    replyingTo.value = null
    await fetchComments(props.project.id)
  } catch (err) {
    console.error('Ошибка отправки ответа', err)
  }
}

async function softDeleteComment(commentId) {
  try {
    await api.put(`comments/delete/soft/${commentId}`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    await fetchComments(props.project.id);
  } catch (err) {
    console.error('Ошибка при удалении комментария', err);
  }
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = parseISO(dateString)
    return format(date, 'd MMMM yyyy г.', { locale: ru })
  } catch {
    return dateString
  }
}

// Загружаем данные при открытии модалки
watch(() => props.project, (newProject) => {
  if (newProject) {
    countViewsPost(newProject.id)
    getOwnerPost(newProject.user_id)
    fetchLikes(newProject.id)
    fetchFavoriteStatus(currentUser.value.id)
    fetchComments(newProject.id)
  } else {
    // Сбрасываем состояние при закрытии
    likeCount.value = 0
    userLiked.value = false
    userFavorited.value = false
    ownerPost.value = null
    comments.value = []
    newCommentText.value = ''
    replyText.value = ''
    replyingTo.value = null
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed; 
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex; 
  justify-content: center; 
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: #fff; 
  padding: 30px; 
  border-radius: 12px;
  max-width: 600px; 
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 20px rgba(0,0,0,0.2);
  text-align: center;
}

.modal-img {
  width: 100%; 
  max-height: 300px;
  object-fit: cover; 
  margin-bottom: 20px; 
  border-radius: 8px;
}

.modal-title {
  font-size: 24px;
  margin-bottom: 10px;
}

.modal-description {
  font-size: 16px;
  color: #333;
  white-space: pre-wrap;
  text-align: left;
  margin-bottom: 20px;
}

.modal-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.modal-close {
  margin-top: 40px; 
  padding: 10px 20px;
  background: #333; 
  color: white; 
  border: none;
  border-radius: 8px; 
  cursor: pointer;
}

/* Блок избранного - закладка в левом верхнем углу */
.favorite-block {
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 1001;
}

.favorite-btn {
  background: rgba(0,0,0,0.7);
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  background: rgba(0,0,0,0.9);
  transform: scale(1.05);
}

.modal-img-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 8px;
}

.modal-hover-title {
  position: absolute;
  top: 50%; 
  left: 50%;
  transform: translate(-50%, -50%);
  color: white; 
  font-size: 24px; 
  font-weight: 600;
  text-align: center; 
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 10px; 
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.modal-img-wrapper:hover .modal-hover-title {
  opacity: 1; 
  pointer-events: auto;
}

.owner-block {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.owner-block:hover {
  background-color: #f8f9fa;
}

.owner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.owner-name {
  font-size: 16px;
  color: #333;
  text-decoration: underline;
}

/* Блок действий с контентом (лайки) - как в соцсетях */
.content-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.like-block {
  display: flex; 
  align-items: center; 
  gap: 8px;
  padding: 6px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.like-block:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.like-btn {
  background: none; 
  border: none; 
  cursor: pointer; 
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.like-btn:hover {
  background-color: rgba(255, 48, 64, 0.1);
  transform: scale(1.1);
}

.like-count { 
  font-size: 14px; 
  color: #495057; 
  font-weight: 500;
}

/* Стили для комментариев */
.modal-comments-section {
  margin-top: 20px;
  padding-top: 0;
  max-height: 400px;
  overflow-y: auto;
}

.modal-comments-section h4 {
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  text-align: left;
}

.new-comment-form {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-textarea {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
}

.comment-submit-btn {
  align-self: flex-start;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.comment-submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.comment-submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.comments-loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #007bff;
}

.comment.has-replies {
  border-left-color: #28a745;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-author {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.comment-date {
  font-size: 12px;
  color: #666;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.4;
  color: #444;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.reply-btn, .delete-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.reply-btn:hover {
  background-color: #e7f3ff;
}

.delete-btn {
  color: #dc3545;
}

.delete-btn:hover {
  background-color: #ffebee;
}

.reply-form {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

.reply-submit-btn {
  align-self: flex-start;
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.reply-submit-btn:hover:not(:disabled) {
  background-color: #1e7e34;
}

.reply-submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.replies {
  margin-top: 15px;
  margin-left: 20px;
  border-left: 2px solid #dee2e6;
  padding-left: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply {
  background: #ffffff;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.reply-to {
  font-size: 11px;
  color: #6c757d;
  font-style: italic;
}

.reply-delete-btn {
  margin-top: 5px;
  font-size: 11px;
}

.no-comments {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>