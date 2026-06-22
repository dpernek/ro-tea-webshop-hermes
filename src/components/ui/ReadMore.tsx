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

  // Normalize whitespace: collapse multiple consecutive newlines into single ones
  const normalized = text.replace(/\n{3,}/g, "\n\n").replace(/\n{2,}/g, "\n").trim();

  useEffect(() => {
    if (contentRef.current) {
      const el = contentRef.current;
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || el.scrollHeight / maxLines;
      const maxHeight = lineHeight * maxLines;
      setNeedsTruncation(el.scrollHeight > maxHeight + 4);
    }
  }, [text, maxLines]);

  // Short text - show all
  if (normalized.length < 200 && !needsTruncation) {
    return <div className="leading-relaxed text-slate-600 whitespace-pre-line">{normalized}</div>;
  }

  return (
    <div>
      <div
        ref={contentRef}
        style={
          !expanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : {}
        }
        className="leading-relaxed text-slate-600 whitespace-pre-line"
      >
        {normalized}
      </div>
      {needsTruncation && (
        <button
          className="mt-2 text-sm font-medium text-[#0055a8] hover:text-[#003d7a] hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Prikaži manje" : "Prikaži više"}
        </button>
      )}
    </div>
  );
}
