import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { dexieStorage } from './dexieStorage';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import { WhiteboardNode, GroupFrame, Tag } from '@whiteboard/shared/types';
import { findPlacement, extractDomain } from '@/utils/clustering';

// Module-level drag tracking — snapshot only if position actually changed
let _dragging = false;
let _preDragSnapshot: { nodes: Node[]; edges: Edge[] } | null = null;

const BOOKMARK_COLORS = ['blue', 'green', 'amber', 'purple', 'pink'];
const NOTE_COLORS = ['purple', 'teal', 'orange', 'pink', 'blue', 'lime'];

export type RoomType = 'living-room' | 'kitchen' | 'bedroom' | 'toilet';

export interface RoomData {
  id: RoomType;
  name: string;
  nodes: Node<WhiteboardNode['data']>[];
  edges: Edge[];
  groups: GroupFrame[];
}

const DEFAULT_ROOMS: RoomData[] = [
  { id: 'living-room', name: 'Living Room', nodes: [], edges: [], groups: [] },
  { id: 'kitchen',     name: 'Kitchen',     nodes: [], edges: [], groups: [] },
  { id: 'bedroom',     name: 'Bedroom',     nodes: [], edges: [], groups: [] },
  { id: 'toilet',      name: 'Toilet',      nodes: [], edges: [], groups: [] },
];

const ACCENT_HEX: Record<string, string> = {
  white: '#94a3b8', blue: '#3b82f6', green: '#10b981', amber: '#f59e0b',
  purple: '#a855f7', pink: '#f472b6', teal: '#22d3ee', orange: '#f97316',
  lime: '#a3e635', slate: '#475569',
};

type HistoryEntry = { nodes: Node[]; edges: Edge[] };

interface WhiteboardState {
  nodes: Node<WhiteboardNode['data']>[];
  edges: Edge[];
  groups: GroupFrame[];
  tags: Tag[];
  selectedNodes: string[];
  previewNodeId: string | null;
  editingNodeId: string | null;
  clipboard: Node[];
  _past: HistoryEntry[];
  _future: HistoryEntry[];
  rooms: RoomData[];
  currentRoomId: RoomType;
  hasSeenIntro: boolean;
  activeTagFilters: string[];

  // Actions
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: WhiteboardNode) => void;
  deleteNode: (id: string) => void;
  updateNode: (id: string, data: Partial<WhiteboardNode['data']>) => void;
  copyNodes: () => void;
  cutNodes: () => void;
  pasteNodes: (center?: { x: number; y: number }) => void;
  createGroup: (group: GroupFrame) => void;
  deleteGroup: (id: string) => void;
  removeGroup: (id: string) => void;
  addTag: (tag: Tag) => void;
  removeTag: (id: string) => void;
  setSelectedNodes: (ids: string[]) => void;
  setPreviewNodeId: (id: string | null) => void;
  setEditingNodeId: (id: string | null) => void;
  setNodes: (nodes: Node<WhiteboardNode['data']>[]) => void;
  autoArrange: () => void;
  switchRoom: (id: RoomType) => void;
  snapshot: () => void;
  undo: () => void;
  redo: () => void;
  dismissIntro: () => void;
  toggleTagFilter: (tag: string) => void;
  _getParentId: (n: Node) => string | undefined;
}

