<template>
  <div id="app">
    <!-- Навигация -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            🎨 PaletteGen
          </router-link>
        </div>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link" exact-active-class="active">
            <span class="nav-icon">🎲</span>
            <span class="nav-text">Генератор</span>
          </router-link>
          
          <router-link to="/library" class="nav-link" active-class="active">
            <span class="nav-icon">📚</span>
            <span class="nav-text">Библиотека</span>
            <span v-if="savedPalettesCount > 0" class="nav-badge">
              {{ savedPalettesCount }}
            </span>
          </router-link>
          
          <router-link to="/export" class="nav-link" active-class="active">
            <span class="nav-icon">📤</span>
            <span class="nav-text">Экспорт</span>
          </router-link>
          
          <router-link to="/settings" class="nav-link" active-class="active">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">Настройки</span>
          </router-link>
        </div>
        
        <div class="nav-user">
          <button @click="toggleDarkMode" class="theme-toggle">
            {{ isDarkMode ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Основное содержимое -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Футер -->
    <footer class="main-footer">
      <div class="footer-content">
        <p>🎨 Vue 3 Palette Generator • Практика 27-28 • {{ currentYear }}</p>
        <div class="footer-links">
          <a href="#" class="footer-link">GitHub</a>
          <a href="#" class="footer-link">Документация</a>
          <a href="#" class="footer-link">О проекте</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'App',
  
  setup() {
    const isDarkMode = ref(false)
    const savedPalettes = ref([])
    
    const savedPalettesCount = computed(() => {
      return savedPalettes.value.length
    })
    
    const currentYear = computed(() => {
      return new Date().getFullYear()
    })
    
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value
      document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    }
    
    const loadSavedPalettes = () => {
      const saved = localStorage.getItem('savedPalettes')
      if (saved) {
        savedPalettes.value = JSON.parse(saved)
      }
    }
    
    const loadTheme = () => {
      const savedTheme = localStorage.getItem('theme') || 'light'
      isDarkMode.value = savedTheme === 'dark'
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    
    onMounted(() => {
      loadSavedPalettes()
      loadTheme()
      
      // Слушаем изменения в localStorage
      window.addEventListener('storage', (event) => {
        if (event.key === 'savedPalettes') {
          loadSavedPalettes()
        }
      })
    })
    
    return {
      isDarkMode,
      savedPalettesCount,
      currentYear,
      toggleDarkMode
    }
  }
}
</script>

<style>
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --accent-color: #e74c3c;
  --background-color: #f8f9fa;
  --surface-color: #ffffff;
  --text-color: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
}

[data-theme="dark"] {
  --primary-color: #2980b9;
  --secondary-color: #27ae60;
  --accent-color: #c0392b;
  --background-color: #1a1a1a;
  --surface-color: #2d2d2d;
  --text-color: #ffffff;
  --text-secondary: #cccccc;
  --border-color: #404040;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color var(--transition-speed), color var(--transition-speed);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Навигация */
.main-nav {
  background-color: var(--surface-color);
  box-shadow: 0 2px 10px var(--shadow-color);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.brand-link {
  text-decoration: none;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-links {
  display: flex;
  gap: 10px;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  padding: 10px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all var(--transition-speed);
  position: relative;
}

.nav-link:hover {
  background-color: var(--background-color);
  color: var(--text-color);
}

.nav-link.active {
  background-color: var(--primary-color);
  color: white;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  font-size: 0.95rem;
  font-weight: 500;
}

.nav-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--accent-color);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 15px;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color var(--transition-speed);
}

.theme-toggle:hover {
  background-color: var(--background-color);
}

/* Основное содержимое */
.main-content {
  flex: 1;
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-speed) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Футер */
.main-footer {
  background-color: var(--surface-color);
  border-top: 1px solid var(--border-color);
  padding: 30px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.footer-content p {
  color: var(--text-secondary);
  margin-bottom: 15px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.footer-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-link:hover {
  text-decoration: underline;
}

/* Адаптивность */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 15px;
  }
  
  .nav-links {
    margin: 15px 0;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-user {
    margin-top: 10px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 10px;
  }
}
</style>