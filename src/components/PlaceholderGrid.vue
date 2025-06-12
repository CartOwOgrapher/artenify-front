<script setup>
import { ref } from 'vue'
import PostCard from '@/components/PostCard.vue'

const props = defineProps({
  displayedProjects: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['open-modal'])

function openModal(project) {
  emit('open-modal', project)
}
</script>

<template>
  <div class="grid-wrapper" :style="{ zIndex: 12 }">
    <!-- 1) Сообщение, если нет результатов -->
    <div v-if="!displayedProjects.length" class="no-results">
      <p>Ой-ой-ой, ничего не нашли по этим тегам... 😥</p>
    </div>

    <!-- 2) Сетка постов -->
    <div v-else class="grid-container">
      <PostCard
        v-for="(project, index) in displayedProjects"
        :key="project.id + '-' + index"
        :project="project"
        :onClick="openModal"
      />
    </div>
  </div>
</template>

<style scoped>
.grid-wrapper {
  position: relative;
  width: 100%;
  background: white;
  padding: 10px 0;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 15px 20px;
  width: 100vw;
  margin: 24px auto;
  padding: 10px 30px;
}

.no-results {
  width: 100%;
  padding: 100px 0;
  background-color: white;
  color: #333;
  text-align: center;
  font-size: 20px;
  font-weight: 500;
}
</style>