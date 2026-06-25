"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MapPin, Loader2 } from "lucide-react";

interface Point {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface Props {
  onSelect: (point: {
    id: string;
    name: string;
    contact: { address: string; city: string; postalCode: string; countryCode: string };
  }) => void;
  selectedName?: string;
}

export default function GlsWidgetPicker({ onSelect, selectedName }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/shipping/gls/delivery-points")
      .then(r => r.json())
      .then(d => { setPoints(d.points || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? points.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        (p.city || "").toLowerCase().includes(search.toLowerCase())
      )
    : points;

  const handleSelect = (p: Point) => {
    const parts = p.address.split(",").map(s => s.trim());
    onSelect({
      id: p.id,
      name: p.name,
      contact: {
        address: parts[0] || "",
        city: p.city || parts[1]?.split(" ").slice(1).join(" ") || "",
        postalCode: parts[1]?.split(" ")[0] || "",
        countryCode: "HR",
      },
    });
    setOpen(false);
  };

  return (
    <div className="mt-3">
      {selectedName ? (
        <div className="rounded-lg bg-[#0055a8]/5 border border-[#0055a8]/20 p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#0055a8]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Odabrani paketomat:</p>
              <p className="text-sm text-slate-700">{selectedName}</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
              Promijeni paketomat
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
          <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-3" />
          <p className="text-sm text-slate-600 mb-3">Odaberite GLS Paketomat za preuzimanje</p>
          <Button type="button" onClick={() => setOpen(true)} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Učitavanje...</> : "Odaberite GLS Paketomat"}
          </Button>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="mx-4 max-h-[80vh] w-full max-w-lg rounded-xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Odaberite GLS Paketomat</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-5 py-3">
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Pretraži paketomate..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-[50vh] overflow-y-auto border-t border-slate-100">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-sm text-slate-400">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Učitavanje GLS paketomata...
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-400">
                  {search ? "Nema rezultata za uneseni pojam." : "Nema dostupnih GLS paketomata."}
                </p>
              ) : (
                filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="flex w-full items-start gap-3 border-b border-slate-50 px-5 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.address}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 px-5 py-3">
              <Button type="button" variant="ghost" className="w-full" onClick={() => setOpen(false)}>
                Zatvori
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
