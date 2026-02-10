import * as cheerio from 'cheerio';
import { resolveUrl } from './urlUtils.js';

/**
 * Parse HTML content and extract page information
 * @param {string} html - HTML content
 * @param {string} baseUrl - Base URL for resolving relative links
 * @returns {Object} - Parsed page data
 */
export function parseHTML(html, baseUrl) {
  const $ = cheerio.load(html);
  
  return {
    title: extractPageTitle($),
    links: extractLinks($, baseUrl),
    pageType: getPageType($)
  };
}

/**
 * Extract page title from HTML
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {string} - Page title
 */
export function extractPageTitle($) {
  // Try multiple sources for title
  let title = $('title').first().text().trim();
  
  if (!title) {
    title = $('h1').first().text().trim();
  }
  
  if (!title) {
    title = $('meta[property="og:title"]').attr('content') || '';
  }
  
  return title || 'Untitled Page';
}

/**
 * Extract all links from HTML with context information
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {string} baseUrl - Base URL for resolving relative links
 * @returns {Array} - Array of link objects with context
 */
export function extractLinks($, baseUrl) {
  const links = [];
  const seen = new Set();
  
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    
    try {
      const absoluteUrl = resolveUrl(href, baseUrl);
      
      // Avoid duplicates
      if (seen.has(absoluteUrl)) {
        return;
      }
      seen.add(absoluteUrl);
      
      const context = analyzeLinkContext($, element);
      
      links.push({
        url: absoluteUrl,
        text: $(element).text().trim() || '',
        context: context
      });
    } catch (error) {
      // Skip invalid URLs
    }
  });
  
  return links;
}

/**
 * Analyze the context of a link element to determine its importance
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {Element} element - Link element
 * @returns {Object} - Context information
 */
export function analyzeLinkContext($, element) {
  const $element = $(element);
  
  // Check parent elements to determine context
  const inNav = $element.closest('nav, header').length > 0;
  const inFooter = $element.closest('footer').length > 0;
  const inAside = $element.closest('aside').length > 0;
  const inMain = $element.closest('main, article').length > 0;
  
  // Determine link type based on context
  let type = 'secondary';
  if (inMain) {
    type = 'primary';
  } else if (inNav) {
    type = 'navigation';
  } else if (inFooter) {
    type = 'footer';
  } else if (inAside) {
    type = 'sidebar';
  }
  
  return {
    type,
    inNav,
    inFooter,
    inAside,
    inMain,
    ariaLabel: $element.attr('aria-label') || ''
  };
}

/**
 * Classify page type based on HTML structure and content
 * @param {CheerioAPI} $ - Cheerio instance
 * @returns {string} - Page type: 'entry', 'content', or 'utility'
 */
export function getPageType($) {
  // Check for common utility page indicators
  const title = $('title').text().toLowerCase();
  const h1 = $('h1').text().toLowerCase();
  
  // Utility pages
  if (title.includes('404') || title.includes('not found') ||
      title.includes('error') || h1.includes('404') ||
      title.includes('login') || title.includes('sign in') ||
      title.includes('search')) {
    return 'utility';
  }
  
  // Entry pages (homepage, landing pages)
  const hasHeroSection = $('section[class*="hero"], div[class*="hero"]').length > 0;
  const hasCTA = $('a[class*="cta"], button[class*="cta"]').length > 0;
  const isHomepage = title.includes('home') || $('body').hasClass('home');
  
  if (hasHeroSection || (hasCTA && isHomepage)) {
    return 'entry';
  }
  
  // Content pages (articles, products, etc.)
  const hasArticle = $('article').length > 0;
  const hasMainContent = $('main').length > 0;
  
  if (hasArticle || hasMainContent) {
    return 'content';
  }
  
  // Default to content
  return 'content';
}
