"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { MapPin } from "lucide-react";

interface Props {
  onSelect: (point: {
    id: string;
    name: string;
    contact: { address: string; city: string; postalCode: string; countryCode: string };
  }) => void;
  selectedName?: string;
}

const SCRIPT_URL = "https://map.gls-hungary.com/widget/gls-dpm.js";

export default function GlsWidgetPicker({ onSelect, selectedName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogElRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  // Load GLS script once, track readiness
  useEffect(() => {
    // Already loaded?
    if (customElements.get("gls-dpm-dialog")) {
      setReady(true);
      return;
    }

    // Script already in DOM?
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_URL}"]`
    );
    if (existing) {
      if (customElements.get("gls-dpm-dialog")) {
        setReady(true);
      } else {
        // Script loaded but custom element not registered yet — wait
        existing.addEventListener("load", () => setReady(true));
      }
      return;
    }

    // Load fresh
    const script = document.createElement("script");
    script.type = "module";
    script.src = SCRIPT_URL;
    script.onload = () => setReady(true);
    script.onerror = () => setReady(false);
    document.head.appendChild(script);
  }, []);

  // Create the dialog element imperatively (clean, no innerHTML)
  useEffect(() => {
    if (!ready || !containerRef.current) return;

    // Remove any previous element
    if (dialogElRef.current) {
      dialogElRef.current.remove();
    }

    const el = document.createElement("gls-dpm-dialog");
    el.setAttribute("country", "HR");
    el.setAttribute("language", "HR");
    el.setAttribute("filter-type", "parcel-locker");

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) onSelectRef.current(detail);
    };
    el.addEventListener("change", handler);

    containerRef.current.appendChild(el);
    dialogElRef.current = el;

    return () => {
      el.removeEventListener("change", handler);
      el.remove();
      dialogElRef.current = null;
    };
  }, [ready]);

  const openDialog = useCallback(() => {
    const el = dialogElRef.current as any;
    if (el?.showModal) el.showModal();
  }, []);

  if (!ready) {
    return (
      <div className="mt-3 rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
        <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-3" />
        <p className="text-sm text-slate-600 mb-3">Učitavanje GLS karte...</p>
        <Button type="button" disabled>Učitavanje...</Button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* Hidden container for the dialog custom element */}
      <div ref={containerRef} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} />

      {selectedName ? (
        <div className="rounded-lg bg-[#0055a8]/5 border border-[#0055a8]/20 p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#0055a8]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Odabrani paketomat:</p>
              <p className="text-sm text-slate-700">{selectedName}</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={openDialog}>
              Promijeni paketomat
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-3" />
          <p className="text-sm text-slate-600 mb-3">Odaberite GLS Paketomat za preuzimanje</p>
          <Button type="button" onClick={openDialog}>
            Odaberite GLS Paketomat
          </Button>
        </div>
      )}
    </div>
  );
}
