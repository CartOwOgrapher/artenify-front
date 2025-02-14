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
  
  <script>
  export default {
    data() {
      return {
        searchQuery: "",
        isHidden: false,
        lastScrollY: 0,
      };
    },
    methods: {
      handleScroll() {
        if (window.scrollY > this.lastScrollY) {
          this.isHidden = true; // Скроллим вниз → панель скрывается
        } else {
          this.isHidden = false; // Скроллим вверх → панель появляется
        }
        this.lastScrollY = window.scrollY;
      },
    },
    mounted() {
      window.addEventListener("scroll", this.handleScroll);
    },
    beforeUnmount() {
      window.removeEventListener("scroll", this.handleScroll);
    },
  };
  </script>
  
  <style scoped>
  .search-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 15px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease-in-out;
    z-index: 1100;
  }
  
  /* Подгоняем панель под нижний край фонового изображения */
  @media (min-height: 1080px) {
    .search-panel {
      bottom: calc((100vh - 1080px) / 2);
    }
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
    max-width: 900px; /* Учитываем ширину фонового изображения */
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
  