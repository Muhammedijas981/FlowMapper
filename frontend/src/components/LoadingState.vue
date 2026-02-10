<template>
  <div class="loading-state">
    <div class="spinner"></div>
    <p>{{ message }}</p>
    <p class="sub-message">This may take a few moments...</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingState',
  props: {
    message: {
      type: String,
      default: 'Crawling website and analyzing user flows'
    }
  }
};
</script>
