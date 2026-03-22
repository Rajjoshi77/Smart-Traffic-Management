import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchPeakHours } from "../services/api";
import { RefreshCw } from "lucide-react";

// Modified to accept liveData prop
export default function TrafficChart({ liveData = [] }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  // Live Data Update (WebSocket)
  useEffect(() => {
    if (liveData && liveData.length > 0) {
      // Take the most recent data point (assuming liveData is sorted or we take first)
      const latest = liveData[0]; // liveData from Dashboard is 5 latest, [0]. 

      // Add to our chart data
      setData(prev => {
        const newPoint = {
          hour: new Date().getHours(), // Use current time
          traffic: latest.vehicle_count,
          label: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        // Keep last 15 points for visual clarity
        const updated = [...prev, newPoint];
        return updated.slice(-15);
      });
      setLastUpdated(new Date());
    }
  }, [liveData]);

  const loadData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetchPeakHours();

      const sorted = res.sort((a, b) => a.hour - b.hour);

      const formatted = sorted.map((item) => ({
        hour: item.hour,
        traffic: Math.round(item.avg_volume),
        label: formatHour(item.hour),
      }));

      // Initialize with historical/peak data if live data is empty
      if (data.length === 0) {
        setData(formatted);
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      if (!data.length) setError("Failed to load traffic data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(true);
  };

  if (loading && !data.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !data.length) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
        <p className="text-red-600 dark:text-red-300 text-sm font-medium">⚠️ {error}</p>
        <button
          onClick={() => loadData()}
          className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Traffic Volume Trend</h3>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              dy={10}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="traffic"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTraffic)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Helper
function formatHour(hour) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}
