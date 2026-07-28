"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

function FlowingWaves() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let animationId: number;
    let time = 0;

    const draw = () => {
      time += 0.005;
      const paths = svg.querySelectorAll(".wave-path");
      paths.forEach((path, i) => {
        const amplitude = 30 + i * 10;
        const frequency = 0.008 - i * 0.002;
        const speed = 0.5 + i * 0.3;
        const yOffset = 50 + i * 15;

        let d = `M 0 ${yOffset}`;
        for (let x = 0; x <= 100; x += 2) {
          const y = yOffset + Math.sin(x * frequency + time * speed) * amplitude + Math.sin(x * frequency * 2 + time * speed * 0.5) * (amplitude * 0.3);
          d += ` L ${x}% ${y}`;
        }
        d += " L 100% 100 L 0 100 Z";
        path.setAttribute("d", d);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full opacity-20"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        className="wave-path"
        fill={isDark ? "rgba(129, 140, 248, 0.1)" : "rgba(129, 140, 248, 0.05)"}
      />
      <path
        className="wave-path"
        fill={isDark ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.04)"}
      />
      <path
        className="wave-path"
        fill={isDark ? "rgba(165, 180, 252, 0.05)" : "rgba(165, 180, 252, 0.03)"}
      />
    </svg>
  );
}

function GeometricShapes() {
  const shapes = [
    { size: 80, x: 15, y: 20, duration: 20, delay: 0, rotate: 0 },
    { size: 60, x: 80, y: 70, duration: 25, delay: 2, rotate: 45 },
    { size: 100, x: 70, y: 15, duration: 30, delay: 1, rotate: 90 },
    { size: 50, x: 20, y: 80, duration: 18, delay: 3, rotate: 135 },
    { size: 70, x: 50, y: 50, duration: 22, delay: 0.5, rotate: 180 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
            borderColor: `rgba(129, 140, 248, ${0.05 + i * 0.02})`,
          }}
          animate={{
            y: [0, -20, 0, 15, 0],
            x: [0, 15, -10, 5, 0],
            rotate: [s.rotate, s.rotate + 90, s.rotate + 180, s.rotate + 270, s.rotate + 360],
            scale: [1, 1.05, 0.95, 1.02, 1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/[0.02]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <FlowingWaves />
      <GeometricShapes />
    </div>
  );
}
