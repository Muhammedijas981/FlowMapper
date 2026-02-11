<template>
  <div class="app-container">
    <div class="sidebar">
      <!-- Sidebar Header / Title -->
      <h2 class="sidebar-title">Flow Mapper</h2>
      
      <!-- Input Form Component -->
      <InputForm 
        :isLoading="isLoading" 
        @submit="handleCrawl" 
      />
      
      <!-- Footer Info -->
      <div class="sidebar-footer">
        <p>Built for Fore Assignment</p>
      </div>
    </div>

    <div class="main-content">
      <div class="content-header">
        <h1 class="page-title">Detected User Flows</h1>
      </div>
      
      <div class="visualization-area">
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
          <div class="empty-content">
            <span class="empty-icon">←</span>
            <h3>Start by entering a URL</h3>
            <p>Enter a website URL in the sidebar to visualize its user flows.</p>
          </div>
        </div>
      </div>
    </div>
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
        this.graphData = result.graph;
        this.metadata = result.graph?.metadata || null;
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

<style>
/* Global Reset for this component context */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f3f4f6; /* Gray-100 background for whole app */
  color: #1f2937; /* Gray-800 text */
}

.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar Styling */
.sidebar {
  width: 300px;
  background-color: white; /* White sidebar */
  border-right: 1px solid #e5e7eb; /* Border separator */
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 10;
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-top: 0;
  margin-bottom: 24px;
}

.sidebar-footer {
  margin-top: auto;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
}

/* Main Content Area */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb; /* Light gray main area */
  position: relative;
}

.content-header {
  padding: 20px 32px;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.visualization-area {
  flex: 1;
  padding: 24px 32px;
  overflow: hidden;
  position: relative;
}

/* Empty State */
.empty-state {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #6b7280;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 16px;
}

/* Overriding child component styles to fit layout perfectly */
.flow-diagram-container {
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
}
</style>
