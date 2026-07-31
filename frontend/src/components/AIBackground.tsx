"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/useLocalStorage";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  twinkle: number;
  isNode: boolean;
  pulse: number;
};

export default function AIBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const glowRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let particles: Particle[] = [];
    const maxDist = 120;

    const spawn = () => {
      const count = width < 768 ? 36 : 72;
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.8,
        alpha: 0.25 + Math.random() * 0.5,
        twinkle: Math.random() * Math.PI * 2,
        isNode: i < 10,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawn();
    };

    const drawFrame = (t: number) => {
      const time = t / 1000;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist2 = dx * dx + dy * dy;
          const influence = 130 * 130;
          if (dist2 < influence && dist2 > 0.01) {
            const dist = Math.sqrt(dist2);
            const force = (1 - dist / 130) * 0.6;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        const twinkle = reduced ? p.alpha : p.alpha + Math.sin(time * 1.6 + p.twinkle) * 0.12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.isNode
          ? `hsla(262, 72%, 70%, ${Math.max(0, twinkle)})`
          : `hsla(210, 90%, 75%, ${Math.max(0, twinkle)})`;
        ctx.fill();

        if (p.isNode) {
          const ringR = p.r + 2.5 + Math.sin(time * 1.2 + p.pulse) * 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(262, 72%, 70%, 0.35)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < maxDist * maxDist) {
            const alpha = (1 - Math.sqrt(dist2) / maxDist) * 0.14;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `hsla(230, 80%, 75%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      if (mouse.active && !reduced) {
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(mouse.x + 0.01, mouse.y);
        ctx.strokeStyle = "transparent";
        ctx.stroke();
      }
    };

    const loop = (t: number) => {
      drawFrame(t);
      raf = requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true };
      const glow = glowRef.current;
      if (glow) {
        glow.style.opacity = "1";
        glow.style.transform = `translate3d(${e.clientX - 200}px, ${e.clientY - 200}px, 0)`;
      }
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999, active: false };
      const glow = glowRef.current;
      if (glow) glow.style.opacity = "0";
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      drawFrame(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(262_72%_58%/0.16),transparent_60%)]" />
      <div className="aurora-blob animate-aurora left-[-10%] top-[-15%] h-[55vh] w-[55vh] bg-[hsl(262,72%,55%,0.14)]" />
      <div className="aurora-blob animate-aurora right-[-8%] top-[30%] h-[50vh] w-[50vh] bg-[hsl(210,90%,55%,0.12)]" style={{ animationDelay: "-6s" }} />
      <div className="aurora-blob animate-aurora bottom-[-20%] left-[30%] h-[50vh] w-[50vh] bg-[hsl(330,80%,55%,0.1)]" style={{ animationDelay: "-12s" }} />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div
        ref={glowRef}
        className="absolute h-[400px] w-[400px] rounded-full opacity-0 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, hsl(262 72% 60% / 0.1), transparent 60%)",
          willChange: "transform",
        }}
      />
      <div className="noise-overlay" />
    </div>
  );
}
