<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import api from '@/axios.js'
import flowerImg from '@/assets/flower.png'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import ProjectModal from '@/components/ProjectModal.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1'

import AnalyticsTab from '@/components/AnalyticsTab.vue'

// Router & Store
const route = useRoute()
const router = useRouter()
const store = useStore()

// Reactive state
const userProjects = ref([])
const likedProjects = ref([])
const favoritedProjects = ref([])
const draftProjects = ref([])

const userName = ref('')
const userCreated = ref(null)
const profileUser = ref(null)
const profileViews = ref(0)

const profileSubscriptionsCount = ref(0)
const profileSubscribersCount = ref(0)

const selectedProject = ref(null)
const isModalOpen = ref(false)

const loadingProfile = ref(false)
const loadingProjects = ref(false)
const loadingFavorited = ref(false)
const loadingLiked = ref(false)
const loadingDraft = ref(false)

const activeTab = ref('Проекты')

// Banner upload state
const bannerImage = ref(null)
const isDragOver = ref(false)
const fileInput = ref(null)

// Avatar upload state
const avatarImage = ref(null)
const avatarImageStore = ref(null)
const avatarFileInput = ref(null)
const uploadingBanner = ref(false)
const uploadingAvatar = ref(false)

// Current user
const currentUser = store.getters.user || JSON.parse(localStorage.getItem('user'))
const currentUserId = currentUser?.id
const selectedUserId = ref(null)
const isMyProfile = ref(false)

// Subscription state
const isSubscribed = ref(false)

const comments = ref([])
const newCommentText = ref('')
const replyText = ref('')
const replyingTo = ref(null)
const loadingComments = ref(false)

// Utils
async function fetchLikeCount(postId) {
  try {
    const res = await api.get(`/likes/count`, { params: { model: 'post', id: postId } })
    return res.data.count ?? 0
  } catch {
    return 0
  }
}

