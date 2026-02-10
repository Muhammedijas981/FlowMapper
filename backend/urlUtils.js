// URL utility functions shared between frontend and backend

/**
 * Normalize a URL by removing fragments, trailing slashes, and converting to lowercase
 * @param {string} url - The URL to normalize
 * @returns {string} - Normalized URL
 */
export function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remove fragment
    urlObj.hash = '';
    // Remove trailing slash from pathname
    if (urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    return urlObj.href.toLowerCase();
  } catch (error) {
    return url;
  }
}

/**
 * Check if two URLs belong to the same domain
 * @param {string} url1 - First URL
 * @param {string} url2 - Second URL
 * @returns {boolean} - True if same domain
 */
export function isSameDomain(url1, url2) {
  try {
    const domain1 = new URL(url1).hostname;
    const domain2 = new URL(url2).hostname;
    return domain1 === domain2;
  } catch (error) {
    return false;
  }
}

/**
 * Validate if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extract the base domain from a URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} - The domain (e.g., "example.com")
 */
export function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return '';
  }
}

/**
 * Convert relative URL to absolute URL
 * @param {string} relativeUrl - Relative URL
 * @param {string} baseUrl - Base URL to resolve against
 * @returns {string} - Absolute URL
 */
export function resolveUrl(relativeUrl, baseUrl) {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (error) {
    return relativeUrl;
  }
}
