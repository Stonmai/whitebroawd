'use client';

import React from 'react';
import { StickyNote, Plus, Tag, Group, Wand2, Undo2, Redo2, Utensils, Bed, Bath, SofaIcon, X, Menu } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { useStore } from '@/store/useStore';
import { RoomType } from '@/store/useStore';
import { v4 as uuidv4 } from 'uuid';

const ROOMS: { id: RoomType; label: string; icon: React.ReactNode }[] = [
  { id: 'living-room', label: 'Living Room', icon: <SofaIcon size={22} strokeWidth={1.8} /> },
  { id: 'kitchen',     label: 'Kitchen',     icon: <Utensils size={22} strokeWidth={1.8} /> },
  { id: 'bedroom',     label: 'Bedroom',     icon: <Bed size={22} strokeWidth={1.8} /> },
  { id: 'toilet',      label: 'Toilet',      icon: <Bath size={22} strokeWidth={1.8} /> },
];

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 'calc(100% + 25px)',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(10, 11, 22, 0.94)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 20,
  padding: 14,
  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
};

const Toolbar = () => {
  const addNode = useStore((s) => s.addNode);
  const setEditingNodeId = useStore((s) => s.setEditingNodeId);
  const autoArrange = useStore((s) => s.autoArrange);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s._past.length > 0);
  const canRedo = useStore((s) => s._future.length > 0);
  const currentRoomId = useStore((s) => s.currentRoomId);
  const switchRoom = useStore((s) => s.switchRoom);
  const nodes = useStore((s) => s.nodes);
  const activeTagFilters = useStore((s) => s.activeTagFilters);
  const toggleTagFilter = useStore((s) => s.toggleTagFilter);
  const { screenToFlowPosition } = useReactFlow();

  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    nodes.forEach(n => (n.data.tags as string[] | undefined)?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [nodes]);

  const [showRooms, setShowRooms] = React.useState(false);
  const [showTags, setShowTags] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isCompact, setIsCompact] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 540);
      setIsCompact(window.innerWidth < 400);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const roomsRef = React.useRef<HTMLDivElement>(null);
  const tagsRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const roomsBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!showRooms) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        roomsRef.current && !roomsRef.current.contains(t) &&
        roomsBtnRef.current && !roomsBtnRef.current.contains(t)
      ) setShowRooms(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showRooms]);

  React.useEffect(() => {
    if (!showTags) return;
    const handler = (e: MouseEvent) => {
      if (tagsRef.current && !tagsRef.current.contains(e.target as Node)) setShowTags(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTags]);

  React.useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const center = (offsetX = 0, offsetY = 0) => {
    const pos = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    return { x: pos.x - offsetX + (Math.random() - 0.5) * 80, y: pos.y - offsetY + (Math.random() - 0.5) * 80 };
  };

  const handleAddBookmark = () => {
    const id = uuidv4();
    addNode({ id, type: 'bookmark', position: center(90, 65), width: 180, data: { title: '', url: '' }, createdAt: new Date().toISOString() });
    setEditingNodeId(id);
  };

  const handleAddSticker = () => {
    const id = uuidv4();
    addNode({ id, type: 'note', position: center(90, 65), width: 180, data: { title: '', content: '' }, createdAt: new Date().toISOString() });
    setEditingNodeId(id);
  };

  const handleAddGroup = () => {
    const id = uuidv4();
    addNode({ id, type: 'group', position: center(160, 120), width: 550, height: 450, data: { title: '' }, createdAt: new Date().toISOString() });
    setEditingNodeId(id);
  };

  const currentRoom = ROOMS.find(r => r.id === currentRoomId) ?? ROOMS[0];
  const hasActiveFilters = activeTagFilters.length > 0;

  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.28)',
    textTransform: 'uppercase', letterSpacing: '0.08em', userSelect: 'none', lineHeight: 1,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
  };

  const mkBtnStyle = (active = false): React.CSSProperties => ({
    width: isMobile ? 34 : 44, height: isMobile ? 32 : 36, borderRadius: 13,
    background: active ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none',
    color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.18s ease', position: 'relative', top: isMobile ? 0 : '-5px',
  });

  const onEnter = (e: React.MouseEvent<HTMLButtonElement>, skip = false) => {
    if (skip) return;
    const el = e.currentTarget as HTMLButtonElement;
    el.style.background = 'rgba(255,255,255,0.07)';
    el.style.color = '#ffffff';
    el.style.transform = 'translateY(-2px)';
  };
  const onLeave = (e: React.MouseEvent<HTMLButtonElement>, skip = false) => {
    if (skip) return;
    const el = e.currentTarget as HTMLButtonElement;
    el.style.background = 'transparent';
    el.style.color = 'rgba(255,255,255,0.5)';
    el.style.transform = 'translateY(0)';
  };
  const onDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(0.92)';
  };

  // ── Compact mode (< 400px): pill with rooms, + and menu ──────────────────
  if (isCompact) {
    const menuItems = [
      { icon: <StickyNote size={18} strokeWidth={2} />, label: 'Sticker', action: () => { handleAddSticker(); setShowMenu(false); } },
      { icon: <Group size={18} strokeWidth={2} />, label: 'Group', action: () => { handleAddGroup(); setShowMenu(false); } },
      { icon: <Tag size={18} strokeWidth={2} />, label: 'Tags', action: () => { setShowTags(v => !v); setShowMenu(false); }, active: hasActiveFilters },
      { icon: <Wand2 size={18} strokeWidth={2} />, label: 'Arrange', action: () => { autoArrange(); setShowMenu(false); } },
      { icon: <Undo2 size={18} strokeWidth={2} />, label: 'Undo', action: undo, disabled: !canUndo },
      { icon: <Redo2 size={18} strokeWidth={2} />, label: 'Redo', action: redo, disabled: !canRedo },
    ];

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
        <div className="relative" ref={menuRef}>
          {/* Tags panel */}
          {showTags && (
            <div ref={tagsRef} style={{ ...panelStyle, minWidth: 200, maxWidth: Math.min(300, window.innerWidth - 32) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Filter by tag</span>
                {hasActiveFilters && (
                  <button onClick={() => { [...activeTagFilters].forEach(t => toggleTagFilter(t)); }} style={{ fontSize: 9, fontWeight: 700, color: 'rgba(200,241,53,0.7)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <X size={10} /> Clear
                  </button>
                )}
              </div>
              {allTags.length === 0 ? (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '8px 0', margin: 0 }}>No tags yet</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {allTags.map(tag => {
                    const active = activeTagFilters.includes(tag);
                    return (
                      <button key={tag} onClick={() => toggleTagFilter(tag)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: active ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.06)', border: active ? '1px solid rgba(200,241,53,0.4)' : '1px solid rgba(255,255,255,0.08)', color: active ? '#c8f135' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.15s ease', textTransform: 'uppercase' }}>
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Rooms panel */}
          {showRooms && (
            <div ref={roomsRef} style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: Math.min(220, window.innerWidth - 32) }}>
              <div style={{ gridColumn: '1 / -1', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, paddingLeft: 2 }}>Rooms</div>
              {ROOMS.map(room => {
                const active = room.id === currentRoomId;
                return (
                  <button key={room.id} onClick={() => { switchRoom(room.id); setShowRooms(false); }} style={{ borderRadius: 14, padding: '12px 8px', background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s ease' }}>
                    {room.icon}
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>{room.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Menu grid */}
          {showMenu && (
            <div style={{ ...panelStyle, width: Math.min(240, window.innerWidth - 32) }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    disabled={item.disabled}
                    style={{
                      borderRadius: 14, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      background: item.active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.05)',
                      border: item.active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)',
                      color: item.active ? '#c8f135' : item.disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)',
                      cursor: item.disabled ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.icon}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compact pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', background: 'rgba(10, 11, 22, 0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 40, boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)', height: 60, animation: 'pillFloat 5s ease-in-out infinite' }}>
            {/* Rooms */}
            <button
              ref={roomsBtnRef}
              onClick={() => { setShowRooms(v => !v); setShowMenu(false); setShowTags(false); }}
              style={{ width: 36, height: 36, borderRadius: 13, background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease' }}
            >
              {currentRoom.icon}
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            {/* Bookmark + */}
            <button
              onClick={handleAddBookmark}
              style={{ width: 44, height: 44, borderRadius: 16, background: '#c8f135', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(200,241,53,0.5)', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)' }}
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            {/* Menu */}
            <button
              onClick={() => { setShowMenu(v => !v); setShowRooms(false); setShowTags(false); }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ width: 38, height: 38, borderRadius: 13, background: showMenu ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showMenu ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease', position: 'relative' }}
            >
              <Menu size={20} strokeWidth={2} />
              {hasActiveFilters && (
                <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#c8f135', border: '1.5px solid rgba(10,11,22,0.9)' }} />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile layout (400–540px): Rooms + + + menu ──────────────────────────
  if (isMobile) {
    const mobileMenuItems = [
      { icon: <StickyNote size={18} strokeWidth={2} />, label: 'Sticker', action: () => { handleAddSticker(); setShowMenu(false); } },
      { icon: <Group size={18} strokeWidth={2} />, label: 'Group', action: () => { handleAddGroup(); setShowMenu(false); } },
      { icon: <Tag size={18} strokeWidth={2} />, label: 'Tags', action: () => { setShowTags(v => !v); setShowMenu(false); }, active: hasActiveFilters },
      { icon: <Wand2 size={18} strokeWidth={2} />, label: 'Arrange', action: () => { autoArrange(); setShowMenu(false); } },
      { icon: <Undo2 size={18} strokeWidth={2} />, label: 'Undo', action: undo, disabled: !canUndo },
      { icon: <Redo2 size={18} strokeWidth={2} />, label: 'Redo', action: redo, disabled: !canRedo },
    ];

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
        <div className="relative" ref={menuRef}>
          {/* Tags panel */}
          {showTags && (
            <div ref={tagsRef} style={{ ...panelStyle, minWidth: 200, maxWidth: Math.min(300, window.innerWidth - 32) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Filter by tag</span>
                {hasActiveFilters && (
                  <button onClick={() => { [...activeTagFilters].forEach(t => toggleTagFilter(t)); }} style={{ fontSize: 9, fontWeight: 700, color: 'rgba(200,241,53,0.7)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <X size={10} /> Clear
                  </button>
                )}
              </div>
              {allTags.length === 0 ? (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '8px 0', margin: 0 }}>No tags yet</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {allTags.map(tag => {
                    const active = activeTagFilters.includes(tag);
                    return (
                      <button key={tag} onClick={() => toggleTagFilter(tag)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: active ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.06)', border: active ? '1px solid rgba(200,241,53,0.4)' : '1px solid rgba(255,255,255,0.08)', color: active ? '#c8f135' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.15s ease', textTransform: 'uppercase' }}>
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Rooms panel */}
          {showRooms && (
            <div ref={roomsRef} style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: Math.min(220, window.innerWidth - 32) }}>
              <div style={{ gridColumn: '1 / -1', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, paddingLeft: 2 }}>Rooms</div>
              {ROOMS.map(room => {
                const active = room.id === currentRoomId;
                return (
                  <button key={room.id} onClick={() => { switchRoom(room.id); setShowRooms(false); }} style={{ borderRadius: 14, padding: '12px 8px', background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s ease' }}>
                    {room.icon}
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>{room.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Menu grid */}
          {showMenu && (
            <div style={{ ...panelStyle, width: Math.min(240, window.innerWidth - 32) }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {mobileMenuItems.map((item) => (
                  <button key={item.label} onClick={item.action} disabled={item.disabled}
                    style={{ borderRadius: 14, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: item.active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.05)', border: item.active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: item.active ? '#c8f135' : item.disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.65)', cursor: item.disabled ? 'default' : 'pointer', transition: 'all 0.15s ease' }}
                  >
                    {item.icon}
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', background: 'rgba(10, 11, 22, 0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 40, boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)', height: 60, animation: 'pillFloat 5s ease-in-out infinite' }}>
            {/* Rooms */}
            <button
              ref={roomsBtnRef}
              onClick={() => { setShowRooms(v => !v); setShowMenu(false); setShowTags(false); }}
              style={{ width: 36, height: 36, borderRadius: 13, background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease' }}
            >
              {currentRoom.icon}
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            {/* Bookmark + */}
            <button onClick={handleAddBookmark}
              style={{ width: 44, height: 44, borderRadius: 16, background: '#c8f135', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(200,241,53,0.5)', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)' }}
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            {/* Menu */}
            <button
              onClick={() => { setShowMenu(v => !v); setShowRooms(false); setShowTags(false); }}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ width: 38, height: 38, borderRadius: 13, background: showMenu ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showMenu ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease', position: 'relative' }}
            >
              <Menu size={20} strokeWidth={2} />
              {hasActiveFilters && <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#c8f135', border: '1.5px solid rgba(10,11,22,0.9)' }} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
      <div
        className="flex items-center"
        style={{
          gap: 8,
          padding: '0 16px',
          animation: 'pillFloat 5s ease-in-out infinite',
          background: 'rgba(10, 11, 22, 0.72)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '40px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
          height: 76,
        }}
      >
        {/* Rooms */}
        <div className="relative" ref={roomsRef}>
          {showRooms && (
            <div style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: Math.min(220, window.innerWidth - 32) }}>
              <div style={{ gridColumn: '1 / -1', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, paddingLeft: 2 }}>Rooms</div>
              {ROOMS.map(room => {
                const active = room.id === currentRoomId;
                return (
                  <button key={room.id} onClick={() => { switchRoom(room.id); setShowRooms(false); }} style={{ borderRadius: 14, padding: '12px 8px', background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.04)', border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)', color: active ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => { if (active) return; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
                    onMouseLeave={(e) => { if (active) return; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; }}
                  >
                    {room.icon}
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>{room.label}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex flex-col items-center justify-center" style={{ margin: '0 12px' }}>
            <button
              onClick={() => setShowRooms(v => !v)}
              style={{ width: 44, height: 36, borderRadius: 13, background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent', border: 'none', color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease', position: 'relative', top: '-5px' }}
              onMouseEnter={(e) => { if (showRooms) return; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
              onMouseLeave={(e) => { if (showRooms) return; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; }}
            >
              {currentRoom.icon}
            </button>
            <span style={{ fontSize: 9, fontWeight: 700, color: showRooms ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em', userSelect: 'none', lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{currentRoom.label}</span>
          </div>
        </div>

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Undo / Redo */}
        {[
          { icon: <Undo2 size={18} strokeWidth={2} />, action: undo, enabled: canUndo, label: '⌘Z' },
          { icon: <Redo2 size={18} strokeWidth={2} />, action: redo, enabled: canRedo, label: '⌘⇧Z' },
        ].map((item) => (
          <button key={item.label} onClick={item.action} disabled={!item.enabled} title={item.label}
            style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', color: item.enabled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)', cursor: item.enabled ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { if (!item.enabled) return; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = item.enabled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)'; }}
          >
            {item.icon}
          </button>
        ))}

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Primary + */}
        <button
          onClick={handleAddBookmark}
          style={{ width: isMobile ? 42 : 52, height: isMobile ? 42 : 52, borderRadius: 18, background: '#c8f135', color: '#0a0b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(200,241,53,0.5), 0 0 8px rgba(200,241,53,0.3)', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px rgba(200,241,53,0.7), 0 0 12px rgba(200,241,53,0.4)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(200,241,53,0.5), 0 0 8px rgba(200,241,53,0.3)'; }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Sticker */}
        <div className="flex flex-col items-center justify-center">
          <button style={mkBtnStyle()} onClick={handleAddSticker} onMouseEnter={(e) => onEnter(e)} onMouseLeave={(e) => onLeave(e)} onMouseDown={onDown}><StickyNote size={20} strokeWidth={2} /></button>
          {!isMobile && <span style={labelStyle}>Sticker</span>}
        </div>

        {/* Group */}
        <div className="flex flex-col items-center justify-center">
          <button style={mkBtnStyle()} onClick={handleAddGroup} onMouseEnter={(e) => onEnter(e)} onMouseLeave={(e) => onLeave(e)} onMouseDown={onDown}><Group size={20} strokeWidth={2} /></button>
          {!isMobile && <span style={labelStyle}>Group</span>}
        </div>

        {/* Tags */}
        <div className="relative flex flex-col items-center justify-center" ref={tagsRef}>
          {showTags && (
            <div style={{ ...panelStyle, minWidth: 200, maxWidth: Math.min(300, window.innerWidth - 32) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Filter by tag</span>
                {hasActiveFilters && (
                  <button onClick={() => { [...activeTagFilters].forEach(t => toggleTagFilter(t)); }} style={{ fontSize: 9, fontWeight: 700, color: 'rgba(200,241,53,0.7)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <X size={10} /> Clear
                  </button>
                )}
              </div>
              {allTags.length === 0 ? (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '8px 0', margin: 0 }}>No tags yet</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {allTags.map(tag => {
                    const active = activeTagFilters.includes(tag);
                    return (
                      <button key={tag} onClick={() => toggleTagFilter(tag)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: active ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.06)', border: active ? '1px solid rgba(200,241,53,0.4)' : '1px solid rgba(255,255,255,0.08)', color: active ? '#c8f135' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.15s ease', textTransform: 'uppercase' }}>
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <button
            style={{ ...mkBtnStyle(hasActiveFilters), top: isMobile ? 0 : '-5px' }}
            onClick={() => { setShowTags(v => !v); setShowRooms(false); }}
            onMouseEnter={(e) => onEnter(e, hasActiveFilters || showTags)}
            onMouseLeave={(e) => onLeave(e, hasActiveFilters || showTags)}
            onMouseDown={onDown}
          >
            <Tag size={20} strokeWidth={2} />
            {hasActiveFilters && (
              <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: '#c8f135', border: '1.5px solid rgba(10,11,22,0.9)' }} />
            )}
          </button>
          {!isMobile && <span style={{ ...labelStyle, color: hasActiveFilters ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)' }}>Tags</span>}
        </div>

        {/* Arrange */}
        <div className="flex flex-col items-center justify-center">
          <button style={mkBtnStyle()} onClick={autoArrange} onMouseEnter={(e) => onEnter(e)} onMouseLeave={(e) => onLeave(e)} onMouseDown={onDown}><Wand2 size={20} strokeWidth={2} /></button>
          {!isMobile && <span style={labelStyle}>Arrange</span>}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;