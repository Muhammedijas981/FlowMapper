// URL utility functions shared between frontend and backend
//Normalize a URL by removing fragments, trailing slashes, and converting to lowercase

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

//Check if two URLs belong to the same domain

export function isSameDomain(url1, url2) {
  try {
    const domain1 = new URL(url1).hostname;
    const domain2 = new URL(url2).hostname;
    return domain1 === domain2;
  } catch (error) {
    return false;
  }
}

//Validate if a string is a valid URL

export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

//Extract the base domain from a URL

export function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return '';
  }
}

//Convert relative URL to absolute URL

export function resolveUrl(relativeUrl, baseUrl) {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (error) {
    return relativeUrl;
  }
}
