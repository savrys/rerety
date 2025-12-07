<template>
  <div class="palette-detail-view">
    <h1>Детали палитры</h1>
    <p>ID палитры: {{ id }}</p>
  </div>
</template>

<script>
export default {
  name: 'PaletteDetailView',
  props: {
    id: {
      type: String,
      required: true
    }
  }
}
</script>