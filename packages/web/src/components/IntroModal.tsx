'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

const IntroModal = () => {
  const hasSeenIntro = useStore((s) => s.hasSeenIntro);
  const dismissIntro = useStore((s) => s.dismissIntro);
  const [extInstalled, setExtInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    // Give the content script a moment to set the attribute
    const timer = setTimeout(() => {
      const installed = document.documentElement.getAttribute('data-whiteboard-ext') === 'true';
      setExtInstalled(installed);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (hasSeenIntro) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(11,12,22,0.85)', backdropFilter: 'blur(12px)' }}>
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: '#13141f', border: '1px solid rgba(200,241,53,0.15)', boxShadow: '0 0 60px rgba(200,241,53,0.07)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, transparent, #c8f135, transparent)' }} />

        <div className="p-5 sm:p-8">
          {/* Logo / Title */}
          <div className="mb-5 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#c8f135', letterSpacing: '-0.02em' }}>
              whitebroawd
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              your visual workspace for tabs &amp; bookmarks
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-5 sm:mb-8">
            {/* Step 1 — Extension */}
            <div className="flex items-start gap-4 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: extInstalled ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.06)', color: extInstalled ? '#c8f135' : 'rgba(255,255,255,0.5)', border: extInstalled ? '1px solid rgba(200,241,53,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                {extInstalled ? <CheckIcon /> : '1'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white">Install the Chrome extension</p>
                  {extInstalled === true && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(200,241,53,0.12)', color: '#c8f135' }}>
                      Installed
                    </span>
                  )}
                  {extInstalled === false && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,100,100,0.12)', color: '#ff6b6b' }}>
                      Not detected
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {extInstalled
                    ? 'Extension is active. You can capture tabs directly from your browser.'
                    : 'Load the extension from the /packages/extension folder in Chrome (Developer mode).'}
                </p>
              </div>
            </div>

            {/* Step 2 — Capture */}
            <div className="flex items-start gap-4 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                2
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Capture tabs from the extension popup</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Click the extension icon in your toolbar, then capture the current tab or all open tabs at once.
                </p>
              </div>
            </div>

            {/* Step 3 — Canvas */}
            <div className="flex items-start gap-4 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                3
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Organise on the canvas</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Drag bookmarks into rooms, paste URLs, add sticky notes, and group related items together.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={dismissIntro}
            className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{ background: '#c8f135', color: '#0b0c16' }}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default IntroModal;