export const useStore = create<WhiteboardState>()(
  persist(
    (set, get) => ({
  nodes: [],
  edges: [],
  groups: [],
  rooms: DEFAULT_ROOMS,
  currentRoomId: 'living-room' as RoomType,
  tags: [
    { id: 'work', label: 'Work', color: 'slate' },
    { id: 'personal', label: 'Personal', color: 'slate' },
    { id: 'urgent', label: 'Urgent', color: 'slate' },
    { id: 'idea', label: 'Idea', color: 'slate' },
    { id: 'reference', label: 'Reference', color: 'slate' },
    { id: 'later', label: 'Later', color: 'slate' },
  ],
  selectedNodes: [],
  previewNodeId: null,
  editingNodeId: null,
  clipboard: [],
  _past: [],
  _future: [],
  hasSeenIntro: false,
  activeTagFilters: [],

  dismissIntro: () => set({ hasSeenIntro: true }),
  toggleTagFilter: (tag: string) => {
    const { activeTagFilters } = get();
    set({
      activeTagFilters: activeTagFilters.includes(tag)
        ? activeTagFilters.filter((t: string) => t !== tag)
        : [...activeTagFilters, tag],
    });
  },

  // ReactFlow 11 uses `parentNode`; v12+ uses `parentId`. Read both.
  _getParentId: (n: Node): string | undefined => (n as any).parentId || (n as any).parentNode,

  copyNodes: () => {
    const { nodes, selectedNodes, _getParentId } = get();
    const selected = nodes.filter((n: Node) => selectedNodes.includes(n.id));
    // Also include children of any selected groups
    const selectedGroupIds = new Set(selected.filter((n: Node) => n.type === 'group').map((n: Node) => n.id));
    const children = selectedGroupIds.size > 0
      ? nodes.filter((n: Node) => { const pid = _getParentId(n); return pid && selectedGroupIds.has(pid) && !selectedNodes.includes(n.id); })
      : [];
    const copied = [...selected, ...children];
    if (copied.length > 0) set({ clipboard: copied });
  },

  cutNodes: () => {
    const { nodes, edges, selectedNodes, _past, _getParentId } = get();
    const selected = nodes.filter((n: Node) => selectedNodes.includes(n.id));
    const selectedGroupIds = new Set(selected.filter((n: Node) => n.type === 'group').map((n: Node) => n.id));
    const children = selectedGroupIds.size > 0
      ? nodes.filter((n: Node) => { const pid = _getParentId(n); return pid && selectedGroupIds.has(pid) && !selectedNodes.includes(n.id); })
      : [];
    const cut = [...selected, ...children];
    if (cut.length === 0) return;
    const cutIds = new Set(cut.map((n: Node) => n.id));
    set({
      clipboard: cut,
      nodes: nodes.filter((n: Node) => !cutIds.has(n.id)),
      edges: edges.filter((e: Edge) => !cutIds.has(e.source) && !cutIds.has(e.target)),
      selectedNodes: [],
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
    });
  },

  pasteNodes: (center?: { x: number; y: number }) => {
    const { clipboard, nodes, edges, _past, _getParentId } = get();
    if (clipboard.length === 0) return;
    const idMap = new Map<string, string>();
    // First pass: generate all new IDs
    clipboard.forEach((n: Node) => {
      idMap.set(n.id, `${n.id}-copy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
    });
    const clipboardIds = new Set(clipboard.map((n: Node) => n.id));
    // Compute offset to move cluster center to target position
    const topLevel = clipboard.filter((n: Node) => { const pid = _getParentId(n); return !pid || !clipboardIds.has(pid); });
    let dx = 24, dy = 24;
    if (center && topLevel.length > 0) {
      const cx = topLevel.reduce((s: number, n: Node) => s + n.position.x, 0) / topLevel.length;
      const cy = topLevel.reduce((s: number, n: Node) => s + n.position.y, 0) / topLevel.length;
      dx = center.x - cx;
      dy = center.y - cy;
    }
    // Second pass: build pasted nodes with remapped parent references
    const pasted = clipboard.map((n: Node) => {
      const newId = idMap.get(n.id)!;
      const oldPid = _getParentId(n);
      const newParent = oldPid && clipboardIds.has(oldPid) ? idMap.get(oldPid) : undefined;
      const isChild = oldPid && clipboardIds.has(oldPid);
      return {
        ...n,
        id: newId,
        selected: true,
        parentId: newParent,
        parentNode: newParent,
        position: isChild ? n.position : { x: n.position.x + dx, y: n.position.y + dy },
      };
    });
    set({
      nodes: [...nodes.map((n: Node) => ({ ...n, selected: false })), ...pasted],
      selectedNodes: pasted.map((n: Node) => n.id),
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
    });
  },

  snapshot: () => {
    const { nodes, edges, _past } = get();
    set({ _past: [..._past.slice(-49), { nodes, edges }], _future: [] });
  },

  undo: () => {
    const { _past, _future, nodes, edges } = get();
    if (_past.length === 0) return;
    const prev = _past[_past.length - 1];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      _past: _past.slice(0, -1),
      _future: [{ nodes, edges }, ..._future.slice(0, 49)],
    });
  },

  redo: () => {
    const { _past, _future, nodes, edges } = get();
    if (_future.length === 0) return;
    const next = _future[0];
    set({
      nodes: next.nodes,
      edges: next.edges,
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: _future.slice(1),
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    const posChanges = changes.filter(c => c.type === 'position') as Array<{ type: 'position'; dragging?: boolean }>;
    const isDragging = posChanges.some(c => c.dragging === true);
    const isDragEnd = posChanges.some(c => c.dragging === false) && _dragging;

    // Snapshot on remove
    if (changes.some(c => c.type === 'remove')) {
      const { nodes, edges, _past } = get();
      set({ _past: [..._past.slice(-49), { nodes, edges }], _future: [] });
    }

    // Save pre-drag state on drag start
    if (isDragging && !_dragging) {
      const { nodes, edges } = get();
      _preDragSnapshot = { nodes, edges };
      _dragging = true;
    }

    const newNodes = applyNodeChanges(changes, get().nodes);

    // On drag end, only commit to history if position actually changed
    if (isDragEnd) {
      _dragging = false;
      if (_preDragSnapshot) {
        const snap = _preDragSnapshot;
        _preDragSnapshot = null;
        const moved = newNodes.some(n => {
          const old = snap.nodes.find(o => o.id === n.id);
          return old && (Math.abs(old.position.x - n.position.x) > 0.5 || Math.abs(old.position.y - n.position.y) > 0.5);
        });
        if (moved) {
          const { edges, _past } = get();
          set({ nodes: newNodes, _past: [..._past.slice(-49), snap], _future: [] });
          return;
        }
      }
    }

    set({ nodes: newNodes });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    if (changes.some(c => c.type === 'remove')) {
      const { nodes, edges, _past } = get();
      set({ _past: [..._past.slice(-49), { nodes, edges }], _future: [] });
    }
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection: Connection) => {
    const { nodes, edges, _past } = get();
    const sourceNode = nodes.find((n: Node) => n.id === connection.source);
    const accentHex = ACCENT_HEX[(sourceNode?.data?.color as string) ?? ''] ?? '#c8f135';
    set({
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
      edges: addEdge({
        ...connection,
        style: { stroke: accentHex, strokeWidth: 2.5 },
      }, edges),
    });
  },

  addNode: (node: WhiteboardNode) => {
    const { nodes, edges, _past } = get();
    const position = node.position || findPlacement(nodes, node.data);

    const palette = node.type === 'note' ? NOTE_COLORS : BOOKMARK_COLORS;
    const color = (node.data.color as string) || palette[Math.floor(Math.random() * palette.length)];

    const newNode: Node = {
      id: node.id,
      type: node.type,
      position,
      data: { ...node.data, color },
      style: { width: node.width, height: node.height },
    };

    const finalNodes = node.type === 'group' ? [newNode, ...nodes] : [...nodes, newNode];
    set({
      nodes: finalNodes,
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
    });
  },

  deleteNode: (id: string) => {
    const { nodes, edges, _past } = get();
    set({
      nodes: nodes.filter((node: Node) => node.id !== id),
      edges: edges.filter((edge: Edge) => edge.source !== id && edge.target !== id),
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
    });
  },

  updateNode: (id: string, data: Partial<WhiteboardNode['data']>) => {
    set({
      nodes: get().nodes.map((node: Node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      }),
    });
  },

  createGroup: (group: GroupFrame) => {
    set({
      groups: [...get().groups, group],
    });
  },

  deleteGroup: (id: string) => {
    set({
      groups: get().groups.filter((group: GroupFrame) => group.id !== id),
    });
  },

  removeGroup: (id: string) => {
    const { nodes, edges, _past, _getParentId } = get();
    const groupNode = nodes.find((n: Node) => n.id === id);
    if (!groupNode) return;
    set({
      _past: [..._past.slice(-49), { nodes, edges }],
      _future: [],
      nodes: nodes
        .filter((n: Node) => n.id !== id)
        .map((n: Node) => {
          if (_getParentId(n) !== id) return n;
          return {
            ...n,
            parentId: undefined,
            parentNode: undefined,
            extent: undefined,
            position: {
              x: groupNode.position.x + n.position.x,
              y: groupNode.position.y + n.position.y,
            },
          };
        }),
    });
  },

  addTag: (tag: Tag) => {
    set({
      tags: [...get().tags, tag],
    });
  },

  removeTag: (id: string) => {
    set({
      tags: get().tags.filter((tag: Tag) => tag.id !== id),
    });
  },

  setSelectedNodes: (ids: string[]) => {
    set({
      selectedNodes: ids,
    });
  },

  setPreviewNodeId: (id: string | null) => {
    set({ previewNodeId: id });
  },

  setEditingNodeId: (id: string | null) => {
    set({ editingNodeId: id });
  },

  setNodes: (nodes: Node<WhiteboardNode['data']>[]) => {
    set({ nodes });
  },

  switchRoom: (id: RoomType) => {
    const { rooms, currentRoomId, nodes, edges, groups } = get();
    if (id === currentRoomId) return;
    const updatedRooms = rooms.map((r: RoomData) =>
      r.id === currentRoomId ? { ...r, nodes, edges, groups } : r
    );
    const newRoom = updatedRooms.find((r: RoomData) => r.id === id);
    if (!newRoom) return;
    set({
      rooms: updatedRooms,
      currentRoomId: id,
      nodes: newRoom.nodes,
      edges: newRoom.edges,
      groups: newRoom.groups,
      _past: [],
      _future: [],
    });
  },

  autoArrange: () => {
    const allNodes = get().nodes;

    const NODE_W = 180, NODE_H = 120;
    const GROUP_PAD = 60, NODE_GAP = 60;
    const CLUSTER_GAP = 120;

    // Existing groups and their child ids
    const existingGroupIds = new Set(
      allNodes.filter((n: Node) => n.type === 'group').map((n: Node) => n.id)
    );
    const existingGroups = allNodes.filter((n: Node) => n.type === 'group');
    const getPid = (n: Node): string | undefined => (n as any).parentId || (n as any).parentNode;
    const childNodes = allNodes.filter((n: Node) => { const pid = getPid(n); return pid && existingGroupIds.has(pid); });

    // Top-level (ungrouped) nodes
    const topBookmarks = allNodes.filter(
      (n: Node) => (n.type === 'bookmark' || n.type === 'tab') && !getPid(n)
    );
    const topNotes = allNodes.filter((n: Node) => n.type === 'note' && !getPid(n));

    // Group ungrouped bookmarks by domain
    const domainMap = new Map<string, Node[]>();
    topBookmarks.forEach((n: Node) => {
      const domain = extractDomain(n.data.url);
      if (domain) {
        if (!domainMap.has(domain)) domainMap.set(domain, []);
        domainMap.get(domain)!.push(n);
      }
    });

    const toBeGrouped = new Set<string>();
    const newGroups: Node[] = [];
    const newGroupChildren: Node[] = [];

    domainMap.forEach((domNodes, domain) => {
      const groupId = `group-${domain}`;
      if (existingGroupIds.has(groupId)) return; // already grouped
      if (domNodes.length < 2) return;           // need 2+ to auto-group

      const cols = Math.ceil(Math.sqrt(domNodes.length));
      const rows = Math.ceil(domNodes.length / cols);
      const gw = cols * NODE_W + (cols - 1) * NODE_GAP + GROUP_PAD * 2;
      const gh = rows * NODE_H + (rows - 1) * NODE_GAP + GROUP_PAD * 2 + 130;

      newGroups.push({
        id: groupId,
        type: 'group',
        position: { x: 0, y: 0 },
        style: { width: Math.max(gw, 550), height: Math.max(gh, 450) },
        data: { title: domain.toUpperCase(), count: domNodes.length },
      });

      domNodes.forEach((n, i) => {
        toBeGrouped.add(n.id);
        newGroupChildren.push({
          ...n,
          parentId: groupId,
          parentNode: groupId,
          extent: undefined,
          position: {
            x: GROUP_PAD + (i % cols) * (NODE_W + NODE_GAP),
            y: GROUP_PAD + Math.floor(i / cols) * (NODE_H + NODE_GAP),
          },
        });
      });
    });

    const remainingNodes = [
      ...topBookmarks.filter((n: Node) => !toBeGrouped.has(n.id)),
      ...topNotes,
    ];

    // Cluster remaining nodes by edge connectivity (union-find)
    const allEdges = get().edges;
    const remainingIds = new Set(remainingNodes.map(n => n.id));
    const parent = new Map<string, string>();
    const find = (id: string): string => {
      if (!parent.has(id)) parent.set(id, id);
      const p = parent.get(id)!;
      if (p !== id) parent.set(id, find(p));
      return parent.get(id)!;
    };
    const union = (a: string, b: string) => parent.set(find(a), find(b));

    remainingNodes.forEach((n: Node) => parent.set(n.id, n.id));
    allEdges.forEach((e: Edge) => {
      if (remainingIds.has(e.source) && remainingIds.has(e.target)) {
        union(e.source, e.target);
      }
    });

    // Map root -> nodes in component
    const compMap = new Map<string, Node[]>();
    remainingNodes.forEach((n: Node) => {
      const root = find(n.id);
      if (!compMap.has(root)) compMap.set(root, []);
      compMap.get(root)!.push(n);
    });

    // Build layout blocks: groups + connected components
    interface Block { repId: string; nodes: Node[]; w: number; h: number; isGroup: boolean; }
    const blocks: Block[] = [
      ...existingGroups.map((g: Node) => ({
        repId: g.id, nodes: [g],
        w: (g.style?.width as number) ?? 550,
        h: (g.style?.height as number) ?? 450,
        isGroup: true,
      })),
      ...newGroups.map((g: Node) => ({
        repId: g.id, nodes: [g],
        w: (g.style?.width as number) ?? 550,
        h: (g.style?.height as number) ?? 450,
        isGroup: true,
      })),
    ];

    compMap.forEach((compNodes, root) => {
      const cols = Math.ceil(Math.sqrt(compNodes.length));
      const rows = Math.ceil(compNodes.length / cols);
      const nw = Math.max(...compNodes.map(n => (n.style?.width as number) ?? NODE_W));
      const nh = Math.max(...compNodes.map(n => (n.style?.height as number) ?? NODE_H));
      blocks.push({
        repId: root,
        nodes: compNodes,
        w: cols * nw + (cols - 1) * NODE_GAP,
        h: rows * nh + (rows - 1) * NODE_GAP,
        isGroup: false,
      });
    });

    // Sort: groups first, then larger clusters
    blocks.sort((a, b) => {
      if (a.isGroup && !b.isGroup) return -1;
      if (!a.isGroup && b.isGroup) return 1;
      return (b.w * b.h) - (a.w * a.h);
    });

    // Row-based layout
    const totalArea = blocks.reduce((s: number, b) => s + (b.w + CLUSTER_GAP) * (b.h + CLUSTER_GAP), 0);
    const MAX_ROW_W = Math.max(1400, Math.sqrt(totalArea) * 1.5);
    const blockPositions = new Map<string, { x: number; y: number }>();
    let cx = 0, cy = 0, rowH = 0;

    blocks.forEach(block => {
      if (cx > 0 && cx + block.w > MAX_ROW_W) {
        cx = 0; cy += rowH + CLUSTER_GAP; rowH = 0;
      }
      blockPositions.set(block.repId, { x: cx, y: cy });
      cx += block.w + CLUSTER_GAP;
      rowH = Math.max(rowH, block.h);
    });

    // Resolve individual node positions within each block
    const nodePositions = new Map<string, { x: number; y: number }>();
    blocks.forEach(block => {
      const bp = blockPositions.get(block.repId)!;
      if (block.isGroup || block.nodes.length === 1) {
        nodePositions.set(block.nodes[0].id, bp);
      } else {
        const cols = Math.ceil(Math.sqrt(block.nodes.length));
        block.nodes.forEach((n, i) => {
          const nw = (n.style?.width as number) ?? NODE_W;
          const nh = (n.style?.height as number) ?? NODE_H;
          nodePositions.set(n.id, {
            x: bp.x + (i % cols) * (nw + NODE_GAP),
            y: bp.y + Math.floor(i / cols) * (nh + NODE_GAP),
          });
        });
      }
    });

    const finalNodes: Node[] = [
      ...existingGroups.map((g: Node) => ({ ...g, position: nodePositions.get(g.id) ?? g.position })),
      ...newGroups.map((g: Node) => ({ ...g, position: nodePositions.get(g.id) ?? { x: 0, y: 0 } })),
      ...childNodes,
      ...newGroupChildren,
      ...remainingNodes.map((n: Node) => ({ ...n, position: nodePositions.get(n.id) ?? n.position })),
    ];

    const { nodes: curNodes, edges: curEdges, _past } = get();
    set({
      nodes: finalNodes,
      _past: [..._past.slice(-49), { nodes: curNodes, edges: curEdges }],
      _future: [],
    });
  },
}),
{
  name: 'whitebroawd-storage',
  storage: typeof window !== 'undefined'
    ? createJSONStorage(() => dexieStorage)
    : createJSONStorage(() => dummyStorage),
  partialize: (state) => ({
    rooms: state.rooms,
    currentRoomId: state.currentRoomId,
    nodes: state.nodes,
    edges: state.edges,
    groups: state.groups,
    tags: state.tags,
    hasSeenIntro: state.hasSeenIntro,
  }),
  onRehydrateStorage: () => async (state: any) => {
    // One-time migration: copy localStorage data into Dexie then remove it
    if (typeof window !== 'undefined' && !state) {
      const LS_KEY = 'whitebroawd-storage';
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) {
        try {
          await dexieStorage.setItem(LS_KEY, raw);
          window.localStorage.removeItem(LS_KEY);
        } catch (err) {
          console.warn('[whitebroawd] localStorage→Dexie migration failed:', err);
        }
      }
      return;
    }
    if (!state.rooms || state.rooms.length === 0) {
      // Migrate from old format: move existing nodes/edges/groups into living room
      state.rooms = DEFAULT_ROOMS.map((r: RoomData) =>
        r.id === 'living-room'
          ? { ...r, nodes: state.nodes || [], edges: state.edges || [], groups: state.groups || [] }
          : r
      );
      state.currentRoomId = 'living-room';
    } else {
      // Top-level nodes/edges/groups are always the most up-to-date (persisted on every change).
      // Sync them back into the current room so rooms array stays consistent.
      const roomId = state.currentRoomId || 'living-room';
      state.rooms = state.rooms.map((r: RoomData) =>
        r.id === roomId
          ? { ...r, nodes: state.nodes || [], edges: state.edges || [], groups: state.groups || [] }
          : r
      );
    }
  },
}
)
);

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};