'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { Trash2, Check, X, Palette, Pencil, Tag } from 'lucide-react';
import { WhiteboardNode } from '@whiteboard/shared/types';
import { cn } from '@/utils/cn';
import { useStore } from '@/store/useStore';

// ── Gradient palette from the reference image ──────────────────────────────
const COLORS: Record<
  string,
  {
    gradient: string;
    glow: string;
    ring: string;
    text: string;
    swatch: string;
  }
> = {
  purple: {
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #a855f7 60%, #c084fc 100%)',
    glow: '0 0 0 2px rgba(168,85,247,0.5), 0 0 30px rgba(168,85,247,0.4)',
    ring: 'rgba(168,85,247,0.7)',
    text: '#ffffff',
    swatch: '#a855f7',
  },
  teal: {
    gradient: 'linear-gradient(135deg, #0d9488 0%, #22d3ee 60%, #a5f3fc 100%)',
    glow: '0 0 0 2px rgba(34,211,238,0.5), 0 0 30px rgba(34,211,238,0.4)',
    ring: 'rgba(34,211,238,0.7)',
    text: '#0a0b16',
    swatch: '#22d3ee',
  },
  yellow: {
    gradient: 'linear-gradient(135deg, #ecd32e 0%, #f9d566 50%, #fff8a2 100%)',
    glow: '0 0 0 2px rgba(249,215,100,0.5), 0 0 30px rgba(249,215,100,0.4)',
    ring: 'rgba(249,215,100,0.7)',
    text: '#1a0800',
    swatch: '#ecd32e',
  },
  pink: {
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 60%, #fda4af 100%)',
    glow: '0 0 0 2px rgba(244,114,182,0.5), 0 0 30px rgba(244,114,182,0.4)',
    ring: 'rgba(244,114,182,0.7)',
    text: '#ffffff',
    swatch: '#f472b6',
  },
  blue: {
    gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 60%, #a5b4fc 100%)',
    glow: '0 0 0 2px rgba(96,165,250,0.5), 0 0 30px rgba(96,165,250,0.4)',
    ring: 'rgba(96,165,250,0.7)',
    text: '#ffffff',
    swatch: '#60a5fa',
  },
  lime: {
    gradient: 'linear-gradient(135deg, #65a30d 0%, #a3e635 60%, #d9f99d 100%)',
    glow: '0 0 0 2px rgba(163,230,53,0.5), 0 0 30px rgba(163,230,53,0.4)',
    ring: 'rgba(163,230,53,0.7)',
    text: '#0c1a00',
    swatch: '#a3e635',
  },
  orange: {
    gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fde68a 100%)',
    glow: '0 0 0 2px rgba(249,115,22,0.5), 0 0 30px rgba(249,115,22,0.4)',
    ring: 'rgba(249,115,22,0.7)',
    text: '#1a0800',
    swatch: '#f97316',
  },
  slate: {
    gradient: 'linear-gradient(135deg,#494e69 0%, #656588 60%, #878ba3 100%)',
    glow: '0 0 0 2px rgba(148,163,184,0.3), 0 0 20px rgba(148,163,184,0.2)',
    ring: 'rgba(148,163,184,0.5)',
    text: '#ffffff',
    swatch: '#3e3f5f',
  },
};

const NoteNode = ({ id, data, selected }: NodeProps<WhiteboardNode['data']>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState(data.content || '');
  const [title, setTitle] = useState(data.title || '');

  const updateNode = useStore((s) => s.updateNode);
  const deleteNode = useStore((s) => s.deleteNode);
  const editingNodeId = useStore((s) => s.editingNodeId);
  const setEditingNodeId = useStore((s) => s.setEditingNodeId);

  React.useEffect(() => {
    if (editingNodeId === id) {
      setIsEditing(true);
      setEditingNodeId(null);
    }
  }, [editingNodeId, id, setEditingNodeId]);

  const currentColor = (data.color as string) || 'purple';
  const style = COLORS[currentColor] ?? COLORS.purple;

  const handleSave = () => {
    updateNode(id, { content, title });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(data.content || '');
    setTitle(data.title || '');
    setIsEditing(false);
  };

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

  return (
    <div
      className="group relative h-full w-full"
      style={{
        borderRadius: 20,
        background: style.gradient,
        boxShadow: selected
          ? `${style.glow}, 0 20px 40px rgba(0,0,0,0.4)`
          : '0 10px 30px rgba(0,0,0,0.35)',
        border: selected
          ? `2px solid ${style.ring}`
          : '2px solid rgba(255,255,255,0.18)',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
        overflow: 'visible',
        ['--accent-color' as string]: style.swatch,
        ['--accent-glow' as string]: style.swatch + '55',
      }}
    >
      {/* 4 connection handles — visible on hover, connectable in any direction */}
      <Handle type="source" position={Position.Top} id="top" style={{}}/>
      <Handle type="source" position={Position.Bottom} id="bottom" style={{}}/>
      <Handle type="source" position={Position.Left}   id="left" style={{}}/>
      <Handle type="source" position={Position.Right}  id="right" style={{}}/>

      <NodeResizer color="rgba(255,255,255,0.6)" isVisible={selected} minWidth={160} minHeight={80} />

      {/* Card content */}
      <div className="w-full h-full p-3 rounded-[16px]" style={{ color: style.text }}>
        <div className="space-y-2">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-lg px-2.5 py-1.5 text-[13px] font-bold outline-none focus:ring-2"
                style={{
                  background: 'rgba(0,0,0,0.15)',
                  color: style.text,
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
                autoFocus
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing..."
                className="w-full rounded-lg px-2.5 py-1.5 text-[12px] outline-none resize-none min-h-[80px] focus:ring-2"
                style={{
                  background: 'rgba(0,0,0,0.15)',
                  color: style.text,
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: 'rgba(0,0,0,0.2)', color: style.text }}
                >
                  <X size={15} />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 rounded-xl transition-colors"
                  style={{ background: 'rgba(0,0,0,0.25)', color: style.text }}
                >
                  <Check size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="cursor-text min-h-[60px] break-words"
              onDoubleClick={() => setIsEditing(true)}
            >
              <h3
                className="font-bold text-[14px] mb-1.5 break-words leading-tight"
                style={{ color: style.text, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
              >
                {title || 'New Note 🔖'}
              </h3>
              <p
                className="text-[12px] whitespace-pre-wrap leading-relaxed break-words line-clamp-4 font-medium"
                style={{ color: style.text, opacity: 0.88 }}
              >
                {content || 'Click to add content…'}
              </p>
            </div>
          )}

          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(data.tags as string[]).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase"
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    color: style.text,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Floating action bar */}
        <div
          className={cn(
            'nodrag absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 glass p-1.5 rounded-2xl shadow-xl transition-all duration-200 z-50',
            isEditing || selected
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
          <button
            className="p-2 hover:bg-red-500/20 rounded-xl text-white hover:text-red-400 transition-colors"
            onClick={() => deleteNode(id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(NoteNode);
