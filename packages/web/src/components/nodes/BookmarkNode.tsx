'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { ExternalLink, Trash2, Palette, Check, X, Pencil, Tag } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { WhiteboardNode } from '@whiteboard/shared/types';
import { cn } from '@/utils/cn';

// Bookmark cards use a glassmorphism style with a colored accent on the left edge
const COLORS: Record<
  string,
  { accent: string; glow: string; ring: string; swatch: string }
> = {
  white:  { accent: 'rgba(255,255,255,0.1)', glow: '0 0 28px rgba(255,255,255,0.1)', ring: 'rgba(255,255,255,0.4)', swatch: '#94a3b8' },
  blue:   { accent: '#3b82f6',               glow: '0 0 28px rgba(59,130,246,0.4)',  ring: 'rgba(59,130,246,0.7)',  swatch: '#3b82f6' },
  green:  { accent: '#10b981',               glow: '0 0 28px rgba(16,185,129,0.4)', ring: 'rgba(16,185,129,0.7)', swatch: '#10b981' },
  amber:  { accent: '#f59e0b',               glow: '0 0 28px rgba(245,158,11,0.4)', ring: 'rgba(245,158,11,0.7)', swatch: '#f59e0b' },
  purple: { accent: '#a855f7',               glow: '0 0 28px rgba(168,85,247,0.4)', ring: 'rgba(168,85,247,0.7)', swatch: '#a855f7' },
  pink:   { accent: '#f472b6',               glow: '0 0 28px rgba(244,114,182,0.4)',ring: 'rgba(244,114,182,0.7)',swatch: '#f472b6' },
};

