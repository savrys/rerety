<template>
  <div class="home-view">
    <div class="home-view__header">
      <h1>🎨 Генератор цветовых палитр</h1>
      <p>Создавайте гармоничные цветовые схемы для ваших проектов</p>
    </div>

    <!-- Основные настройки -->
    <div class="home-view__controls">
      <div class="controls-section">
        <h3>Основные настройки</h3>
        <div class="controls-grid">
          <div class="control-group">
            <label>Количество цветов:</label>
            <select v-model="colorsCount" class="form-select">
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="7">7</option>
              <option value="9">9</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>Формат цвета:</label>
            <select v-model="colorFormat" class="form-select">
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>Тип палитры:</label>
            <select v-model="paletteType" class="form-select">
              <option value="random">Случайная</option>
              <option value="analogous">Аналогичная</option>
              <option value="complementary">Комплементарная</option>
              <option value="triadic">Триада</option>
              <option value="monochromatic">Монохромная</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Выбор базового цвета -->
      <div class="controls-section">
        <h3>Базовый цвет</h3>
        <ColorPicker 
          v-model="baseColor"
          label="Выберите базовый цвет:"
          placeholder="#HEX или название"
          :show-actions="true"
          @random="generateRandomColor"
          @save="saveBaseColor"
        />
      </div>

      <!-- Кнопки управления -->
      <div class="action-buttons">
        <button @click="generatePalette" class="btn btn--primary btn--large">
          🎲 Сгенерировать палитру
        </button>
        <button @click="savePalette" class="btn btn--success" :disabled="!currentPalette.length">
          💾 Сохранить палитру
        </button>
        <button @click="resetPalette" class="btn btn--danger">
          🔄 Сбросить
        </button>
      </div>
    </div>

    <!-- Отображение палитры -->
    <div class="home-view__palette">
      <div v-if="currentPalette.length" class="palette-container">
        <h3>Текущая палитра</h3>
        <div class="palette-grid">
          <ColorCard
            v-for="(color, index) in currentPalette"
            :key="index"
            :color="color"
            :color-name="getColorName(color)"
            :is-pinned="pinnedColors.includes(color)"
            :format="colorFormat"
            :show-contrast="true"
            @pin-toggle="togglePinColor(color)"
            @copy="handleColorCopy"
            @click="selectColor(color)"
          >
            <template #actions>
              <button @click.stop="removeColor(index)" class="color-action-btn" title="Удалить">
                🗑️
              </button>
            </template>
            
            <div class="color-card-custom">
              <button @click.stop="lightenColor(color)" class="color-mod-btn" title="Светлее">
                ⬆️
              </button>
              <button @click.stop="darkenColor(color)" class="color-mod-btn" title="Темнее">
                ⬇️
              </button>
            </div>
          </ColorCard>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <p>Палитра пуста. Сгенерируйте новую палитру!</p>
      </div>
    </div>

    <!-- Быстрые действия -->
    <div class="home-view__quick-actions">
      <h3>Быстрые действия</h3>
      <div class="quick-actions-grid">
        <button @click="generateComplementary" class="quick-action-btn">
          🎨 Комплементарная
        </button>
        <button @click="generateAnalogous" class="quick-action-btn">
          🌈 Аналогичная
        </button>
        <button @click="generateMonochromatic" class="quick-action-btn">
          ⚫️ Монохромная
        </button>
        <button @click="exportToCSS" class="quick-action-btn">
          📝 CSS переменные
        </button>
      </div>
    </div>

    <!-- Уведомление -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      {{ notificationMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ColorCard from '../components/ColorCard.vue'
import ColorPicker from '../components/ColorPicker.vue'

export default {
  name: 'HomeView',
  
  components: {
    ColorCard,
    ColorPicker
  },
  
  setup() {
    const router = useRouter()
    
    // Реактивные данные
    const colorsCount = ref(5)
    const colorFormat = ref('hex')
    const paletteType = ref('random')
    const baseColor = ref('#3498db')
    const currentPalette = ref([])
    const pinnedColors = ref([])
    const savedPalettes = ref([])
    
    // Уведомления
    const showNotification = ref(false)
    const notificationMessage = ref('')
    const notificationType = ref('success')
    
    // Вычисляемые свойства
    const hasPalette = computed(() => currentPalette.value.length > 0)
    
    // Методы
    const generateRandomColor = () => {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    }
    
    const generatePalette = () => {
      const newPalette = []
      
      // Сохраняем закрепленные цвета
      newPalette.push(...pinnedColors.value)
      
      // Генерируем остальные в зависимости от типа
      const remaining = colorsCount.value - newPalette.length
      
      if (paletteType.value === 'random') {
        for (let i = 0; i < remaining; i++) {
          newPalette.push(generateRandomColor())
        }
      } else if (paletteType.value === 'analogous') {
        // Аналогичные цвета
        const baseHue = hexToHue(baseColor.value)
        for (let i = 0; i < remaining; i++) {
          const hue = (baseHue + (i - Math.floor(remaining / 2)) * 30) % 360
          newPalette.push(hslToHex(hue, 70, 60))
        }
      } else if (paletteType.value === 'complementary') {
        // Комплементарные цвета
        const baseHue = hexToHue(baseColor.value)
        const complementaryHue = (baseHue + 180) % 360
        newPalette.push(baseColor.value)
        newPalette.push(hslToHex(complementaryHue, 70, 60))
        
        // Остальные случайные
        for (let i = 2; i < remaining; i++) {
          newPalette.push(generateRandomColor())
        }
      }
      
      currentPalette.value = newPalette.slice(0, colorsCount.value)
      saveToLocalStorage()
      showNotificationFunc('Палитра сгенерирована успешно!', 'success')
    }
    
    const generateComplementary = () => {
      paletteType.value = 'complementary'
      generatePalette()
    }
    
    const generateAnalogous = () => {
      paletteType.value = 'analogous'
      generatePalette()
    }
    
    const generateMonochromatic = () => {
      paletteType.value = 'monochromatic'
      // Простая монохромная генерация
      const base = baseColor.value
      currentPalette.value = [
        lightenColorHex(base, 40),
        lightenColorHex(base, 20),
        base,
        darkenColorHex(base, 20),
        darkenColorHex(base, 40)
      ].slice(0, colorsCount.value)
    }
    
    const savePalette = () => {
      if (!currentPalette.value.length) return
      
      const paletteName = prompt('Введите название палитры:', 'Моя палитра')
      if (!paletteName) return
      
      const newPalette = {
        id: Date.now(),
        name: paletteName,
        colors: [...currentPalette.value],
        createdAt: new Date().toISOString(),
        isFavorite: false,
        tags: []
      }
      
      savedPalettes.value.push(newPalette)
      localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes.value))
      showNotificationFunc(`Палитра "${paletteName}" сохранена!`, 'success')
      router.push('/library')
    }
    
    const saveBaseColor = () => {
      localStorage.setItem('baseColor', baseColor.value)
      showNotificationFunc('Базовый цвет сохранен!', 'info')
    }
    
    const resetPalette = () => {
      if (confirm('Вы уверены, что хотите сбросить палитру?')) {
        currentPalette.value = []
        showNotificationFunc('Палитра сброшена', 'info')
      }
    }
    
    const togglePinColor = (color) => {
      const index = pinnedColors.value.indexOf(color)
      if (index > -1) {
        pinnedColors.value.splice(index, 1)
      } else {
        pinnedColors.value.push(color)
      }
      saveToLocalStorage()
    }
    
    const removeColor = (index) => {
      currentPalette.value.splice(index, 1)
      saveToLocalStorage()
    }
    
    const selectColor = (color) => {
      baseColor.value = color
      showNotificationFunc(`Цвет ${color} выбран как базовый`, 'info')
    }
    
    const handleColorCopy = (color) => {
      showNotificationFunc(`Цвет ${color} скопирован в буфер`, 'success')
    }
    
    const exportToCSS = () => {
      if (!currentPalette.value.length) return
      
      const cssVars = currentPalette.value.map((color, index) => {
        return `  --color-${index + 1}: ${color};`
      }).join('\n')
      
      const cssCode = `:root {\n${cssVars}\n}`
      navigator.clipboard.writeText(cssCode)
      showNotificationFunc('CSS переменные скопированы в буфер!', 'success')
    }
    
    // Вспомогательные функции
    const hexToHue = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0
      
      if (max !== min) {
        if (max === r) {
          h = (g - b) / (max - min)
        } else if (max === g) {
          h = 2 + (b - r) / (max - min)
        } else {
          h = 4 + (r - g) / (max - min)
        }
        
        h = h * 60
        if (h < 0) h = h + 360
      }
      
      return Math.round(h)
    }
    
    const hslToHex = (h, s, l) => {
      s /= 100
      l /= 100
      
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs((h / 60) % 2 - 1))
      const m = l - c / 2
      
      let r, g, b
      
      if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0]
      } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0]
      } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x]
      } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c]
      } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c]
      } else {
        [r, g, b] = [c, 0, x]
      }
      
      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
    
    const lightenColorHex = (hex, percent) => {
      // Упрощенная функция осветления
      const num = parseInt(hex.slice(1), 16)
      const amt = Math.round(2.55 * percent)
      
      const r = (num >> 16) + amt
      const g = (num >> 8 & 0x00FF) + amt
      const b = (num & 0x0000FF) + amt
      
      return `#${(
        0x1000000 +
        (r < 255 ? r < 1 ? 0 : r : 255) * 0x10000 +
        (g < 255 ? g < 1 ? 0 : g : 255) * 0x100 +
        (b < 255 ? b < 1 ? 0 : b : 255)
      )
        .toString(16)
        .slice(1)}`
    }
    
    const darkenColorHex = (hex, percent) => {
      return lightenColorHex(hex, -percent)
    }
    
    const lightenColor = (color) => {
      const index = currentPalette.value.indexOf(color)
      if (index > -1) {
        currentPalette.value[index] = lightenColorHex(color, 20)
        saveToLocalStorage()
      }
    }
    
    const darkenColor = (color) => {
      const index = currentPalette.value.indexOf(color)
      if (index > -1) {
        currentPalette.value[index] = darkenColorHex(color, 20)
        saveToLocalStorage()
      }
    }
    
    const getColorName = (color) => {
      const colorNames = {
        '#ff0000': 'Красный',
        '#00ff00': 'Зеленый',
        '#0000ff': 'Синий',
        '#ffff00': 'Желтый',
        '#ff00ff': 'Пурпурный',
        '#00ffff': 'Бирюзовый',
        '#ffffff': 'Белый',
        '#000000': 'Черный'
      }
      return colorNames[color.toLowerCase()] || ''
    }
    
    const showNotificationFunc = (message, type = 'success') => {
      notificationMessage.value = message
      notificationType.value = type
      showNotification.value = true
      
      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    }
    
    const saveToLocalStorage = () => {
      const data = {
        currentPalette: currentPalette.value,
        pinnedColors: pinnedColors.value,
        colorsCount: colorsCount.value,
        colorFormat: colorFormat.value,
        paletteType: paletteType.value,
        baseColor: baseColor.value
      }
      localStorage.setItem('paletteGeneratorData', JSON.stringify(data))
    }
    
    const loadFromLocalStorage = () => {
      const saved = localStorage.getItem('paletteGeneratorData')
      if (saved) {
        const data = JSON.parse(saved)
        currentPalette.value = data.currentPalette || []
        pinnedColors.value = data.pinnedColors || []
        colorsCount.value = data.colorsCount || 5
        colorFormat.value = data.colorFormat || 'hex'
        paletteType.value = data.paletteType || 'random'
        baseColor.value = data.baseColor || '#3498db'
      }
      
      const savedPalettesData = localStorage.getItem('savedPalettes')
      if (savedPalettesData) {
        savedPalettes.value = JSON.parse(savedPalettesData)
      }
    }
    
    // Хуки жизненного цикла
    onMounted(() => {
      loadFromLocalStorage()
      if (!currentPalette.value.length) {
        generatePalette()
      }
    })
    
    return {
      colorsCount,
      colorFormat,
      paletteType,
      baseColor,
      currentPalette,
      pinnedColors,
      showNotification,
      notificationMessage,
      notificationType,
      hasPalette,
      
      generatePalette,
      generateComplementary,
      generateAnalogous,
      generateMonochromatic,
      savePalette,
      saveBaseColor,
      resetPalette,
      togglePinColor,
      removeColor,
      selectColor,
      handleColorCopy,
      exportToCSS,
      generateRandomColor,
      lightenColor,
      darkenColor,
      getColorName
    }
  }
}
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.home-view__header {
  text-align: center;
  margin-bottom: 40px;
}

.home-view__header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.home-view__header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.home-view__controls {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.controls-section {
  margin-bottom: 25px;
}

.controls-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-select {
  padding: 10px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.form-select:focus {
  outline: none;
  border-color: #3498db;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn--success {
  background-color: #2ecc71;
  color: white;
}

.btn--danger {
  background-color: #e74c3c;
  color: white;
}

.btn--large {
  padding: 15px 30px;
  font-size: 18px;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.15);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.home-view__palette {
  background: white;
  border-radius: 15px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.palette-container h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.color-action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-action-btn:hover {
  background: white;
  transform: scale(1.1);
}

.color-mod-btn {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 4px;
  width: 25px;
  height: 25px;
  font-size: 10px;
  cursor: pointer;
  margin: 2px;
}

.color-mod-btn:hover {
  background: white;
}

.color-card-custom {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.home-view__quick-actions {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.quick-action-btn {
  padding: 15px;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.quick-action-btn:hover {
  background-color: white;
  border-color: #3498db;
  transform: translateY(-2px);
}

.notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 15px 25px;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background-color: #2ecc71;
}

.notification.info {
  background-color: #3498db;
}

.notification.warning {
  background-color: #f39c12;
}

.notification.error {
  background-color: #e74c3c;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .palette-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>