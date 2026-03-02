import React, { useState, useEffect, useMemo } from "react";
import { Map as MapIcon, AlertCircle, Filter, Search } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

interface Outlet {
  id: string;
  name: string;
  location: string;
  coords: { x: number; y: number };
  lat: number;
  lng: number;
  status: "critical" | "warning" | "good";
  satisfaction: number;
  issues: string[];
}

function coordsToLatLng(x: number, y: number): [number, number] {
  const lat = 6 - (y / 100) * 17;
  const lng = 95 + (x / 100) * 46;
  return [lat, lng];
}

const INDONESIA_CENTER: [number, number] = [-2.5, 118];
const DEFAULT_ZOOM = 5;

function getStatusColor(status: string) {
  switch (status) {
    case "critical":
      return { bg: "#ef4444", border: "#b91c1c", text: "text-red-600" };
    case "warning":
      return { bg: "#f59e0b", border: "#d97706", text: "text-amber-600" };
    case "good":
      return { bg: "#10b981", border: "#059669", text: "text-emerald-600" };
    default:
      return { bg: "#64748b", border: "#475569", text: "text-slate-600" };
  }
}

const MAP_HEIGHT = 600;

function OutletMapLeaflet({ outlets }: { outlets: Outlet[] }) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{ outlets: Outlet[] }> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([import("react-leaflet"), import("leaflet")])
      .then(([RL, LeafletModule]) => {
        const { MapContainer, TileLayer, Marker, Popup } = RL;
        const L = (LeafletModule as { default?: typeof import("leaflet") }).default ?? LeafletModule;
        if (typeof L !== "undefined" && L.Icon?.Default) {
          delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          });
        }

        const StatusMarker = ({ outlet }: { outlet: Outlet }) => {
          const c = getStatusColor(outlet.status);
          const icon = L.divIcon({
            className: "outlet-marker",
            html: `<div style="width:24px;height:24px;border-radius:50%;background:${c.bg};border:3px solid ${c.border};box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });
          return (
            <Marker position={[outlet.lat, outlet.lng]} icon={icon}>
              <Popup>
                <div className="min-w-[200px] p-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{outlet.location}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${outlet.status === "critical" ? "bg-red-100 text-red-600" : outlet.status === "warning" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                      {outlet.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{outlet.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${outlet.status === "critical" ? "bg-red-500" : outlet.status === "warning" ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${((outlet.satisfaction + 1) / 2) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{outlet.satisfaction.toFixed(2)}</span>
                  </div>
                  {outlet.issues.length > 0 && (
                    <ul className="space-y-1">
                      {outlet.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        };

        const Inner = ({ outlets: out }: { outlets: Outlet[] }) => (
          <MapContainer
            center={INDONESIA_CENTER}
            zoom={DEFAULT_ZOOM}
            className="outlet-leaflet-map"
            style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {out.map((outlet) => (
              <StatusMarker key={outlet.id} outlet={outlet} />
            ))}
          </MapContainer>
        );
        setMapComponent(() => Inner);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err?.message ?? "Failed to load map. Install: npm install leaflet react-leaflet");
      });
  }, []);

  const containerStyle = { width: "100%", height: MAP_HEIGHT };

  if (loadError) {
    return (
      <div className="w-full rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-2" style={containerStyle}>
        <p className="text-slate-600 font-medium">Map unavailable</p>
        <p className="text-xs text-slate-500 max-w-sm text-center">{loadError}</p>
      </div>
    );
  }

  if (!MapComponent) {
    return (
      <div className="w-full rounded-xl bg-slate-100 flex items-center justify-center" style={containerStyle}>
        <p className="text-slate-500 font-medium">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden z-0" style={containerStyle}>
      <MapComponent outlets={outlets} />
    </div>
  );
}

export function OutletCustomerSatisfaction() {
  const content = useDashboardContent();
  const outlets = useMemo((): Outlet[] => {
    const list = content?.outletSatisfaction ?? [];
    return list.map((o) => {
      const [lat, lng] = coordsToLatLng(o.coords.x, o.coords.y);
      return {
        id: o.id,
        name: o.name,
        location: o.location,
        coords: o.coords,
        lat,
        lng,
        status: o.status,
        satisfaction: o.satisfaction,
        issues: Array.isArray(o.issues) ? o.issues : [],
      };
    });
  }, [content?.outletSatisfaction]);

  return (
    <section id="outlet-satisfaction" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-200/50">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-slate-900 font-bold tracking-tight">Outlet Customer Satisfaction</h2>
            <p className="text-sm text-slate-500">Geographical distribution of outlet performance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1 mr-4">
            <div className="px-3 py-1 text-xs font-medium bg-white rounded-md shadow-sm text-slate-900">Map View</div>
            <div className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">List View</div>
          </div>
          <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <Filter className="w-4 h-4" />
          </button>
          <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="relative w-full" style={{ height: MAP_HEIGHT }}>
            <OutletMapLeaflet outlets={outlets} />
          </div>

          <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-[1000]">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl p-2.5 shadow-lg flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Critical ({outlets.filter((o) => o.status === "critical").length})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Warning ({outlets.filter((o) => o.status === "warning").length})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Healthy ({outlets.filter((o) => o.status === "good").length})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6 opacity-70">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Critical Alerts ({outlets.filter((o) => o.status === "critical").length})
            </span>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
            {outlets.filter((o) => o.status === "critical").map((outlet) => (
              <div key={outlet.id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold group-hover:text-red-400 transition-colors">{outlet.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                    {outlet.location}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {outlet.name === "Jakarta Flagship"
                    ? "Critical satisfaction drop in the last 48 hours. Negative mentions about wait times increased by 45%."
                    : "Severe decline in service perception. Customer feedback indicates persistent issues with pricing and facility cleanliness."}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Customer Sentiment</p>
                    <p className="text-sm font-bold text-red-400">{outlet.satisfaction.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Impact</p>
                    <p className="text-sm font-bold text-red-400">High</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {outlet.issues.map((issue, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-slate-300 font-medium border border-white/5">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="w-full mt-8 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
          >
            View All Insights
          </button>
        </div>
      </div>
    </section>
  );
}
