import { useState, useEffect } from "react";
import { predictTraffic } from "../services/api";
import { Calendar, Clock, CloudRain, MapPin, Navigation } from "lucide-react";

export default function PredictForm({ setTrafficLevel }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ lat: 12.9716, lon: 77.5946 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => { },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const saveToHistory = (payload, response) => {
    try {
      const history = JSON.parse(localStorage.getItem("predictionHistory") || "[]");
      const newEntry = {
        ...payload,
        traffic_level: response.traffic_level,
        traffic_volume: response.traffic_volume,
        weather_main: response.weather_main || response.weather || "N/A",
        temp: response.temp || response.temperature || "N/A",
        timestamp: new Date().toISOString(),
      };
      history.unshift(newEntry);
      localStorage.setItem("predictionHistory", JSON.stringify(history));
    } catch (err) {
      console.error("Error saving to history:", err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        date: e.target.date.value,
        hour: Number(e.target.hour.value),
        holiday: "None",
        rain_1h: 0,
        snow_1h: 0,
        clouds_all: 0,
        lat: coords.lat,
        lon: coords.lon,
      };
      const res = await predictTraffic(payload);
      setResult(res.data);
      setTrafficLevel(res.data.traffic_level);
      saveToHistory(payload, res.data);
    } catch (err) {
      setError("Failed to predict traffic. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTrafficColor = (level) => {
    switch (level) {
      case "Low Traffic":
        return "text-emerald-500 dark:text-emerald-400";
      case "Medium Traffic":
        return "text-amber-500 dark:text-amber-400";
      case "High Traffic":
        return "text-rose-500 dark:text-rose-400";
      default:
        return "text-slate-500 dark:text-slate-400";
    }
  };

  const getTrafficBg = (level) => {
    switch (level) {
      case "Low Traffic":
        return "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800";
      case "Medium Traffic":
        return "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800";
      case "High Traffic":
        return "from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border-rose-200 dark:border-rose-800";
      default:
        return "from-slate-50 to-gray-50 dark:from-slate-800/30 dark:to-gray-800/30 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">

      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      <div className="relative z-10 flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
          <Navigation size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Predict Traffic</h2>
          <p className="text-slate-500 dark:text-slate-400">Enter details to get AI-powered forecast</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <Calendar size={16} /> Date
            </label>
            <input name="date" type="date" min={new Date().toISOString().split("T")[0]} required className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <Clock size={16} /> Hour (0-23)
            </label>
            <input name="hour" type="number" min="0" max="23" placeholder="e.g. 14" required className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white" />
          </div>
        </div>

        {/* Weather & Location Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <MapPin size={18} />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Current Location</p>
              <p className="text-slate-500">{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
              <CloudRain size={18} />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Live Weather</p>
              <p className="text-slate-500">Auto-fetched daily</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gradient w-full flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Run Prediction <Navigation size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600">⚠️</div>
          <p className="text-red-800 dark:text-red-200 font-medium text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className={`mt-10 p-8 rounded-3xl border bg-gradient-to-br ${getTrafficBg(result.traffic_level)} relative overflow-hidden animate-in zoom-in-95 duration-500`}>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Forecast Result</p>
                <div className={`text-4xl md:text-5xl font-extrabold ${getTrafficColor(result.traffic_level)}`}>
                  {result.traffic_level}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Volume</p>
                <div className="text-3xl font-bold">
                  {result.traffic_volume} <span className="text-lg font-medium opacity-60">veh/h</span>
                </div>
              </div>
            </div>

            {/* Weather Features Used */}
            <div className="pt-6 border-t border-black/5 dark:border-white/5">
              <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-4">Conditions Analyzed</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 text-center">
                  <div className="text-xs opacity-70">Weather</div>
                  <div className="font-bold text-sm truncate">{result.weather_main ?? 'N/A'}</div>
                </div>
                <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 text-center">
                  <div className="text-xs opacity-70">Temp</div>
                  <div className="font-bold text-sm">{typeof result.temp === 'number' ? (result.temp - 273.15).toFixed(1) + '°C' : 'N/A'}</div>
                </div>
                <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 text-center">
                  <div className="text-xs opacity-70">Rain</div>
                  <div className="font-bold text-sm">{result.rain_1h ?? 0}mm</div>
                </div>
                <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 text-center">
                  <div className="text-xs opacity-70">Snow</div>
                  <div className="font-bold text-sm">{result.snow_1h ?? 0}mm</div>
                </div>
                <div className="bg-white/40 dark:bg-black/20 rounded-xl p-3 text-center">
                  <div className="text-xs opacity-70">Clouds</div>
                  <div className="font-bold text-sm">{result.clouds_all ?? 0}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
