import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Start a crawl operation
// 2 minute timeout for crawling

export async function startCrawl(config) {
  try {
    const response = await axios.post(`${API_BASE_URL}/crawl`, {
      startUrl: config.startUrl,
      maxDepth: config.maxDepth,
      maxPages: config.maxPages,
      auth: config.auth
    }, {
      timeout: 120000 
    });
    
    return handleCrawlResponse(response.data);
  } catch (error) {
    throw handleErrors(error);
  }
}

// Check API health

export async function checkHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw new Error('Backend API is not responding');
  }
}

//Process successful crawl response
 
function handleCrawlResponse(response) {
  if (!response.success) {
    throw new Error(response.error || 'Crawl failed');
  }
  
  return {
    graph: response.graph,
    timestamp: response.timestamp
  };
}

// API errors Handle 
 
function handleErrors(error) {
  if (error.response) {
    const message = error.response.data?.error || error.response.data?.details || 'Server error occurred';
    return new Error(message);
  } else if (error.request) {
    return new Error('Cannot connect to backend server. Please ensure the server is running on port 3000.');
  } else if (error.code === 'ECONNABORTED') {
    return new Error('Crawl operation timed out. Try reducing the depth or max pages.');
  } else {
    return new Error(error.message || 'An unexpected error occurred');
  }
}
