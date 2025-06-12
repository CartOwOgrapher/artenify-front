<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import api from '@/axios.js'
import flowerImg from '@/assets/flower.png'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1'

import AnalyticsTab from '@/components/AnalyticsTab.vue'


// Router & Store
const route = useRoute()
const router = useRouter()
const store = useStore()

// Reactive state
const projects = ref([])
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
const likeCount = ref(0)
const userLiked = ref(false)
const userFavorited = ref(false)

const loadingProfile = ref(false)
const loadingProjects = ref(false)
const loadingLiked = ref(false)
const loadingModal = ref(false)
const loadingDraft = ref(false)

const activeTab = ref('Проекты')

// Banner upload state
const bannerImage = ref(null)
const isDragOver = ref(false)
const fileInput = ref(null)

// Avatar upload state (новое)
const avatarImage = ref(null)
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
    projects.value = await Promise.all(list.map(async p => ({ ...p, likeCount: await fetchLikeCount(p.id) })))
  } catch (err) {
    console.error(err)
  } finally {
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
async function fetchLikedProjects() {
  loadingLiked.value = true
  try {
    const res = await api.get('/likes', { params: { model: 'post', id: currentUserId }, headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
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
  try {
    const response = await api.get(`/favorites/${userId}`, {
      params: { model: 'post' },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });

    const favoritedPosts = Array.isArray(response.data.favorite) ? response.data.favorite : [];

    const ids = favoritedPosts.map(f => f.favoriteble_id); // используем entity_id
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
  }
}

// 6) Toggle like
async function toggleLike() {
  if (!selectedProject.value) return
  const postId = selectedProject.value.id
  try {
    const headers = { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    if (userLiked.value) await api.delete('/likes/delete', { params: { model: 'post', id: postId }, headers })
    else await api.post('/likes/create', { likeble_type: 'post', likeble_id: postId }, { headers })
    await fetchProjectModalData(postId)
  } catch (err) {
    console.error(err)
  }
}

// 7) Toggle favorite
async function toggleFavorite() {
  if (!selectedProject.value) return;
  const postId = selectedProject.value.id;

  try {
    const headers = { Authorization: `Bearer ${localStorage.getItem('access_token')}` };
    if (userFavorited.value) {
      // Удалить из избранного
      await api.delete('/favorites/delete', {
        params: {
          model: 'post',
          id: postId
        }
      });
      userFavorited.value = false;
    } else {
      // Добавить в избранное
      await api.post('/favorites/create', {
        favoriteble_type: 'post',
        favoriteble_id: postId
      });
      userFavorited.value = true;
    }

    // Обновляем список "Избранное"
    await fetchFavoritedProjects(selectedUserId.value);

  } catch (err) {
    console.error('Ошибка при изменении избранного:', err);
    alert('Не удалось изменить статус избранного');
  }
}

// Combined fetch for modal
async function fetchProjectModalData(postId) {
  loadingModal.value = true;
  likeCount.value = await fetchLikeCount(postId);
  try {
    const res = await api.get('/likes', {
      params: { model: 'post', id: postId },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    const likes = Array.isArray(res.data.like) ? res.data.like : [];
    userLiked.value = likes.some(item => item.likeble_id === postId);
  } catch {
    userLiked.value = false;
  }

  // Проверяем, есть ли пост в избранном
  try {
    const res = await api.get(`/favorites/${currentUserId}`, {
      params: { model: 'post' },
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    });
    const favorited = res.data.favorite || [];
    userFavorited.value = favorited.some(fav => fav.favoriteble_id == postId);
  } catch {
    userFavorited.value = false;
  }
  loadingModal.value = false;
}

// Modal open/close
function openModal(p) { selectedProject.value = p; fetchProjectModalData(p.id) }
function closeModal() { selectedProject.value = null }

// === НОВЫЕ ФУНКЦИИ ДЛЯ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ ===

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
    currentUser.avatar = avatarImage
    store.commit('setUser', currentUser)
    uploadingAvatar.value = false
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

watch(() => route.params.userId, async (newUserId) => {
  if (newUserId) {
    selectedUserId.value = newUserId;
    if (newUserId == currentUserId) {
      await fetchUserDraftProject();
    }

    await Promise.all([
      fetchFavoritedProjects(newUserId),
      fetchProfile(newUserId),
      fetchUserProjects(newUserId),
      fetchLikedProjects(),
    ]);
  }
}, { immediate: true });

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
    fetchLikedProjects(),
    fetchFavoritedProjects(userId)])
})

function changeTab(tab) { activeTab.value = tab }

const tabs = computed(() => {
  const publicTabs = ['Проекты', 'Статистика', 'Избранное', 'Понравившееся']
  const privateTabs = ['Продвижение+', 'Черновики']
  return isMyProfile.value ? [...publicTabs, ...privateTabs] : publicTabs
})
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
      <div v-if="loadingProjects" class="spinner" />
      <div v-else class="project-grid">
        <div v-for="p in projects" :key="p.id" class="placeholder" @click="openModal(p)">
          <img v-if="p.images?.length" :src="`${api.defaults.imageURL}/${p.images[0].path}`" :alt="p.title"
            class="placeholder-img" />
          <div v-else class="placeholder-img">Нет изображения</div>
          <div class="card-like-block">Лайки: {{ p.likeCount }}</div>
        </div>
      </div>
    </div>

    <!-- Favorites -->
    <div v-if="activeTab === 'Избранное'" class="projects">
      <h3>Избранное</h3>
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

    <!-- Liked -->
    <div v-if="activeTab === 'Понравившееся'" class="projects">
      <h3>Понравившиеся проекты</h3>
      <div v-if="loadingLiked" class="spinner" />
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
    <div v-if="selectedProject" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button v-if="activeTab !== 'Черновики'" class="favorite-btn-top-left" @click="toggleFavorite">
          <span v-if="userFavorited">⭐</span><span v-else>☆</span>
        </button>

        <img v-if="selectedProject.images?.length" :src="`${api.defaults.imageURL}/${selectedProject.images[0].path}`"
          :alt="selectedProject.title" class="modal-img" />

        <h2 class="modal-title">{{ selectedProject.title }}</h2>
        <p class="modal-description">{{ selectedProject.description || 'Нет описания' }}</p>

        <!-- Исправленный блок лайков (без дублирования) -->
        <div v-if="activeTab !== 'Черновики'" class="like-block">
          <button class="like-btn" @click="toggleLike">
            <span v-if="userLiked">❤️</span>
            <span v-else>🤍</span>
          </button>
          <span class="like-count">{{ likeCount }}</span>
        </div>

        <button class="modal-close" @click="closeModal">Закрыть</button>
      </div>
    </div>
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

.project-card {
  width: 250px;
  height: 250px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

.project-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-title {
  position: absolute;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 100%;
  padding: 8px;
  font-weight: bold;
  text-align: center;
}

/* --- Добавленные стили --- */
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
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
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
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
}

.like-block {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.like-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
}

.subscribe-btn {
  background: #4CAF50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.unsubscribe-btn {
  background: #f44336;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.like-count {
  font-size: 16px;
  color: #333;
}

.modal-close {
  margin-top: 40px;
  padding: 10px 20px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.favorite-btn-top-left {
  position: absolute;
  top: 16px;
  left: 16px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
}

.favorite-btn-top-left:hover {
  transform: scale(1.1);
}

.tab-content {
  text-align: center;
  color: #666;
  padding: 2rem;
}
</style>