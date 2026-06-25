"use client";
import { useEffect, useRef, useState } from "react";

export default function GlsDeliveryMap({
  country = "hr",
  language = "hr",
  onSelect,
  height = "500px",
}: {
  country?: string;
  language?: string;
  onSelect?: (point: any) => void;
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = ref.current;
    if (!container || loaded) return;

    // Load GLS script
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://map.gls-hungary.com/widget/gls-dpm.js";
    
    script.onload = () => {
      requestAnimationFrame(() => {
        const el = container.querySelector("gls-dpm");
        if (el && onSelect) {
          el.addEventListener("change", ((e: CustomEvent) => {
            e.detail && onSelect(e.detail);
          }) as EventListener);
        }
        setLoaded(true);
      });
    };
    
    script.onerror = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  return (
    <div ref={ref} style={{ height, width: "100%" }}>
      <div
        dangerouslySetInnerHTML={{
          __html: `<gls-dpm country="${country}" language="${language}" filter-type="parcel-locker" style="width:100%;height:${height};display:block"></gls-dpm>`,
        }}
      />
    </div>
  );
}
