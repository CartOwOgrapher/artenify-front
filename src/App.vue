<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from '@/components/Header.vue'
import SearchPanel from "@/components/SearchPanel.vue";
</script>

<template>
  <div id="app">
    <Header />
    <Footer />
    <router-view />
    <SearchPanel />
  </div>
  
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
  background-image: url("@/assets/L_background.png"), url("@/assets/R_background.png");
  background-position: left top, right top;
  background-repeat: no-repeat, no-repeat;
  background-size: contain, contain;
  pointer-events: none;
  z-index: -1;
}

.bg-left, .bg-right {
  position: absolute;
  width: auto;
  height: 100%;
  object-fit: contain;
}

.bg-left {
  left: 0;
  top: 0;
}

.bg-right {
  right: 0;
  top: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
