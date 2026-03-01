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
import CursorEffect from './CursorEffect';

import { v4 as uuidv4 } from 'uuid';
import { fetchMetadata } from '@/utils/metadata';

const nodeTypes = {
  bookmark: BookmarkNode,
  tab: BookmarkNode,
  note: NoteNode,
  group: GroupNode,
};

// Tracks the last text we wrote to the system clipboard from within the app.
// If the pasted text matches this, it came from an internal copy/cut and we
// should paste nodes rather than creating a new node from the text.
let _internalClipboardText = '';

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
  const { getViewport } = useReactFlow();
  const getViewportRef = React.useRef(getViewport);
  useEffect(() => { getViewportRef.current = getViewport; });

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const text = event.clipboardData?.getData('text')?.trim();

      // No text, or text matches what we internally copied → paste nodes
      if (!text || text === _internalClipboardText) {
        const store = useStore.getState();
        if (store.clipboard.length > 0) {
          const vp = getViewportRef.current();
          const center = {
            x: (window.innerWidth * 0.5 - vp.x) / vp.zoom,
            y: (window.innerHeight * 0.5 - vp.y) / vp.zoom,
          };
          store.pasteNodes(center);
        }
        return;
      }

      const isUrl = /^(https?:\/\/[^\s]+)$/.test(text);

      const vp = getViewportRef.current();
      const position = {
        x: (window.innerWidth * 0.5 - vp.x) / vp.zoom + (Math.random() - 0.5) * 80,
        y: (window.innerHeight * 0.5 - vp.y) / vp.zoom + (Math.random() - 0.5) * 80,
      };

      if (isUrl) {
        const nodeId = uuidv4();
        let displayTitle = text;
        try { displayTitle = new URL(text).hostname.replace('www.', ''); } catch (e) {}

        addNode({
          id: nodeId,
          type: 'bookmark',
          position,
          width: 180,
          data: { title: displayTitle, url: text, tags: ['pasted url'] },
          createdAt: new Date().toISOString(),
        });

        fetchMetadata(text).then(metadata => { updateNode(nodeId, metadata); });
      } else {
        const lines = text.split('\n');
        const title = "New Note 🔖"
        const content = lines || 'Pasted Note';
        addNode({
          id: uuidv4(),
          type: 'note',
          position,
          width: 300,
          data: { title, content, tags: ['pasted note'] },
          createdAt: new Date().toISOString(),
        });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addNode, updateNode]);

  return null;
};

const Canvas = () => {
  const [isMounted, setIsMounted] = React.useState(false);
  const rawNodes = useStore((state) => state.nodes);
  const activeTagFilters = useStore((state) => state.activeTagFilters);
  const nodes = React.useMemo(() => {
    if (activeTagFilters.length === 0) return rawNodes;
    return rawNodes.map(n => ({
      ...n,
      hidden: !(n.data.tags as string[] | undefined)?.some(t => activeTagFilters.includes(t)),
    }));
  }, [rawNodes, activeTagFilters]);
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
    const w = (groupNode.style?.width as number) ?? 550;
    const h = (groupNode.style?.height as number) ?? 450;
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
      // parentId stays so coordinate space is unchanged during this drag.
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

  // ReactFlow 11 uses `parentNode`; v12+ uses `parentId`. Support both.
  const getParentId = (n: Node) => (n as any).parentId || (n as any).parentNode;

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, draggedNode: Node) => {
      if (draggedNode.type === 'group') return;
      const currentNodes = useStore.getState().nodes;

      // Compute absolute position.
      // During drag, a child node's position is relative to its parent.
      let absolutePos = draggedNode.position;
      const parentId = getParentId(draggedNode);
      if (parentId) {
        const parent = currentNodes.find((n) => n.id === parentId);
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
      const oldParentId = getParentId(draggedNode);
      const oldParent = oldParentId ? cleared.find((n) => n.id === oldParentId) : null;
      if (oldParent) {
        absolutePos = {
          x: oldParent.position.x + draggedNode.position.x,
          y: oldParent.position.y + draggedNode.position.y,
        };
      }

      const fakeNode = { ...draggedNode, position: absolutePos, parentId: undefined, parentNode: undefined };
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
            parentId: targetGroup.id,
            parentNode: targetGroup.id,
            extent: undefined,
          };
        } else {
          // ── Drag OUT of a group ──
          return {
            ...n,
            position: absolutePos,
            parentId: undefined,
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
      if (e.key === 'c' || e.key === 'x') {
        e.preventDefault();
        const { nodes: allNodes, selectedNodes: sel } = store;
        const picked = allNodes.filter(n => sel.includes(n.id));
        if (e.key === 'x') {
          store.cutNodes();
        } else {
          store.copyNodes();
        }
        if (picked.length > 0) {
          // Build a text representation for the system clipboard
          const lines = picked
            .map(n => {
              if ((n.type === 'bookmark' || n.type === 'tab') && n.data.url) return n.data.url as string;
              if (n.type === 'note' && n.data.content) return n.data.content as string;
              return null;
            })
            .filter(Boolean) as string[];
          const text = lines.join('\n');
          _internalClipboardText = text;
          navigator.clipboard.writeText(text).catch(() => {});
        }
      }
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
      <CursorEffect />
    </div>
  );
};

export default Canvas;