<template>
  <div class="leaders-panel">
    <img src="@/assets/leaders.png" alt="Leaders Logo" class="leaders-logo" />
  </div>
</template>

<style scoped>
.leaders-panel {
  position: sticky;
  top: 65px;
  margin-top: 900px;
  width: 100vw;
  height: 67px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border: 1px solid #ddd; /* светлая серая обводка снизу */
  z-index: 999;
}

.leaders-logo {
  height: 110px;
  object-fit: contain;
}
</style>

