<template>
  <div class="analytics-container">
    <!-- Фильтр по периоду -->
    <div class="date-filter">
  <div class="date-input-wrapper">
    <label>Начало</label>
    <input type="date" v-model="startDate" />
  </div>
  <div class="date-input-wrapper">
    <label>Конец</label>
    <input type="date" v-model="endDate" />
  </div>
  <button @click="loadData">Применить</button>
</div>

    <!-- Основные метрики -->
    <div class="metrics">
      <div class="metric-card">
        <h4>Просмотры</h4>
        <div class="metric-value">{{ analytics.views }}</div>
      </div>
      <div class="metric-card">
        <h4>Лайки</h4>
        <div class="metric-value">{{ analytics.likesCount }}</div>
      </div>
      <div class="metric-card">
        <h4>Избранное</h4>
        <div class="metric-value">{{ analytics.favoritesCount }}</div>
      </div>
      <div class="metric-card">
        <h4>Подписки</h4>
        <div class="metric-value">{{ analytics.subscriptionsCount }}</div>
      </div>
    </div>

    <!-- График активности -->
    <div class="chart-container">
      <apex-chart
        v-if="series.length > 0"
        :series="series"
        :options="chartOptions"
        type="line"
        height="350"
      />
    </div>

    <!-- Топ посты -->
    <div class="top-posts" v-if="analytics.topPosts?.length">
      <h3>Топ посты</h3>
      <div class="top-posts-grid">
        <div v-for="(post, index) in analytics.topPosts" :key="post.id" class="top-post-card">
          <div class="post-rank">#{{ index + 1 }}</div>
          <img 
            v-if="post.images?.length"
            :src="`${api.defaults.imageURL}/${post.images[0]?.path}`" 
            class="post-image" 
            alt="Post image"
          />
          <div v-else class="post-image-placeholder">No image</div>
          <div class="post-info">
            <div class="post-title">{{ post.title }}</div>
            <div class="post-metrics">
              <span>👁️ {{ post.views }}</span>
              <span>❤️ {{ post.likes.length }}</span>
              <span>⭐ {{ post.favorites.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/axios'
import type { ApexOptions } from 'apexcharts'
import VueApexCharts from 'vue3-apexcharts'

// Типы данных
interface PostImage {
  path: string;
}

interface AnalyticsPost {
  id: string;
  title: string;
  views: number;
  likeCount: number;
  favoritesCount: number;
  images?: PostImage[];
}

interface AnalyticsData {
  views: number;
  likesCount: number;
  favoritesCount: number;
  subscriptionsCount: number;
  topPosts?: AnalyticsPost[];
  likesByDay?: Record<string, number>;
  favoritesByDay?: Record<string, number>;
  subscriptionsByDay?: Record<string, number>;
}

const ApexChart = VueApexCharts

const route = useRoute()

// Данные
const analytics = ref<AnalyticsData>({
  views: 0,
  likesCount: 0,
  favoritesCount: 0,
  subscriptionsCount: 0,
  topPosts: [],
})

const series = ref<ApexAxisChartSeries>([])
const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'line',
    height: 350,
    toolbar: { show: true },
    zoom: { enabled: true }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false
    }
  },
  yaxis: {
    title: { text: 'Количество' }
  },
  tooltip: {
    x: {
      format: 'dd MMM yyyy'
    }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  legend: { show: true }
})

const startDate = ref('')
const endDate = ref('')
const loading = ref(true)

// Получение данных
async function loadData() {
  try {
    loading.value = true
    
    const userId = Array.isArray(route.params.userId) 
      ? route.params.userId[0] 
      : route.params.userId || ''

    const res = await api.get(`/analytics/users/${route.params.userId}`, {
      params: { 
        start: startDate.value,
        end: endDate.value
      }
    });
    
    analytics.value = res.data as AnalyticsData
    
    // Подготовка данных для графика
    const prepareData = (data) => {
      return Object.entries(data || {}).map(([date, count]) => ({
        x: new Date(date).getTime(),
        y: count
      }))
    }

    series.value = [
      {
        name: 'Лайки',
        data: prepareData(analytics.value.likesByDay)
      },
      {
        name: 'Избранное',
        data: prepareData(analytics.value.favoritesByDay)
      },
      {
        name: 'Подписки',
        data: prepareData(analytics.value.subscriptionsByDay)
      },
    ]
    
    // Фикс масштабирования для малых значений
    if (series.value.length > 0) {
      const allValues = series.value.flatMap(serie => serie.data.map(point => point.y));
      const maxValue = Math.max(...allValues, 1);
      
      // Определяем буфер в зависимости от масштаба значений
      const buffer = maxValue < 10 ? 1 : maxValue * 0.2;
      const yMax = maxValue + buffer;
      
      chartOptions.value = {
        ...chartOptions.value,
        yaxis: {
          ...chartOptions.value.yaxis,
          min: 0,
          max: yMax,
          forceNiceScale: false,
          tickAmount: Math.min(10, Math.ceil(yMax)),
        }
      };
    }
    
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
  } finally {
    loading.value = false
  }
}
// Инициализация
onMounted(async () => {
  const today = new Date()
  const lastWeek = new Date()
  lastWeek.setDate(today.getDate() - 7)
  
  startDate.value = lastWeek.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
  
  await loadData()
})
</script>

<style scoped>
/* Стили остаются без изменений */
.analytics-container {
  padding: 2rem;
}

.date-filter {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  flex: 1;
  min-width: 150px;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #a32aa1;
}

.metrics {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.chart-container {
  margin-bottom: 3rem;
  min-height: 350px;
}

.top-posts {
  margin-top: 2rem;
}

.top-posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.top-post-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
}

.top-post-card:hover {
  transform: translateY(-5px);
}

.post-rank {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #a32aa1;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  z-index: 1;
}

.post-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.post-image-placeholder {
  width: 100%;
  height: 150px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.post-info {
  padding: 1rem;
  flex-grow: 1;
}

.post-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
  height: 2em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-metrics {
  display: flex;
  justify-content: space-between;
  color: #666;
}

.date-filter {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.date-input-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 140px;
}

.date-input-wrapper label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.3rem;
}

.date-input-wrapper input[type="date"] {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.date-input-wrapper input[type="date"]:focus {
  outline: none;
  border-color: #a32aa1;
  box-shadow: 0 0 0 2px rgba(163, 42, 161, 0.2);
}

.date-filter button {
  padding: 0.6rem 1.2rem;
  background-color: #a32aa1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.date-filter button:hover {
  background-color: #8e2891;
  transform: translateY(-2px);
}

.date-filter button:active {
  transform: translateY(0);
}
</style>