const BookmarkNode = ({ data, selected, id }: NodeProps<WhiteboardNode['data']>) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showTagInput, setShowTagInput] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(data.title || '');
  const [tempUrl, setTempUrl] = React.useState(data.url || '');
  const [tempDescription, setTempDescription] = React.useState(data.description || '');

  const deleteNode = useStore((s) => s.deleteNode);
  const updateNode = useStore((s) => s.updateNode);
  const editingNodeId = useStore((s) => s.editingNodeId);
  const setEditingNodeId = useStore((s) => s.setEditingNodeId);

  React.useEffect(() => {
    if (editingNodeId === id) {
      setIsEditing(true);
      setEditingNodeId(null);
    }
  }, [editingNodeId, id, setEditingNodeId]);

  const currentColor = (data.color as string) || 'white';
  const style = COLORS[currentColor] ?? COLORS.white;

  const handleColorChange = (color: string) => {
    updateNode(id, { color });
    setShowColorPicker(false);
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed) return;
    const existing = (data.tags as string[]) || [];
    if (!existing.includes(trimmed)) updateNode(id, { tags: [...existing, trimmed] });
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const existing = (data.tags as string[]) || [];
    updateNode(id, { tags: existing.filter(t => t !== tag) });
  };

  const handleSave = () => {
    updateNode(id, { title: tempTitle, url: tempUrl, description: tempDescription });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(data.title || '');
    setTempUrl(data.url || '');
    setTempDescription(data.description || '');
    setIsEditing(false);
  };

  React.useEffect(() => {
    if (!isEditing) {
      setTempTitle(data.title || '');
      setTempUrl(data.url || '');
      setTempDescription(data.description || '');
    }
  }, [data.title, data.url, data.description, isEditing]);

  return (
    <div
      className="group relative h-full w-full"
      style={{
        borderRadius: 18,
        background: 'rgba(12, 13, 28, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: selected
          ? `2px solid ${style.ring}`
          : '1.5px solid rgba(255,255,255,0.10)',
        boxShadow: selected
          ? `${style.glow}, 0 20px 40px rgba(0,0,0,0.5)`
          : '0 12px 32px rgba(0,0,0,0.4)',
        overflow: 'visible',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        ['--accent-color' as string]: style.swatch,
        ['--accent-glow' as string]: style.swatch + '55',
      }}
    >
      {/* Colored left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 12,
          bottom: 12,
          width: 4,
          borderRadius: '0 4px 4px 0',
          background: style.accent,
          opacity: 0.9,
        }}
      />

      {/* 4 connection handles — visible on hover, connectable in any direction */}
      <Handle type="source" position={Position.Top}    id="top"    />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left}   id="left"   />
      <Handle type="source" position={Position.Right}  id="right"  />

      <NodeResizer color="rgba(255,255,255,0.5)" isVisible={selected} minWidth={160} minHeight={80} />

      {/* Card body */}
      <div className="w-full h-full rounded-[14px] overflow-hidden" onDoubleClick={() => { if (!isEditing) setIsEditing(true); }}>
        <div className="p-3 pl-4">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-lg px-2.5 py-1 text-[13px] font-bold text-white outline-none focus:ring-2 focus:ring-white/30"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                autoFocus
              />
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="URL"
                className="w-full rounded-lg px-2.5 py-1 text-[11px] text-white/70 outline-none focus:ring-2 focus:ring-white/20"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full rounded-lg px-2.5 py-1 text-[11px] text-white/80 outline-none resize-none min-h-[56px] focus:ring-2 focus:ring-white/20"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={handleCancel}
                  className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={13} />
                </button>
                <button
                  onClick={handleSave}
                  className="p-1 rounded-lg text-white hover:bg-white/15 transition-colors"
                >
                  <Check size={13} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="flex items-start gap-2 mb-2"
              >
                {data.favicon && (
                  <img
                    src={data.favicon as string}
                    alt=""
                    className="w-4 h-4 mt-0.5 rounded flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.08)', padding: 1 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold text-white leading-tight break-words mb-0.5">
                    {data.title || 'Untitled Bookmark'}
                  </h3>
                  <p className="text-[9px] text-white/35 break-all font-mono">
                    {data.url as string}
                  </p>
                </div>
              </div>

              {data.description && (
                <p
                  className="text-[11px] text-white/65 mb-2 leading-relaxed line-clamp-2 font-medium"
                >
                  {data.description as string}
                </p>
              )}

              {(data.screenshot || data.ogImage) && (
                <div
                  className="w-full aspect-video rounded-lg overflow-hidden mb-2 cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  onClick={() => window.open(data.url as string, '_blank')}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={(data.screenshot || data.ogImage) as string}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      const el = (e.currentTarget as HTMLElement).parentElement;
                      if (el) el.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {data.tags && (data.tags as string[]).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(data.tags as string[]).map((tag, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.65)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating action bar */}
      <div
        className={cn(
          'absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 glass p-1.5 rounded-2xl shadow-xl transition-all duration-200 z-50',
          isEditing
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
        )}
      >
        <div className="relative">
          <button
            className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
            onClick={() => { setShowColorPicker(!showColorPicker); setShowTagInput(false); }}
          >
            <Palette size={15} />
          </button>

          {showColorPicker && (
            <div className="absolute bottom-full left-0 mb-3 p-2 glass-dark rounded-2xl shadow-2xl flex gap-2 z-[60] border border-white/20">
              {Object.entries(COLORS).map(([key, val]) => (
                <button
                  key={key}
                  aria-label={key}
                  className="transition-transform hover:scale-125"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: val.swatch,
                    border: key === currentColor ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleColorChange(key)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
            onClick={() => { setShowTagInput(!showTagInput); setShowColorPicker(false); }}
          >
            <Tag size={15} />
          </button>

          {showTagInput && (
            <div className="absolute bottom-full left-0 mb-3 p-2.5 glass-dark rounded-2xl shadow-2xl z-[60] border border-white/20" style={{ width: 180 }}>
              {(data.tags as string[] || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(data.tags as string[]).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase cursor-pointer transition-colors hover:bg-red-500/20 hover:text-red-400"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} <X size={8} />
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddTag(tagInput); }
                  if (e.key === 'Escape') setShowTagInput(false);
                }}
                placeholder="Add tag & press Enter"
                autoFocus
                className="w-full rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none placeholder:text-white/30"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
            </div>
          )}
        </div>

        {!isEditing && (
          <button
            className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={15} />
          </button>
        )}
        {!isEditing && (
          <button
            className="p-2 hover:bg-blue-500/20 rounded-xl text-white hover:text-blue-400 transition-colors"
            onClick={() => window.open(data.url as string, '_blank')}
          >
            <ExternalLink size={15} />
          </button>
        )}
        <button
          className="p-2 hover:bg-red-500/20 rounded-xl text-white hover:text-red-400 transition-colors"
          onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default memo(BookmarkNode);
