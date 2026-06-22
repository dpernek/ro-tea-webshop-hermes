"use client";

import { useState, useRef, useEffect } from "react";

interface ReadMoreProps {
  text: string;
  maxLines?: number;
}

export function ReadMore({ text, maxLines = 3 }: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const clampedStyle = !expanded
    ? {
        display: "-webkit-box",
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical" as const,
        overflow: "hidden",
      }
    : {};

  useEffect(() => {
    if (contentRef.current) {
      const el = contentRef.current;
      // Check if content exceeds maxLines
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || el.scrollHeight / 3;
      const maxHeight = lineHeight * maxLines;
      setNeedsTruncation(el.scrollHeight > maxHeight + 2);
    }
  }, [text, maxLines]);

  // Short text — show all, no toggle
  if (text.length < 200 || !needsTruncation) {
    return (
      <div className="prose prose-slate max-w-none leading-relaxed text-slate-600 whitespace-pre-line">
        {text}
      </div>
    );
  }

  return (
    <div>
      <div
        ref={contentRef}
        style={clampedStyle}
        className="prose prose-slate max-w-none leading-relaxed text-slate-600 whitespace-pre-line"
      >
        {text}
      </div>
      <button
        className="mt-2 text-sm font-medium text-[#0055a8] hover:text-[#003d7a] hover:underline transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Prikaži manje" : "Prikaži više"}
      </button>
    </div>
  );
}
