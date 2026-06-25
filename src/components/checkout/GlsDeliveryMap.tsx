"use client";
import Script from "next/script";

interface Props {
  onSelect?: (point: any) => void;
  height?: string;
}

export default function GlsDeliveryMap({ onSelect, height = "500px" }: Props) {
  return (
    <>
      <Script
        src="https://map.gls-hungary.com/widget/gls-dpm.js"
        type="module"
        strategy="afterInteractive"
      />
      <div style={{ height, width: "100%" }}>
        <gls-dpm
          country="hr"
          language="hr"
          filter-type="parcel-locker"
          ref={(el: any) => {
            if (el && onSelect) {
              el.addEventListener("change", (e: CustomEvent) => {
                if (e.detail) onSelect(e.detail);
              });
            }
          }}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>
    </>
  );
}
