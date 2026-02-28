import { Node } from 'reactflow';
import { WhiteboardNode } from '@whiteboard/shared/types';

export const extractDomain = (url?: string): string | null => {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch (e) {
    return null;
  }
};

export const findPlacement = (
  nodes: Node<WhiteboardNode['data']>[],
  newNodeData: WhiteboardNode['data']
): { x: number; y: number } => {
  const domain = extractDomain(newNodeData.url);
  
  // 1. Domain match
  if (domain) {
    const matchingNodes = nodes.filter(node => 
      node.type === 'bookmark' && extractDomain(node.data.url) === domain
    );

    if (matchingNodes.length > 0) {
      // Place near the first matching node in a spiral pattern
      const baseNode = matchingNodes[0];
      const angle = matchingNodes.length * 0.5;
      const radius = 250;
      
      return {
        x: baseNode.position.x + radius * Math.cos(angle),
        y: baseNode.position.y + radius * Math.sin(angle),
      };
    }
  }

  // 2. Default/Recent (for now, place at a random offset from 0,0 or near center)
  // In a real app, logic for "recent" would involve a timestamp check
  return {
    x: nodes.length * 50,
    y: nodes.length * 50,
  };
};
