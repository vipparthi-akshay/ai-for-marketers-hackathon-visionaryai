"use client";

import { useRef } from "react";

export function useMagnetic(strength = 0.25) {
  const ref = useRef<HTMLElement | null>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate3d(0, 0, 0)";
  };

  return { ref, onMouseMove, onMouseLeave } as {
    ref: React.RefObject<HTMLElement | null>;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
  };
}
