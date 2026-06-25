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

interface GPoint {
  id: string; name: string; street: string; city: string; postalCode: string;
  address: string; lat?: number; lng?: number; distanceMeters?: number;
}

interface Props {
  onSelect: (point: { id: string; name: string; contact: { address: string; city: string; postalCode: string; countryCode: string } }) => void;
  selectedName?: string;
  city?: string;
  postalCode?: string;
  customerAddress?: string;
}

// ── Haversine ──
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

// ── Croatian stopwords ──
const STOPWORDS = new Set([
  "ulica", "trg", "avenija", "aleja", "put", "prolaz", "prilaz",
  "bb", "grada", "setaliste", "šetalište", "obala", "pristaniste", "pristanište",
]);

function norm(s: string) {
  return s.toLowerCase()
    .replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s")
    .replace(/đ/g, "d").replace(/ž/g, "z");
}

function meaningfulTokens(s: string): string[] {
  return norm(s).split(/[\s,.-]+/).filter(t => t.length > 1 && !STOPWORDS.has(t));
}

function textScore(point: GPoint, tokens: string[]): number {
  let score = 0;
  for (const t of tokens) {
    if (point.postalCode === t) score += 50;
    else if (norm(point.city).includes(t)) score += 20;
    else if (norm(point.street).includes(t)) score += 10;
    else if (norm(point.name).includes(t)) score += 5;
  }
  return score;
}

// ── FitBounds ──
function FitBounds({ points }: { points: GPoint[] }) {
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

export default function GlsParcelPicker({ onSelect, selectedName, city, postalCode, customerAddress }: Props) {
  const [points, setPoints] = useState<GPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<GPoint | null>(null);
  const [geoLat, setGeoLat] = useState<number | null>(null);
  const [geoLng, setGeoLng] = useState<number | null>(null);
  const [geoDisplay, setGeoDisplay] = useState("");
  const [geoError, setGeoError] = useState(false);

  // Auto-open
  useEffect(() => {
    if (!loading && !selectedName) setOpen(true);
  }, [loading, selectedName]);

  // Fetch GLS points
  useEffect(() => {
    fetch("/api/shipping/gls/delivery-points")
      .then(r => r.json())
      .then(d => setPoints(d.points || []))
      .finally(() => setLoading(false));
  }, []);

  // Geocode customer address
  useEffect(() => {
    if (!open || !customerAddress) return;
    setGeoError(false);

    fetch("/api/shipping/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: customerAddress, city, postalCode, countryCode: "HR" }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setGeoLat(d.lat);
          setGeoLng(d.lng);
          setGeoDisplay(d.displayName);
        } else {
          setGeoError(true);
        }
      })
      .catch(() => setGeoError(true));
  }, [open, customerAddress, city, postalCode]);

  // 1) Filter by postalCode → city → all
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

  // 2) Attach distances if geocoded
  const withDist = useMemo(() => {
    if (geoLat == null || geoLng == null) return localPoints;
    return localPoints.map(p => ({
      ...p,
      distanceMeters: p.lat && p.lng ? haversineM(geoLat, geoLng, p.lat, p.lng) : undefined,
    }));
  }, [localPoints, geoLat, geoLng]);

  // 3) Sort: distance first, text score second
  const sorted = useMemo(() => {
    if (!search) {
      // No search — sort by distance if available, else keep original
      return [...withDist].sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
    }
    const tokens = meaningfulTokens(search);
    return [...withDist].sort((a, b) => {
      const aDist = a.distanceMeters ?? Infinity;
      const bDist = b.distanceMeters ?? Infinity;
      // If distances differ significantly (>200m), distance wins
      if (Math.abs(aDist - bDist) > 200) return aDist - bDist;
      // Otherwise use text score
      return textScore(b, tokens) - textScore(a, tokens);
    });
  }, [withDist, search]);

  const handleSelect = (p: GPoint) => {
    onSelect({
      id: p.id, name: p.name,
      contact: { address: p.street, city: p.city, postalCode: p.postalCode, countryCode: "HR" },
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
                  placeholder="Pretraži paketomate po nazivu ili adresi"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {geoLat != null
                  ? `📍 Prikazani najbliži GLS paketomati za: ${geoDisplay?.split(",").slice(0, 3).join(", ") || `${customerAddress}, ${postalCode} ${city}`}`
                  : geoError
                    ? "Točna lokacija adrese nije pronađena. Prikazani su paketomati za vaš grad."
                    : `${sorted.length} paketomata${city ? ` za ${city}` : ""}${postalCode ? ` (${postalCode})` : ""}`
                }
              </p>
              {geoError && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>Točna lokacija adrese nije pronađena. Prikazani su paketomati za vaš grad.</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
              <div className="h-[350px] md:h-full">
                {loading ? (
                  <div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-400"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Učitavanje...</div>
                ) : (
                  <MapContainer center={[45.815, 15.982]} zoom={7} className="h-full w-full" scrollWheelZoom={true}>
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {sorted.map(p => (
                      <Marker key={p.id} position={[p.lat || 45.8, p.lng || 16.0]} icon={icon} eventHandlers={{ click: () => handleSelect(p) }}>
                        <Popup><strong>{p.name}</strong><br />{p.address}{p.distanceMeters ? <><br />{formatDist(p.distanceMeters)}</> : null}</Popup>
                      </Marker>
                    ))}
                    <FitBounds points={sorted} />
                  </MapContainer>
                )}
              </div>

              <div className="overflow-y-auto border-t md:border-t-0 md:border-l border-slate-100">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-sm text-slate-400"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Učitavanje...</div>
                ) : sorted.length === 0 ? (
                  <p className="py-16 text-center text-sm text-slate-400">Nema dostupnih paketomata.</p>
                ) : (
                  sorted.map(p => (
                    <button key={p.id} onClick={() => handleSelect(p)} className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${selected?.id === p.id ? "bg-blue-50" : ""}`}>
                      <MapPin className={`mt-0.5 h-4 w-4 flex-shrink-0 ${selected?.id === p.id ? "text-[#0055a8]" : "text-slate-400"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500 truncate">{p.address}</p>
                      </div>
                      {p.distanceMeters != null && (
                        <span className="text-xs font-medium text-[#0055a8] whitespace-nowrap">{formatDist(p.distanceMeters)}</span>
                      )}
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
