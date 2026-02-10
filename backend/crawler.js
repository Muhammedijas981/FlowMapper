import axios from 'axios';
import { parseHTML } from './parser.js';
import { normalizeUrl, isSameDomain, isValidUrl } from './urlUtils.js';

/**
 * Crawl a website starting from a given URL
 * @param {string} startUrl - The URL to start crawling from
 * @param {Object} options - Crawl configuration options
 * @returns {Promise<Object>} - Crawl results with pages and links
 */
export async function crawlWebsite(startUrl, options = {}) {
  const {
    maxDepth = 3,
    maxPages = 50,
    auth = null,
    timeout = 10000
  } = options;
  
  const visited = new Set();
  const queue = [{ url: normalizeUrl(startUrl), depth: 0 }];
  const pages = [];
  const allLinks = [];
  
  console.log(`Starting crawl from: ${startUrl}`);
  console.log(`Max depth: ${maxDepth}, Max pages: ${maxPages}`);
  
  while (queue.length > 0 && pages.length < maxPages) {
    const { url, depth } = queue.shift();
    
    // Skip if already visited
    if (visited.has(url)) {
      continue;
    }
    
    // Skip if depth exceeded
    if (depth > maxDepth) {
      continue;
    }
    
    try {
      console.log(`Crawling (depth ${depth}): ${url}`);
      
      const html = await fetchPage(url, auth, timeout);
      visited.add(url);
      
      const pageData = parseHTML(html, url);
      
      pages.push({
        url,
        title: pageData.title,
        type: pageData.pageType,
        depth
      });
      
      // Process links
      for (const link of pageData.links) {
        const normalizedLink = normalizeUrl(link.url);
        
        // Only crawl internal links
        if (isSameDomain(normalizedLink, startUrl) && isValidUrl(normalizedLink)) {
          // Add to queue if not visited and should crawl
          if (!visited.has(normalizedLink) && shouldCrawl(normalizedLink, visited, depth, maxPages, pages.length)) {
            queue.push({ url: normalizedLink, depth: depth + 1 });
          }
          
          // Record the link for graph building
          allLinks.push({
            source: url,
            target: normalizedLink,
            text: link.text,
            context: link.context
          });
        }
      }
      
    } catch (error) {
      console.error(`Error crawling ${url}:`, error.message);
      // Continue with next URL
    }
  }
  
  console.log(`Crawl complete. Visited ${pages.length} pages.`);
  
  return {
    pages,
    links: allLinks,
    startUrl
  };
}

/**
 * Fetch a page's HTML content
 * @param {string} url - URL to fetch
 * @param {Object} auth - Optional authentication credentials
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<string>} - HTML content
 */
export async function fetchPage(url, auth = null, timeout = 10000) {
  const config = {
    timeout,
    headers: {
      'User-Agent': 'FlowMapper/1.0 (Web Crawler)'
    }
  };
  
  // Add basic auth if provided
  if (auth && auth.username && auth.password) {
    config.auth = {
      username: auth.username,
      password: auth.password
    };
  }
  
  const response = await axios.get(url, config);
  return response.data;
}

/**
 * Determine if a URL should be crawled
 * @param {string} url - URL to check
 * @param {Set} visited - Set of visited URLs
 * @param {number} currentDepth - Current crawl depth
 * @param {number} maxPages - Maximum pages to crawl
 * @param {number} currentPageCount - Current number of pages crawled
 * @returns {boolean} - True if should crawl
 */
export function shouldCrawl(url, visited, currentDepth, maxPages, currentPageCount) {
  // Don't crawl if already visited
  if (visited.has(url)) {
    return false;
  }
  
  // Don't crawl if we've reached max pages
  if (currentPageCount >= maxPages) {
    return false;
  }
  
  // Skip common file extensions that aren't HTML
  const skipExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.zip', '.tar', '.gz', '.mp4', '.mp3', '.avi', '.mov'];
  if (skipExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
    return false;
  }
  
  return true;
}
