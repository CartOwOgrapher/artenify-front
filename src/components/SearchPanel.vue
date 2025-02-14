<template>
    <div class="search-panel" :class="{ hidden: isHidden }">
      <button class="filter-btn">
        <i class="icon">⚙️</i> Фильтр
      </button>
      <div class="search-input">
        <i class="icon">🔍</i>
        <input type="text" placeholder="Поиск творческих работ сообщества" v-model="searchQuery" />
        <button class="image-search">🖼 Поиск по картинке</button>
      </div>
      <button class="recommended-btn">
        Рекомендуемые ▼
      </button>
    </div>
  </template>
  
  
  <style scoped>
  /* Панель будет фиксированной ширины и с конкретными координатами */
  .search-panel {
    position: absolute;
    width: 100%; /* Всю ширину окна */
    height: 65px; /* Высота панели */
    background: white;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;
    z-index: 1000;
  
    /* Точные координаты */
    left: 0;
    top: 912px; /* Измени это значение под нужное */
  }
  
  /* Скролл вниз — скрытие */
  .search-panel.hidden {
    transform: translateY(100%);
  }
  
  /* Кнопки */
  .filter-btn,
  .recommended-btn {
    background: #ff69b4;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    font-weight: 500;
    cursor: pointer;
  }
  
  /* Поле поиска */
  .search-input {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 25px;
    padding: 5px 10px;
    width: 60%;
  }
  
  .search-input input {
    border: none;
    background: transparent;
    padding: 5px;
    flex: 1;
    outline: none;
  }
  
  .image-search {
    background: #ff69b4;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    margin-left: 10px;
    cursor: pointer;
  }
  
  .icon {
    margin-right: 5px;
  }
  </style>
  