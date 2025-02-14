<template>
    <footer class="footer">
      <div class="background-container">
        <img src="@/assets/L_background.png" class="background-left" alt="Left Background" />
        <img src="@/assets/R_background.png" class="background-right" alt="Right Background" />
      </div>
      <div class="container">
        <p>&copy; 2025 Artenify. All rights reserved.</p>
      </div>
    </footer>
  </template>
  
  <style scoped>
  .footer {
    position: relative;
    width: 100vw;
    height: 100px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  
  .background-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100px;
    pointer-events: none;
    z-index: 0;
  }
  
  .background-left {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    max-width: 910px;
  }
  
  .background-right {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    max-width: 910px;
  }
  
  .container {
    width: 100%;
    max-width: 1920px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #630D46;
    font-size: 16px;
    font-weight: 500;
  }
  </style>
  