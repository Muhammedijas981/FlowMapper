import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { crawlWebsite } from './crawler.js';
import { buildCleanGraph } from './noiseReducer.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FlowMapper API is running' });
});

// Main crawl endpoint
app.post('/api/crawl', async (req, res) => {
  try {
    const { startUrl, maxDepth, maxPages, auth } = req.body;
    
    // Validation
    if (!startUrl) {
      return res.status(400).json({ error: 'startUrl is required' });
    }
    
    // Validate URL format
    try {
      new URL(startUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    console.log('Received crawl request:', { startUrl, maxDepth, maxPages });
    
    // Set reasonable defaults and limits
    const options = {
      maxDepth: Math.min(maxDepth || 3, 5), 
      maxPages: Math.min(maxPages || 50, 100), 
      auth: auth || null,
      timeout: 10000
    };
    
    // Perform the crawl
    const crawlData = await crawlWebsite(startUrl, options);
    
    // Apply noise reduction and build clean graph
    const graph = buildCleanGraph(crawlData);
    
    res.json({
      success: true,
      graph,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Crawl error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'An error occurred during crawling';
    let statusCode = 500;
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Website not found. Please check the URL.';
      statusCode = 404;
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. The website may be slow or unreachable.';
      statusCode = 408;
    } else if (error.response && error.response.status === 403) {
      errorMessage = 'Access forbidden. The website may block crawlers.';
      statusCode = 403;
    } else if (error.response && error.response.status === 401) {
      errorMessage = 'Authentication required. Please provide valid credentials.';
      statusCode = 401;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`FlowMapper API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
