"use client";

import { useEffect, useRef, useState } from "react";

export function useTypewriter(text: string, speed = 14, start = true) {
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setOutput("");
    setDone(false);
    indexRef.current = 0;
    if (!start) return;
    if (!text) {
      setDone(true);
      return;
    }
    const id = window.setInterval(() => {
      indexRef.current += 3;
      if (indexRef.current >= text.length) {
        setOutput(text);
        setDone(true);
        window.clearInterval(id);
      } else {
        setOutput(text.slice(0, indexRef.current));
      }
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed, start]);

  return { output, done };
}
