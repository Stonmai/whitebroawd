'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

// ── Illustrations ──────────────────────────────────────────────────────────────

const CanvasIllustration = () => (
  <svg viewBox="0 0 400 190" fill="none" style={{ width: '100%', height: '100%' }}>
    <rect width="400" height="190" fill="#0d0e1a" rx="14" />
    {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(c => (
      <circle key={`${r}-${c}`} cx={16+c*27} cy={14+r*26} r="1.1" fill="rgba(255,255,255,0.1)" />
    )))}
    {/* Bookmark card blue */}
    <rect x="22" y="28" width="96" height="66" rx="10" fill="rgba(59,130,246,0.13)" stroke="rgba(59,130,246,0.32)" strokeWidth="1" />
    <circle cx="38" cy="46" r="9" fill="rgba(59,130,246,0.22)" />
    <rect x="52" y="42" width="46" height="4" rx="2" fill="rgba(59,130,246,0.75)" />
    <rect x="30" y="60" width="76" height="2.5" rx="1.2" fill="rgba(255,255,255,0.18)" />
    <rect x="30" y="67" width="60" height="2.5" rx="1.2" fill="rgba(255,255,255,0.12)" />
    <rect x="30" y="79" width="32" height="11" rx="5.5" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth="0.8" />
    <text x="46" y="87" textAnchor="middle" fill="rgba(59,130,246,0.85)" fontSize="7" fontWeight="700">Work</text>
    {/* Note card purple */}
    <rect x="144" y="20" width="96" height="76" rx="10" fill="rgba(168,85,247,0.11)" stroke="rgba(168,85,247,0.28)" strokeWidth="1" />
    <rect x="154" y="34" width="54" height="4" rx="2" fill="rgba(168,85,247,0.75)" />
    <rect x="154" y="44" width="76" height="2.5" rx="1.2" fill="rgba(255,255,255,0.18)" />
    <rect x="154" y="51" width="62" height="2.5" rx="1.2" fill="rgba(255,255,255,0.14)" />
    <rect x="154" y="58" width="70" height="2.5" rx="1.2" fill="rgba(255,255,255,0.1)" />
    <rect x="154" y="65" width="48" height="2.5" rx="1.2" fill="rgba(255,255,255,0.08)" />
    <rect x="154" y="79" width="36" height="11" rx="5.5" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.3)" strokeWidth="0.8" />
    <text x="172" y="87" textAnchor="middle" fill="rgba(168,85,247,0.85)" fontSize="7" fontWeight="700">Ideas</text>
    {/* Group frame lime */}
    <rect x="258" y="16" width="124" height="108" rx="12" fill="rgba(200,241,53,0.04)" stroke="rgba(200,241,53,0.2)" strokeWidth="1" strokeDasharray="5 3" />
    <rect x="268" y="26" width="46" height="3.5" rx="1.7" fill="rgba(200,241,53,0.45)" />
    <rect x="266" y="40" width="48" height="36" rx="7" fill="rgba(200,241,53,0.08)" stroke="rgba(200,241,53,0.18)" strokeWidth="0.8" />
    <rect x="274" y="50" width="28" height="3" rx="1.5" fill="rgba(200,241,53,0.6)" />
    <rect x="274" y="57" width="34" height="2.5" rx="1.2" fill="rgba(255,255,255,0.18)" />
    <rect x="320" y="40" width="48" height="36" rx="7" fill="rgba(200,241,53,0.08)" stroke="rgba(200,241,53,0.18)" strokeWidth="0.8" />
    <rect x="328" y="50" width="28" height="3" rx="1.5" fill="rgba(200,241,53,0.6)" />
    <rect x="328" y="57" width="34" height="2.5" rx="1.2" fill="rgba(255,255,255,0.18)" />
    {/* Connections */}
    <path d="M118 62 C132 62 132 56 144 54" stroke="rgba(147,120,255,0.5)" strokeWidth="1.5" fill="none" />
    <circle cx="118" cy="62" r="2.5" fill="rgba(147,120,255,0.65)" />
    <circle cx="144" cy="54" r="2.5" fill="rgba(147,120,255,0.65)" />
    <path d="M240 56 C249 56 250 44 258 40" stroke="rgba(200,241,53,0.42)" strokeWidth="1.5" fill="none" />
    <circle cx="240" cy="56" r="2.5" fill="rgba(200,241,53,0.55)" />
    {/* Bottom row cards */}
    <rect x="28" y="116" width="82" height="54" rx="8" fill="rgba(16,185,129,0.11)" stroke="rgba(16,185,129,0.26)" strokeWidth="1" />
    <circle cx="42" cy="130" r="7" fill="rgba(16,185,129,0.22)" />
    <rect x="54" y="126" width="44" height="3.5" rx="1.7" fill="rgba(16,185,129,0.72)" />
    <rect x="36" y="142" width="64" height="2.5" rx="1.2" fill="rgba(255,255,255,0.16)" />
    <rect x="36" y="149" width="50" height="2.5" rx="1.2" fill="rgba(255,255,255,0.1)" />
    <rect x="130" y="112" width="82" height="54" rx="8" fill="rgba(245,158,11,0.11)" stroke="rgba(245,158,11,0.26)" strokeWidth="1" />
    <circle cx="144" cy="126" r="7" fill="rgba(245,158,11,0.22)" />
    <rect x="156" y="122" width="44" height="3.5" rx="1.7" fill="rgba(245,158,11,0.72)" />
    <rect x="138" y="138" width="64" height="2.5" rx="1.2" fill="rgba(255,255,255,0.16)" />
    <rect x="138" y="145" width="50" height="2.5" rx="1.2" fill="rgba(255,255,255,0.1)" />
    <path d="M110 142 C120 140 122 134 130 132" stroke="rgba(200,200,255,0.3)" strokeWidth="1.2" fill="none" strokeDasharray="3 2" />
    {/* Right accent */}
    <circle cx="322" cy="152" r="28" fill="rgba(200,241,53,0.05)" stroke="rgba(200,241,53,0.16)" strokeWidth="1" />
    <rect x="308" y="146" width="28" height="3.5" rx="1.7" fill="rgba(200,241,53,0.38)" />
    <rect x="312" y="154" width="20" height="3" rx="1.5" fill="rgba(255,255,255,0.18)" />
  </svg>
);

