import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * API client for communicating with the backend
 */

/**
 * Start a crawl operation
 * @param {Object} config - Crawl configuration
 * @returns {Promise<Object>} - Crawl results with graph data
 */
export async function startCrawl(config) {
  try {
    const response = await axios.post(`${API_BASE_URL}/crawl`, {
      startUrl: config.url,
      maxDepth: config.depth,
      maxPages: config.maxPages,
      auth: config.auth
    }, {
      timeout: 120000 // 2 minute timeout for crawling
    });
    
    return handleCrawlResponse(response.data);
  } catch (error) {
    throw handleErrors(error);
  }
}

/**
 * Check API health
 * @returns {Promise<Object>} - Health status
 */
export async function checkHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw new Error('Backend API is not responding');
  }
}

/**
 * Process successful crawl response
 * @param {Object} response - API response
 * @returns {Object} - Processed graph data
 */
function handleCrawlResponse(response) {
  if (!response.success) {
    throw new Error(response.error || 'Crawl failed');
  }
  
  return {
    graph: response.graph,
    timestamp: response.timestamp
  };
}

/**
 * Handle API errors and provide user-friendly messages
 * @param {Error} error - Axios error object
 * @returns {Error} - User-friendly error
 */
function handleErrors(error) {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || error.response.data?.details || 'Server error occurred';
    return new Error(message);
  } else if (error.request) {
    // Request made but no response
    return new Error('Cannot connect to backend server. Please ensure the server is running on port 3000.');
  } else if (error.code === 'ECONNABORTED') {
    // Timeout
    return new Error('Crawl operation timed out. Try reducing the depth or max pages.');
  } else {
    // Other errors
    return new Error(error.message || 'An unexpected error occurred');
  }
}
