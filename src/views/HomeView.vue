<script setup>
import SearchPanel from '@/components/SearchPanel.vue'
import PlaceholderGrid from '@/components/PlaceholderGrid.vue'
</script>

<template>
  <main>
    <!-- Фоновые картинки -->
    <img class="bg-left" src="@/assets/L_background.png" alt="Left Background" />
    <img class="bg-right" src="@/assets/R_background.png" alt="Right Background" />

    <!-- Основной контент -->
    <div>
      <SearchPanel />
      <PlaceholderGrid />

      <!-- Логотип -->
      <div class="logo-container">
        <img src="@/assets/top_art_logo.png" alt="Top Art Logo" class="top-logo" />
      </div>

      <!-- Контейнер с плейсхолдерами -->
      <div class="placeholders-wrapper">
        <div class="placeholder placeholder-1">
          <img src="@/assets/2.png" alt="Placeholder 1" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-2">
          <img src="@/assets/1.png" alt="Placeholder 2" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-3">
          <img src="@/assets/p_test.png" alt="Placeholder 3" class="placeholder-img" />
        </div>
        <div class="placeholder placeholder-4">
          <img src="@/assets/p_test.png" alt="Placeholder 4" class="placeholder-img" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Фоновые картинки */
.bg-left,
.bg-right {
  position: absolute;
  top: 0;
  height: auto;
  max-height: 100vh;
  width: auto;
  z-index: 10;
}
.bg-left { left: 0; }
.bg-right { right: 0; }

/* Логотип */
.logo-container {
  position: absolute;
  top: 105px;
  /* Центрируем между bg-left и bg-right */
  left: calc(250px + (100vw - 1120px) / 2);
  transform: translateX(-50%);
  z-index: 9;
  width: 170px;
  height: auto;
}

/* Контейнер плейсхолдеров */
.placeholders-wrapper {
  position: absolute;
  top: 200px; /* общий отступ сверху */
  left: 45%;
  transform: translateX(-50%);
  width: 1200px; /* ширина блока: сумма ширин + промежутков между плейсхолдерами (подберите точнее) */
  height: auto;
  z-index: 9;
  /* Можно добавить user-select:none или pointer-events:none, если нужно */
}

/* Плейсхолдеры - внутри контейнера позиционируются абсолютно */
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

.placeholder:hover .placeholder-img {
  filter: brightness(0.7);
  z-index: 9;
}

.placeholder-img {
  width: 77%;
  height: 77%;
  object-fit: cover;
}

/* Отступы внутри контейнера */
/* Для top - поднимаем так, чтобы placeholder-1 был на top:0 */
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
  left: calc(0px + 454px + 40px - 320px); /* ваша формула */
  top: calc(95px + 350px);
  z-index: 11;
}

.placeholder-4 {
  left: calc(0px + 454px + 40px - 260px + 380px);
  top: calc(95px + 27px + 400px);
  z-index: 11;
}
</style>