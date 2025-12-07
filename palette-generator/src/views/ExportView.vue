<template>
  <div class="export-view">
    <div class="export-view__header">
      <h1>📤 Экспорт палитр</h1>
      <p>Экспортируйте цветовые палитры в различных форматах для использования в проектах</p>
    </div>

    <!-- Выбор палитры для экспорта -->
    <div class="export-view__palette-selector">
      <div class="section-header">
        <h2>1. Выберите палитру для экспорта</h2>
      </div>
      
      <div class="palette-selector">
        <!-- Радио-кнопки для выбора источника -->
        <div class="source-selector">
          <label class="source-option">
            <input 
              type="radio" 
              v-model="exportSource" 
              value="current" 
              class="radio-input"
            />
            <span class="radio-label">Текущая палитра</span>
          </label>
          
          <label class="source-option">
            <input 
              type="radio" 
              v-model="exportSource" 
              value="saved" 
              class="radio-input"
            />
            <span class="radio-label">Сохраненная палитра</span>
          </label>
          
          <label class="source-option">
            <input 
              type="radio" 
              v-model="exportSource" 
              value="manual" 
              class="radio-input"
            />
            <span class="radio-label">Ввести вручную</span>
          </label>
        </div>

        <!-- Выбор сохраненной палитры -->
        <div v-if="exportSource === 'saved'" class="saved-palettes-selector">
          <select v-model="selectedSavedPaletteId" class="palette-select">
            <option value="">Выберите палитру...</option>
            <option 
              v-for="palette in savedPalettes" 
              :key="palette.id" 
              :value="palette.id"
            >
              {{ palette.name }} ({{ palette.colors.length }} цветов)
            </option>
          </select>
          
          <div v-if="selectedSavedPalette" class="selected-palette-preview">
            <div 
              v-for="color in selectedSavedPalette.colors" 
              :key="color"
              class="preview-color"
              :style="{ backgroundColor: color }"
              :title="color"
            ></div>
          </div>
        </div>

        <!-- Ручной ввод цветов -->
        <div v-if="exportSource === 'manual'" class="manual-input">
          <div class="color-inputs">
            <div 
              v-for="(color, index) in manualColors" 
              :key="index"
              class="color-input-group"
            >
              <div class="color-input-row">
                <input
                  v-model="manualColors[index]"
                  type="text"
                  placeholder="#HEX"
                  class="color-input"
                  :class="{ 'error': !isValidHex(manualColors[index]) }"
                />
                <input
                  :value="manualColors[index]"
                  @input="manualColors[index] = $event.target.value"
                  type="color"
                  class="color-picker"
                />
                <button 
                  @click="removeManualColor(index)" 
                  class="remove-color-btn"
                  :disabled="manualColors.length <= 1"
                >
                  ×
                </button>
              </div>
              <div v-if="!isValidHex(manualColors[index])" class="error-message">
                Неверный HEX формат
              </div>
            </div>
          </div>
          <button @click="addManualColor" class="add-color-btn">
            + Добавить цвет
          </button>
        </div>

        <!-- Предпросмотр выбранной палитры -->
        <div v-if="exportPalette.length > 0" class="palette-preview">
          <h3>Предпросмотр палитры:</h3>
          <div class="palette-preview-colors">
            <div 
              v-for="(color, index) in exportPalette" 
              :key="index"
              class="preview-color-item"
              :style="{ backgroundColor: color }"
            >
              <span class="color-hex">{{ color.toUpperCase() }}</span>
              <span class="color-index">{{ index + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Выбор формата экспорта -->
    <div class="export-view__format-selector">
      <div class="section-header">
        <h2>2. Выберите формат экспорта</h2>
      </div>
      
      <div class="format-tabs">
        <button 
          v-for="format in exportFormats" 
          :key="format.id"
          @click="selectedFormat = format.id"
          :class="{ active: selectedFormat === format.id }"
          class="format-tab"
        >
          {{ format.name }}
          <span class="format-desc">{{ format.description }}</span>
        </button>
      </div>

      <!-- Настройки формата -->
      <div class="format-settings">
        <div v-if="selectedFormat === 'css'" class="css-settings">
          <div class="setting-group">
            <label>
              <input type="checkbox" v-model="cssSettings.useVariables">
              Использовать CSS переменные
            </label>
            <label v-if="cssSettings.useVariables">
              <input type="checkbox" v-model="cssSettings.useRoot">
              Добавить в :root
            </label>
          </div>
          <div class="setting-group">
            <label>
              Префикс переменных:
              <input 
                v-model="cssSettings.prefix" 
                type="text" 
                class="prefix-input"
                placeholder="--color-"
              >
            </label>
          </div>
        </div>

        <div v-else-if="selectedFormat === 'scss'" class="scss-settings">
          <div class="setting-group">
            <label>
              Тип переменных:
              <select v-model="scssSettings.variableType" class="scss-select">
                <option value="$">$ (Sass)</option>
                <option value="@">@ (Less)</option>
              </select>
            </label>
          </div>
          <div class="setting-group">
            <label>
              Имя файла:
              <input 
                v-model="scssSettings.filename" 
                type="text" 
                class="filename-input"
                placeholder="_colors.scss"
              >
            </label>
          </div>
        </div>

        <div v-else-if="selectedFormat === 'tailwind'" class="tailwind-settings">
          <div class="setting-group">
            <label>
              <input type="checkbox" v-model="tailwindSettings.extendTheme">
              Добавить в extend темы
            </label>
          </div>
          <div class="setting-group">
            <label>
              Ключ цвета:
              <input 
                v-model="tailwindSettings.colorKey" 
                type="text" 
                class="color-key-input"
                placeholder="brand"
              >
            </label>
          </div>
        </div>

        <div v-else-if="selectedFormat === 'json'" class="json-settings">
          <div class="setting-group">
            <label>
              <input type="checkbox" v-model="jsonSettings.minify">
              Минифицировать JSON
            </label>
          </div>
          <div class="setting-group">
            <label>
              Добавить метаданные:
              <input 
                v-model="jsonSettings.includeMetadata" 
                type="checkbox"
              >
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Предпросмотр кода -->
    <div class="export-view__code-preview">
      <div class="section-header">
        <h2>3. Код для экспорта</h2>
        <div class="code-actions">
          <button @click="copyToClipboard" class="copy-btn" :disabled="!exportCode">
            📋 Копировать код
          </button>
          <button @click="downloadFile" class="download-btn" :disabled="!exportCode">
            💾 Скачать файл
          </button>
        </div>
      </div>
      
      <div class="code-container">
        <pre class="code-block" :class="selectedFormat">{{ exportCode || '// Выберите палитру для просмотра кода' }}</pre>
      </div>
      
      <!-- Уведомление о копировании -->
      <div v-if="showCopyNotification" class="copy-notification">
        Код скопирован в буфер обмена!
      </div>
    </div>

    <!-- Быстрый экспорт -->
    <div class="export-view__quick-export">
      <div class="section-header">
        <h2>Быстрый экспорт</h2>
      </div>
      
      <div class="quick-export-buttons">
        <button @click="quickExport('css')" class="quick-export-btn">
          CSS переменные
        </button>
        <button @click="quickExport('scss')" class="quick-export-btn">
          SCSS переменные
        </button>
        <button @click="quickExport('tailwind')" class="quick-export-btn">
          Tailwind config
        </button>
        <button @click="quickExport('json')" class="quick-export-btn">
          JSON
        </button>
      </div>
    </div>

    <!-- Информация -->
    <div class="export-view__info">
      <h3>💡 Как использовать</h3>
      <div class="info-grid">
        <div class="info-card">
          <h4>CSS/SCSS</h4>
          <p>Скопируйте переменные в ваш файл стилей или импортируйте SCSS файл</p>
        </div>
        <div class="info-card">
          <h4>Tailwind CSS</h4>
          <p>Добавьте конфиг в <code>tailwind.config.js</code> в раздел theme.extend.colors</p>
        </div>
        <div class="info-card">
          <h4>JSON</h4>
          <p>Используйте для хранения палитр или передачи между приложениями</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'ExportView',
  
  setup() {
    // Состояние экспорта
    const exportSource = ref('current') // 'current', 'saved', 'manual'
    const selectedSavedPaletteId = ref('')
    const manualColors = ref(['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6'])
    
    // Форматы экспорта
    const selectedFormat = ref('css')
    const exportFormats = ref([
      { id: 'css', name: 'CSS', description: 'CSS переменные и классы' },
      { id: 'scss', name: 'SCSS', description: 'Sass/Less переменные' },
      { id: 'tailwind', name: 'Tailwind', description: 'Конфигурация Tailwind CSS' },
      { id: 'json', name: 'JSON', description: 'Структурированные данные' },
      { id: 'android', name: 'Android', description: 'XML для Android' },
      { id: 'ios', name: 'iOS', description: 'Swift/UIColor' }
    ])
    
    // Настройки форматов
    const cssSettings = ref({
      useVariables: true,
      useRoot: true,
      prefix: '--color-'
    })
    
    const scssSettings = ref({
      variableType: '$',
      filename: '_colors.scss'
    })
    
    const tailwindSettings = ref({
      extendTheme: true,
      colorKey: 'brand'
    })
    
    const jsonSettings = ref({
      minify: false,
      includeMetadata: true
    })
    
    // Данные
    const savedPalettes = ref([])
    const currentPalette = ref([])
    const showCopyNotification = ref(false)
    
    // Вычисляемые свойства
    const selectedSavedPalette = computed(() => {
      return savedPalettes.value.find(p => p.id === selectedSavedPaletteId.value)
    })
    
    const exportPalette = computed(() => {
      switch (exportSource.value) {
        case 'current':
          return currentPalette.value
        case 'saved':
          return selectedSavedPalette.value?.colors || []
        case 'manual':
          return manualColors.value.filter(color => isValidHex(color))
        default:
          return []
      }
    })
    
    const exportCode = computed(() => {
      if (exportPalette.value.length === 0) return ''
      
      switch (selectedFormat.value) {
        case 'css':
          return generateCSS()
        case 'scss':
          return generateSCSS()
        case 'tailwind':
          return generateTailwind()
        case 'json':
          return generateJSON()
        case 'android':
          return generateAndroid()
        case 'ios':
          return generateIOS()
        default:
          return ''
      }
    })
    
    // Методы
    const loadData = () => {
      // Загружаем сохраненные палитры
      const saved = localStorage.getItem('savedPalettes')
      if (saved) {
        savedPalettes.value = JSON.parse(saved)
      }
      
      // Загружаем текущую палитру
      const currentData = localStorage.getItem('paletteGeneratorData')
      if (currentData) {
        const data = JSON.parse(currentData)
        currentPalette.value = data.currentPalette || []
      }
      
      // Загружаем палитру для экспорта из параметров
      const exportPaletteData = localStorage.getItem('exportPalette')
      if (exportPaletteData) {
        try {
          const palette = JSON.parse(exportPaletteData)
          savedPalettes.value.unshift(palette)
          selectedSavedPaletteId.value = palette.id
          exportSource.value = 'saved'
          
          // Очищаем временные данные
          localStorage.removeItem('exportPalette')
        } catch (e) {
          console.error('Ошибка загрузки палитры для экспорта:', e)
        }
      }
    }
    
    const isValidHex = (color) => {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
    }
    
    const addManualColor = () => {
      manualColors.value.push('#cccccc')
    }
    
    const removeManualColor = (index) => {
      if (manualColors.value.length > 1) {
        manualColors.value.splice(index, 1)
      }
    }
    
    // Генерация кода
    const generateCSS = () => {
      const colors = exportPalette.value
      let code = ''
      
      if (cssSettings.value.useVariables) {
        if (cssSettings.value.useRoot) {
          code += ':root {\n'
        } else {
          code += '/* CSS Custom Properties */\n'
        }
        
        colors.forEach((color, index) => {
          const varName = `${cssSettings.value.prefix}${index + 1}`
          code += `  ${varName}: ${color};\n`
        })
        
        if (cssSettings.value.useRoot) {
          code += '}\n\n'
        } else {
          code += '\n'
        }
        
        // Пример использования
        code += '/* Пример использования */\n'
        code += '.primary-button {\n'
        code += `  background-color: var(${cssSettings.value.prefix}1);\n`
        code += `  color: var(${cssSettings.value.prefix}5);\n`
        code += '}\n'
      } else {
        // Классы CSS
        code += '/* Color Classes */\n'
        colors.forEach((color, index) => {
          code += `.color-${index + 1} {\n`
          code += `  color: ${color};\n`
          code += '}\n\n'
          
          code += `.bg-color-${index + 1} {\n`
          code += `  background-color: ${color};\n`
          code += '}\n\n'
        })
      }
      
      return code
    }
    
    const generateSCSS = () => {
      const colors = exportPalette.value
      const varType = scssSettings.value.variableType
      let code = `// ${scssSettings.value.filename}\n`
      code += '// Auto-generated color palette\n\n'
      
      colors.forEach((color, index) => {
        const varName = `${varType}color-${index + 1}`
        code += `${varName}: ${color};\n`
      })
      
      code += '\n// Map for easier iteration\n'
      code += '$colors: (\n'
      colors.forEach((color, index) => {
        code += `  color-${index + 1}: ${color},\n`
      })
      code += ');\n\n'
      
      code += '// Mixin example\n'
      code += '@mixin text-color($color) {\n'
      code += '  color: $color;\n'
      code += '}\n'
      
      return code
    }
    
    const generateTailwind = () => {
      const colors = exportPalette.value
      const key = tailwindSettings.value.colorKey || 'palette'
      let code = '// tailwind.config.js\n'
      code += 'module.exports = {\n'
      code += '  theme: {\n'
      
      if (tailwindSettings.value.extendTheme) {
        code += '    extend: {\n'
        code += '      colors: {\n'
        code += `        '${key}': {\n`
        colors.forEach((color, index) => {
          code += `          ${index + 1 > 0 ? index + 1 : 'DEFAULT'}: '${color}',\n`
        })
        code += '        }\n'
        code += '      }\n'
        code += '    }\n'
      } else {
        code += '    colors: {\n'
        code += `      '${key}': {\n`
        colors.forEach((color, index) => {
          code += `        ${index + 1 > 0 ? index + 1 : 'DEFAULT'}: '${color}',\n`
        })
        code += '      }\n'
        code += '    }\n'
      }
      
      code += '  }\n'
      code += '}\n'
      
      return code
    }
    
    const generateJSON = () => {
      const colors = exportPalette.value
      const paletteData = {
        name: selectedSavedPalette.value?.name || 'Exported Palette',
        colors: colors,
        format: 'hex',
        count: colors.length,
        createdAt: new Date().toISOString()
      }
      
      if (jsonSettings.value.includeMetadata && selectedSavedPalette.value) {
        paletteData.metadata = {
          originalName: selectedSavedPalette.value.name,
          tags: selectedSavedPalette.value.tags || [],
          isFavorite: selectedSavedPalette.value.isFavorite || false
        }
      }
      
      if (jsonSettings.value.minify) {
        return JSON.stringify(paletteData)
      } else {
        return JSON.stringify(paletteData, null, 2)
      }
    }
    
    const generateAndroid = () => {
      const colors = exportPalette.value
      let code = '<!-- colors.xml -->\n'
      code += '<resources>\n'
      code += '    <!-- Color Palette -->\n'
      
      colors.forEach((color, index) => {
        // Конвертация HEX в ARGB для Android
        const hex = color.replace('#', '')
        const argb = hex.length === 6 ? `FF${hex}` : hex
        code += `    <color name="color_${index + 1}">#${argb.toUpperCase()}</color>\n`
      })
      
      code += '</resources>\n'
      return code
    }
    
    const generateIOS = () => {
      const colors = exportPalette.value
      let code = '// UIColor+Palette.swift\n'
      code += 'import UIKit\n\n'
      code += 'extension UIColor {\n'
      code += '    // Color Palette\n'
      
      colors.forEach((color, index) => {
        // Конвертация HEX в RGB компоненты для UIColor
        const hex = color.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16) / 255
        const g = parseInt(hex.substr(2, 2), 16) / 255
        const b = parseInt(hex.substr(4, 2), 16) / 255
        
        code += `    static let color${index + 1} = UIColor(\n`
        code += `        red: ${r.toFixed(2)},\n`
        code += `        green: ${g.toFixed(2)},\n`
        code += `        blue: ${b.toFixed(2)},\n`
        code += '        alpha: 1.0\n'
        code += '    )\n\n'
      })
      
      code += '}\n'
      return code
    }
    
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(exportCode.value)
        showCopyNotification.value = true
        setTimeout(() => {
          showCopyNotification.value = false
        }, 3000)
      } catch (err) {
        alert('Ошибка копирования: ' + err.message)
      }
    }
    
    const downloadFile = () => {
      const code = exportCode.value
      if (!code) return
      
      let filename = 'palette'
      let extension = ''
      
      switch (selectedFormat.value) {
        case 'css':
          filename = 'palette.css'
          break
        case 'scss':
          filename = scssSettings.value.filename || '_colors.scss'
          break
        case 'tailwind':
          filename = 'tailwind.config.js'
          break
        case 'json':
          filename = 'palette.json'
          break
        case 'android':
          filename = 'colors.xml'
          break
        case 'ios':
          filename = 'UIColor+Palette.swift'
          break
      }
      
      const blob = new Blob([code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    const quickExport = (format) => {
      selectedFormat.value = format
      setTimeout(() => {
        copyToClipboard()
      }, 100)
    }
    
    // Watchers
    watch(exportSource, (newSource) => {
      if (newSource === 'saved' && savedPalettes.value.length > 0 && !selectedSavedPaletteId.value) {
        selectedSavedPaletteId.value = savedPalettes.value[0].id
      }
    })
    
    // Хук жизненного цикла
    onMounted(() => {
      loadData()
    })
    
    return {
      exportSource,
      selectedSavedPaletteId,
      manualColors,
      selectedFormat,
      exportFormats,
      cssSettings,
      scssSettings,
      tailwindSettings,
      jsonSettings,
      savedPalettes,
      showCopyNotification,
      
      selectedSavedPalette,
      exportPalette,
      exportCode,
      
      isValidHex,
      addManualColor,
      removeManualColor,
      copyToClipboard,
      downloadFile,
      quickExport
    }
  }
}
</script>

<style scoped>
.export-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.export-view__header {
  text-align: center;
  margin-bottom: 40px;
}

.export-view__header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.export-view__header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.section-header h2 {
  color: #2c3e50;
  font-size: 1.3rem;
}

/* Выбор палитры */
.palette-selector {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.source-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.source-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.source-option:hover {
  border-color: #3498db;
  background-color: #f0f8ff;
}

.radio-input {
  display: none;
}

.radio-input:checked + .radio-label {
  color: #3498db;
  font-weight: bold;
}

.source-option input:checked ~ span {
  color: #3498db;
  font-weight: bold;
}

.source-option input:checked {
  background-color: #3498db;
}

.palette-select {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 16px;
  margin-bottom: 20px;
}

.selected-palette-preview {
  display: flex;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eee;
}

.preview-color {
  flex: 1;
}

/* Ручной ввод */
.manual-input {
  margin: 20px 0;
}

.color-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.color-input-group {
  margin-bottom: 10px;
}

.color-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.color-input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
}

.color-input.error {
  border-color: #e74c3c;
  background-color: #ffeaea;
}

.color-picker {
  width: 50px;
  height: 50px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.remove-color-btn {
  width: 40px;
  height: 40px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-color-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.remove-color-btn:not(:disabled):hover {
  background-color: #c0392b;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
}

.add-color-btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-color-btn:hover {
  background-color: #2980b9;
}

/* Предпросмотр палитры */
.palette-preview {
  margin-top: 25px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.palette-preview-colors {
  display: flex;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 15px;
}

.preview-color-item {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 10px;
  transition: transform 0.3s;
}

.preview-color-item:hover {
  transform: scale(1.05);
  z-index: 1;
}

.color-hex {
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
}

.color-index {
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* Выбор формата */
.format-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.format-tab {
  padding: 20px;
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.format-tab:hover {
  border-color: #3498db;
  transform: translateY(-2px);
}

.format-tab.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.format-desc {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 5px;
}

/* Настройки формата */
.format-settings {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.setting-group {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.setting-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.prefix-input,
.filename-input,
.color-key-input,
.scss-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

/* Превью кода */
.code-actions {
  display: flex;
  gap: 10px;
}

.copy-btn,
.download-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.copy-btn {
  background-color: #2ecc71;
  color: white;
}

.copy-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.copy-btn:not(:disabled):hover {
  background-color: #27ae60;
}

.download-btn {
  background-color: #3498db;
  color: white;
}

.download-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.download-btn:not(:disabled):hover {
  background-color: #2980b9;
}

.code-container {
  background-color: #1e1e1e;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 15px;
}

.code-block {
  color: #d4d4d4;
  padding: 20px;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
  min-height: 200px;
}

.code-block.css {
  color: #569cd6;
}

.code-block.scss {
  color: #dcdcaa;
}

.code-block.tailwind {
  color: #4ec9b0;
}

.code-block.json {
  color: #ce9178;
}

/* Уведомление о копировании */
.copy-notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #2ecc71;
  color: white;
  padding: 15px 25px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
  animation: slideIn 0.3s ease;
  z-index: 1000;
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

/* Быстрый экспорт */
.quick-export-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.quick-export-btn {
  padding: 15px 25px;
  background-color: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  flex: 1;
  min-width: 200px;
}

.quick-export-btn:hover {
  border-color: #3498db;
  background-color: #f0f8ff;
  transform: translateY(-2px);
}

/* Информация */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.info-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.info-card h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.info-card p {
  color: #7f8c8d;
  font-size: 14px;
}

.info-card code {
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #e74c3c;
}

@media (max-width: 768px) {
  .source-selector {
    flex-direction: column;
  }
  
  .format-tabs {
    grid-template-columns: 1fr;
  }
  
  .code-actions {
    flex-direction: column;
  }
  
  .quick-export-buttons {
    flex-direction: column;
  }
  
  .quick-export-btn {
    min-width: 100%;
  }
}
</style>