const BookmarkIllustration = () => (
  <svg viewBox="0 0 400 190" fill="none" style={{ width: '100%', height: '100%' }}>
    <rect width="400" height="190" fill="#0d0e1a" rx="14" />
    {/* Browser bar */}
    <rect x="16" y="12" width="368" height="30" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    <circle cx="34" cy="27" r="5" fill="rgba(255,80,80,0.42)" />
    <circle cx="50" cy="27" r="5" fill="rgba(255,190,0,0.42)" />
    <circle cx="66" cy="27" r="5" fill="rgba(80,200,80,0.42)" />
    <rect x="82" y="20" width="230" height="14" rx="7" fill="rgba(255,255,255,0.05)" />
    <rect x="90" y="24" width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.2)" />
    <rect x="322" y="19" width="58" height="16" rx="8" fill="rgba(200,241,53,0.18)" stroke="rgba(200,241,53,0.38)" strokeWidth="1" />
    <text x="351" y="29.5" textAnchor="middle" fill="rgba(200,241,53,0.95)" fontSize="8" fontWeight="800" letterSpacing="0.05em">CAPTURE</text>
    {/* Arrow */}
    <path d="M200 47 L200 58" stroke="rgba(200,241,53,0.5)" strokeWidth="2" strokeLinecap="round" />
    <path d="M194 54 L200 60 L206 54" stroke="rgba(200,241,53,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* 2×4 card grid */}
    {[
      { x: 16, y: 66, c: 'rgba(59,130,246',   t: 'Research' },
      { x: 112, y: 66, c: 'rgba(168,85,247',  t: 'Design'   },
      { x: 208, y: 66, c: 'rgba(16,185,129',  t: 'Dev'      },
      { x: 304, y: 66, c: 'rgba(244,114,182', t: 'Ideas'    },
      { x: 16, y: 132, c: 'rgba(245,158,11',  t: 'Later'    },
      { x: 112, y: 132, c: 'rgba(34,211,238', t: 'Read'     },
      { x: 208, y: 132, c: 'rgba(163,230,53', t: 'Tools'    },
      { x: 304, y: 132, c: 'rgba(99,120,255', t: 'Saved'    },
    ].map((card, i) => (
      <g key={i}>
        <rect x={card.x} y={card.y} width="88" height="56" rx="9" fill={`${card.c},0.1)`} stroke={`${card.c},0.26)`} strokeWidth="1" />
        <rect x={card.x + 10} y={card.y + 13} width="36" height="3.5" rx="1.7" fill={`${card.c},0.82)`} />
        <rect x={card.x + 10} y={card.y + 22} width="68" height="2.5" rx="1.2" fill="rgba(255,255,255,0.18)" />
        <rect x={card.x + 10} y={card.y + 29} width="54" height="2.5" rx="1.2" fill="rgba(255,255,255,0.12)" />
        <rect x={card.x + 10} y={card.y + 41} width="36" height="10" rx="5" fill={`${card.c},0.14)`} stroke={`${card.c},0.3)`} strokeWidth="0.8" />
        <text x={card.x + 28} y={card.y + 48.5} textAnchor="middle" fill={`${card.c},0.88)`} fontSize="7" fontWeight="700">{card.t}</text>
      </g>
    ))}
  </svg>
);

