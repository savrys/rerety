<template>
  <div class="palette-card" :class="{ 'palette-card--favorite': isFavorite }">
    <div class="palette-card__header">
      <h3 class="palette-card__title">{{ palette.name }}</h3>
      <div class="palette-card__actions">
        <button 
          @click="toggleFavorite" 
          class="palette-card__fav-btn"
          :title="isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
        >
          {{ isFavorite ? '★' : '☆' }}
        </button>
        <button 
          @click="editPalette" 
          class="palette-card__edit-btn"
          title="Редактировать"
        >
          ✎
        </button>
      </div>
    </div>
    
    <!-- Цветовая палитра -->
    <div class="palette-card__colors">
      <div 
        v-for="(color, index) in palette.colors" 
        :key="index"
        class="palette-card__color"
        :style="{ backgroundColor: color }"
        :title="color"
      ></div>
    </div>
    
    <!-- Информация о палитре -->
    <div class="palette-card__info">
      <span class="palette-card__date">{{ formatDate(palette.createdAt) }}</span>
      <span class="palette-card__count">{{ palette.colors.length }} цветов</span>
    </div>
    
    <!-- Теги -->
    <div v-if="palette.tags && palette.tags.length" class="palette-card__tags">
      <span 
        v-for="tag in palette.tags" 
        :key="tag"
        class="palette-card__tag"
      >
        {{ tag }}
      </span>
    </div>
    
    <!-- Слот для дополнительных действий -->
    <slot name="actions">
      <div class="palette-card__footer-actions">
        <button @click="usePalette" class="palette-card__use-btn">
          Использовать
        </button>
        <button @click="exportPalette" class="palette-card__export-btn">
          Экспорт
        </button>
      </div>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'PaletteCard',
  
  props: {
    palette: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        name: 'Новая палитра',
        colors: [],
        tags: [],
        createdAt: new Date().toISOString(),
        isFavorite: false
      })
    }
  },
  
  emits: ['favorite-toggle', 'edit', 'use', 'export'],
  
  computed: {
    isFavorite() {
      return this.palette.isFavorite || false
    }
  },
  
  methods: {
    toggleFavorite() {
      this.$emit('favorite-toggle', this.palette.id)
    },
    
    editPalette() {
      this.$emit('edit', this.palette)
    },
    
    usePalette() {
      this.$emit('use', this.palette.colors)
    },
    
    exportPalette() {
      this.$emit('export', this.palette)
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }
  }
}
</script>

<style scoped>
.palette-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.palette-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.palette-card--favorite {
  border: 2px solid #f1c40f;
}

.palette-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.palette-card__title {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.palette-card__actions {
  display: flex;
  gap: 8px;
}

.palette-card__fav-btn,
.palette-card__edit-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.palette-card__fav-btn {
  color: #f1c40f;
}

.palette-card__fav-btn:hover {
  background-color: #fff9e6;
}

.palette-card__edit-btn {
  color: #3498db;
}

.palette-card__edit-btn:hover {
  background-color: #ebf5fb;
}

.palette-card__colors {
  display: flex;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 1px solid #eee;
}

.palette-card__color {
  flex: 1;
}

.palette-card__info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 10px;
}

.palette-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.palette-card__tag {
  background-color: #ecf0f1;
  color: #2c3e50;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.palette-card__footer-actions {
  display: flex;
  gap: 10px;
}

.palette-card__use-btn,
.palette-card__export-btn {
  flex: 1;
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.palette-card__use-btn {
  background-color: #2ecc71;
  color: white;
}

.palette-card__use-btn:hover {
  background-color: #27ae60;
}

.palette-card__export-btn {
  background-color: #3498db;
  color: white;
}

.palette-card__export-btn:hover {
  background-color: #2980b9;
}
</style>