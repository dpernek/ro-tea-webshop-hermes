"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Loader2, MapPin, Search, X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface GlsPoint {
  id: string;
  name: string;
  address: string;
  city?: string;
  lat?: number;
  lng?: number;
}

interface Props {
  onSelect: (point: GlsPoint) => void;
  onClose?: () => void;
  initialCity?: string;
}

function FitBounds({ points }: { points: GlsPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const validPoints = points.filter((p) => p.lat && p.lng);
    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints.map((p) => [p.lat!, p.lng!]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    } else if (points.length > 0) {
      // Default to Zagreb
      map.setView([45.815, 15.982], 12);
    }
  }, [points, map]);
  return null;
}

export default function GlsParcelPicker({
  onSelect,
  onClose,
  initialCity,
}: Props) {
  const [points, setPoints] = useState<GlsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(initialCity || "");
  const [selected, setSelected] = useState<GlsPoint | null>(null);

  const fetchPoints = async (city?: string, postal?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (postal) params.set("postalCode", postal);
      const res = await fetch(`/api/shipping/gls/delivery-points?${params}`);
      const data = await res.json();
      if (data.success && data.points?.length) {
        // Add mock coordinates for Croatian cities (real GLS API doesn't return coords)
        const withCoords = data.points.map((p: GlsPoint) => ({
          ...p,
          lat: p.lat || getCityLat(p),
          lng: p.lng || getCityLng(p),
        }));
        setPoints(withCoords);
      } else {
        setError("Nema dostupnih GLS paketomata za ovo područje.");
      }
    } catch {
      setError("Nismo uspjeli dohvatiti GLS lokacije. Pokušajte ponovno.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPoints(initialCity); }, [initialCity]);

  const handleSelect = (point: GlsPoint) => {
    setSelected(point);
    onSelect(point);
  };

  return (
    <div className="rounded-xl border border-[#0055a8]/30 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-base font-semibold text-slate-900">
          Odaberite GLS Paketomat
        </h3>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm"
            placeholder="Pretraži po gradu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPoints(search)}
          />
        </div>
      </div>

      {/* Map */}
      <div className="h-[300px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center bg-slate-50 px-4 text-center text-sm text-slate-500">
            {error}
          </div>
        ) : (
          <MapContainer
            center={[45.815, 15.982]}
            zoom={12}
            className="h-full w-full"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat || 45.8, p.lng || 16.0]}
                eventHandlers={{ click: () => handleSelect(p) }}
              >
                <Popup>
                  <strong>{p.name}</strong>
                  <br />
                  {p.address}
                </Popup>
              </Marker>
            ))}
            <FitBounds points={points} />
          </MapContainer>
        )}
      </div>

      {/* List */}
      <div className="max-h-[300px] overflow-y-auto border-t border-slate-100">
        {loading ? null : points.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p)}
            className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
              selected?.id === p.id ? "bg-blue-50 ring-1 ring-[#0055a8]" : ""
            }`}
          >
            <MapPin
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                selected?.id === p.id ? "text-[#0055a8]" : "text-slate-400"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-slate-900">{p.name}</p>
              <p className="text-xs text-slate-500">{p.address}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="border-t border-[#0055a8]/30 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-[#0055a8]">
            Odabrani paketomat:
          </p>
          <p className="text-sm text-slate-700">{selected.name}</p>
          <p className="text-xs text-slate-500">{selected.address}</p>
          <button
            onClick={() => { setSelected(null); onSelect(null as any); }}
            className="mt-2 text-xs text-[#0055a8] underline hover:text-blue-800"
          >
            Promijeni paketomat
          </button>
        </div>
      )}
    </div>
  );
}

// Fallback coordinates for Croatian cities (real GLS API doesn't return coords)
function getCityLat(p: GlsPoint): number {
  const addr = (p.address + (p.city || "")).toLowerCase();
  if (addr.includes("zagreb")) return 45.815;
  if (addr.includes("split")) return 43.508;
  if (addr.includes("rijeka")) return 45.327;
  if (addr.includes("osijek")) return 45.551;
  if (addr.includes("zadar")) return 44.119;
  if (addr.includes("pula")) return 44.867;
  if (addr.includes("slavonski")) return 45.161;
  if (addr.includes("dubrovnik")) return 42.651;
  if (addr.includes("varaždin")) return 46.306;
  if (addr.includes("karlovac")) return 45.487;
  if (addr.includes("sisak")) return 45.486;
  if (addr.includes("velika gorica")) return 45.714;
  if (addr.includes("samobor")) return 45.801;
  if (addr.includes("zaprešić")) return 45.857;
  return 45.815; // default Zagreb
}

function getCityLng(p: GlsPoint): number {
  const addr = (p.address + (p.city || "")).toLowerCase();
  if (addr.includes("zagreb")) return 15.982;
  if (addr.includes("split")) return 16.440;
  if (addr.includes("rijeka")) return 14.442;
  if (addr.includes("osijek")) return 18.694;
  if (addr.includes("zadar")) return 15.231;
  if (addr.includes("pula")) return 13.850;
  if (addr.includes("slavonski")) return 18.704;
  if (addr.includes("dubrovnik")) return 18.092;
  if (addr.includes("varaždin")) return 16.337;
  if (addr.includes("karlovac")) return 15.548;
  if (addr.includes("sisak")) return 16.373;
  if (addr.includes("velika gorica")) return 16.076;
  if (addr.includes("samobor")) return 15.719;
  if (addr.includes("zaprešić")) return 15.811;
  return 15.982; // default Zagreb
}
