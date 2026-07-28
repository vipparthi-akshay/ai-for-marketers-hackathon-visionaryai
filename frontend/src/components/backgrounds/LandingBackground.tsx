"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

function ParticleNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = document.documentElement.classList.contains("dark");
      const particleColor = isDark ? "160, 170, 255" : "95, 100, 220";
      const lineColor = isDark ? "160, 170, 255" : "95, 100, 220";

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

function GradientOrbs() {
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${isDark ? "rgba(129, 140, 248, 0.08)" : "rgba(129, 140, 248, 0.05)"} 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 60, -40, 30, 0],
          y: [0, -40, 30, -20, 0],
          scale: [1, 1.15, 0.9, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${isDark ? "rgba(99, 102, 241, 0.06)" : "rgba(99, 102, 241, 0.04)"} 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, -50, 30, -40, 0],
          y: [0, 50, -30, 20, 0],
          scale: [1, 0.9, 1.1, 1, 1],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${isDark ? "rgba(165, 180, 252, 0.05)" : "rgba(165, 180, 252, 0.03)"} 0%, transparent 70%)`,
        }}
        animate={{
          x: [0, 40, -30, 20, 0],
          y: [0, -30, 40, -25, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function LandingBackground() {
  return (
    <>
      <ParticleNetworkBackground />
      <GradientOrbs />
    </>
  );
}
