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
.bg-right { right: 0;
z-index: 8;
}



/* Логотип */
.logo-container {
  position: absolute;
  top: 105px;
  margin-left: 300px ;
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
  top: 150px;
  left: 45%;
  transform: translateX(-50%);
  width: 1200px;
  height: auto;
  z-index: 9;

  /* Добавляем transition для плавности */
  transform-origin: top left;
  transition: transform 0.3s ease;

}

/* === Адаптивные масштабирования через медиазапросы === */

@media (max-width: 1400px) {
  .placeholders-wrapper {
    transform: translateX(-40%) scale(0.9);
    
  }
}

@media (max-width: 1300px) {
  .placeholders-wrapper {
    transform: translateX(-35%) scale(0.85);
  }
}

@media (max-width: 1200px) {
  .placeholders-wrapper {
    transform: translateX(-30%) scale(0.80);
  }
}

@media (max-width: 1100px) {
  .placeholders-wrapper {
    transform: translateX(-25%) scale(0.75);
  }
}

@media (max-width: 1000px) {
  .placeholders-wrapper {
    transform: translateX(-25%) scale(0.70);
  }
}

@media (max-width: 900px) {
  .placeholders-wrapper {
    transform: translateX(-20%) scale(0.65);
  }
}

@media (max-width: 800px) {
  .placeholders-wrapper {
    transform: translateX(-20%) scale(0.6);
  }
}

@media (max-width: 700px) {
  .placeholders-wrapper {
    transform: translateX(-15%) scale(0.55);
  }
}

@media (max-width: 600px) {
  .placeholders-wrapper {
    transform: translateX(-15%) scale(0.5);
    top: 250px;
  }
}

@media (max-width: 800px) {
  .placeholders-wrapper {
    z-index: 12;
  }
}

@media (max-width: 500px) {
  .placeholder.placeholder-4 {
    opacity: 0;
    visibility: hidden;
  }
}

@media (max-width: 431px) {
  .placeholder.placeholder-2 {
    opacity: 0;
    visibility: hidden;

  }
  .placeholders-wrapper {
    margin-left: 50px;
  }
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
  transition: filter 0.3s ease;
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
  top: 60px;
  z-index: 11;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

.placeholder-3 {
  left: calc(0px + 454px + 40px - 320px); /* ваша формула */
  top: calc(95px + 300px);
  z-index: 11;
  
}

.placeholder-4 {
  left: calc(0px + 454px + 40px - 260px + 380px);
  top: calc(95px + 27px + 300px);
  z-index: 11;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}
</style>
