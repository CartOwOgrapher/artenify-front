<template>
    <div class="background-container">
      <img src="@/assets/L_background.png" class="background-left" alt="Left Background" />
      <img src="@/assets/R_background.png" class="background-right" alt="Right Background" />
    </div>
  
    <!-- Логотип -->
    <div class="logo-container">
      <img src="@/assets/top_art_logo.png" alt="Top Art Logo" class="top-logo" />
    </div>
  
    <div class="placeholders">
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
  </template>
  
  <style scoped>
  /* Фоновые элементы */
  .background-container {
    position: relative; /* Или static */
    width: 100%;
    height: auto;
    pointer-events: none;
    z-index: 0; /* Ниже остальных */
  }

  .background-left,
  .background-right {
    position: absolute;
    top: 0;
    height: auto;
    max-height: none;
    width: auto;
    max-width: 910px;
  }

  
  .background-left {
    left: 0;
  }
  
  .background-right {
    right: 0;
  }
  
  /* Логотип */
  .logo-container {
    position: absolute;
    top: 105px; /* Можно подкорректировать */
    left: 35%;
    transform: translateX(-50%);
    z-index: 15;
  }
  
  .top-logo {
    width: 170px; /* Можно изменить размер */
    height: auto;
  }
  
  /* Контейнер плейсхолдеров */
  .placeholders {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
  }

  
  /* Базовый стиль плейсхолдеров */
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
  }
  
  /* Стили для изображений в плейсхолдерах */
  .placeholder-img {
    width: 77%;
    height: 77%;
    object-fit: cover;
    transition: filter 0.3s ease-in-out;
  }
  
  /* Эффект при наведении */
  .placeholder:hover .placeholder-img {
    filter: brightness(0.7);
  }
  
  /* Позиции плейсхолдеров */
  .placeholder-1 {
    left: 250px;
    top: 212px;
  }
  
  .placeholder-2 {
    left: calc(250px + 418px + 20px);
    top: calc(212px + 95px);
  }
  
  .placeholder-3 {
    left: calc(250px + 454px + 40px - 320px);
    top: calc(212px + 95px + 350px);
  }
  
  .placeholder-4 {
    left: calc(250px + 454px + 40px - 260px + 380px);
    top: calc(212px + 95px + 27px + 400px);
  }
  </style>
  