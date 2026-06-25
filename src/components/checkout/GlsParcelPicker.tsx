"use client";
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/Button";
import { MapPin, Search, X, Loader2, Info } from "lucide-react";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

interface Point {
  id: string; name: string; street: string; city: string; postalCode: string;
  address: string; lat?: number; lng?: number;
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
    }
  }, [points, map]);
  return null;
}

function norm(s: string) {
  return s.toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/đ/g, "d").replace(/ž/g, "z");
}

function tokenize(s: string): string[] {
  return norm(s).split(/[\s,.-]+/).filter(t => t.length > 1);
}

function rankPoints(points: Point[], search: string): Point[] {
  if (!search) return points;
  const tokens = tokenize(search);
  if (!tokens.length) return points;

  const scored = points.map(p => {
    let score = 0;
    const nameN = norm(p.name);
    const streetN = norm(p.street);
    const cityN = norm(p.city);
    const zipN = p.postalCode;

    for (const t of tokens) {
      if (zipN === t) score += 100;
      if (zipN.includes(t)) score += 50;
      if (cityN.includes(t)) score += 30;
      if (streetN.includes(t)) score += 20;
      if (nameN.includes(t)) score += 10;
    }
    return { point: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(s => s.point);
}

export default function GlsParcelPicker({ onSelect, selectedName, city, postalCode }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Point | null>(null);

  useEffect(() => {
    if (!loading && !selectedName) setOpen(true);
  }, [loading, selectedName]);

  useEffect(() => {
    fetch("/api/shipping/gls/delivery-points")
      .then(r => r.json())
      .then(d => { setPoints(d.points || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // 1) Filter by postalCode (exact) → city (contains) → all
  const localPoints = useMemo(() => {
    const zip = (postalCode || "").trim();
    const c = norm(city || "");

    if (zip) {
      const byZip = points.filter(p => p.postalCode === zip);
      if (byZip.length) return byZip;
    }
    if (c) {
      const byCity = points.filter(p => norm(p.city).includes(c));
      if (byCity.length) return byCity;
    }
    return points;
  }, [points, postalCode, city]);

  // 2) Search: rank by token match
  const displayPoints = useMemo(() => {
    if (!search) return localPoints;
    return rankPoints(localPoints, search);
  }, [localPoints, search]);

  const isExactMatch = useMemo(() => {
    if (!search) return true;
    const tokens = tokenize(search);
    return displayPoints.some(p => {
      const haystack = norm(`${p.street} ${p.city} ${p.postalCode} ${p.name}`);
      return tokens.every(t => haystack.includes(t));
    });
  }, [search, displayPoints]);

  const handleSelect = (p: Point) => {
    onSelect({
      id: p.id, name: p.name,
      contact: {
        address: p.street, city: p.city, postalCode: p.postalCode, countryCode: "HR",
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
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>Promijeni</Button>
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
                  placeholder="Pretraži po nazivu, ulici, gradu ili poštanskom broju"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {/* Info line */}
              <p className="mt-2 text-xs text-slate-400">
                {search && !isExactMatch
                  ? `Nema točnog podudaranja. Prikazani najrelevantniji paketomati${city ? ` za ${city}` : ""}.`
                  : `${displayPoints.length} paketomata${city ? ` za ${city}` : ""}${postalCode ? ` (${postalCode})` : ""}`
                }
              </p>
              {search && !isExactMatch && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>Nema točnog podudaranja za unesenu adresu. Prikazani su najbliži dostupni paketomati za vaš grad.</span>
                </div>
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
                    {displayPoints.map(p => (
                      <Marker key={p.id} position={[p.lat || 45.8, p.lng || 16.0]} icon={icon} eventHandlers={{ click: () => handleSelect(p) }}>
                        <Popup><strong>{p.name}</strong><br />{p.address}</Popup>
                      </Marker>
                    ))}
                    <FitBounds points={displayPoints} />
                  </MapContainer>
                )}
              </div>

              <div className="overflow-y-auto border-t md:border-t-0 md:border-l border-slate-100">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-sm text-slate-400"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Učitavanje...</div>
                ) : displayPoints.length === 0 ? (
                  <p className="py-16 text-center text-sm text-slate-400">Nema dostupnih paketomata.</p>
                ) : (
                  displayPoints.map(p => (
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
