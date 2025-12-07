<template>
  <div 
    class="color-card" 
    :class="{ 'color-card--pinned': isPinned }"
    :style="{ backgroundColor: colorValue }"
    @click="handleClick"
  >
    <div class="color-card__info">
      <span class="color-card__value">{{ formattedColor }}</span>
      <span class="color-card__name" v-if="colorName">{{ colorName }}</span>
    </div>
    
    <!-- Слот для действий -->
    <div class="color-card__actions">
      <slot name="actions">
        <button @click.stop="togglePin" class="color-card__pin-btn">
          {{ isPinned ? '📌' : '📍' }}
        </button>
        <button @click.stop="copyColor" class="color-card__copy-btn">
          📋
        </button>
      </slot>
    </div>
    
    <!-- Слот по умолчанию для дополнительной информации -->
    <slot>
      <div class="color-card__extra" v-if="showContrast">
        Контраст: {{ contrastRatio }}
      </div>
    </slot>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ColorCard',
  
  // Определяем пропсы
  props: {
    color: {
      type: String,
      required: true,
      validator: (value) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
    },
    colorName: {
      type: String,
      default: ''
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    format: {
      type: String,
      default: 'hex',
      validator: (value) => ['hex', 'rgb', 'hsl'].includes(value)
    },
    showContrast: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['pin-toggle', 'copy', 'click'],
  
  setup(props, { emit }) {
    // Форматируем цвет в нужный формат
    const formattedColor = computed(() => {
      if (props.format === 'rgb') {
        return hexToRgb(props.color)
      } else if (props.format === 'hsl') {
        return hexToHsl(props.color)
      }
      return props.color.toUpperCase()
    })

    const colorValue = computed(() => props.color)
    const contrastRatio = computed(() => calculateContrast(props.color))

    // Методы
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgb(${r}, ${g}, ${b})`
    }

    const hexToHsl = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h, s, l = (max + min) / 2

      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }

      return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
    }

    const calculateContrast = (hex) => {
      // Простой расчет контраста (для демо)
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      return brightness > 128 ? 'высокий' : 'низкий'
    }

    const togglePin = () => {
      emit('pin-toggle', props.color)
    }

    const copyColor = async () => {
      try {
        await navigator.clipboard.writeText(formattedColor.value)
        emit('copy', formattedColor.value)
      } catch (err) {
        console.error('Ошибка копирования:', err)
      }
    }

    const handleClick = () => {
      emit('click', props.color)
    }

    return {
      formattedColor,
      colorValue,
      contrastRatio,
      togglePin,
      copyColor,
      handleClick
    }
  }
}
</script>

<style scoped>
.color-card {
  position: relative;
  width: 180px;
  height: 220px;
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.color-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.color-card--pinned {
  border: 3px solid #ff6b6b;
}

.color-card__info {
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.color-card__value {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 14px;
  display: block;
  margin-bottom: 5px;
}

.color-card__name {
  font-size: 12px;
  opacity: 0.9;
}

.color-card__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.color-card__pin-btn,
.color-card__copy-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-card__pin-btn:hover,
.color-card__copy-btn:hover {
  background: white;
  transform: scale(1.1);
}

.color-card__extra {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}
</style>