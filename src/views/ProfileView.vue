<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import api from '@/axios.js'
import flowerImg from '@/assets/flower.png'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/v1'

// Router & Store
const route = useRoute()
const router = useRouter()
const store = useStore()

// Reactive state
const projects = ref([])
const likedProjects = ref([])
const favoritedProjects = ref([])

const userName = ref('')
const userCreated = ref(null)
const profileUser = ref(null)
const profileViews = ref(0)

const subscriptionsCount = ref(0)
const subscribersCount = ref(0)

const selectedProject = ref(null)
const likeCount = ref(0)
const userLiked = ref(false)
const userFavorited = ref(false)

const loadingProfile = ref(false)
const loadingProjects = ref(false)
const loadingLiked = ref(false)
const loadingModal = ref(false)

const activeTab = ref('Проекты')

// Banner upload state
const bannerImage = ref(null)
const isDragOver = ref(false)
const fileInput = ref(null)

// Current user
const currentUser = store.getters.user || JSON.parse(localStorage.getItem('user'))
const currentUserId = currentUser?.id
const isMyProfile = ref(false)

// Utils
async function fetchLikeCount(postId) {
  try {
    const res = await api.get(`/likes/count`, { params: { model: 'post', id: postId } })
    return res.data.count ?? 0
  } catch {
    return 0
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

// 4) Fetch favorited projects
async function fetchFavoritedProjects() {
  try {
    const res = await api.get('/favorites', { params: { model: 'post', id: currentUserId }, headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
    const favs = Array.isArray(res.data.favorite) ? res.data.favorite : []
    const ids = favs.map(f => f.favoriteble_id)
    if (!ids.length) { favoritedProjects.value = []; return }
    const posts = await Promise.all(ids.map(id => api.get(`/posts/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }).then(r => r.data.data)))
    favoritedProjects.value = await Promise.all(posts.map(async p => ({ ...p, likeCount: await fetchLikeCount(p.id) })))
  } catch (err) {
    console.error('Ошибка при загрузке избранного', err)
    favoritedProjects.value = []
  }
}

// 5) Favorite status
async function fetchFavoriteStatus(postId) {
  try {
    const res = await api.get('/favorites', { params: { model: 'post', id: postId }, headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
    const arr = Array.isArray(res.data.favorite) ? res.data.favorite : []
    userFavorited.value = arr.some(item => item.favoriteble_id === postId)
  } catch {
    userFavorited.value = false
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
  if (!selectedProject.value) return
  const postId = selectedProject.value.id
  try {
    const headers = { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    if (userFavorited.value) await api.delete('/favorites/delete', { params: { model: 'post', id: postId }, headers })
    else await api.post('/favorites/create', { favoriteble_type: 'post', favoriteble_id: postId }, { headers })
    await fetchProjectModalData(postId)
    await fetchFavoritedProjects()
  } catch (err) {
    console.error(err)
  }
}

// Combined fetch for modal
async function fetchProjectModalData(postId) {
  loadingModal.value = true
  likeCount.value = await fetchLikeCount(postId)
  await Promise.all([fetchFavoriteStatus(postId), (async () => {
    try {
      const res = await api.get('/likes', { params: { model: 'post', id: postId }, headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
      const arr = Array.isArray(res.data.like) ? res.data.like : []
      userLiked.value = arr.some(item => item.likeble_id === postId)
    } catch {
      userLiked.value = false
    }
  })()])
  loadingModal.value = false
}

// Subscriptions
async function fetchSubscriptionsCount() {
  try {
    const res = await api.get('/subscriptions/subscriptions', { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
    subscriptionsCount.value = res.data.subscribtions?.length || 0
  } catch { subscriptionsCount.value = 0 }
}
async function fetchSubscribersCount() {
  try {
    const res = await api.get('/subscriptions/subscribers', { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } })
    subscribersCount.value = res.data.subscribers?.length || 0
  } catch { subscribersCount.value = 0 }
}

// Modal open/close
function openModal(p) { selectedProject.value = p; fetchProjectModalData(p.id) }
function closeModal() { selectedProject.value = null }

// Watch route param for user change
watch(() => route.params.userId, async (newId) => {
  const id = newId || 'me'
  await fetchProfile(id)
  await Promise.all([fetchUserProjects(id), fetchLikedProjects(), fetchFavoritedProjects(), fetchSubscriptionsCount(), fetchSubscribersCount()])
}, { immediate: true })

// Initial mount
onMounted(async () => {
  let userId = route.params.userId || 'me'
  if (!store.getters.isAuthenticated) { router.push('/login'); return }
  if (!route.params.userId) userId = currentUserId
  await fetchProfile(userId)
  await Promise.all([fetchUserProjects(userId), fetchLikedProjects(), fetchFavoritedProjects(), fetchSubscriptionsCount(), fetchSubscribersCount()])
})

function changeTab(tab) { activeTab.value = tab }
function triggerFileInput() { fileInput.value?.click() }
function handleBannerUpload(e) { const f = e.target.files[0]; if (f) bannerImage.value = URL.createObjectURL(f) }
function onDragOver() { isDragOver.value = true }
function onDragLeave() { isDragOver.value = false }
function onDrop(e) { isDragOver.value = false; const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) bannerImage.value = URL.createObjectURL(f) }

const tabs = computed(() => {
  const publicTabs = ['Проекты', 'Статистика']
  const privateTabs = ['Избранное', 'Понравившееся', 'Продвижение+', 'Черновики']
  return isMyProfile.value ? [...publicTabs, ...privateTabs] : publicTabs
})



</script>

<template>
  <div class="profile-container">
    <!-- Banner -->
    <div class="profile-banner" :class="{ 'drag-over': isDragOver }" :style="{ backgroundImage: bannerImage ? 'url(' + bannerImage + ')' : '' }" @click="triggerFileInput" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop">
      <div v-if="!bannerImage" class="banner-placeholder"><span>Добавить изображение баннера</span><small>Оптимальные размеры 3200 x 410px</small></div>
      <input ref="fileInput" type="file" accept="image/*" @change="handleBannerUpload" class="banner-upload"/>
    </div>

    <!-- Header -->
    <div class="profile-header">
      <img class="avatar" :src="flowerImg" alt="Avatar"/>
      <div class="info">
        <h2 v-if="loadingProfile"><div class="spinner"></div></h2>
        <h2 v-else>{{ userName }}</h2>
        <p>Подписки: <b>{{ subscriptionsCount }}</b> | Подписчики: <b>{{ subscribersCount }}</b></p>
        <p class="views-counter"><span>👁️ Просмотры профиля: <b>{{ profileViews }}</b></span></p>
        <div v-if="isMyProfile" class="buttons"><button class="edit">✏️ Редактировать профиль</button><button class="setup">⚙️ Настроить профиль <span class="tag">artenify+</span></button></div>
        <p class="reg-date">{{ formattedRegDate }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <nav class="profile-tabs">
      <span
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="changeTab(tab)"
      >
        {{ tab }}
      </span>
    </nav>


    <!-- Projects -->
    <div v-if="activeTab==='Проекты'" class="projects">
      <h3>Проекты</h3>
      <div v-if="loadingProjects" class="spinner"/>
      <div v-else class="project-grid">
        <div v-for="p in projects" :key="p.id" class="placeholder" @click="openModal(p)">
          <img v-if="p.images?.length" :src="`${api.defaults.imageURL}/${p.images[0].path}`" :alt="p.title" class="placeholder-img"/>
          <div v-else class="placeholder-img">Нет изображения</div>
          <div class="card-like-block">Лайки: {{ p.likeCount }}</div>
        </div>
      </div>
    </div>

    <!-- Favorites -->
    <div v-if="activeTab==='Избранное'" class="projects">
      <h3>Избранное</h3>
      <div v-if="favoritedProjects.length" class="project-grid">
        <div v-for="p in favoritedProjects" :key="p.id" class="placeholder" @click="openModal(p)">
          <img v-if="p.images?.length" :src="`${api.defaults.imageURL}/${p.images[0].path}`" :alt="p.title" class="placeholder-img"/>
          <div v-else class="placeholder-img">Нет изображения</div>
          <div class="card-like-block">Лайки: {{ p.likeCount }}</div>
        </div>
      </div>
      <div v-else class="tab-content">Пока нет избранного</div>
    </div>

    <!-- Liked -->
    <div v-if="activeTab==='Понравившееся'" class="projects">
      <h3>Понравившиеся проекты</h3>
      <div v-if="loadingLiked" class="spinner"/>
      <div v-else>
        <div v-if="likedProjects.length" class="project-grid">
          <div v-for="p in likedProjects" :key="p.id" class="placeholder" @click="openModal(p)">
            <img v-if="p.images?.length" :src="`${api.defaults.imageURL}/${p.images[0].path}`" :alt="p.title" class="placeholder-img"/>
            <div v-else class="placeholder-img">Нет изображения</div>
            <div class="card-like-block">Лайки: {{ p.likeCount }}</div>
          </div>
        </div>
        <div v-else class="tab-content">Пока нет лайков</div>
      </div>
    </div>

    <!-- Others Tabs... -->
    <div v-if="activeTab==='Продвижение+'" class="projects"><h3>Продвижение+</h3><div class="tab-content">Продвижение в разработке</div></div>
    <div v-if="activeTab==='Статистика'" class="projects"><h3>Статистика</h3><div class="tab-content">Статистика по проектам будет здесь</div></div>
    <div v-if="activeTab==='Черновики'" class="projects"><h3>Черновики</h3><div class="tab-content">Черновиков пока нет</div></div>

    <!-- Modal -->
    <div v-if="selectedProject" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="favorite-btn-top-left" @click="toggleFavorite">
          <span v-if="userFavorited">⭐</span><span v-else>☆</span>
        </button>
        <img v-if="selectedProject.images?.length" :src="`${api.defaults.imageURL}/${selectedProject.images[0].path}`" :alt="selectedProject.title" class="modal-img"/>
        <h2 class="modal-title">{{ selectedProject.title }}</h2>
        <p class="modal-description">{{ selectedProject.description || 'Нет описания' }}</p>
        <div class="like-block">
          <button class="like-btn" @click="toggleLike"><span v-if="userLiked">❤️</span><span v-else>🤍</span></button>
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
@keyframes spin {
  to { transform: rotate(360deg); }
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
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s;
}

.profile-banner.drag-over {
  background-color: rgba(255 255 255 / 0.1);
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

.profile-header {
  display: flex;
  padding: 1rem 5vw;
  align-items: flex-start;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1.5rem;
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

</style>
