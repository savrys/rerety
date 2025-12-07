<template>
  <div class="library-view">
    <div class="library-view__header">
      <h1>📚 Библиотека палитр</h1>
      <p>Ваши сохраненные цветовые палитры</p>
    </div>

    <div class="library-view__controls">
      <div class="search-container">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Поиск по названию или тегам..."
          class="search-input"
        />
        <button class="search-btn">🔍</button>
      </div>
      
      <div class="filter-controls">
        <button 
          @click="toggleFilter('favorites')" 
          :class="{ active: filters.favorites }"
          class="filter-btn"
        >
          Избранное
        </button>
        <button 
          @click="toggleFilter('recent')"
          :class="{ active: filters.recent }"
          class="filter-btn"
        >
          Недавние
        </button>
        <select v-model="sortBy" class="sort-select">
          <option value="date">По дате</option>
          <option value="name">По названию</option>
          <option value="colors">По количеству цветов</option>
        </select>
      </div>
    </div>

    <div v-if="filteredPalettes.length" class="library-view__content">
      <div class="palettes-grid">
        <PaletteCard
          v-for="palette in filteredPalettes"
          :key="palette.id"
          :palette="palette"
          @favorite-toggle="toggleFavorite"
          @edit="editPalette"
          @use="usePalette"
          @export="exportPalette"
        >
          <template #actions>
            <button @click="duplicatePalette(palette)" class="palette-action-btn">
              📋 Дублировать
            </button>
            <button @click="deletePalette(palette.id)" class="palette-action-btn delete">
              🗑️ Удалить
            </button>
          </template>
        </PaletteCard>
      </div>
    </div>
    
    <div v-else class="empty-library">
      <div class="empty-library__content">
        <p class="empty-library__icon">🎨</p>
        <h3>Библиотека пуста</h3>
        <p>Сохраните свою первую палитру в генераторе</p>
        <router-link to="/" class="btn btn--primary">
          Перейти к генератору
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PaletteCard from '../components/PaletteCard.vue'

export default {
  name: 'LibraryView',
  
  components: {
    PaletteCard
  },
  
  setup() {
    const router = useRouter()
    
    const savedPalettes = ref([])
    const searchQuery = ref('')
    const filters = ref({
      favorites: false,
      recent: false
    })
    const sortBy = ref('date')
    
    const filteredPalettes = computed(() => {
      let filtered = [...savedPalettes.value]
      
      // Поиск
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(palette => 
          palette.name.toLowerCase().includes(query) ||
          (palette.tags && palette.tags.some(tag => tag.toLowerCase().includes(query)))
        )
      }
      
      // Фильтры
      if (filters.value.favorites) {
        filtered = filtered.filter(palette => palette.isFavorite)
      }
      
      if (filters.value.recent) {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = filtered.filter(palette => 
          new Date(palette.createdAt) > weekAgo
        )
      }
      
      // Сортировка
      filtered.sort((a, b) => {
        if (sortBy.value === 'date') {
          return new Date(b.createdAt) - new Date(a.createdAt)
        } else if (sortBy.value === 'name') {
          return a.name.localeCompare(b.name)
        } else if (sortBy.value === 'colors') {
          return b.colors.length - a.colors.length
        }
        return 0
      })
      
      return filtered
    })
    
    const loadPalettes = () => {
      const saved = localStorage.getItem('savedPalettes')
      if (saved) {
        savedPalettes.value = JSON.parse(saved)
      }
    }
    
    const toggleFavorite = (paletteId) => {
      const palette = savedPalettes.value.find(p => p.id === paletteId)
      if (palette) {
        palette.isFavorite = !palette.isFavorite
        savePalettes()
      }
    }
    
    const editPalette = (palette) => {
      router.push(`/palette/${palette.id}`)
    }
    
    const usePalette = (colors) => {
      // Сохраняем цвета в localStorage для использования в генераторе
      localStorage.setItem('selectedPalette', JSON.stringify(colors))
      router.push('/')
    }
    
    const exportPalette = (palette) => {
      router.push('/export')
      // Можно передать данные через хранилище или параметры
      localStorage.setItem('exportPalette', JSON.stringify(palette))
    }
    
    const duplicatePalette = (palette) => {
      const duplicate = {
        ...palette,
        id: Date.now(),
        name: `${palette.name} (копия)`,
        createdAt: new Date().toISOString()
      }
      savedPalettes.value.unshift(duplicate)
      savePalettes()
    }
    
    const deletePalette = (paletteId) => {
      if (confirm('Вы уверены, что хотите удалить эту палитру?')) {
        savedPalettes.value = savedPalettes.value.filter(p => p.id !== paletteId)
        savePalettes()
      }
    }
    
    const toggleFilter = (filterName) => {
      filters.value[filterName] = !filters.value[filterName]
    }
    
    const savePalettes = () => {
      localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes.value))
    }
    
    onMounted(() => {
      loadPalettes()
    })
    
    return {
      savedPalettes,
      searchQuery,
      filters,
      sortBy,
      filteredPalettes,
      toggleFavorite,
      editPalette,
      usePalette,
      exportPalette,
      duplicatePalette,
      deletePalette,
      toggleFilter
    }
  }
}
</script>

<style scoped>
.library-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.library-view__header {
  text-align: center;
  margin-bottom: 40px;
}

.library-view__header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.library-view__header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.library-view__controls {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  flex: 1;
  min-width: 300px;
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.search-btn {
  padding: 12px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #2980b9;
}

.filter-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.filter-btn:hover:not(.active) {
  border-color: #3498db;
}

.sort-select {
  padding: 10px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.library-view__content {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.palette-action-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
}

.palette-action-btn.delete {
  background-color: #e74c3c;
  color: white;
}

.palette-action-btn.delete:hover {
  background-color: #c0392b;
}

.empty-library {
  background: white;
  border-radius: 15px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.empty-library__content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-library__icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-library h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.empty-library p {
  color: #7f8c8d;
  margin-bottom: 30px;
}

.btn {
  padding: 12px 24px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #2980b9;
}

@media (max-width: 768px) {
  .library-view__controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    min-width: 100%;
  }
  
  .palettes-grid {
    grid-template-columns: 1fr;
  }
}
</style>