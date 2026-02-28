import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Share2, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

const Popup = () => {
  const [tabInfo, setTabInfo] = useState<{ title?: string; url?: string; favicon?: string }>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        setTabInfo({
          title: activeTab.title,
          url: activeTab.url,
          favicon: activeTab.favIconUrl,
        });
      }
    });
  }, []);

  const handleCapture = async () => {
    setStatus('loading');
    const allTags = tagInput.trim() ? [...tags, tagInput.trim()] : tags;
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CAPTURE_TAB',
        tags: allTags
      });
      if (response.success) {
        setStatus('success');
        setTimeout(() => window.close(), 1500);
      } else {
        setStatus('error');
      }
    } catch (e) {
      setStatus('error');
    }
  };

  const handleCaptureAll = async () => {
    setStatus('loading');
    const response = await chrome.runtime.sendMessage({ type: 'CAPTURE_ALL_TABS' });
    if (response.success) setStatus('success');
    else setStatus('error');
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput) {
      if (!tags.includes(tagInput)) {
        setTags([...tags, tagInput]);
      }
      setTagInput('');
    }
  };

  return (
    <div className="p-4 bg-white text-slate-900 border-none select-none">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-200">
          <Share2 size={18} />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">Whiteboard Capture</h1>
          <p className="text-[10px] text-slate-400 font-medium">Add to your workspace</p>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
        <div className="flex items-start gap-3">
          {tabInfo.favicon && <img src={tabInfo.favicon} alt="" className="w-4 h-4 mt-1" />}
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold truncate leading-tight mb-1">{tabInfo.title || 'Loading...'}</h2>
            <p className="text-[10px] text-slate-400 truncate font-mono">{tabInfo.url}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(t => (
              <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold border border-blue-100 flex items-center gap-1">
                {t}
                <button onClick={() => setTags(tags.filter(tag => tag !== t))} className="hover:text-blue-800">×</button>
              </span>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="Add tags (press Enter)..." 
            className="w-full bg-slate-100 border-none rounded-lg text-xs p-2.5 focus:ring-2 ring-blue-500/20 transition-all placeholder:text-slate-400"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            disabled={status === 'loading'}
            onClick={handleCapture}
            className="col-span-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl shadow-lg shadow-blue-200 transition-all font-bold text-sm flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <Clock size={16} className="animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle2 size={16} />
            ) : status === 'error' ? (
              <AlertCircle size={16} />
            ) : (
              <Plus size={16} />
            )}
            {status === 'success' ? 'Added!' : 'Add current tab'}
          </button>
          
          <button 
            onClick={handleCaptureAll}
            className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-bold text-[11px] flex items-center justify-center gap-2"
          >
            Capture All
          </button>
          
          <button 
            className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-bold text-[11px] flex items-center justify-center gap-2"
            onClick={() => {
              // Try to find the app on any of the common ports
              window.open('http://localhost:3000', '_blank');
            }}
          >
            Go to Whiteboard
          </button>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
