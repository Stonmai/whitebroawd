import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

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
    <div className="p-4 select-none" style={{ background: '#0d0e1a', color: '#fff' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <img src="icon.png" alt="logo" className="w-8 h-8 rounded-lg" />
        <div>
          <h1 className="text-sm font-bold tracking-tight" style={{ color: '#c8f135' }}>whitebroawd</h1>
          <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>capture to your workspace</p>
        </div>
      </div>

      {/* Tab info */}
      <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-start gap-3">
          {tabInfo.favicon && <img src={tabInfo.favicon} alt="" className="w-4 h-4 mt-0.5 rounded" />}
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold truncate leading-tight mb-1" style={{ color: '#fff' }}>{tabInfo.title || 'Loading...'}</h2>
            <p className="text-[10px] truncate font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{tabInfo.url}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tags */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.35)' }}>Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1" style={{ background: 'rgba(200,241,53,0.1)', color: '#c8f135', border: '1px solid rgba(200,241,53,0.2)' }}>
                {t}
                <button onClick={() => setTags(tags.filter(tag => tag !== t))} style={{ color: '#c8f135' }}>×</button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tags (press Enter)..."
            className="w-full border-none rounded-lg text-xs p-2.5 transition-all outline-none"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#fff' }}
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
          />
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={status === 'loading'}
            onClick={handleCapture}
            className="col-span-2 py-3 rounded-xl transition-all font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: status === 'loading' ? 'rgba(200,241,53,0.4)' : '#c8f135', color: '#0b0c16' }}
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
            {status === 'success' ? 'Added!' : status === 'error' ? 'Failed' : 'Capture tab'}
          </button>

          <button
            onClick={handleCaptureAll}
            className="py-2.5 rounded-xl transition-all font-bold text-[11px] flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Capture All
          </button>

          <button
            className="py-2.5 rounded-xl transition-all font-bold text-[11px] flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => window.open('https://whitebroawd-web.vercel.app', '_blank')}
          >
            Open App
          </button>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
