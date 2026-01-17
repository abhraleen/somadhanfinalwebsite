import React, { useEffect, useRef } from 'react';

type ResolutionFlowProps = {
  className?: string;
  width?: number;
  height?: number;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const ResolutionFlow: React.FC<ResolutionFlowProps> = ({ className = '', width = 520, height = 360 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    type Node = { x: number; y: number; r: number; vx: number; vy: number };
    const center = { x: width * 0.6, y: height * 0.5 };
    const makeNodes = (): Node[] => {
      const count = Math.floor(10 + Math.random() * 5); // 10–14
      const xs: Node[] = [];
      for (let i = 0; i < count; i++) {
        xs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 2 + Math.random() * 1.5,
          vx: (Math.random() - 0.5) * 0.02, // px per ms
          vy: (Math.random() - 0.5) * 0.02,
        });
      }
      return xs;
    };

    let nodes = makeNodes();
    const lineDist = 140; // px
    const lineDist2 = lineDist * lineDist;

    const convergeDuration = 2000; // 2s
    const makeDriftDuration = () => Math.floor(8000 + Math.random() * 2000); // 8–10s
    const fadeDuration = 2000; // 2s to finish ~12–14s total
    let driftDuration = makeDriftDuration();
    let cycleStart = performance.now();
    let lastTs = cycleStart;

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      // lines first
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < lineDist2) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      // nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();
      });
    };

    if (reduceMotion) {
      drawStatic();
      return;
    }

    const step = (ts: number) => {
      const dt = ts - lastTs;
      lastTs = ts;
      const elapsed = ts - cycleStart;
      ctx.clearRect(0, 0, width, height);

      if (elapsed < driftDuration) {
        // Drift phase: subtle movement and lines by proximity
        for (const n of nodes) {
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          // keep inside with soft clamp and velocity flip
          if (n.x < 5 || n.x > width - 5) n.vx *= -1;
          if (n.y < 5 || n.y > height - 5) n.vy *= -1;
          n.x = clamp(n.x, 5, width - 5);
          n.y = clamp(n.y, 5, height - 5);
        }

        // lines (full opacity)
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < lineDist2) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = 'rgba(255,255,255,0.15)';
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }

        // nodes
        nodes.forEach((n) => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fill();
        });
      } else if (elapsed < driftDuration + convergeDuration) {
        // Converge phase: move nodes to center over ~2s, lines fade out
        const t = (elapsed - driftDuration) / convergeDuration; // 0..1
        const f = t; // linear is fine for calm feel

        const lineAlpha = lerp(0.15, 0.0, f);

        const pos: { x: number; y: number }[] = [];
        for (const n of nodes) {
          const nx = lerp(n.x, center.x, f);
          const ny = lerp(n.y, center.y, f);
          pos.push({ x: nx, y: ny });
        }

        // lines fading
        for (let i = 0; i < pos.length; i++) {
          for (let j = i + 1; j < pos.length; j++) {
            const dx = pos[i].x - pos[j].x;
            const dy = pos[i].y - pos[j].y;
            const d2 = dx * dx + dy * dy;
            if (d2 < lineDist2) {
              ctx.beginPath();
              ctx.moveTo(pos[i].x, pos[i].y);
              ctx.lineTo(pos[j].x, pos[j].y);
              ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }

        // nodes moving in
        pos.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fill();
        });
      } else if (elapsed < driftDuration + convergeDuration + fadeDuration) {
        // Fade phase: single central dot fading out
        const t = (elapsed - driftDuration - convergeDuration) / fadeDuration; // 0..1
        const alpha = lerp(0.5, 0.0, t);
        ctx.beginPath();
        ctx.arc(center.x, center.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      } else {
        // Reset
        nodes = makeNodes();
        driftDuration = makeDriftDuration();
        cycleStart = ts;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [width, height]);

  return (
    <div className={className + ' hero-visual'} aria-hidden="true">
      <canvas ref={canvasRef} width={width} height={height} style={{ display: 'block' }} />
    </div>
  );
};

export default ResolutionFlow;
