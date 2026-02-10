# Intelligent User Flow Mapper

A smart web crawler that analyzes websites and produces clean, noise-reduced user flow diagrams. Built as a solution to Fore's assignment focusing on intelligent noise reduction and meaningful user navigation path extraction.

## 🎯 Project Overview

This application crawls websites and creates visual representations of user navigation flows, with a key focus on **reducing noise** by filtering out global navigation elements (headers, footers) that don't represent actual user journeys.

### Key Features

- **Smart Crawling**: Server-side crawler with depth control, duplicate detection, and loop prevention
- **Intelligent Noise Reduction**: 4-layer heuristic system to filter out redundant navigation
  - 70% frequency threshold for global navigation detection
  - Context-based link classification (nav/footer vs main/article)
  - Redundant edge elimination
  - Page type classification (entry/content/utility)
- **Interactive Visualization**: D3.js force-directed graph with zoom, pan, and drag
- **Modern UI**: Clean, responsive interface with gradient design and real-time feedback

## 🏗️ Architecture

**Hybrid Architecture**: Vue.js frontend + Node.js/Express backend

```
FlowMapper/
├── backend/          # Node.js/Express API server
│   ├── server.js     # Express server with /api/crawl endpoint
│   ├── crawler.js    # Breadth-first web crawler
│   ├── parser.js     # Cheerio-based HTML parsing
│   ├── noiseReducer.js  # Core noise reduction algorithms
│   └── urlUtils.js   # URL manipulation utilities
└── frontend/         # Vue.js 3 application
    └── src/
        ├── components/
        │   ├── InputForm.vue      # Crawl configuration
        │   ├── FlowDiagram.vue    # D3.js visualization
        │   ├── LoadingState.vue   # Progress indicator
        │   └── ErrorDisplay.vue   # Error handling
        ├── services/
        │   ├── apiClient.js       # Backend API communication
        │   └── graphBuilder.js    # D3 data transformation
        └── styles/
            ├── main.css           # CSS variables & base
            ├── layout.css         # Flexbox layouts
            └── components.css     # Component styling
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ and npm

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend API will run on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📖 Usage

1. **Enter Website URL**: Provide the starting URL to crawl
2. **Configure Options**:
   - Max Depth: How many levels deep to crawl (1-5)
   - Max Pages: Maximum number of pages to analyze (10-100)
   - Authentication: Optional basic auth credentials
3. **Start Crawl**: Click "Start Crawl" and wait for analysis
4. **Explore Flow**: Interact with the generated flow diagram
   - **Zoom**: Scroll to zoom in/out
   - **Pan**: Click and drag background
   - **Move Nodes**: Drag individual nodes
   - **Hover**: View page titles and URLs

## 🧠 Noise Reduction Approach

The core differentiator of this application is intelligent noise reduction:

### 1. Global Navigation Detection (70% Threshold)

Links appearing on more than 70% of pages are classified as global navigation:

```javascript
if (linkFrequency / totalPages > 0.70) {
  // This is global nav (header/footer)
  // Don't create redundant edges
}
```

### 2. Context-Based Classification

Links are scored based on their HTML context:

- **Primary** (score: 3): Links in `<main>` or `<article>` tags
- **Navigation** (score: 0.5): Links in `<nav>` or `<header>` tags
- **Footer** (score: 0.3): Links in `<footer>` tags

### 3. Redundant Edge Elimination

If a connection exists via global navigation, we don't duplicate it in the content flow.

### 4. Page Type Filtering

Utility pages (404, login, search) are filtered from the main flow visualization.

## 🎨 Design Decisions

### Technology Stack

- **Vue.js 3**: Modern, reactive framework with Composition API
- **D3.js**: Industry-standard visualization library for learning and flexibility
- **Express**: Lightweight backend for CORS bypass and server-side crawling
- **Cheerio**: Fast, jQuery-like HTML parsing
- **Bare CSS + Flexbox**: Maximum control without framework overhead

### Why Hybrid Architecture?

Browser-based crawling faces CORS restrictions. A Node.js backend bypasses this limitation and enables crawling of real-world websites.

### Why D3.js over Pre-built Libraries?

D3.js provides learning opportunities and full control over visualization, demonstrating engineering depth rather than just library integration.

## 🧪 Testing

### Test with Sample Sites

1. **Small Static Site** (3-10 pages): Test basic crawling
2. **Medium Blog** (20-50 pages): Test noise reduction effectiveness
3. **Documentation Site**: Test depth control and link classification

### Example Test URLs

- `https://example.com` - Simple static site
- Any small documentation site with clear navigation structure

## 📊 Evaluation Criteria Alignment

This implementation addresses Fore's evaluation criteria:

1. **Product Thinking**: Focus on noise reduction as key differentiator, not just crawling
2. **Engineering Judgment**: Definitive architecture decisions (proxy server, D3.js) based on constraints
3. **Reduce Complexity**: Multiple heuristics isolate concerns; 70% threshold makes logic testable
4. **System Thinking**: Hybrid architecture addresses browser limitations; clear data flow
5. **Code Quality**: Separation of concerns with services layer, detailed component structure

## 🔧 Configuration

### Backend Configuration

Edit `backend/server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

### Crawl Limits

Maximum limits (for safety):

- Max Depth: 5 levels
- Max Pages: 100 pages
- Timeout: 10 seconds per page

## 🐛 Known Limitations

- **JavaScript-Heavy SPAs**: Limited support for client-side rendered content
- **Authentication**: Only basic auth supported (no OAuth/session-based)
- **Rate Limiting**: No built-in rate limiting (may be blocked by some sites)
- **Robots.txt**: Not currently respected (should be added for production)

## 🚧 Future Enhancements

- Respect robots.txt
- Support for JavaScript rendering (Puppeteer/Playwright)
- Export flow diagrams as images
- Save/load previous crawls
- Advanced filtering options
- Performance optimization for large sites (1000+ pages)

## 📝 License

MIT

## 👤 Author

Built for Fore's Intelligent User Flow Mapper assignment.

---

**Note**: This is an educational project demonstrating web crawling, graph algorithms, and data visualization. Always respect website terms of service and robots.txt when crawling.
