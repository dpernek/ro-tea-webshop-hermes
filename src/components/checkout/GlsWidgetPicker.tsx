"use client";
import { useEffect, useRef, useState } from "react";
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

export default function GlsWidgetPicker({ onSelect, selectedName }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || document.querySelector('script[src*="gls-dpm.js"]')) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://map.gls-hungary.com/widget/gls-dpm.js";
    script.onload = () => setLoaded(true);
    script.onerror = () => setLoaded(false);
    document.head.appendChild(script);

    return () => {
      // Don't remove — script may be used by other instances
    };
  }, [loaded]);

  useEffect(() => {
    if (!loaded || !dialogRef.current) return;

    // Inject gls-dpm-dialog element directly
    dialogRef.current.innerHTML = `<gls-dpm-dialog country="hr" language="hr" filter-type="parcel-locker"></gls-dpm-dialog>`;

    const el = dialogRef.current.querySelector("gls-dpm-dialog");
    if (el && onSelect) {
      el.addEventListener("change", ((e: CustomEvent) => {
        if (e.detail) onSelect(e.detail);
      }) as EventListener);
    }
  }, [loaded, onSelect]);

  const openDialog = () => {
    const el = dialogRef.current?.querySelector("gls-dpm-dialog") as any;
    if (el?.showModal) el.showModal();
  };

  return (
    <div className="mt-3">
      <div ref={dialogRef} style={{ display: "none" }} />

      {selectedName ? (
        <div className="rounded-lg bg-[#0055a8]/5 border border-[#0055a8]/20 p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#0055a8]" />
            <div>
              <p className="text-sm font-medium text-slate-900">Odabrani paketomat:</p>
              <p className="text-sm text-slate-700">{selectedName}</p>
            </div>
            <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={openDialog}>
              Promijeni paketomat
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-3" />
          <p className="text-sm text-slate-600 mb-3">Odaberite GLS Paketomat za preuzimanje</p>
          <Button type="button" onClick={openDialog} disabled={!loaded}>
            {loaded ? "Odaberite GLS Paketomat" : "Učitavanje GLS karte..."}
          </Button>
        </div>
      )}
    </div>
  );
}
