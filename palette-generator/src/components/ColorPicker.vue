<template>
  <div class="color-picker">
    <label v-if="label" class="color-picker__label">{{ label }}</label>
    
    <div class="color-picker__container">
      <!-- Поле для ввода HEX -->
      <input
        :value="modelValue"
        @input="handleInput($event.target.value)"
        :placeholder="placeholder"
        class="color-picker__input"
        type="text"
        spellcheck="false"
      />
      
      <!-- Кнопка для сброса -->
      <button 
        v-if="modelValue && showClear"
        @click="clearColor"
        class="color-picker__clear-btn"
        :title="clearTitle"
      >
        ×
      </button>
      
      <!-- Выбор цвета через input[type=color] -->
      <input
        :value="modelValue"
        @input="handleColorInput($event.target.value)"
        class="color-picker__native"
        type="color"
        :title="pickerTitle"
      />
    </div>
    
    <!-- Предпросмотр цвета -->
    <div class="color-picker__preview">
      <div 
        class="color-picker__preview-color"
        :style="{ backgroundColor: previewColor }"
      ></div>
      <span class="color-picker__preview-text">{{ formattedColor }}</span>
    </div>
    
    <!-- Дополнительные действия -->
    <div v-if="showActions" class="color-picker__actions">
      <slot name="actions">
        <button @click="emit('random')" class="color-picker__action-btn">
          🎲 Случайный
        </button>
        <button @click="emit('save')" class="color-picker__action-btn">
          💾 Сохранить
        </button>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorPicker',
  
  props: {
    modelValue: {
      type: String,
      default: '#3498db'
    },
    label: {
      type: String,
      default: 'Выберите цвет'
    },
    placeholder: {
      type: String,
      default: '#HEX или название'
    },
    showClear: {
      type: Boolean,
      default: true
    },
    showActions: {
      type: Boolean,
      default: false
    },
    clearTitle: {
      type: String,
      default: 'Очистить'
    },
    pickerTitle: {
      type: String,
      default: 'Выбрать цвет'
    }
  },
  
  emits: ['update:modelValue', 'random', 'save', 'change'],
  
  computed: {
    previewColor() {
      return this.modelValue || '#cccccc'
    },
    
    formattedColor() {
      if (!this.modelValue) return 'Не выбран'
      return this.modelValue.toUpperCase()
    }
  },
  
  methods: {
    handleInput(value) {
      // Валидация HEX цвета
      const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      const namedColors = {
        'красный': '#ff0000',
        'зеленый': '#00ff00',
        'синий': '#0000ff',
        'черный': '#000000',
        'белый': '#ffffff'
      }
      
      let processedValue = value.trim().toLowerCase()
      
      // Проверяем именованные цвета
      if (namedColors[processedValue]) {
        processedValue = namedColors[processedValue]
      }
      
      // Добавляем # если нужно
      if (processedValue && !processedValue.startsWith('#')) {
        processedValue = '#' + processedValue
      }
      
      // Проверяем валидность
      if (!processedValue || hexRegex.test(processedValue)) {
        this.$emit('update:modelValue', processedValue)
        this.$emit('change', processedValue)
      }
    },
    
    handleColorInput(value) {
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    },
    
    clearColor() {
      this.$emit('update:modelValue', '')
      this.$emit('change', '')
    },
    
    emit(eventName) {
      this.$emit(eventName)
    }
  }
}
</script>

<style scoped>
.color-picker {
  margin: 20px 0;
}

.color-picker__label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.color-picker__container {
  position: relative;
  display: flex;
  align-items: center;
}

.color-picker__input {
  flex: 1;
  padding: 10px 40px 10px 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  transition: border-color 0.3s;
}

.color-picker__input:focus {
  outline: none;
  border-color: #3498db;
}

.color-picker__clear-btn {
  position: absolute;
  right: 50px;
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.color-picker__clear-btn:hover {
  background-color: #f0f0f0;
  color: #e74c3c;
}

.color-picker__native {
  width: 50px;
  height: 50px;
  margin-left: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.color-picker__preview {
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.color-picker__preview-color {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  margin-right: 15px;
  border: 1px solid #ddd;
}

.color-picker__preview-text {
  font-family: 'Courier New', monospace;
  font-weight: bold;
}

.color-picker__actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.color-picker__action-btn {
  flex: 1;
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.color-picker__action-btn:hover {
  background-color: #2980b9;
}
</style>