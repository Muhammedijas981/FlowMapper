<template>
  <div class="input-form">
    <h2>Configure Crawl</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="url">Website URL *</label>
        <input
          id="url"
          v-model="formData.url"
          type="url"
          placeholder="https://example.com"
          required
          :disabled="isLoading"
        />
        <span v-if="errors.url" class="error">{{ errors.url }}</span>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="depth">Max Depth</label>
          <select id="depth" v-model.number="formData.depth" :disabled="isLoading">
            <option :value="1">1 level</option>
            <option :value="2">2 levels</option>
            <option :value="3">3 levels</option>
            <option :value="4">4 levels</option>
            <option :value="5">5 levels</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="maxPages">Max Pages</label>
          <select id="maxPages" v-model.number="formData.maxPages" :disabled="isLoading">
            <option :value="10">10 pages</option>
            <option :value="25">25 pages</option>
            <option :value="50">50 pages</option>
            <option :value="100">100 pages</option>
          </select>
        </div>
      </div>
      
      <div class="form-group auth-toggle">
        <label>
          <input type="checkbox" v-model="showAuth" :disabled="isLoading" />
          Requires Authentication
        </label>
      </div>
      
      <div v-if="showAuth" class="auth-section">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="formData.auth.username"
            type="text"
            placeholder="Username"
            :disabled="isLoading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="formData.auth.password"
            type="password"
            placeholder="Password"
            :disabled="isLoading"
          />
        </div>
      </div>
      
      <button type="submit" class="btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Crawling...' : 'Start Crawl' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'InputForm',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit'],
  data() {
    return {
      formData: {
        url: '',
        depth: 3,
        maxPages: 50,
        auth: {
          username: '',
          password: ''
        }
      },
      showAuth: false,
      errors: {}
    };
  },
  methods: {
    handleSubmit() {
      this.errors = {};
      
      // Validate URL
      if (!this.formData.url) {
        this.errors.url = 'URL is required';
        return;
      }
      
      try {
        new URL(this.formData.url);
      } catch (e) {
        this.errors.url = 'Please enter a valid URL';
        return;
      }
      
      // Prepare submission data
      const submitData = {
        url: this.formData.url,
        depth: this.formData.depth,
        maxPages: this.formData.maxPages,
        auth: this.showAuth && this.formData.auth.username ? this.formData.auth : null
      };
      
      this.$emit('submit', submitData);
    }
  }
};
</script>
