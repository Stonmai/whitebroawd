'use client';

import React, { memo, useState, useRef } from 'react';
import { NodeProps, NodeResizer } from 'reactflow';
import { FolderX, Pencil, Check, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/utils/cn';

const GroupNode = ({ id, data, selected }: NodeProps) => {
  const removeGroup = useStore(s => s.removeGroup);
  const updateNode = useStore(s => s.updateNode);
  const editingNodeId = useStore(s => s.editingNodeId);
  const setEditingNodeId = useStore(s => s.setEditingNodeId);
  const isDropTarget = !!data.__dropTarget;

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(data.title || '');
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editingNodeId === id) {
      setNameInput(data.title || '');
      setIsEditingName(true);
      setEditingNodeId(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editingNodeId, id, setEditingNodeId]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNameInput(data.title || '');
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim() || 'New Group 📦';
    if (trimmed) updateNode(id, { title: trimmed} as any);
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setNameInput(data.title || 'New Group 📦');
    setIsEditingName(false);
  };

  return (
    <div
      className="group w-full h-full relative"
      style={{
        borderRadius: 20,
        border: isDropTarget
          ? '2px dashed rgba(200, 241, 53, 0.85)'
          : selected
          ? '2px solid rgba(255,255,255,0.35)'
          : '2px dashed rgba(255,255,255,0.15)',
        background: isDropTarget
          ? 'rgba(200, 241, 53, 0.06)'
          : selected
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(4px)',
        transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
        boxShadow: isDropTarget
          ? '0 0 0 2px rgba(200,241,53,0.2), inset 0 0 40px rgba(200,241,53,0.04)'
          : selected
          ? '0 0 0 2px rgba(255,255,255,0.1)'
          : 'none',
      }}
    >
      <NodeResizer
        color="rgba(255,255,255,0.4)"
        isVisible={selected}
        minWidth={200}
        minHeight={150}
      />

      {/* Group label */}
      <div
        style={{ position: 'absolute', top: -65, left: 0, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        {isEditingName ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') handleCancelName();
              }}
              placeholder="NEW GROUP"
              className="rounded-lg px-2 py-0.5 text-[11px] font-bold tracking-widest uppercase text-white outline-none placeholder:text-white/30"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                width: 120,
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={handleSaveName}
            >
              <Check size={11} />
            </button>
            <button
              className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={handleCancelName}
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 8,
                fontSize: 25,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: isDropTarget ? 'rgba(200,241,53,0.18)' : 'rgba(255,255,255,0.08)',
                color: isDropTarget ? '#c8f135' : 'rgba(255,255,255,0.55)',
                border: isDropTarget ? '1px solid rgba(200,241,53,0.35)' : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.15s ease',
              }}
            >
              {data.title || 'New Group 📦'}
            </span>
            {data.count !== undefined && (
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                {data.count} items
              </span>
            )}
          </>
        )}
      </div>

      {/* Drop hint */}
      {isDropTarget && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(200,241,53,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Drop to add
          </span>
        </div>
      )}

      {/* Floating action bar */}
      <div
        className={cn(
          'absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1 glass p-1 rounded-xl shadow-xl transition-all duration-200 z-50',
          selected
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
        )}
      >
        <button
          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
          title="Rename"
          onClick={handleStartEdit}
        >
          <Pencil size={15} />
        </button>
        <button
          className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
          title="Ungroup"
          onClick={(e) => { e.stopPropagation(); removeGroup(id); }}
        >
          <FolderX size={15} />
        </button>
      </div>
    </div>
  );
};

export default memo(GroupNode);