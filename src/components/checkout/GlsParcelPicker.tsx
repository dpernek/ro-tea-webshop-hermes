"use client";
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/Button";
import { MapPin, Search, X, Loader2 } from "lucide-react";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

interface Point {
  id: string; name: string; address: string; lat?: number; lng?: number;
}

interface Props {
  onSelect: (point: {
    id: string; name: string;
    contact: { address: string; city: string; postalCode: string; countryCode: string };
  }) => void;
  selectedName?: string;
  city?: string;
  postalCode?: string;
}

function FitBounds({ points }: { points: Point[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter(p => p.lat && p.lng);
    if (valid.length) {
      map.fitBounds(
        L.latLngBounds(valid.map(p => [p.lat!, p.lng!] as [number, number])),
        { padding: [30, 30], maxZoom: 13 }
      );
    } else {
      map.setView([45.815, 15.982], 7);
    }
  }, [points, map]);
  return null;
}

function normalize(s: string) {
  return s.toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/đ/g, "d").replace(/ž/g, "z");
}

export default function GlsParcelPicker({ onSelect, selectedName, city, postalCode }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Point | null>(null);

  // Auto-open on first render when no location selected
  useEffect(() => {
    if (!loading && !selectedName) setOpen(true);
  }, [loading, selectedName]);

  // Fetch all GLS points
  useEffect(() => {
    fetch("/api/shipping/gls/delivery-points")
      .then(r => r.json())
      .then(d => { setPoints(d.points || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Pre-filter: if user has city/postal, prioritize those results
  const localPoints = useMemo(() => {
    if (!city && !postalCode) return points;
    const c = normalize(city || "");
    const z = (postalCode || "").trim();
    const local = points.filter(p => {
      const addr = normalize(p.address);
      const name = normalize(p.name);
      if (z && addr.includes(z)) return true;
      if (c && (addr.includes(c) || name.includes(c))) return true;
      return false;
    });
    return local.length > 0 ? local : points;
  }, [points, city, postalCode]);

  // Search within (already localized) points
  const filtered = useMemo(() => {
    if (!search) return localPoints;
    const q = normalize(search);
    return localPoints.filter(p =>
      normalize(p.name).includes(q) ||
      normalize(p.address).includes(q)
    );
  }, [localPoints, search]);

  const handleSelect = (p: Point) => {
    const parts = p.address.split(",").map(s => s.trim());
    onSelect({
      id: p.id, name: p.name,
      contact: {
        address: parts[0] || "",
        city: parts[1]?.split(" ").slice(1).join(" ") || "",
        postalCode: parts[1]?.split(" ")[0] || "",
        countryCode: "HR",
      },
    });
    setSelected(p);
    setOpen(false);
  };

  return (
    <div className="mt-3">
      {selectedName ? (
        <div className="rounded-lg bg-[#0055a8]/5 border border-[#0055a8]/20 p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#0055a8] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">Odabrani paketomat:</p>
              <p className="text-sm text-slate-700 truncate">{selectedName}</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
              Promijeni
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

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="flex max-h-[85vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-lg font-semibold">Odaberite GLS Paketomat</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#0055a8] focus:outline-none"
                  placeholder="Pretraži po nazivu, adresi ili gradu..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {city && (
                <p className="mt-2 text-xs text-slate-400">
                  {localPoints.length < points.length
                    ? `Prikazano ${localPoints.length} paketomata za ${city}${postalCode ? ` (${postalCode})` : ""}`
                    : `Prikazano svih ${points.length} paketomata`}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
              <div className="h-[350px] md:h-full">
                {loading ? (
                  <div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-400">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Učitavanje karte...
                  </div>
                ) : (
                  <MapContainer center={[45.815, 15.982]} zoom={7} className="h-full w-full" scrollWheelZoom={true}>
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {filtered.map(p => (
                      <Marker key={p.id} position={[p.lat || 45.8, p.lng || 16.0]} icon={icon} eventHandlers={{ click: () => handleSelect(p) }}>
                        <Popup><strong>{p.name}</strong><br />{p.address}</Popup>
                      </Marker>
                    ))}
                    <FitBounds points={filtered} />
                  </MapContainer>
                )}
              </div>

              <div className="overflow-y-auto border-t md:border-t-0 md:border-l border-slate-100">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-sm text-slate-400">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Učitavanje...
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="py-16 text-center text-sm text-slate-400">
                    {search ? "Nema rezultata za ovu pretragu." : `Nema paketomata${city ? ` u ${city}` : ""}.`}
                  </p>
                ) : (
                  filtered.map(p => (
                    <button key={p.id} onClick={() => handleSelect(p)} className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${selected?.id === p.id ? "bg-blue-50" : ""}`}>
                      <MapPin className={`mt-0.5 h-4 w-4 flex-shrink-0 ${selected?.id === p.id ? "text-[#0055a8]" : "text-slate-400"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500 truncate">{p.address}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
