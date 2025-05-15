<template>
  <div class="grid-wrapper">
    <div class="grid-container">
      <div class="placeholder" v-for="(item, index) in items" :key="index">
        <img src="@/assets/p_test.png" alt="Placeholder" class="placeholder-img" />
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
  position: relative;
  margin-top: px;
  width: 100%;
  background: white;
  z-index: 12;
  padding: 20px 0;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 55px 20px;
  
  /* центрируем сам грид внутри wrapper */
  max-width: 1920px;    /* или любая желаемая ширина */
  margin: 0 auto;       /* именно авто-отступы по бокам */
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