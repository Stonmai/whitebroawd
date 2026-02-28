'use client';

import React, { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  BackgroundVariant,
  Node,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '@/store/useStore';
import BookmarkNode from './nodes/BookmarkNode';
import NoteNode from './nodes/NoteNode';
import GroupNode from './nodes/GroupNode';
import Toolbar from './Toolbar';
import PreviewModal from './PreviewModal';
import IntroModal from './IntroModal';

import { v4 as uuidv4 } from 'uuid';
import { fetchMetadata } from '@/utils/metadata';

const nodeTypes = {
  bookmark: BookmarkNode,
  tab: BookmarkNode,
  note: NoteNode,
  group: GroupNode,
};

type HandlerProps = {
  addNode: (node: any) => void;
  updateNode: (id: string, data: any) => void;
};

const SyncHandler = ({ addNode, updateNode }: HandlerProps) => {
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    const handleSyncResponse = (event: any) => {
      const pendingCaptures = event.detail;
      if (!Array.isArray(pendingCaptures) || pendingCaptures.length === 0) return;

      const COL_W = 220;
      const ROW_H = 280;
      const cols = Math.ceil(Math.sqrt(pendingCaptures.length));
      const rows = Math.ceil(pendingCaptures.length / cols);

      // Centre the grid on the current viewport
      const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const originX = center.x - ((cols - 1) * COL_W) / 2;
      const originY = center.y - ((rows - 1) * ROW_H) / 2;

      pendingCaptures.forEach((capture: any, index: number) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const nodeId = uuidv4();
        addNode({
          id: nodeId,
          type: 'bookmark',
          position: { x: originX + col * COL_W, y: originY + row * ROW_H },
          width: 180,
          data: capture,
          createdAt: new Date().toISOString(),
        });
        if (!capture.screenshot && capture.url) {
          fetchMetadata(capture.url).then((metadata: any) => { updateNode(nodeId, metadata); });
        }
      });
    };

    window.addEventListener('WHITEBOARD_SYNC_RESPONSE', handleSyncResponse);
    return () => window.removeEventListener('WHITEBOARD_SYNC_RESPONSE', handleSyncResponse);
  }, [addNode, updateNode, screenToFlowPosition]);

  return null;
};

type PasteHandlerProps = HandlerProps;

const PasteHandler = ({ addNode, updateNode }: PasteHandlerProps) => {
  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const text = event.clipboardData?.getData('text');
      if (!text) return;

      const isUrl = /^(https?:\/\/[^\s]+)$/.test(text.trim());

      const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      const position = {
        x: center.x + (Math.random() - 0.5) * 80,
        y: center.y + (Math.random() - 0.5) * 80,
      };

      if (isUrl) {
        const url = text.trim();
        const nodeId = uuidv4();
        let displayTitle = url;
        try { displayTitle = new URL(url).hostname.replace('www.', ''); } catch (e) {}

        addNode({
          id: nodeId,
          type: 'bookmark',
          position,
          width: 180,
          data: { title: displayTitle, url },
          createdAt: new Date().toISOString(),
        });

        fetchMetadata(url).then(metadata => { updateNode(nodeId, metadata); });
      } else {
        addNode({
          id: uuidv4(),
          type: 'note',
          position,
          width: 300,
          data: { title: 'Pasted Note', content: text },
          createdAt: new Date().toISOString(),
        });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addNode, updateNode, screenToFlowPosition]);

  return null;
};