// Subscription functions
async function fetchSubscriptionStatus(toUserId) {
  if (!currentUserId) return;
  try {
    const res = await api.get(`/subscriptions/subscription/check/${toUserId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    isSubscribed.value = res.data.isSubscribed;
  } catch (err) {
    console.error('Ошибка при проверке подписки', err);
    isSubscribed.value = false;
  }
}

async function subscribeToUser(toUserId) {
  try {
    await api.post(`/subscriptions/subscribe/${toUserId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    isSubscribed.value = true;
    await fetchProfileCounts(route.params.userId);
  } catch (err) {
    console.error('Ошибка при подписке', err);
  }
}

async function unsubscribeFromUser(toUserId) {
  try {
    await api.post(`/subscriptions/unsubscribe/${toUserId}`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    isSubscribed.value = false;
    await fetchProfileCounts(route.params.userId);
  } catch (err) {
    console.error('Ошибка при отписке', err);
  }
}

async function fetchProfileCounts(userId) {
  try {
    if (userId === currentUserId || userId === 'me') {
      const [subscrRes, subersRes] = await Promise.all([
        api.get('/subscriptions/subscriptions', { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }),
        api.get('/subscriptions/subscribers', { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
      ]);
      profileSubscriptionsCount.value = subscrRes.data.subscribtions?.length || 0;
      profileSubscribersCount.value = subersRes.data.subscribers?.length || 0;
    } else {
      const [subscrRes, subersRes] = await Promise.all([
        api.get(`/subscriptions/other?userId=${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }),
        api.get(`/subscribers/other?userId=${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
      ]);
      profileSubscriptionsCount.value = subscrRes.data.subscribtions?.length || 0;
      profileSubscribersCount.value = subersRes.data.subscribers?.length || 0;
    }
  } catch (err) {
    console.error('Ошибка при загрузке счетчиков', err);
  }
}

// 1) Profile info
async function fetchProfile(userId) {
  loadingProfile.value = true
  try {
    let url = userId === currentUserId || userId === 'me' ? '/profile/me' : `/profile/user/${userId}`
    isMyProfile.value = (url === '/profile/me')
    const res = await api.get(url, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
    profileUser.value = res.data
    userName.value = res.data.name
    userCreated.value = res.data.created_at || res.data.createdAt || res.data.createdAt
    profileViews.value = res.data.views ?? 0

    if (res.data.banner) {
      bannerImage.value = `${api.defaults.imageURL}/${res.data.banner}`
    }
    if (res.data.avatar) {
      avatarImage.value = `${api.defaults.imageURL}/${res.data.avatar}`
      avatarImageStore.value = res.data.avatar
    }

    // Загрузка статуса подписки для чужого профиля
    if (userId !== currentUserId && userId !== 'me') {
      await fetchSubscriptionStatus(profileUser.value.id);
    }

    // Загрузка счетчиков подписчиков
    await fetchProfileCounts(userId);
  } catch (err) {
    console.error('Ошибка при загрузке профиля:', err)
    userName.value = 'Не удалось загрузить профиль'
  } finally {
    loadingProfile.value = false
  }
}

const formattedRegDate = computed(() => {
  if (!userCreated.value) return 'Дата регистрации: неизвестна'
  try {
    const date = parseISO(userCreated.value)
    return `Дата регистрации: ${format(date, 'd MMMM yyyy г.', { locale: ru })}`
  } catch {
    return 'Дата регистрации: неизвестна'
  }
})

// 2) Fetch user projects
async function fetchUserProjects(userId) {
  loadingProjects.value = true
  try {
    const res = await api.get(`/users/${userId}/posts`, { params: { page: 1 } })
    let list = res.data.data || []
    // enrich with likes
    userProjects.value = await Promise.all(list.map(async p => ({ ...p, likeCount: await fetchLikeCount(p.id) })))
  } catch (err) {
    console.error(err)
  } finally {
    console.log(userProjects.value)
    loadingProjects.value = false
  }
}

async function fetchUserDraftProject() {
  loadingDraft.value = true
  try {
    const res = await api.get(`posts/me/drafts`)
    draftProjects.value = res.data.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loadingDraft.value = false
  }
}

// 3) Fetch liked projects
async function fetchLikedProjects(userId) {
  loadingLiked.value = true
  try {
    const res = await api.get('/likes', { params: { model: 'post', id: userId }, headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
    const likes = Array.isArray(res.data.like) ? res.data.like : []
    const ids = likes.map(l => l.likeble_id)
    if (!ids.length) { likedProjects.value = []; return }
    const arr = await Promise.all(ids.map(id => api.get(`/posts/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }).then(r => r.data.data)))
    likedProjects.value = await Promise.all(arr.map(async p => ({ ...p, likeCount: await fetchLikeCount(p.id) })))
  } catch (err) {
    console.error('Ошибка при загрузке понравившихся проектов', err)
    likedProjects.value = []
  } finally {
    loadingLiked.value = false
  }
}

async function fetchFavoritedProjects(userId) {
  loadingFavorited.value = true
  try {
    const response = await api.get(`/favorites/${userId}`, {
      params: { model: 'post' },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });

    const favoritedPosts = Array.isArray(response.data.favorite) ? response.data.favorite : [];

    const ids = favoritedPosts.map(f => f.favoriteble_id);
    if (!ids.length) {
      favoritedProjects.value = [];
      return;
    }

    const posts = await Promise.all(ids.map(post_id =>
      api.get(`/posts/${post_id}`, {
      }).then(r => r.data.data)
    ));

    favoritedProjects.value = await Promise.all(posts.map(async p => ({
      ...p,
      likeCount: await fetchLikeCount(p.id)
    })));
  } catch (err) {
    console.error('Ошибка при загрузке избранного', err);
    favoritedProjects.value = [];
  } finally {
    loadingFavorited.value = false
  }
}

const usersCache = ref({});

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

async function fetchComments(userId) {
  loadingComments.value = true;

  try {
    const res = await api.get('/comments', {
      params: { model: 'user', id: userId }
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
          tree.push(comment); // если не найден родитель, выводим как самостоятельный
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
  if (!newCommentText.value.trim()) return
  try {
    await api.post('/comments/create', {
      commentable_type: 'user',
      commentable_id: selectedUserId.value,
      content: newCommentText.value
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    newCommentText.value = ''
    await fetchComments(selectedUserId.value)
  } catch (err) {
    console.error('Ошибка отправки комментария', err)
  }
}

// Функция ответа на комментарий
async function postReply(commentId) {
  if (!replyText.value.trim()) return
  try {
    await api.post('/comments/create', {
      commentable_type: 'user',
      commentable_id: selectedUserId.value,
      content: replyText.value,
      parent_comment: commentId
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    })
    replyText.value = ''
    replyingTo.value = null
    await fetchComments(selectedUserId.value)
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

    await fetchComments(currentUserId);
  } catch (err) {
    console.error('Ошибка при удалении комментария', err);
  }
}

// Обработчики для баннера
function triggerFileInput() {
  if (isMyProfile.value) {
    fileInput.value?.click()
  }
}

function handleBannerUpload(e) {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) {
    // Показываем превью
    bannerImage.value = URL.createObjectURL(file)
    // Загружаем на сервер
    uploadBanner(file)
  }
}

function onDragOver(e) {
  if (isMyProfile.value) {
    e.preventDefault()
    isDragOver.value = true
  }
}

function onDragLeave(e) {
  if (isMyProfile.value) {
    e.preventDefault()
    isDragOver.value = false
  }
}

function onDrop(e) {
  if (isMyProfile.value) {
    e.preventDefault()
    isDragOver.value = false
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      // Показываем превью
      bannerImage.value = URL.createObjectURL(file)
      // Загружаем на сервер
      uploadBanner(file)
    }
  }
}

// Загрузка баннера
async function uploadBanner(file) {
  uploadingBanner.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/profile/banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    })

    console.log('Баннер успешно загружен:', response.data)
    // Обновляем профиль после успешной загрузки
    await fetchProfile(route.params.userId || currentUserId)
  } catch (error) {
    console.error('Ошибка при загрузке баннера:', error)
    alert('Ошибка при загрузке баннера')
  } finally {
    uploadingBanner.value = false
    currentUser.banner = bannerImage
    store.commit('setUser', currentUser)
  }
}

// Обработчики для аватара
function triggerAvatarInput() {
  if (isMyProfile.value) {
    avatarFileInput.value?.click()
  }
}

function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (file && file.type.startsWith('image/')) {
    // Показываем превью
    avatarImage.value = URL.createObjectURL(file)
    // Загружаем на сервер
    uploadAvatar(file)
  }
}

// Загрузка аватарки
async function uploadAvatar(file) {
  uploadingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })

    console.log('Аватар успешно загружен:', response.data)
    // Обновляем профиль после успешной загрузки
    await fetchProfile(route.params.userId || currentUserId)
  } catch (error) {
    console.error('Ошибка при загрузке аватара:', error)
    alert('Ошибка при загрузке аватара')
  } finally {
    currentUser.avatar = avatarImageStore.value
    store.commit('setUser', currentUser)
    uploadingAvatar.value = false
  }
}

function openModal(project) {
  selectedProject.value = project
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedProject.value = null
}

function changeTab(tab) { activeTab.value = tab }

watch(() => route.params.userId, async (newUserId) => {
  if (newUserId) {
    selectedUserId.value = newUserId;
    if (newUserId == currentUserId) {
      await fetchUserDraftProject();
    }
    await fetchProfile(newUserId),
    await Promise.all([
      fetchUserProjects(newUserId),
      fetchFavoritedProjects(newUserId),
      fetchLikedProjects(newUserId),
      fetchComments(newUserId)
    ]);
  }
}, { immediate: true });

watch(activeTab, async (newTab) => {
  if (newTab === 'Комментарии') {
    await fetchComments(selectedUserId.value)
  }
})

// Initial mount
onMounted(async () => {
  let userId = route.params.userId || 'me'
  if (!store.getters.isAuthenticated) { router.push('/login'); return }
  if (!route.params.userId) {
    userId = currentUserId
    await fetchUserDraftProject()
  }
  selectedUserId.value = userId;
  await fetchProfile(userId)
  await Promise.all([
    fetchUserProjects(userId),
    fetchFavoritedProjects(userId),
    fetchLikedProjects(userId),
    fetchComments(userId),
  ])
})

const tabs = computed(() => {
  const publicTabs = ['Проекты', 'Избранное', 'Понравившееся', 'Комментарии', 'Статистика']
  const privateTabs = ['Продвижение+', 'Черновики']
  return isMyProfile.value ? [...publicTabs, ...privateTabs] : publicTabs
})

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = parseISO(dateString)
    return format(date, 'd MMMM yyyy г.', { locale: ru })
  } catch {
    return dateString
  }
}
</script>

<template>
  <div class="profile-container">
    <!-- Banner -->
    <div class="profile-banner" :class="{ 'drag-over': isDragOver, 'clickable': isMyProfile }"
      :style="{ backgroundImage: bannerImage ? `url(${bannerImage})` : '' }" @click="triggerFileInput"
      @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
      <div v-if="!bannerImage && isMyProfile" class="banner-placeholder">
        <span>Добавить изображение баннера</span>
        <small>Оптимальные размеры 3200 x 410px</small>
      </div>
      <div v-if="uploadingBanner" class="upload-overlay">
        <div class="spinner"></div>
        <span>Загрузка баннера...</span>
      </div>
      <input ref="fileInput" type="file" accept="image/*" @change="handleBannerUpload" class="banner-upload" />
    </div>

    <!-- Header -->
    <div class="profile-header">
      <div class="avatar-container" :class="{ 'clickable': isMyProfile }" @click="triggerAvatarInput">
        <img class="avatar" :src="avatarImage || flowerImg" alt="Avatar" />
        <div v-if="isMyProfile" class="avatar-overlay">
          <span class="camera-icon">📷</span>
        </div>
        <div v-if="uploadingAvatar" class="avatar-upload-overlay">
          <div class="spinner small"></div>
        </div>
        <input ref="avatarFileInput" type="file" accept="image/*" @change="handleAvatarUpload" class="avatar-upload" />
      </div>

      <div class="info">
        <h2 v-if="loadingProfile">
          <div class="spinner"></div>
        </h2>
        <h2 v-else>{{ userName }}</h2>
        <p>Подписки: <b>{{ profileSubscriptionsCount }}</b> | Подписчики: <b>{{ profileSubscribersCount }}</b></p>
        <p class="views-counter"><span>👁️ Просмотры профиля: <b>{{ profileViews }}</b></span></p>

        <!-- Кнопки для своего профиля -->
        <div v-if="isMyProfile" class="buttons">
          <button class="edit">✏️ Редактировать профиль</button>
          <button class="setup">⚙️ Настроить профиль <span class="tag">artenify+</span></button>
        </div>

        <!-- Кнопка подписки для чужого профиля -->
        <div v-else class="buttons">
          <button v-if="!isSubscribed" @click="subscribeToUser(profileUser.id)" class="subscribe-btn">
            Подписаться
          </button>
          <button v-else @click="unsubscribeFromUser(profileUser.id)" class="unsubscribe-btn">
            Отписаться
          </button>
        </div>

        <p class="reg-date">{{ formattedRegDate }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <nav class="profile-tabs">
      <span v-for="tab in tabs" :key="tab" :class="{ active: activeTab === tab }" @click="changeTab(tab)">
        {{ tab }}
      </span>
    </nav>

    <!-- Projects -->
    <div v-if="activeTab === 'Проекты'" class="projects">
      <h3>Проекты</h3>
      <div v-if="loadingProjects" class="spinner"/>
      <div v-else>
        <div v-if="userProjects.length" class="project-grid">
          <div v-for="p in userProjects" :key="p.id" class="placeholder" @click="openModal(p)">
            <img v-if="p.images?.length" :src="`${api.defaults.imageURL}/${p.images[0].path}`" :alt="p.title"
              class="placeholder-img" />
            <div v-else class="placeholder-img">Нет изображения</div>
            <div class="card-like-block">Лайки: {{ p.likeCount }}</div>
          </div>
        </div>
        <div v-else class="tab-content">Пока нет проектов</div>
      </div>
    </div>

    <!-- Favorites -->
    <div v-if="activeTab === 'Избранное'" class="projects">
      <h3>Избранное</h3>
      <div v-if="loadingFavorited" class="spinner"/>
      <div v-else>
        <div v-if="favoritedProjects.length" class="project-grid">
          <div v-for="p in favoritedProjects" :key="p.id" class="placeholder" @click="openModal(p)">
            <img v-if="p.images?.length" :src="`${api.defaults.imageURL}/${p.images[0].path}`" :alt="p.title"
              class="placeholder-img" />
            <div v-else class="placeholder-img">Нет изображения</div>
            <div class="card-like-block">Лайки: {{ p.likeCount }}</div>
          </div>
        </div>
        <div v-else class="tab-content">Пока нет избранного</div>
      </div>
    </div>

    <!-- Liked -->
    <div v-if="activeTab === 'Понравившееся'" class="projects">
      <h3>Понравившиеся проекты</h3>
      <div v-if="loadingLiked" class="spinner"/>
      <div v-else>
        <div v-if="likedProjects.length" class="project-grid">
          <div v-for="p in likedProjects" :key="p.id" class="placeholder" @click="openModal(p)">
            <img v-if="p.images?.length" :src="`${api.defaults.imageURL}/${p.images[0].path}`" :alt="p.title"
              class="placeholder-img" />
            <div v-else class="placeholder-img">Нет изображения</div>
            <div class="card-like-block">Лайки: {{ p.likeCount }}</div>
          </div>
        </div>
        <div v-else class="tab-content">Пока нет лайков</div>
      </div>
    </div>

    <!-- Комментарии -->
    <div v-if="activeTab === 'Комментарии'" class="comments-section">
      <h3>Комментарии</h3>

      <div v-if="currentUserId" class="new-comment-form">
        <textarea v-model="newCommentText" placeholder="Оставьте комментарий..."></textarea>
        <button class="comment-btn" @click="postComment" :disabled="!newCommentText.trim()">Отправить</button>
      </div>

      <div v-if="loadingComments" class="spinner">
        <div v-if="comments.length" class="comments-list">
          <div v-for="comment in comments" :key="comment.id" class="comment"
            :class="{ 'has-replies': comment.replies && comment.replies.length }">
            <div class="comment-header">
              <img :src="comment.comment_owner.avatar" class="comment-avatar" />
              <div>
                <div class="comment-author">{{ comment.comment_owner.name }}</div>
                <div class="comment-date">{{ formatDate(comment.created_at) }}</div>
              </div>
            </div>
            <div class="comment-content">{{ comment.content }}</div>

            <button v-if="currentUserId && comment.content !== 'Комментарий удалён'"
              @click="replyingTo = replyingTo === comment.id ? null : comment.id" class="reply-btn">
              Ответить
            </button>

            <button v-if="currentUserId === comment.comment_owner.id && comment.content !== 'Комментарий удалён'"
              @click="softDeleteComment(comment.id)" class="delete-btn">
              Удалить
            </button>

            <div v-if="replyingTo === comment.id" class="reply-form">
              <textarea v-model="replyText" placeholder="Ваш ответ..."></textarea>
              <button @click="postReply(comment.id)" :disabled="!replyText.trim()">Отправить ответ</button>
            </div>

            <div v-if="comment.replies.length" class="replies">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply">
                <div class="comment-header">
                  <img :src="reply.comment_owner.avatar" class="comment-avatar" />
                  <div>
                    <div class="comment-author">{{ reply.comment_owner.name }}</div>
                    <div class="reply-to" v-if="reply.reply_to">в ответ пользователю {{ reply.reply_to }}</div>
                    <div class="comment-date">{{ formatDate(reply.created_at) }}</div>
                  </div>
                </div>
                <div class="comment-content">{{ reply.content }}</div>

                <button v-if="currentUserId === reply.comment_owner.id && reply.content !== 'Комментарий удалён'"
                  @click="softDeleteComment(reply.id)" class="delete-btn">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-comments">Пока нет комментариев</div>
    </div>

    <!-- Others Tabs... -->
    <div v-if="activeTab === 'Продвижение+'" class="projects">
      <h3>Продвижение+</h3>
      <div class="tab-content">Продвижение в разработке</div>
    </div>
    <AnalyticsTab v-if="activeTab === 'Статистика'" />
    <div v-if="activeTab === 'Черновики' && selectedUserId === currentUserId" class="projects">
      <h3>Черновики</h3>
      <div v-if="loadingDraft" class="spinner" />
      <div v-else>
        <div v-if="draftProjects.length" class="project-grid">
          <div v-for="p in draftProjects" :key="p.id" class="placeholder" @click="openModal(p)">
            <img v-if="p.images?.length" :src="`${api.defaults.imageURL}/${p.images[0].path}`" :alt="p.title"
              class="placeholder-img" />
            <div v-else class="placeholder-img">Нет изображения</div>
          </div>
        </div>
        <div v-else class="tab-content">Черновиков пока нет</div>
      </div>
    </div>

    <!-- Modal -->
    <ProjectModal 
    :isVisible="isModalOpen" 
    :project="selectedProject" 
    @close="closeModal" 
    @likedUpdate="fetchLikedProjects"
    @favoritedUpdate="fetchFavoritedProjects"
    />
  </div>
</template>

<style scoped>
.profile-container {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  font-family: sans-serif;
  color: #333;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #a32aa1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

.spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.profile-banner {
  background: linear-gradient(#3a3a3a, #222);
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 0 5vw;
  box-sizing: border-box;
  position: relative;
  user-select: none;
  transition: background-color 0.3s;
  background-size: cover;
  background-position: center;
}

.profile-banner.clickable {
  cursor: pointer;
}

.profile-banner.drag-over {
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px dashed #a32aa1;
}

.banner-placeholder span {
  font-size: 18px;
  font-weight: 600;
}

.banner-placeholder small {
  display: block;
  font-size: 12px;
  margin-top: 4px;
}

.banner-upload {
  display: none;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 10px;
}

.profile-header {
  display: flex;
  padding: 1rem 5vw;
  align-items: flex-start;
}

.avatar-container {
  position: relative;
  margin-right: 1.5rem;
}

.avatar-container.clickable {
  cursor: pointer;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  transition: opacity 0.3s;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 24px;
  color: white;
}

.avatar-upload {
  display: none;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info h2 {
  font-size: 24px;
  margin: 0;
}

.buttons {
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
}

.edit,
.setup {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.edit {
  background: #f4b5dd;
  color: #111;
}

.setup {
  background: #3a0f3f;
  color: white;
}

.setup .tag {
  background: #ce3ad8;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  margin-left: 5px;
}

.profile-tabs {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 5vw;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.profile-tabs span {
  cursor: pointer;
  color: #555;
  white-space: nowrap;
}

.profile-tabs .active {
  color: #a32aa1;
  font-weight: bold;
}

.projects {
  padding: 0 5vw 2rem;
}

.project-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.placeholder {
  width: 250px;
  height: 250px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.placeholder-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #eee;
}

.card-like-block {
  position: absolute;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4px 8px;
  font-size: 14px;
}

.tab-content {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.comments-section {
  padding: 0 5vw 2rem;
}

.new-comment-form {
  margin-bottom: 20px;
}

.new-comment-form textarea,
.reply-form textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.comment {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.comment-btn {
  background: linear-gradient(135deg, #ff69b4, #f8a5c2);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  position: relative;
  overflow: hidden;
}

.comment-btn:disabled {
  background: linear-gradient(135deg, #d2d2d2, #b9b9b9);
  color: black;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  position: relative;
  overflow: hidden;
}

.comment.has-replies {
  border-left: 3px solid #a32aa1;
  background-color: #fdf7fd;
}

.reply {
  margin-top: 10px;
  padding-left: 20px;
  border-left: 2px solid #ddd;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.comment-author {
  font-weight: bold;
}

.comment-date {
  font-size: 12px;
  color: #777;
}

.reply-to {
  font-size: 12px;
  color: #999;
  margin-top: -6px;
}

.comment-content {
  margin-bottom: 10px;
}

.reply-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  margin-right: 10px;
}

.reply-btn {
  color: #a32aa1;
}

.delete-btn {
  color: #dc3545;
}

.reply-form {
  margin-top: 10px;
}

.no-comments {
  text-align: center;
  color: #777;
  padding: 20px;
}

.subscribe-btn {
  background: linear-gradient(135deg, #ff69b4, #f8a5c2);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  position: relative;
  overflow: hidden;
}

.subscribe-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://www.transparenttextures.com/patterns/asfalt-light.png');
  opacity: 0.2;
  pointer-events: none;
}

.unsubscribe-btn {
  background: #e24373;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
</style>