"use client";

import { Fragment } from "react";

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(<Fragment key={`${keyPrefix}-t-${i}`}>{part}</Fragment>);
    }
  });
  return nodes;
}

export default function Markdown({ content, streaming }: { content: string; streaming?: boolean }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let key = 0;

  const flushList = () => {
    if (listType && listBuffer.length > 0) {
      const items = listBuffer;
      const type = listType;
      blocks.push(
        type === "ul" ? (
          <ul key={`ul-${key++}`} className="my-2.5 space-y-1.5 pl-5">
            {items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed text-foreground/90 marker:text-primary">
                {renderInline(item, `li-${key}-${i}`)}
              </li>
            ))}
          </ul>
        ) : (
          <ol key={`ol-${key++}`} className="my-2.5 space-y-1.5 pl-5">
            {items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed text-foreground/90 marker:text-primary marker:font-semibold">
                {renderInline(item, `li-${key}-${i}`)}
              </li>
            ))}
          </ol>
        )
      );
      listBuffer = [];
      listType = null;
    }
  };

  for (const line of lines) {
    const ulMatch = line.match(/^-\s+(.*)/);
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    const h2Match = line.match(/^##\s+(.*)/);
    const h3Match = line.match(/^###\s+(.*)/);

    if (ulMatch) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuffer.push(ulMatch[1]);
      continue;
    }
    if (olMatch) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuffer.push(olMatch[1]);
      continue;
    }

    flushList();

    if (h2Match) {
      blocks.push(
        <h3 key={key++} className="mt-5 mb-2 flex items-center gap-2 text-base font-bold text-foreground">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-primary to-[hsl(210,90%,62%)]" aria-hidden="true" />
          {renderInline(h2Match[1], `h2-${key}`)}
        </h3>
      );
    } else if (h3Match) {
      blocks.push(
        <h4 key={key++} className="mt-4 mb-1.5 text-sm font-semibold text-foreground">
          {renderInline(h3Match[1], `h3-${key}`)}
        </h4>
      );
    } else if (/^[A-Za-z][^:]+:/.test(line)) {
      const colon = line.indexOf(":");
      blocks.push(
        <p key={key++} className="my-2 text-sm leading-relaxed text-foreground/90">
          <span className="font-semibold text-primary">{line.slice(0, colon + 1)}</span>
          {renderInline(line.slice(colon + 1), `meta-${key}`)}
        </p>
      );
    } else if (line.trim() === "") {
      blocks.push(<div key={key++} className="h-2.5" />);
    } else {
      blocks.push(
        <p key={key++} className="my-2 text-sm leading-relaxed text-foreground/90">
          {renderInline(line, `p-${key}`)}
        </p>
      );
    }
  }
  flushList();

  return (
    <div className="space-y-0">
      {blocks}
      {streaming && (
        <span className="inline-block h-4 w-2 animate-pulse rounded-sm bg-primary align-middle" aria-hidden="true" />
      )}
    </div>
  );
}
