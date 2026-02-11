<template>
  <div class="flow-diagram-container">
    <div class="diagram-info-bar">
      <h3>Detected User Flows</h3>
      <div class="zoom-controls">
        <button @click="zoomIn" class="zoom-btn">+</button>
        <button @click="zoomOut" class="zoom-btn">-</button>
        <button @click="resetZoom" class="zoom-btn">Fit</button>
      </div>
    </div>
    
    <div class="diagram-canvas" ref="canvasContainer">
      <svg ref="svg" class="flow-svg">
        <defs>
          <!-- Arrow marker for connections -->
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                  refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
        </defs>
        
        <g ref="graphGroup">
          <!-- Links (Edges) -->
          <path 
            v-for="(link, index) in graphData.links" 
            :key="'link-' + index"
            :d="getLinkPath(link.points)"
            class="flow-link"
            marker-end="url(#arrowhead)"
          />
          
          <!-- Nodes (Boxes) -->
          <g 
            v-for="node in graphData.nodes" 
            :key="node.id"
            class="flow-node"
            :class="{ 'start-node': node.isStart }"
            :transform="`translate(${node.x - node.width/2}, ${node.y - node.height/2})`"
          >
            <!-- Node Box -->
            <rect 
              :width="node.width" 
              :height="node.height" 
              rx="4" 
              ry="4"
              class="node-box"
            />
            
            <!-- Node Label -->
            <foreignObject :width="node.width" :height="node.height">
              <div class="node-content">
                <span class="node-title" :title="node.label">{{ truncate(node.label, 20) }}</span>
              </div>
            </foreignObject>
          </g>
        </g>
      </svg>
    </div>
    
    <!-- Empty State / Placeholder -->
    <div v-if="!graphData.nodes.length" class="empty-diagram">
      <p>No clean flows detected yet. Try crawling a site.</p>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import { transformForD3 } from '../services/graphBuilder';

export default {
  name: 'FlowDiagram',
  props: {
    graph: {
      type: Object,
      required: true
    },
    metadata: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      graphData: { nodes: [], links: [] },
      zoom: null,
      svgSelection: null,
      gSelection: null
    };
  },
  mounted() {
    this.setupZoom();
    this.updateDiagram();
  },
  watch: {
    graph: {
      handler(newVal) {
        if (newVal) {
          this.updateDiagram();
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    truncate(str, n) {
      return (str && str.length > n) ? str.substr(0, n-1) + '...' : str;
    },
    
    getLinkPath(points) {
     
      const lineGenerator = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveBasis); 
      return lineGenerator(points);
    },
    
    setupZoom() {
      const svg = this.$refs.svg;
      const g = this.$refs.graphGroup;
      
      this.svgSelection = d3.select(svg);
      this.gSelection = d3.select(g);
      
      this.zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          this.gSelection.attr('transform', event.transform);
        });
        
      this.svgSelection.call(this.zoom);
    },
    
    updateDiagram() {
      if (!this.graph || !this.graph.nodes) return;
      
      try {
        const layoutData = transformForD3(this.graph);
        this.graphData = layoutData;
        
        this.$nextTick(() => {
          this.resetZoom();
        });
      } catch (e) {
        console.error("Layout error:", e);
      }
    },
    
    resetZoom() {
      if (!this.svgSelection || !this.graphData.nodes.length) return;
      
      const bounds = this.$refs.graphGroup.getBBox();
      const parent = this.$refs.svg.parentElement;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      
      if (bounds.width === 0 || bounds.height === 0) return;
      
      const dx = bounds.width;
      const dy = bounds.height;
      const x = bounds.x + (bounds.width / 2);
      const y = bounds.y + (bounds.height / 2);
      
      const scale = 0.9 / Math.max(dx / width, dy / height);
      const translate = [width / 2 - scale * x, height / 2 - scale * y];
      
      this.svgSelection.transition()
        .duration(750)
        .call(
          this.zoom.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    },
    
    zoomIn() {
      this.svgSelection.transition().call(this.zoom.scaleBy, 1.2);
    },
    
    zoomOut() {
      this.svgSelection.transition().call(this.zoom.scaleBy, 0.8);
    }
  }
};
</script>

<style scoped>
.flow-diagram-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.diagram-info-bar {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
}

.diagram-info-bar h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #374151;
  font-weight: 600;
}

.diagram-canvas {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #f8fafc; 
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 20px 20px;
}

.flow-svg {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.flow-svg:active {
  cursor: grabbing;
}

.flow-link {
  fill: none;
  stroke: #9ca3af;
  stroke-width: 2px;
}

.node-box {
  fill: #ffffff;
  stroke: #e5e7eb;
  stroke-width: 1px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.05));
  transition: all 0.2s;
}

.flow-node:hover .node-box {
  stroke: #6366f1; 
  stroke-width: 2px;
}

.start-node .node-box {
  stroke: #10b981;
  stroke-width: 2px;
}

.node-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  /* padding: 0 8px; */
}

.node-title {
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
  pointer-events: none;
}

.zoom-controls {
  display: flex;
  gap: 8px;
}

.zoom-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
  transition: all 0.1s;
}

.zoom-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.empty-diagram {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #6b7280;
}
</style>
