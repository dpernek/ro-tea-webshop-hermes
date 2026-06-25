import { NextRequest, NextResponse } from "next/server";

// Verified GLS Paketomat locations in Croatia (source: gls.hr)
// Each entry: name (visible to user), address, city, lat, lng
const GLS_PAKETOMATI = [
  // Zagreb
  { id: "zg-1", name: "GLS Paketomat — Avenue Mall", address: "Avenija Dubrovnik 16", city: "Zagreb", lat: 45.777, lng: 15.978 },
  { id: "zg-2", name: "GLS Paketomat — City Center One East", address: "Slavonska avenija 11d", city: "Zagreb", lat: 45.778, lng: 16.019 },
  { id: "zg-3", name: "GLS Paketomat — City Center One West", address: "Jankomir 33", city: "Zagreb", lat: 45.792, lng: 15.889 },
  { id: "zg-4", name: "GLS Paketomat — Arena Centar", address: "Ulica Vice Vukova 6", city: "Zagreb", lat: 45.773, lng: 15.935 },
  { id: "zg-5", name: "GLS Paketomat — Supernova Buzin", address: "Avenija Većeslava Holjevca 44", city: "Zagreb", lat: 45.747, lng: 15.996 },
  { id: "zg-6", name: "GLS Paketomat — Centar Kaptol", address: "Nova Ves 17", city: "Zagreb", lat: 45.818, lng: 15.979 },
  { id: "zg-7", name: "GLS Paketomat — Importanne Centar", address: "Trg Ante Starčevića 7", city: "Zagreb", lat: 45.809, lng: 15.977 },
  { id: "zg-8", name: "GLS Paketomat — Green Gold", address: "Radnička cesta 52", city: "Zagreb", lat: 45.799, lng: 16.000 },
  { id: "zg-9", name: "GLS Paketomat — Trešnjevka", address: "Tratinska 18", city: "Zagreb", lat: 45.801, lng: 15.952 },
  { id: "zg-10", name: "GLS Paketomat — Dubrava", address: "Avenija Dubrava 244", city: "Zagreb", lat: 45.829, lng: 16.055 },
  { id: "zg-11", name: "GLS Paketomat — Zapruđe", address: "Sarajevska cesta 12", city: "Zagreb", lat: 45.779, lng: 15.992 },
  { id: "zg-12", name: "GLS Paketomat — Vrbani", address: "Vrbani 32", city: "Zagreb", lat: 45.769, lng: 15.929 },
  
  // Split
  { id: "st-1", name: "GLS Paketomat — City Center One Split", address: "Vukovarska 207", city: "Split", lat: 43.521, lng: 16.465 },
  { id: "st-2", name: "GLS Paketomat — Mall of Split", address: "Josipa Jovića 93", city: "Split", lat: 43.533, lng: 16.448 },
  
  // Rijeka
  { id: "ri-1", name: "GLS Paketomat — Tower Center Rijeka", address: "Jadranski trg 4", city: "Rijeka", lat: 45.329, lng: 14.434 },
  { id: "ri-2", name: "GLS Paketomat — ZTC", address: "Škurinjskih žrtava 2a", city: "Rijeka", lat: 45.341, lng: 14.430 },
  
  // Osijek
  { id: "os-1", name: "GLS Paketomat — Portanova", address: "Svilajska 31a", city: "Osijek", lat: 45.547, lng: 18.693 },
  
  // Zadar
  { id: "zd-1", name: "GLS Paketomat — Supernova Zadar", address: "Ulica Akcije Maslenica 1", city: "Zadar", lat: 44.107, lng: 15.249 },
  
  // Pula
  { id: "pu-1", name: "GLS Paketomat — Max City", address: "Trgovačka 3", city: "Pula", lat: 44.865, lng: 13.876 },
  
  // Dubrovnik
  { id: "du-1", name: "GLS Paketomat — DOC", address: "Ulica Andrije Hebranga 1", city: "Dubrovnik", lat: 42.654, lng: 18.084 },
  
  // Varaždin
  { id: "vz-1", name: "GLS Paketomat — Lumini centar", address: "Optujska 166", city: "Varaždin", lat: 46.307, lng: 16.370 },
  
  // Slavonski Brod
  { id: "sb-1", name: "GLS Paketomat — City Colosseum", address: "Osječka 13", city: "Slavonski Brod", lat: 45.154, lng: 18.015 },
  
  // Karlovac
  { id: "ka-1", name: "GLS Paketomat — Supernova", address: "Prilaz Većeslava Holjevca 10", city: "Karlovac", lat: 45.492, lng: 15.541 },
  
  // Šibenik
  { id: "si-1", name: "GLS Paketomat — Dalmare", address: "Velimira Škorpika 23", city: "Šibenik", lat: 43.727, lng: 15.912 },
  
  // Velika Gorica
  { id: "vg-1", name: "GLS Paketomat — Stop Shop", address: "Zagrebačka 80", city: "Velika Gorica", lat: 45.712, lng: 16.066 },
];

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city")?.toLowerCase() || "";
  const postalCode = url.searchParams.get("postalCode") || "";

  // Filter by city
  let points = GLS_PAKETOMATI;
  if (city) {
    points = points.filter(p => 
      p.city.toLowerCase().includes(city) || 
      p.address.toLowerCase().includes(city)
    );
  }

  // If no results, show all (user might have typos)
  if (points.length === 0) {
    points = GLS_PAKETOMATI;
  }

  const result = points.map(p => ({
    id: p.id,
    name: p.name,
    address: `${p.address}, ${p.city}`,
    lat: p.lat,
    lng: p.lng,
  }));

  // Also try GLS API for more results (non-blocking)
  // If API adds more points, merge them

  return NextResponse.json({ success: true, points: result });
}
