//Intelligent noise reduction for user flow mapping
//This is the core differentiator - reduces noise to show meaningful user flows

export function identifyGlobalNavigation(crawlData) {
  const { pages, links } = crawlData;
  const totalPages = pages.length;
  
  const linkFrequency = new Map();
  
  // Group links by source page
  const linksByPage = new Map();
  for (const link of links) {
    if (!linksByPage.has(link.source)) {
      linksByPage.set(link.source, []);
    }
    linksByPage.get(link.source).push(link.target);
  }
  
  // Count frequency of each target URL
  for (const [source, targets] of linksByPage) {
    const uniqueTargets = new Set(targets);
    for (const target of uniqueTargets) {
      linkFrequency.set(target, (linkFrequency.get(target) || 0) + 1);
    }
  }
  
  // Apply 70% threshold heuristic 
  // Links appearing on >70% of pages are considered global navigation
  const globalLinks = new Set();
  const threshold = 0.70;
  
  for (const [url, frequency] of linkFrequency) {
    if (frequency / totalPages > threshold) {
      globalLinks.add(url);
      console.log(`Global nav detected: ${url} (appears on ${frequency}/${totalPages} pages = ${Math.round(frequency/totalPages*100)}%)`);
    }
  }
  
  return globalLinks;
}

//Classify pages by type to filter out utility pages

export function classifyPagesByType(pages) {
  const classified = {
    entry: [],
    content: [],
    utility: []
  };
  
  for (const page of pages) {
    classified[page.type].push(page);
  }
  
  console.log(`Page classification: ${classified.entry.length} entry, ${classified.content.length} content, ${classified.utility.length} utility`);
  
  return classified;
}

//Score links based on importance (context-based classification)
//Primary links (from main content) are weighted higher than secondary links
export function scoreLinks(links) {
  return links.map(link => {
    let score = 1;
    
    if (link.context && link.context.type === 'primary') {
      score = 3;
    } else if (link.context && link.context.type === 'navigation') {
      score = 0.5;
    } else if (link.context && link.context.type === 'footer') {
      score = 0.3;
    }
    
    return {
      ...link,
      score
    };
  });
}

//Build a clean, noise-reduced graph from crawl data

export function buildCleanGraph(crawlData) {
  const { pages, links, startUrl } = crawlData;
  
  console.log('Building clean graph...');
  
  // Step 1: Identify global navigation
  const globalNav = identifyGlobalNavigation(crawlData);
  
  // Step 2: Classify pages
  const classified = classifyPagesByType(pages);
  
  // Step 3: Score links
  const scoredLinks = scoreLinks(links);
  
  // Step 4: Filter out noise
  // Remove links to utility pages
  const utilityUrls = new Set(classified.utility.map(p => p.url));
  
  // Remove redundant edges caused by global navigation
  // Keep only primary content links and high-scoring links
  const cleanLinks = scoredLinks.filter(link => {
    // Remove links to utility pages
    if (utilityUrls.has(link.target)) {
      return false;
    }
    
    // Remove global nav links UNLESS they're from primary content
    // This keeps meaningful flows while removing header/footer noise
    if (globalNav.has(link.target) && link.score < 2) {
      return false;
    }
    
    return true;
  });
  
  console.log(`Noise reduction: ${links.length} raw links -> ${cleanLinks.length} clean links (${Math.round((1 - cleanLinks.length/links.length) * 100)}% reduction)`);
  
  // Step 5: Build graph structure
  const nodes = pages
    .filter(page => !utilityUrls.has(page.url)) // Exclude utility pages
    .map(page => ({
      id: page.url,
      title: page.title,
      type: page.type,
      depth: page.depth,
      isStart: page.url === startUrl
    }));
  
  const edges = cleanLinks.map(link => ({
    source: link.source,
    target: link.target,
    weight: link.score,
    type: link.context ? link.context.type : 'secondary'
  }));
  
  // Remove duplicate edges (keep highest score)
  const edgeMap = new Map();
  for (const edge of edges) {
    const key = `${edge.source}->${edge.target}`;
    const existing = edgeMap.get(key);
    if (!existing || edge.weight > existing.weight) {
      edgeMap.set(key, edge);
    }
  }
  
  const uniqueEdges = Array.from(edgeMap.values());
  
  console.log(`Graph built: ${nodes.length} nodes, ${uniqueEdges.length} edges`);
  
  return {
    nodes,
    edges: uniqueEdges,
    metadata: {
      totalPagesVisited: pages.length,
      pagesInGraph: nodes.length,
      totalLinksFound: links.length,
      linksInGraph: uniqueEdges.length,
      globalNavLinksDetected: globalNav.size,
      noiseReductionPercentage: Math.round((1 - cleanLinks.length/links.length) * 100)
    }
  };
}