const ConnectionIllustration = () => (
  <svg viewBox="0 0 400 190" fill="none" style={{ width: '100%', height: '100%' }}>
    <rect width="400" height="190" fill="#0d0e1a" rx="14" />
    {[0,1,2,3,4,5,6].map(r => [0,1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
      <circle key={`${r}-${c}`} cx={18 + c * 30} cy={14 + r * 27} r="1.1" fill="rgba(255,255,255,0.09)" />
    )))}
    {/* Connection lines */}
    <path d="M200 95 C185 95 160 68 148 62" stroke="rgba(200,241,53,0.35)" strokeWidth="1.5" fill="none" />
    <path d="M200 95 C216 95 252 68 264 62" stroke="rgba(99,120,255,0.35)" strokeWidth="1.5" fill="none" />
    <path d="M200 95 C188 112 155 144 142 150" stroke="rgba(244,114,182,0.35)" strokeWidth="1.5" fill="none" />
    <path d="M200 95 C212 112 248 144 262 150" stroke="rgba(16,185,129,0.35)" strokeWidth="1.5" fill="none" />
    <path d="M148 62 C146 90 143 126 142 150" stroke="rgba(200,241,53,0.13)" strokeWidth="1" strokeDasharray="4 3" fill="none" />
    <path d="M264 62 C262 100 262 126 262 150" stroke="rgba(99,120,255,0.13)" strokeWidth="1" strokeDasharray="4 3" fill="none" />
    {/* Center hub */}
    <circle cx="200" cy="95" r="24" fill="rgba(200,241,53,0.09)" stroke="rgba(200,241,53,0.36)" strokeWidth="1.5" />
    <circle cx="200" cy="95" r="15" fill="rgba(200,241,53,0.17)" />
    <rect x="190" y="91" width="20" height="4" rx="2" fill="rgba(200,241,53,0.9)" />
    <rect x="192" y="98" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.48)" />
    {/* Satellite nodes */}
    {[
      { x: 112, y: 44, c: 'rgba(59,130,246',  label: 'GitHub' },
      { x: 228, y: 44, c: 'rgba(168,85,247',  label: 'Figma'  },
      { x: 106, y: 132, c: 'rgba(244,114,182', label: 'Notes'  },
      { x: 226, y: 132, c: 'rgba(16,185,129',  label: 'Docs'   },
    ].map((n, i) => (
      <g key={i}>
        <rect x={n.x} y={n.y} width="72" height="40" rx="8" fill={`${n.c},0.13)`} stroke={`${n.c},0.36)`} strokeWidth="1" />
        <rect x={n.x + 9} y={n.y + 9} width="28" height="3.5" rx="1.7" fill={`${n.c},0.82)`} />
        <rect x={n.x + 9} y={n.y + 18} width="54" height="2.5" rx="1.2" fill="rgba(255,255,255,0.18)" />
        <rect x={n.x + 9} y={n.y + 25} width="44" height="2.5" rx="1.2" fill="rgba(255,255,255,0.12)" />
      </g>
    ))}
    {/* Edge dots */}
    <circle cx="174" cy="79" r="3" fill="rgba(200,241,53,0.6)" />
    <circle cx="228" cy="79" r="3" fill="rgba(99,120,255,0.6)" />
    <circle cx="172" cy="122" r="3" fill="rgba(244,114,182,0.6)" />
    <circle cx="232" cy="122" r="3" fill="rgba(16,185,129,0.6)" />
  </svg>
);

// ── Page definitions ───────────────────────────────────────────────────────────

const FEATURE_PAGES = [
  {
    badge: 'Visual Canvas',
    title: 'Organize the web,\nvisually',
    description: 'An infinite canvas for your bookmarks, notes, and research. See the whole picture at a glance.',
    Illustration: CanvasIllustration,
  },
  {
    badge: 'Bookmarks',
    title: 'Capture anything\nfrom the web',
    description: 'Save tabs in one click, paste URLs, add sticky notes, and color-tag everything for instant filtering.',
    Illustration: BookmarkIllustration,
  },
  {
    badge: 'Connections',
    title: 'Map your thinking\non canvas',
    description: 'Draw connections between bookmarks and notes. Group related ideas and discover hidden patterns.',
    Illustration: ConnectionIllustration,
  },
];

const TOTAL_PAGES = FEATURE_PAGES.length + 1; // +1 for setup

