<!-- layouts/DefaultLayout.vue -->
<script setup>
import Header from '@/components/Header.vue'
import BackgroundWithPlaceholders from '@/components/BackgroundWithPlaceholders.vue'
</script>

<template>
  <div class="layout">
    <BackgroundWithPlaceholders />
    <Header />
    <slot /> <!-- Вставляется содержимое конкретной страницы -->
  </div>
</template>

<style scoped>
.layout {
  position: relative;
  min-height: 100vh;
}
</style>
