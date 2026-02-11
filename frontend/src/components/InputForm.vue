<template>
  <div class="input-form">
    <!-- Main Input Section -->
    <div class="form-section">
      <label for="url-input" class="input-label">Website URL</label>
      <input 
        id="url-input"
        v-model="url" 
        type="url" 
        placeholder="https://example.com"
        :disabled="isLoading"
        class="text-input"
        @keyup.enter="handleSubmit"
        required
      />
    </div>

    <button 
      @click="handleSubmit" 
      :disabled="isLoading || !isValidUrl"
      class="btn-primary"
    >
      {{ isLoading ? 'Analyzing...' : 'Start Crawl' }}
    </button>
    
    <div class="divider"></div>

    <!-- Authentication Section (Collapsible) -->
    <div class="collapsible-section">
      <button 
        @click="toggleAuth" 
        class="collapsible-header"
        :class="{ active: showAuth }"
      >
        <span>Authenticated Access (Optional)</span>
        <span class="chevron" :class="{ rotated: showAuth }">›</span>
      </button>
      
      <div v-show="showAuth" class="collapsible-content">
        <div class="form-group">
          <input 
            v-model="auth.username" 
            type="text" 
            placeholder="Username or Email"
            :disabled="isLoading"
            class="text-input sm"
          />
        </div>
        <div class="form-group">
          <input 
            v-model="auth.password" 
            type="password" 
            placeholder="Password"
            :disabled="isLoading"
            class="text-input sm"
          />
        </div>
      </div>
    </div>
    
    <!-- Advanced Settings (Collapsible - Hidden by default to match clean UI) -->
    <div class="collapsible-section">
      <button 
        @click="toggleAdvanced" 
        class="collapsible-header"
        :class="{ active: showAdvanced }"
      >
        <span>Crawl Constraints</span>
        <span class="chevron" :class="{ rotated: showAdvanced }">›</span>
      </button>
      
      <div v-show="showAdvanced" class="collapsible-content">
         <div class="form-row">
            <div class="form-group half">
              <label class="param-label">Depth</label>
              <select v-model="maxDepth" :disabled="isLoading" class="select-input">
                <option :value="1">1 Level</option>
                <option :value="2">2 Levels</option>
                <option :value="3">3 Levels</option>
                <option :value="4">4 Levels</option>
                <option :value="5">5 Levels</option>
              </select>
            </div>
            <div class="form-group half">
               <label class="param-label">Max Pages</label>
               <select v-model="maxPages" :disabled="isLoading" class="select-input">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
         </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="localError" class="error-message">
      {{ localError }}
    </div>
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
  data() {
    return {
      url: '',
      maxDepth: 3,
      maxPages: 50,
      showAuth: false,
      showAdvanced: false,
      auth: {
        username: '',
        password: ''
      },
      localError: ''
    };
  },
  computed: {
    isValidUrl() {
      if (!this.url) return false;
      try {
        new URL(this.url);
        return true;
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    toggleAuth() {
      this.showAuth = !this.showAuth;
    },
    toggleAdvanced() {
      this.showAdvanced = !this.showAdvanced;
    },
    handleSubmit() {
      this.localError = '';
      
      if (!this.url) {
        this.localError = 'Please enter a URL';
        return;
      }
      
      try {
        // Basic URL validation
        const urlObj = new URL(this.url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          this.localError = 'Please enter a valid HTTP or HTTPS URL';
          return;
        }
      } catch (e) {
        this.localError = 'Please enter a valid URL (e.g., https://example.com)';
        return;
      }
      
      this.$emit('submit', {
        startUrl: this.url,
        maxDepth: this.maxDepth,
        maxPages: this.maxPages,
        auth: (this.auth.username || this.auth.password) ? this.auth : null
      });
    }
  }
};
</script>

<style scoped>
.input-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
}

.text-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db; /* Gray-300 */
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
  width: 100%;
}

.text-input:focus {
  border-color: #2563eb; /* Blue-600 */
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.text-input.sm {
  font-size: 0.9rem;
  padding: 8px 10px;
  background: #f9fafb;
}

.btn-primary {
  background-color: #1d4ed8; /* Blue-700 matching reference */
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1e40af; /* Blue-800 */
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  height: 1px;
  background-color: #e5e7eb; /* Gray-200 */
  margin: 4px 0;
}

.collapsible-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f3f4f6; /* Gray-100 */
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
}

.collapsible-header:hover {
  background: #e5e7eb;
}

.collapsible-content {
  padding: 12px;
  /* border: 1px solid #e5e7eb; */
  border-top: none;
  border-radius: 0 0 4px 4px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chevron {
  font-weight: bold;
  transition: transform 0.2s;
}

.chevron.rotated {
  transform: rotate(90deg);
}

.form-group {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 10px;
}

.half {
  flex: 1;
}

.param-label {
  display: block;
  font-size: 0.8rem;
  margin-bottom: 4px;
  color: #6b7280;
}

.select-input {
  width: 100%;
  padding: 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 4px;
}
</style>
