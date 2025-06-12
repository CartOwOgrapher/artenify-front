<script setup>
defineProps({
  project: { type: Object, required: true },
  onClick: { type: Function, required: true }
})
</script>

<template>
  <div class="placeholder" @click="onClick(project)">
    <img
      v-if="project.images?.length"
      :src="`${project.images[0].path}`"
      :alt="project.title"
      class="placeholder-img"
    />
    <div v-else class="placeholder-img">Нет изображения</div>
    <div class="card-like-block">Лайки: {{ project.likes }}</div>
  </div>
</template>

<style scoped>
.placeholder {
  position: relative;
  width: 350px;
  height: 300px;
  background-color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.placeholder:hover {
  transform: scale(1.02);
}

.placeholder-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-like-block {
  position: absolute;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  padding: 4px 8px;
  font-size: 12px;
}
</style>
