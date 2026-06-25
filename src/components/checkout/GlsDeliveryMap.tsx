"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icon
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Point {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface Props {
  onSelect?: (point: { id: string; name: string; contact: { address: string; postalCode: string; city: string; countryCode: string } }) => void;
  height?: string;
}

function FitMap({ points }: { points: Point[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter((p) => p.lat && p.lng);
    if (valid.length) {
      map.fitBounds(valid.map((p) => [p.lat!, p.lng!] as [number, number]), { padding: [30, 30] });
    }
  }, [points, map]);
  return null;
}

export default function GlsDeliveryMap({ onSelect, height = "500px" }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shipping/gls/delivery-points")
      .then((r) => r.json())
      .then((d) => {
        setPoints(d.points || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-slate-50 text-sm text-slate-400">
        Učitavanje GLS paketomata...
      </div>
    );
  }

  if (!points.length) {
    return (
      <div style={{ height }} className="flex items-center justify-center bg-slate-50 text-sm text-slate-400">
        Nema dostupnih GLS paketomata.
      </div>
    );
  }

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer
        center={[45.815, 15.982]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
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
            icon={icon}
            eventHandlers={{
              click: () => {
                if (onSelect) {
                  const parts = p.address.split(",").map(s => s.trim());
                  onSelect({
                    id: p.id,
                    name: p.name,
                    contact: {
                      address: parts[0] || "",
                      postalCode: parts[1]?.split(" ")[0] || "",
                      city: parts[1]?.split(" ").slice(1).join(" ") || "",
                      countryCode: "HR",
                    },
                  });
                }
              },
            }}
          >
            <Popup>
              <strong>{p.name}</strong>
              <br />
              {p.address}
            </Popup>
          </Marker>
        ))}
        <FitMap points={points} />
      </MapContainer>
    </div>
  );
}
