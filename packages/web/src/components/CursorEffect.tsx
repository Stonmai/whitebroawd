'use client';

import { useEffect, useRef } from 'react';

interface Point  { x: number; y: number; t: number; }
interface Sphere { x: number; y: number; t: number; }

const TRAIL_MS  = 280;
const MAX_PTS   = 35;
const SPHERE_MS = 500;

export default function CursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pts: Point[]     = [];
    const spheres: Sphere[] = [];
    let raf = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      pts.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      if (pts.length > MAX_PTS) pts.shift();
    };
    const onClick = (e: MouseEvent) => {
      spheres.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);

    const drawCurve = (alpha: number, lineWidth: number, blur: number, color: string) => {
      if (pts.length < 4) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = lineWidth;
      ctx.shadowBlur = blur;
      ctx.shadowColor = color;
      const now = Date.now();
      for (let i = 1; i < pts.length - 2; i++) {
        const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2];
        const a = alpha * Math.max(0, 1 - (now - p1.t) / TRAIL_MS) * (i / pts.length);
        if (a <= 0.005) continue;
        const cp1x = p1.x + (p2.x - p0.x) / 6, cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6, cp2y = p2.y - (p3.y - p1.y) / 6;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        ctx.strokeStyle = color.replace(')', `, ${a})`).replace('rgb(', 'rgba(');
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawSphere = (x: number, y: number, alpha: number) => {
      const halo = ctx.createRadialGradient(x, y, 0, x, y, 48);
      halo.addColorStop(0, `rgba(147, 51, 234, ${0.22 * alpha})`);
      halo.addColorStop(1, 'rgba(88, 28, 235, 0)');
      ctx.beginPath();
      ctx.arc(x, y, 48, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      const mid = ctx.createRadialGradient(x, y, 0, x, y, 18);
      mid.addColorStop(0,   `rgba(167, 139, 250, ${0.85 * alpha})`);
      mid.addColorStop(0.5, `rgba(147,  51, 234, ${0.5  * alpha})`);
      mid.addColorStop(1,   'rgba(88, 28, 235, 0)');
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = mid;
      ctx.fill();

      const core = ctx.createRadialGradient(x - 1, y - 1, 0, x, y, 7);
      core.addColorStop(0,   `rgba(255, 255, 255,  ${0.95 * alpha})`);
      core.addColorStop(0.4, `rgba(210, 190, 255,  ${0.9  * alpha})`);
      core.addColorStop(1,   'rgba(147, 51, 234, 0)');
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      // Trail
      while (pts.length > 0 && now - pts[0].t > TRAIL_MS) pts.shift();
      drawCurve(0.18, 18, 32, 'rgb(88, 28, 235)');
      drawCurve(0.45,  7, 16, 'rgb(147, 51, 234)');
      drawCurve(0.85, 2.5, 8, 'rgb(99, 120, 255)');
      drawCurve(0.65,  1,  0, 'rgb(210, 200, 255)');

      // Click spheres
      for (let i = spheres.length - 1; i >= 0; i--) {
        const s = spheres[i];
        const t = (now - s.t) / SPHERE_MS;
        if (t >= 1) { spheres.splice(i, 1); continue; }
        drawSphere(s.x, s.y, 1 - t * t);
      }

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
    />
  );
}