// ── Sub-components ─────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SetupPage = ({ extInstalled }: { extInstalled: boolean | null }) => (
  <div>
    <div style={{ marginBottom: 20, textAlign: 'center' }}>
      <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(200,241,53,0.7)', background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.18)', borderRadius: 20, padding: '3px 10px', marginBottom: 12 }}>
        Get Started
      </span>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, margin: 0 }}>
        Set up in three steps
      </h2>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        {
          num: '1',
          done: extInstalled === true,
          tag: extInstalled === true ? 'Installed' : extInstalled === false ? 'Not detected' : null,
          tagOk: extInstalled === true,
          title: 'Install the Chrome extension',
          body: extInstalled
            ? 'Extension is active — you can capture tabs directly from your browser.'
            : 'Load the extension from /packages/extension in Chrome (Developer mode).',
        },
        {
          num: '2',
          done: false,
          title: 'Capture tabs from the popup',
          body: 'Click the extension icon in your toolbar, then capture the current tab or all open tabs at once.',
        },
        {
          num: '3',
          done: false,
          title: 'Organise on the canvas',
          body: 'Drag bookmarks into rooms, paste URLs, add sticky notes, and group related items together.',
        },
      ].map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 14px' }}>
          <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, background: step.done ? 'rgba(200,241,53,0.14)' : 'rgba(255,255,255,0.05)', border: step.done ? '1px solid rgba(200,241,53,0.3)' : '1px solid rgba(255,255,255,0.1)', color: step.done ? '#c8f135' : 'rgba(255,255,255,0.45)' }}>
            {step.done ? <CheckIcon /> : step.num}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{step.title}</span>
              {step.tag && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: step.tagOk ? 'rgba(200,241,53,0.1)' : 'rgba(255,100,100,0.1)', color: step.tagOk ? '#c8f135' : '#ff6b6b', border: `1px solid ${step.tagOk ? 'rgba(200,241,53,0.25)' : 'rgba(255,100,100,0.25)'}` }}>
                  {step.tag}
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, lineHeight: 1.6, color: 'rgba(255,255,255,0.38)' }}>{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Main modal ─────────────────────────────────────────────────────────────────

const IntroModal = () => {
  const hasSeenIntro = useStore((s) => s.hasSeenIntro);
  const dismissIntro = useStore((s) => s.dismissIntro);
  const [extInstalled, setExtInstalled] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExtInstalled(document.documentElement.getAttribute('data-whiteboard-ext') === 'true');
      setVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (hasSeenIntro || !visible) return null;

  const isSetup = page === FEATURE_PAGES.length;
  const isFirst = page === 0;
  const isLast = page === TOTAL_PAGES - 1;

  const go = (next: number) => { setPage(next); setAnimKey(k => k + 1); };
  const goNext = () => isLast ? dismissIntro() : go(page + 1);
  const goPrev = () => !isFirst && go(page - 1);

  const current = FEATURE_PAGES[page];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(9,10,20,0.88)', backdropFilter: 'blur(16px)' }}>
      <style>{`
        @keyframes introFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .intro-page { animation: introFadeUp 0.22s ease-out both; }
      `}</style>

      <div
        style={{ position: 'relative', width: '100%', maxWidth: 480, borderRadius: 28, overflow: 'hidden', background: '#11121d', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,241,53,0.04)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent 0%, #c8f135 50%, transparent 100%)' }} />

        {/* Page content */}
        <div key={animKey} className="intro-page" style={{ padding: '24px 24px 0' }}>
          {isSetup ? (
            <SetupPage extInstalled={extInstalled} />
          ) : (
            <>
              {/* Illustration */}
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 22, lineHeight: 0 }}>
                <current.Illustration />
              </div>

              {/* Badge */}
              <div style={{ marginBottom: 10 }}>
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(200,241,53,0.7)', background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.18)', borderRadius: 20, padding: '3px 10px' }}>
                  {current.badge}
                </span>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2, margin: '0 0 10px', whiteSpace: 'pre-line' }}>
                {current.title}
              </h2>

              {/* Description */}
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                {current.description}
              </p>
            </>
          )}
        </div>

        {/* Navigation bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 22px' }}>
          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                style={{ width: i === page ? 20 : 7, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer', transition: 'all 0.25s ease', background: i === page ? '#c8f135' : 'rgba(255,255,255,0.15)', padding: 0 }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {!isFirst && (
              <button
                onClick={goPrev}
                style={{ height: 38, padding: '0 18px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
              >
                Back
              </button>
            )}
            <button
              onClick={goNext}
              style={{ height: 38, padding: '0 22px', borderRadius: 12, background: isLast ? '#c8f135' : 'rgba(200,241,53,0.14)', border: isLast ? 'none' : '1px solid rgba(200,241,53,0.3)', color: isLast ? '#0b0c16' : '#c8f135', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '0.01em' }}
            >
              {isLast ? 'Get Started →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroModal;
