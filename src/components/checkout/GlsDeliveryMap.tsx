"use client";
import { useEffect, useRef, useState } from "react";

interface GlsWidgetProps {
  country?: string;
  language?: string;
  filterType?: "parcel-locker" | "parcel-shop";
  onSelect?: (point: {
    id: string;
    name: string;
    contact: { countryCode: string; postalCode: string; city: string; address: string };
  }) => void;
  height?: string;
}

export default function GlsDeliveryMap({
  country = "hr",
  language = "hr",
  filterType = "parcel-locker",
  onSelect,
  height = "500px",
}: GlsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || ready) return;

    // Load GLS widget script
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://map.gls-hungary.com/widget/gls-dpm.js";
    script.onload = () => {
      // Create the custom element after script loads
      const el = document.createElement("gls-dpm");
      el.setAttribute("country", country);
      el.setAttribute("language", language);
      el.setAttribute("filter-type", filterType);
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.display = "block";

      // Listen for selection changes
      if (onSelect) {
        el.addEventListener("change", ((e: CustomEvent) => {
          if (e.detail) onSelect(e.detail);
        }) as EventListener);
      }

      container.innerHTML = "";
      container.appendChild(el);
      setReady(true);
    };
    script.onerror = () => {
      setReady(true); // Show fallback message
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
    };
  }, [country, language, filterType]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", background: "#f8fafc" }}
    >
      {!ready && (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Učitavanje GLS karte...
        </div>
      )}
    </div>
  );
}
