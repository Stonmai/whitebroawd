'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { WhiteboardNode } from '@whiteboard/shared/types';
import { cn } from '@/utils/cn';

interface PreviewModalProps {
  node: WhiteboardNode | null;
  onClose: () => void;
}

const PreviewModal = ({ node, onClose }: PreviewModalProps) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            {node.data.favicon && (
              <img src={node.data.favicon} alt="" className="w-6 h-6 rounded" />
            )}
            <h3 className="text-base font-bold text-slate-900 truncate">
              {node.data.title || 'Preview'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-y-auto max-h-[70vh]">
          {node.data.screenshot ? (
            <div className="w-full bg-slate-50 border-b border-slate-100">
              <img 
                src={node.data.screenshot} 
                alt="Full Screenshot" 
                className="w-full h-auto object-contain max-h-[500px]" 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 text-slate-400">
              <Layers size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No screenshot available</p>
            </div>
          )}

          <div className="p-8 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">URL</p>
              <a 
                href={node.data.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all font-medium"
              >
                {node.data.url}
              </a>
            </div>

            {node.data.description && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</p>
                <p className="text-slate-600 leading-relaxed italic">
                  "{node.data.description}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={() => window.open(node.data.url, '_blank')}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-200 transition-all font-bold text-sm"
          >
            <ExternalLink size={16} />
            Open Source Page
          </button>
        </div>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

// Helper for empty state icon
const Layers = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
  </svg>
);

export default PreviewModal;
