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
        <div v-if="loadingExperts" class="loading">Loading experts choices...</div>
        <ol v-else>
          <li
            v-for="(post, index) in expertPosts"
            :key="post.id"
            class="flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-100"
            @click="goToOwnerProfile(post.user_id)"
          >
            <span class="rank">{{ index + 1 }} -</span>
            <img
              v-if="post.user_avatar"
              :src="post.user_avatar.startsWith('http') ? post.user_avatar : `${api.defaults.imageURL}/${post.user_avatar}`"
              class="avatar w-6 h-6 rounded-full object-cover"
            />
            <div v-else class="owner-avatar w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
              <span class="text-xs text-gray-600">No photo</span>
            </div>
            <span class="text-sm">{{ post.user_name || post.user_email }}</span>
          </li>
          <li v-if="expertPosts.length === 0" class="text-sm text-gray-500">Эксперты еще не сделали выбор</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/axios.js'

const router = useRouter()
const users = ref([])
const expertPosts = ref([])
const perPage = 14
const currentPage = ref(1)
const loading = ref(true)
const loadingExperts = ref(true)

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
function goToOwnerProfile(userId) {
  router.push({ name: 'Profile', params: { userId } })
}

function getRank(index) {
  const absoluteIndex = (currentPage.value - 1) * perPage + index
  return `#${absoluteIndex + 1}`
}

async function fetchTopUsers() {
  try {
    loading.value = true
    
    const postsResponse = await api.get('posts', {
      params: {
        page: 1,
        per_page: 100
      }
    })
    
    const userIds = [...new Set(postsResponse.data.data.map(post => post.user_id))]
    
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
    
    users.value = userResponses
      .filter(user => user !== null)
      .sort((a, b) => b.views - a.views)
      .slice(0, 100)
    
  } catch (error) {
    console.error('Error fetching top users:', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

async function fetchExpertVotes() {
  try {
    loadingExperts.value = true
    expertPosts.value = []

    const votesResponse = await api.get('/honored-posts')
    const votes = votesResponse.data

    const postPromises = votes.map(async vote => {
      try {
        const postResponse = await api.get(`posts/${vote.post_id}`)
        const post = postResponse.data.data
        
        const userResponse = await api.get(`profile/user/${post.user_id}`)
        const user = userResponse.data
        
        return {
          id: post.id,
          user_id: post.user_id,
          user_name: user.name,
          user_email: user.email,
          user_avatar: user.avatar
        }
      } catch (error) {
        console.error(`Error processing post ${vote.post_id}:`, error)
        return null
      }
    })

    const posts = await Promise.all(postPromises)
    
    expertPosts.value = posts
      .filter(post => post !== null)
      .reduce((unique, post) => {
        if (!unique.some(p => p.user_id === post.user_id)) {
          unique.push(post)
        }
        return unique
      }, [])
      .slice(0, 10)

  } catch (error) {
    console.error('Error fetching expert votes:', error)
  } finally {
    loadingExperts.value = false
  }
}

onMounted(() => {
  fetchTopUsers()
  fetchExpertVotes()
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