"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";

type Effect =
  | "wave"
  | "bounce"
  | "rotate"
  | "blur"
  | "flip"
  | "elastic"
  | "scale"
  | "pop"
  | "slide"
  | "color"
  | "typewriter"
  | "spring"
  | "drop"
  | "swing"
  | "magnetic";

interface LetterAnimatorProps {
  text: string;
  effect?: Effect;
  className?: string;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  stagger?: number;
  once?: boolean;
  highlight?: string;
  highlightClassName?: string;
}

const effectVariants: Record<Effect, { hidden: Variants["hidden"]; visible: (i: number, total: number) => Variants["visible"] }> = {
  wave: {
    hidden: { opacity: 0, y: 30, rotateZ: -8 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotateZ: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        delay: i * 0.03,
      },
    }),
  },
  bounce: {
    hidden: { opacity: 0, y: -40, scale: 0.6 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 300,
        delay: i * 0.04,
      },
    }),
  },
  rotate: {
    hidden: { opacity: 0, rotateX: 90, y: 10 },
    visible: (i) => ({
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 200,
        delay: i * 0.035,
      },
    }),
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 10 },
    visible: (i) => ({
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.04,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  },
  flip: {
    hidden: { opacity: 0, rotateY: 90, x: -10 },
    visible: (i) => ({
      opacity: 1,
      rotateY: 0,
      x: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        delay: i * 0.03,
      },
    }),
  },
  elastic: {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 6,
        stiffness: 150,
        delay: i * 0.05,
      },
    }),
  },
  scale: {
    hidden: { opacity: 0, scale: 0.1 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 250,
        delay: i * 0.025,
      },
    }),
  },
  pop: {
    hidden: { opacity: 0, scale: 0.3, y: 20 },
    visible: (i) => ({
      opacity: 1,
      scale: [0.3, 1.3, 0.9, 1.05, 1],
      y: [20, -8, 3, -1, 0],
      transition: {
        duration: 0.6,
        delay: i * 0.04,
        ease: "easeOut",
      },
    }),
  },
  slide: {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 180,
        delay: i * 0.03,
      },
    }),
  },
  color: {
    hidden: { opacity: 0, y: 20, color: "hsl(250, 56%, 57%)" },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      color: "inherit",
      transition: {
        duration: 0.6,
        delay: i * 0.04,
        color: { duration: 0.8, delay: i * 0.04 + 0.3 },
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  },
  typewriter: {
    hidden: { opacity: 0, width: 0 },
    visible: (i) => ({
      opacity: 1,
      width: "auto",
      transition: {
        duration: 0.1,
        delay: i * 0.06,
      },
    }),
  },
  spring: {
    hidden: { opacity: 0, y: 40, scale: 1.2 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 180,
        mass: 0.8,
        delay: i * 0.035,
      },
    }),
  },
  drop: {
    hidden: { opacity: 0, y: -60, rotate: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 220,
        delay: i * 0.04,
      },
    }),
  },
  swing: {
    hidden: { opacity: 0, rotate: -20, y: -20, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      rotate: 0,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 7,
        stiffness: 160,
        delay: i * 0.04,
      },
    }),
  },
  magnetic: {
    hidden: { opacity: 0, scale: 0.5, x: -20 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        delay: i * 0.03,
      },
    }),
  },
};

const TagMap = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  p: "p",
  span: "span",
} as const;

export function LetterAnimator({
  text,
  effect = "wave",
  className = "",
  tag = "h1",
  delay = 0.1,
  stagger = 0.03,
  once = true,
  highlight,
  highlightClassName = "text-primary",
}: LetterAnimatorProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-60px" });

  const variants = effectVariants[effect];
  const Tag = TagMap[tag];

  const words = text.split(" ");

  let globalIndex = 0;

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, wordIdx) => {
        const letters = word.split("");
        const wordElements = letters.map((letter) => {
          const idx = globalIndex;
          globalIndex++;
          const isHighlighted = highlight && word.toLowerCase().includes(highlight.toLowerCase());

          return (
            <motion.span
              key={`${wordIdx}-${idx}`}
              className={`inline-block ${isHighlighted ? highlightClassName : ""}`}
              style={{ perspective: "600px" }}
              initial={typeof variants.hidden === "function" ? (variants.hidden as Function)(idx) : variants.hidden}
              animate={isInView ? variants.visible(idx, text.length) : (typeof variants.hidden === "function" ? (variants.hidden as Function)(idx) : variants.hidden)}
              whileHover={{
                scale: 1.2,
                y: -4,
                color: "hsl(250, 56%, 62%)",
                transition: { type: "spring", damping: 10, stiffness: 400 },
              }}
            >
              {letter}
            </motion.span>
          );
        });

        globalIndex++; // space gap

        return (
          <span key={`word-${wordIdx}`} className="inline-block whitespace-nowrap">
            {wordElements}
            {wordIdx < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        );
      })}
    </Tag>
  );
}
