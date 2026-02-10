import dagre from 'dagre';

export function transformForD3(backendGraph) {
  if (!backendGraph || !backendGraph.nodes || !backendGraph.edges) {
    return { nodes: [], links: [] };
  }
  
  const { nodes, edges } = backendGraph;
  
  // Create a new directed graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({ 
    rankdir: 'LR', // Left-to-Right layout
    nodesep: 50,   // horizontal space between nodes
    ranksep: 80,   // vertical space between ranks
    marginx: 20,
    marginy: 20
  });
  g.setDefaultEdgeLabel(() => ({}));
  
  // Add nodes to the graph with dimensions
  nodes.forEach(node => {
    g.setNode(node.id, { 
      label: node.title,
      width: 150,  // Fixed width for boxes
      height: 50,  // Fixed height for boxes
      type: node.type,
      isStart: node.isStart
    });
  });
  
  // Add edges to the graph
  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target, { 
      type: edge.type,
      weight: edge.weight
    });
  });
  
  // Calculate layout
  dagre.layout(g);
  
  // Convert back to format for Vue rendering
  const layoutNodes = [];
  g.nodes().forEach(v => {
    const node = g.node(v);
    layoutNodes.push({
      id: v,
      ...node, // Contains x, y, width, high
    });
  });
  
  const layoutEdges = [];
  g.edges().forEach(e => {
    const edge = g.edge(e);
    layoutEdges.push({
      source: e.v, // Source node ID
      target: e.w, // Target node ID
      points: edge.points, // Array of {x, y} for the path
      type: edge.type
    });
  });
  
  return {
    nodes: layoutNodes,
    links: layoutEdges
  };
}
