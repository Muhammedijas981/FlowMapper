<template>
  <div class="error-display">
    <div class="error-icon">⚠️</div>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <button @click="$emit('retry')" class="btn-secondary">Try Again</button>
  </div>
</template>

<script>
export default {
  name: 'ErrorDisplay',
  props: {
    title: {
      type: String,
      default: 'Error'
    },
    message: {
      type: String,
      required: true
    }
  },
  emits: ['retry']
};
</script>
