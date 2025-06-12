<template>
  <div class="component-wrapper">
    <div class="container">
      <!-- Левая колонка: ТОП по просмотрам -->
      <div class="card card-top">
        <h2>ТОП по просмотрам</h2>
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else>
          <ol>
            <li
              v-for="(user, index) in paginated"
              :key="user.id"
              class="owner-block flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-100"
              @click="goToOwnerProfile(user.id)"
            >
              <span class="rank">{{ getRank(index) }}</span>
              <img
                v-if="user.avatar"
                :src="`${api.defaults.imageURL}/${user.avatar}`"
                class="avatar w-8 h-8 rounded-full object-cover"
              />
              <div v-else class="owner-avatar w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span class="text-xs text-gray-600">No photo</span>
              </div>
              <div>
                <div class="owner-name font-medium">{{ user.name || user.email }}</div>
                <div class="text-xs text-gray-500">views: {{ user.views }}</div>
              </div>
            </li>
          </ol>
          <div class="pager">
            <button class="pager-btn" @click="prevPage" :disabled="currentPage === 1">&laquo;</button>
            <span class="pager-current">page {{ currentPage }} / {{ totalPages }}</span>
            <button class="pager-btn" @click="nextPage" :disabled="currentPage === totalPages">&raquo;</button>
          </div>
        </div>
      </div>

      <!-- Центр: Голосование -->
      <div class="card card-vote">
        <h2>ГОЛОСОВАНИЕ</h2>
        <p class="note">*Доступно только экспертам и подписчикам Arterify+</p>
        <button class="vote-btn"><router-link to="/" class="vote-btn">ВЫБРАТЬ ЛУЧШЕГО</router-link></button>
      </div>

      <!-- Правая колонка: Выбор экспертов -->
      <div class="card card-expert">
        <h2>Выбор экспертов</h2>
        <ol>
          <li>7 -</li>
          <li>8 -</li>
          <li>9 -</li>
          <li>10 -</li>
          <li v-for="i in 6" :key="i">---</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios.js'

const users = ref([])
const perPage = 14
const currentPage = ref(1)
const loading = ref(true)
const router = useRouter()

const totalPages = computed(() => Math.ceil(users.value.length / perPage))
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return users.value.slice(start, start + perPage)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function goToOwnerProfile(id) {
  router.push({ name: 'Profile', params: { userId: id } })
}

function getRank(index) {
  const absoluteIndex = (currentPage.value - 1) * perPage + index
  return `#${absoluteIndex + 1}`
}

async function fetchTopUsers() {
  try {
    loading.value = true
    
    // First get all posts to collect user IDs
    const postsResponse = await api.get('posts', {
      params: {
        page: 1,
        per_page: 100 // Adjust based on how many users you want to consider
      }
    })
    
    // Extract unique user IDs from posts
    const userIds = [...new Set(postsResponse.data.data.map(post => post.user_id))]
    
    // Then fetch each user's profile with views count
    const userPromises = userIds.map(userId => 
      api.get(`profile/user/${userId}`)
        .then(response => {
          const user = response.data
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            views: user.views || 0,
            avatar: user.avatar
          }
        })
        .catch(error => {
          console.error(`Error fetching user ${userId}:`, error)
          return null
        })
    )
    
    const userResponses = await Promise.all(userPromises)
    
    // Filter out null responses and sort by views
    users.value = userResponses
      .filter(user => user !== null)
      .sort((a, b) => b.views - a.views)
      .slice(0, 100) // Limit to top 100 users
    
  } catch (error) {
    console.error('Error fetching top users:', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTopUsers()
})
</script>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.component-wrapper {
  position: relative;
  z-index: 15;
  background-color: #fff4f6;
  padding: 24px;
}

.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  background-color: #fff4f3;
  border-radius: 16px;
  padding: 24px;
  box-sizing: border-box;
}

.card {
  position: relative;
  z-index: 15;
  flex: 1 1 calc(33% - 16px);
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
}

.card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.card-top h2   { color: #5c6ac4; }
.card-vote h2  { color: #db2777; text-align: center; }
.card-expert h2{ color: #059669; text-align: center; }

.card ol {
  list-style: none;
  color: #374151;
  margin-bottom: 16px;
  padding-left: 0;
}
.card ol li {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank {
  font-weight: bold;
  min-width: 30px;
  color: #5c6ac4;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

.pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 16px;
}
.pager-btn {
  padding: 4px 10px;
  background: #e0e7ff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.pager-btn:hover { background: #c7d2fe; }
.pager-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pager-current { font-weight: 500; }

.note {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 12px;
  text-align: center;
}
.subtitle {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 20px;
  text-align: center;
}
.vote-btn {
  display: block;
  margin: 0 auto;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background-color: #db2777;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(219,39,119,0.4);
  transition: background 0.2s, transform 0.2s;
}
.vote-btn:hover {
  background-color: #be185d;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .container { flex-direction: column; }
  .card { flex: 1 1 100%; }
}
</style>