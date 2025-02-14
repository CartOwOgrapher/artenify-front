<template>
  <main class="home">
    <div class="background">
      <img class="bg-left" src="@/assets/L_background.png" alt="Left Background" />
      <img class="bg-right" src="@/assets/R_background.png" alt="Right Background" />
    </div>
    <div class="content">
      <TheWelcome />
    </div>
  </main>
</template>

<style scoped>
.home {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none; /* Чтобы фон не мешал взаимодействию */
}

.bg-left, .bg-right {
  position: absolute;
  top: 0;
  height: auto;
  max-height: 100vh;
  width: auto;
}

.bg-left {
  left: 0;
}

.bg-right {
  right: 0;
}
</style>
