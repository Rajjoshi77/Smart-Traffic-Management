import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import L from "leaflet";
import { RotateCcw } from "lucide-react";

/* ================= ICON FIX ================= */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ================= CUSTOM ICONS ================= */
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 45],
  iconAnchor: [15, 45],
});

const startIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 45],
  iconAnchor: [15, 45],
});

const endIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 45],
  iconAnchor: [15, 45],
});

/* ================= AUTO ZOOM TO USER ================= */
function FlyToUser({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [position, map]);

  return null;
}

/* ================= MAP CLICK HANDLER ================= */
function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

/* ================= ROUTING (ROAD FOLLOWING) ================= */
function RouteOnRoad({ points, trafficLevel }) {
  const map = useMap();

  useEffect(() => {
    if (points.length !== 2) return;

    const color =
      trafficLevel === "Low Traffic"
        ? "#16a34a"
        : trafficLevel === "Medium Traffic"
          ? "#f59e0b"
          : "#dc2626";

    const control = L.Routing.control({
      waypoints: [
        L.latLng(points[0].lat, points[0].lng),
        L.latLng(points[1].lat, points[1].lng),
      ],
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color, weight: 6, opacity: 0.9 }],
      },
      createMarker: () => null,
    }).addTo(map);

    return () => map.removeControl(control);
  }, [points, trafficLevel, map]);

  return null;
}

/* ================= MAIN COMPONENT ================= */
export default function TrafficMap({ trafficLevel, trafficData = [] }) {
  const [position, setPosition] = useState(null);
  const [points, setPoints] = useState([]);

  /* LIVE LOCATION */
  useEffect(() => {
    if (!navigator.geolocation) {
      setPosition([12.9716, 77.5946]); // Bangalore Default
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setPosition([12.9716, 77.5946]); // Bangalore Default
      },
      { enableHighAccuracy: true }
    );
  }, []);

  /* HANDLE MAP CLICKS */
  const handleMapClick = (latlng) => {
    if (points.length < 2) {
      setPoints([...points, latlng]);
    }
  };

  const getMarkerColor = (level) => {
    if (level === "Low") return "hue-rotate-[240deg]"; // Blueish
    if (level === "Medium") return "hue-rotate-[30deg]"; // Orange
    return "hue-rotate-[0deg]"; // Red
  };

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center h-96 glass-panel rounded-3xl">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full opacity-25"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 font-medium text-slate-500">Acquiring satellite lock...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Live Traffic Map</h3>
          <p className="text-sm text-slate-500">Real-time sensor data & Routing</p>
        </div>
        <button
          onClick={() => setPoints([])}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm"
        >
          <RotateCcw size={16} /> Reset Route
        </button>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white dark:ring-slate-800">
        <MapContainer
          center={position}
          zoom={12}
          style={{
            height: "500px",
            width: "100%",
          }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* User marker */}
          <Marker position={position} icon={userIcon}>
            <Popup className="glass-popup">
              <div className="text-center">
                <p className="font-bold text-indigo-600">You are here</p>
              </div>
            </Popup>
          </Marker>

          {/* Live Traffic Markers */}
          {trafficData.map((sensor, idx) => (
            <Marker
              key={idx}
              position={[sensor.location.lat, sensor.location.lon]}
              // We reuse startIcon but realistically should use custom colored icons
              // For now, let's use the default icon but maybe add a popup with details
              icon={sensor.congestion_level === "High" ? startIcon : (sensor.congestion_level === "Medium" ? endIcon : userIcon)}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <h4 className="font-bold text-gray-800">{sensor.sensor_id}</h4>
                  <div className="text-xs text-gray-500 mt-1">
                    Current Flow: <span className="font-mono font-bold text-indigo-600">{sensor.vehicle_count} veh/h</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Speed: <span className="font-mono font-bold text-indigo-600">{sensor.avg_speed} km/h</span>
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${sensor.congestion_level === "High" ? "bg-red-500" : sensor.congestion_level === "Medium" ? "bg-amber-500" : "bg-emerald-500"}`}>
                    {sensor.congestion_level} Traffic
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Click handler */}
          <MapClickHandler onClick={handleMapClick} />

          {/* Start */}
          {points[0] && (
            <Marker position={points[0]} icon={startIcon}>
              <Popup>
                <div className="text-center font-semibold">🚩 Start Point</div>
              </Popup>
            </Marker>
          )}

          {/* End */}
          {points[1] && (
            <Marker position={points[1]} icon={endIcon}>
              <Popup>
                <div className="text-center font-semibold">🏁 End Point</div>
              </Popup>
            </Marker>
          )}

          {/* Route */}
          <RouteOnRoad points={points} trafficLevel={trafficLevel} />
        </MapContainer>

        {/* Overlay Gradients */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-[400]" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-[400]" />
      </div>

      {/* Legend */}
      <div className="glass-panel p-4 rounded-2xl grid grid-cols-3 gap-2 md:gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Low</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <div>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Medium</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
          <div>
            <p className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">High</p>
          </div>
        </div>
      </div>
    </div>
  );
}
