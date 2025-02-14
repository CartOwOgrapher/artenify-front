<template>
    <div class="grid-wrapper">
      <div class="spacer"></div> <!-- Отступ сверху 919px -->
      <div class="grid-container">
        <div 
          class="placeholder" 
          v-for="(item, index) in items" 
          :key="index"
        >
          <img 
            src="@/assets/p_test.png" 
            alt="Placeholder" 
            class="placeholder-img"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from "vue";
  
  export default {
    setup() {
      const items = ref(Array(12).fill(null)); // Начальное количество плейсхолдеров
  
      const loadMore = () => {
        for (let i = 0; i < 6; i++) {
          items.value.push(null);
        }
      };
  
      const handleScroll = () => {
        const bottomOffset = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= bottomOffset - 100) {  // Загружаем новые при скролле вниз
          loadMore();
        }
      };
  
      onMounted(() => {
        window.addEventListener("scroll", handleScroll);
      });
  
      onUnmounted(() => {
        window.removeEventListener("scroll", handleScroll);
      });
  
      return { items };
    },
  };
  </script>


  <style scoped>

  
  /* Контейнер для всей сетки */
  .grid-wrapper {
    position: absolute;
    top: 919px;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 1920px;
    min-height: 100vh;
    background: white; /* Белый фон */
    z-index: 10; /* Поверх других слоёв */
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  /* Отступ сверху */
  .spacer {
    height: 50px;
    width: 100%;
  }
  
  /* Сетка с плейсхолдерами */
  .grid-container {
    display: flex;
    flex-wrap: wrap;
    gap: 55px 18px; /* Отступы: 50px вниз, 25px по бокам */
    max-width: 1920px;
    padding: 25px;
    justify-content: center;
  }
  
  /* Один плейсхолдер */
  .placeholder {
    width: 350px;
    height: 300px;
    background-color: #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 7px;
    overflow: hidden;
  }
  
  /* Картинка внутри плейсхолдера */
  .placeholder-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  </style>
  