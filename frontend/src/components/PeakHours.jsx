import { useEffect, useState } from "react";
import { fetchPeakHours } from "../services/api";

import { RefreshCw } from "lucide-react";

export default function PeakHours() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadPeakHours();
  }, []);

  const loadPeakHours = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetchPeakHours();
      setHours(res);
      setError(null);
    } catch (err) {
      setError("Failed to load peak hours data");
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPeakHours(true);
  };

  if (loading && !hours.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !hours.length) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
        <p className="text-red-600 dark:text-red-300 text-sm font-medium">⚠️ {error}</p>
        <button
          onClick={() => loadPeakHours()}
          className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Peak Congestion</h3>
          <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-100 dark:border-indigo-800">
            Top {hours.length}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          title="Refresh Data"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="space-y-4">
        {hours.map((h, i) => {
          const maxVolume = Math.max(...hours.map(item => item.avg_volume));
          const percentage = (h.avg_volume / maxVolume) * 100;

          return (
            <div key={i} className="group relative">
              <div className="flex justify-between items-end mb-1 relative z-10">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 font-bold">{i + 1}</span>
                  {formatHour(h.hour)}
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(h.avg_volume)} <span className="text-xs font-normal text-slate-400">veh/h</span>
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)] relative overflow-hidden"
                  style={{ width: `${percentage}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shimmer" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        .group:hover .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

function formatHour(hour) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}