const Canvas = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect = useStore((state) => state.onConnect);
  const addNode = useStore((state) => state.addNode);
  const updateNode = useStore((state) => state.updateNode);
  const autoArrange = useStore((state) => state.autoArrange);
  const previewNodeId = useStore((state) => state.previewNodeId);
  const setPreviewNodeId = useStore((state) => state.setPreviewNodeId);
  const setNodes = useStore((state) => state.setNodes);
  const snapshot = useStore((state) => state.snapshot);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const copyNodes = useStore((state) => state.copyNodes);
  const pasteNodes = useStore((state) => state.pasteNodes);

  // Track which group is being hovered during a drag
  const [dropTargetId, setDropTargetId] = React.useState<string | null>(null);

  // Helper: get the bounding rect of a group node in flow coordinates
  const getGroupBounds = useCallback((groupNode: Node) => {
    const w = (groupNode.style?.width as number) ?? 300;
    const h = (groupNode.style?.height as number) ?? 300;
    return {
      x: groupNode.position.x,
      y: groupNode.position.y,
      x2: groupNode.position.x + w,
      y2: groupNode.position.y + h,
    };
  }, []);

  // Find which group (if any) a dragged node overlaps
  const findOverlappingGroup = useCallback(
    (draggedNode: Node, allNodes: Node[]) => {
      const dw = (draggedNode.style?.width as number) ?? 180;
      const dh = (draggedNode.style?.height as number) ?? 100;
      const dx = draggedNode.position.x;
      const dy = draggedNode.position.y;

      return allNodes.find((n) => {
        if (n.type !== 'group' || n.id === draggedNode.id) return false;
        const b = getGroupBounds(n);
        // Centre of dragged node must be inside group bounds
        const cx = dx + dw / 2;
        const cy = dy + dh / 2;
        return cx > b.x && cx < b.x2 && cy > b.y && cy < b.y2;
      }) ?? null;
    },
    [getGroupBounds]
  );

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, draggedNode: Node) => {
      if (draggedNode.type === 'group') return;
      // Remove extent:'parent' immediately so the node is free to leave the group.
      // parentNode stays so coordinate space is unchanged during this drag.
      if ((draggedNode as any).extent === 'parent') {
        const currentNodes = useStore.getState().nodes;
        setNodes(
          currentNodes.map((n) =>
            n.id === draggedNode.id ? { ...n, extent: undefined } : n
          )
        );
      }
    },
    [setNodes]
  );

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, draggedNode: Node) => {
      if (draggedNode.type === 'group') return;
      const currentNodes = useStore.getState().nodes;

      // Compute absolute position.
      // During drag, a child node's position is relative to its parent.
      let absolutePos = draggedNode.position;
      if (draggedNode.parentNode) {
        const parent = currentNodes.find((n) => n.id === draggedNode.parentNode);
        if (parent) {
          absolutePos = {
            x: parent.position.x + draggedNode.position.x,
            y: parent.position.y + draggedNode.position.y,
          };
        }
      }
      const fakeNode = { ...draggedNode, position: absolutePos };
      const over = findOverlappingGroup(fakeNode, currentNodes);
      const newTarget = over?.id ?? null;

      if (newTarget !== dropTargetId) {
        setDropTargetId(newTarget);
        setNodes(
          currentNodes.map((n) =>
            n.type === 'group'
              ? { ...n, data: { ...n.data, __dropTarget: n.id === newTarget } }
              : n
          )
        );
      }
    },
    [dropTargetId, findOverlappingGroup, setNodes]
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, draggedNode: Node) => {
      if (draggedNode.type === 'group') return;
      snapshot();
      const currentNodes = useStore.getState().nodes;

      // Clear all drop-target highlights
      const cleared = currentNodes.map((n) =>
        n.type === 'group' ? { ...n, data: { ...n.data, __dropTarget: false } } : n
      );

      // Compute absolute position (children use relative coords while dragging)
      let absolutePos = draggedNode.position;
      const oldParent = draggedNode.parentNode
        ? cleared.find((n) => n.id === draggedNode.parentNode)
        : null;
      if (oldParent) {
        absolutePos = {
          x: oldParent.position.x + draggedNode.position.x,
          y: oldParent.position.y + draggedNode.position.y,
        };
      }

      const fakeNode = { ...draggedNode, position: absolutePos, parentNode: undefined };
      const targetGroup = findOverlappingGroup(fakeNode, cleared);

      const updated = cleared.map((n) => {
        if (n.id !== draggedNode.id) return n;

        if (targetGroup) {
          // ── Drag INTO a group ──
          const relPos = {
            x: absolutePos.x - targetGroup.position.x,
            y: absolutePos.y - targetGroup.position.y,
          };
          return {
            ...n,
            position: relPos,
            parentNode: targetGroup.id,
            // Do NOT set extent:'parent' — it prevents dragging back out
            extent: undefined,
          };
        } else {
          // ── Drag OUT of a group ──
          return {
            ...n,
            position: absolutePos,
            parentNode: undefined,
            extent: undefined,
          };
        }
      });

      setNodes(updated);
      setDropTargetId(null);
    },
    [findOverlappingGroup, setNodes]
  );

  const previewNode = useMemo(() => {
    const node = nodes.find(n => n.id === previewNodeId);
    if (!node) return null;
    return {
      id: node.id,
      type: node.type as any,
      position: node.position,
      data: node.data,
      createdAt: new Date().toISOString()
    };
  }, [nodes, previewNodeId]);


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const store = useStore.getState();
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); store.undo(); }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); store.redo(); }
      if (e.key === 'c') {
        e.preventDefault();
        store.copyNodes();
        const { nodes: allNodes, selectedNodes: sel } = store;
        const picked = allNodes.filter(n => sel.includes(n.id));
        if (picked.length === 1 && (picked[0].type === 'bookmark' || picked[0].type === 'tab') && picked[0].data.url) {
          navigator.clipboard.writeText(picked[0].data.url as string).catch(() => {});
        }
      }
      if (e.key === 'v') { e.preventDefault(); store.pasteNodes(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Periodically request sync from the extension
  useEffect(() => {
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('WHITEBOARD_SYNC_REQUEST'));
    }, 2000);
    return () => clearInterval(interval);
  }, []);


  if (!isMounted) return null;

  return (
    <div className="w-full h-screen overflow-hidden relative" style={{ background: '#0d0e1a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={({ nodes }) => useStore.getState().setSelectedNodes(nodes.map(n => n.id))}
        nodeTypes={nodeTypes as any}
        fitView
        connectionMode={'loose' as any}
        connectionRadius={40}
        snapToGrid={false}
        panOnDrag={true}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        selectionMode={'partial' as any}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        defaultEdgeOptions={{
          style: { strokeWidth: 2.5, strokeLinecap: 'round' },
          animated: false,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.5}
          color="rgba(255,255,255,0.18)"
        />
        <Controls position="bottom-left" style={{ marginBottom: 110, marginLeft: 20 }} />
        <Toolbar />
        <PasteHandler addNode={addNode} updateNode={updateNode} />
        <SyncHandler addNode={addNode} updateNode={updateNode} />
      </ReactFlow>

      {previewNode && (
        <PreviewModal
          node={previewNode}
          onClose={() => setPreviewNodeId(null)}
        />
      )}

      <IntroModal />
    </div>
  );
};

export default Canvas;
