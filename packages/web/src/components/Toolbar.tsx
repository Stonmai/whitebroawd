'use client';

import React from 'react';
import { StickyNote, Plus, Tag, Group, Wand2, Undo2, Redo2, Home, Utensils, Bed, Bath, SofaIcon } from 'lucide-react';
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
  const { screenToFlowPosition } = useReactFlow();

  const [showRooms, setShowRooms] = React.useState(false);
  const roomsRef = React.useRef<HTMLDivElement>(null);

  // Close panel on outside click
  React.useEffect(() => {
    if (!showRooms) return;
    const handler = (e: MouseEvent) => {
      if (roomsRef.current && !roomsRef.current.contains(e.target as Node)) {
        setShowRooms(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showRooms]);

  const center = (offsetX = 0, offsetY = 0) => {
    const pos = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    return {
      x: pos.x - offsetX + (Math.random() - 0.5) * 80,
      y: pos.y - offsetY + (Math.random() - 0.5) * 80,
    };
  };

  const handleAddBookmark = () => {
    const id = uuidv4();
    addNode({
      id,
      type: 'bookmark',
      position: center(90, 65),
      width: 180,
      data: {
        title: '',
        url: '',
      },
      createdAt: new Date().toISOString(),
    });
    setEditingNodeId(id);
  };

  const handleAddSticker = () => {
    const id = uuidv4();
    addNode({
      id,
      type: 'note',
      position: center(90, 65),
      width: 180,
      data: {
        title: '',
        content: '',
      },
      createdAt: new Date().toISOString(),
    });
    setEditingNodeId(id);
  };

  const handleAddGroup = () => {
    const id = uuidv4();
    addNode({
      id,
      type: 'group',
      position: center(160, 120),
      width: 320,
      height: 240,
      data: {
        title: 'New Group',
      },
      createdAt: new Date().toISOString(),
    });
    setEditingNodeId(id);
  };

  const currentRoom = ROOMS.find(r => r.id === currentRoomId) ?? ROOMS[0];

  const secondaryItems = [
    { icon: <StickyNote size={20} strokeWidth={2} />, label: 'Sticker',  action: handleAddSticker },
    { icon: <Group size={20} strokeWidth={2} />,      label: 'Group',    action: handleAddGroup },
    { icon: <Tag size={20} strokeWidth={2} />,        label: 'Tags',     action: () => {} },
    { icon: <Wand2 size={20} strokeWidth={2} />,      label: 'Arrange',  action: autoArrange },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <div
        className="flex items-center gap-2 px-4 py-1"
        style={{
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
        {/* Rooms button */}
        <div className="relative" ref={roomsRef}>
          {showRooms && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 14px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10, 11, 22, 0.94)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 20,
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                width: 220,
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              }}
            >
              <div
                style={{
                  gridColumn: '1 / -1',
                  fontSize: 9,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.25)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 4,
                  paddingLeft: 2,
                }}
              >
                Rooms
              </div>
              {ROOMS.map(room => {
                const active = room.id === currentRoomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => { switchRoom(room.id); setShowRooms(false); }}
                    style={{
                      borderRadius: 14,
                      padding: '12px 8px',
                      background: active ? 'rgba(200,241,53,0.12)' : 'rgba(255,255,255,0.04)',
                      border: active ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.07)',
                      color: active ? '#c8f135' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 7,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (active) return;
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                      (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      if (active) return;
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                      (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                    }}
                  >
                    {room.icon}
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
                      {room.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col items-center justify-center mx-3">
            <button
              onClick={() => setShowRooms(v => !v)}
              style={{
                width: 44,
                height: 36,
                borderRadius: 13,
                background: showRooms ? 'rgba(200,241,53,0.12)' : 'transparent',
                border: 'none',
                color: showRooms ? '#c8f135' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease',
                position: 'relative',
                top: '-5px'
              }}
              onMouseEnter={(e) => {
                if (showRooms) return;
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                if (showRooms) return;
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              {currentRoom.icon}
            </button>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: showRooms ? 'rgba(200,241,53,0.7)' : 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                userSelect: 'none',
                lineHeight: 1.2,
                textAlign: 'center',
                whiteSpace: 'normal',
              }}
            >
              {currentRoom.label}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Undo / Redo */}
        {[
          { icon: <Undo2 size={18} strokeWidth={2} />, action: undo, enabled: canUndo, label: '⌘Z' },
          { icon: <Redo2 size={18} strokeWidth={2} />, action: redo, enabled: canRedo, label: '⌘⇧Z' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            disabled={!item.enabled}
            title={item.label}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'transparent',
              border: 'none',
              color: item.enabled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
              cursor: item.enabled ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!item.enabled) return;
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = item.enabled ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)';
            }}
          >
            {item.icon}
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Primary + button */}
        <button
          onClick={handleAddBookmark}
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            background: '#c8f135',
            color: '#0a0b16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(200,241,53,0.5), 0 0 8px rgba(200,241,53,0.3)',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px rgba(200,241,53,0.7), 0 0 12px rgba(200,241,53,0.4)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(200,241,53,0.5), 0 0 8px rgba(200,241,53,0.3)';
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.94)'; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Secondary tools */}
        {secondaryItems.map((item) => (
          <div key={item.label} className="flex flex-col items-center justify-center">
            <button
              onClick={item.action}
              style={{
                width: 44,
                height: 36,
                borderRadius: 13,
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.18s ease',
                position: 'relative',
                top: '-5px'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(0.92)'; }}
            >
              {item.icon}
            </button>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                userSelect: 'none',
                lineHeight: 1,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
