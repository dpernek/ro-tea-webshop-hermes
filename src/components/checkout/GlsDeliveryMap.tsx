"use client";
import { useEffect, useRef } from "react";

interface GlsWidgetProps {
  country?: string;
  language?: string;
  filterType?: "parcel-locker" | "parcel-shop";
  onSelect?: (point: {
    id: string;
    name: string;
    contact: {
      countryCode: string;
      postalCode: string;
      city: string;
      address: string;
    };
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
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://map.gls-hungary.com/widget/gls-dpm.js";
    script.onload = () => {
      // Widget auto-initializes after script loads
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const el = containerRef.current?.querySelector("gls-dpm");
    if (!el || !onSelect) return;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) onSelect(detail);
    };

    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, [onSelect]);

  return (
    <div ref={containerRef} style={{ height, width: "100%" }}>
      {/* @ts-expect-error — GLS custom element */}
      <gls-dpm
        country={country}
        language={language}
        filter-type={filterType}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
