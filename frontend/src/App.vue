<template>
  <div id="app">
    <header class="app-header">
      <h1>Intelligent User Flow Mapper</h1>
      <p class="subtitle">Analyze websites and visualize meaningful user navigation paths</p>
    </header>
    
    <main class="app-main">
      <div class="container">
        <!-- Input Form Section -->
        <section class="input-section">
          <InputForm 
            :isLoading="isLoading"
            @submit="handleCrawl"
          />
        </section>
        
        <!-- Results Section -->
        <section class="results-section">
          <!-- Loading State -->
          <LoadingState v-if="isLoading" />
          
          <!-- Error State -->
          <ErrorDisplay 
            v-else-if="error"
            :message="error"
            @retry="resetState"
          />
          
          <!-- Flow Diagram -->
          <FlowDiagram 
            v-else-if="graphData"
            :graph="graphData"
            :metadata="metadata"
          />
          
          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">🗺️</div>
            <h3>Ready to Map User Flows</h3>
            <p>Enter a website URL to start analyzing its navigation structure</p>
          </div>
        </section>
      </div>
    </main>
    
    <footer class="app-footer">
      <p>Built with Vue.js, D3.js, and intelligent noise reduction algorithms</p>
    </footer>
  </div>
</template>

<script>
import InputForm from './components/InputForm.vue';
import FlowDiagram from './components/FlowDiagram.vue';
import LoadingState from './components/LoadingState.vue';
import ErrorDisplay from './components/ErrorDisplay.vue';
import { startCrawl } from './services/apiClient';

export default {
  name: 'App',
  components: {
    InputForm,
    FlowDiagram,
    LoadingState,
    ErrorDisplay
  },
  data() {
    return {
      isLoading: false,
      error: null,
      graphData: null,
      metadata: null
    };
  },
  methods: {
    async handleCrawl(config) {
      this.isLoading = true;
      this.error = null;
      this.graphData = null;
      this.metadata = null;
      
      try {
        const result = await startCrawl(config);
        console.log('Received result from API:', result);
        console.log('Graph data:', result.graph);
        console.log('Metadata:', result.graph?.metadata);
        
        this.graphData = result.graph;
        this.metadata = result.graph?.metadata || null;
        
        console.log('Set graphData:', this.graphData);
        console.log('Set metadata:', this.metadata);
      } catch (err) {
        console.error('Crawl error:', err);
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    resetState() {
      this.error = null;
      this.graphData = null;
      this.metadata = null;
    }
  }
};
</script>
