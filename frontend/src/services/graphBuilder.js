import dagre from 'dagre';

export function transformForD3(backendGraph) {
  if (!backendGraph || !backendGraph.nodes || !backendGraph.edges) {
    return { nodes: [], links: [] };
  }
  
  const { nodes, edges } = backendGraph;
  
  // Create a new directed graph
  const g = new dagre.graphlib.Graph();
  g.setGraph({ 
    rankdir: 'LR', 
    nodesep: 50,   
    ranksep: 80, 
    marginx: 20,
    marginy: 20
  });
  g.setDefaultEdgeLabel(() => ({}));
  
  // Add nodes to the graph with dimensions
  nodes.forEach(node => {
    g.setNode(node.id, { 
      label: node.title,
      width: 150, 
      height: 50,
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
