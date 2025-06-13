<script setup>
import SearchPanel from '@/components/SearchPanel.vue'
import LeadersPanel from '@/components/LeadersPanel.vue'
import LeadersContent from '@/components/LeadersContent.vue'
</script>
<template>
  <main>
    <!-- Фоновые картинки -->
    <img class="bg-left" src="@/assets/L_background.png" alt="Left Background" />
    <img class="bg-right" src="@/assets/R_backgroundLead.png" alt="Right Background" />

    <!-- Контент -->
    <div>
      <LeadersPanel />
      <LeadersContent />

      <!-- Логотип -->
      <div class="logo-container">
        <img src="@/assets/top_art_logo.png" alt="Top Art Logo" class="top-logo" />
      </div>

      <!-- Плейсхолдеры -->
      <div class="placeholders-wrapper">
        <div class="placeholder placeholder-1">
          <img src="@/assets/1.png" alt="Placeholder 1" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-2">
          <img src="@/assets/2.png" alt="Placeholder 2" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-3">
          <img src="@/assets/p_test.png" alt="Placeholder 3" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-4">
          <img src="@/assets/p_test.png" alt="Placeholder 4" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-5">
          <img src="@/assets/p_test.png" alt="Placeholder 5" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-6">
          <img src="@/assets/p_test.png" alt="Placeholder 6" class="placeholder-img" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Глобальные переменные и хедер */
:root {
  --header-offset: 60px;
}

header {
  position: relative;
  z-index: 20;
}

/* Фоновые картинки */
.bg-left,
.bg-right {
  position: absolute;
  top: 0;
  height: 100vh;
  width: 40vw;
  z-index: 10;
}
.bg-left { left: 0; }
.bg-right { right: 0; }

@media (max-width: 1200px) {
  .bg-left,
  .bg-right {
    display: none;
  }
}
@media (max-width: 1200px) and (min-width: 901px) {
  .bg-left,
  .bg-right {
    width: 15vw;
  }
}
/* Логотип */
.logo-container {
  position: absolute;
  top: 105px;
  left: calc(430px + (100vw - 1120px) / 2);
  transform: translateX(-50%);
  z-index: 9;
  width: 170px;
}
@media (max-width: 1200px) {
  main > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
    margin-top: var(--header-offset);
  }

  /* Логотип первым */
  .logo-container {
    order: -3;
    position: relative !important;
    top: 0; left: 0; transform: none !important;
    margin: 0 auto;
  }
}

/* Обертка плейсхолдеров */
.placeholders-wrapper {
  position: absolute;
  top: 200px;
  left: 45%;
  transform: translateX(-50%);
  width: 1200px;
  height: auto;
  z-index: 12;
}

/* Общий стиль плейсхолдера */
.placeholder {
  position: absolute;
  width: 454px;
  height: 378px;
  background: url("@/assets/top_tab.png") no-repeat center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  z-index: 9;
}

.leaders-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
  z-index: 15;
}

.leaders-logo {
  height: 80px;
  object-fit: contain;
}

.leaders-subtitle {
  margin-top: 4px;
  font-size: 14px;
  color: #555;
  font-style: italic;
  text-align: center;
}



.placeholder-img {
  width: 77%;
  height: 77%;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.placeholder:hover .placeholder-img {
  filter: brightness(0.7);
}

/* Индивидуальные позиции */
.placeholder-1 {
  left: 0px;
  top: 0;
  z-index: 11;
}

.placeholder-2 {
  left: calc(0px + 418px + 20px); /* 438px справа от первого */
  top: 95px;
  z-index: 11;
}

.placeholder-3 {
  left: calc(0px + 454px + 40px - 320px);
  top: calc(95px + 350px);
  z-index: 11;
}

.placeholder-4 {
  left: calc(0px + 454px + 40px - 260px + 380px);
  top: calc(95px + 27px + 400px);
  z-index: 11;
}

.placeholder-5 {
  left: calc(67px + 454px * 2 + 60px - 160px); /* примерно третий столбец */
  top: 0px;
  z-index: 11;
}

.placeholder-6 {
  left: calc(345px + 454px * 2 + 60px - 160px - 100px);
  top: calc(40px + 350px);
  z-index: 11;
}
</style>