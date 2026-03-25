import { useEffect, useState, useRef } from "react";
import StatCard from "./StatCard";
import TrafficChart from "./TrafficChart";
import PeakHours from "./PeakHours";
import TrafficMap from "./TrafficMap"; // Imported Map
import { Wifi, WifiOff } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPredictions: 0,
    avgVolume: 0,
    maxVolume: 0,
    activeSensors: 5,
  });

  const [liveTraffic, setLiveTraffic] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    // connect to WebSocket
    const connectWs = () => {
      // Use environment variable or default to localhost
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const wsUrl = baseUrl.replace(/^http/, 'ws') + "/ws/traffic";
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("✅ WebSocket Connected");
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "LIVE_TRAFFIC_UPDATE") {
          const newData = message.data;
          setLiveTraffic(newData);
          updateStats(newData);
        }
      };

      ws.current.onclose = () => {
        console.log("❌ WebSocket Disconnected");
        setIsConnected(false);
        // Reconnect after 3s
        setTimeout(connectWs, 3000);
      };
    };

    connectWs();

    // Cleanup
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const updateStats = (data) => {
    if (!data.length) return;

    const avg = Math.round(data.reduce((acc, curr) => acc + curr.vehicle_count, 0) / data.length);
    const max = Math.max(...data.map(d => d.vehicle_count));
    const total = data.reduce((acc, curr) => acc + curr.vehicle_count, 0);

    setStats(prev => ({
      ...prev,
      totalPredictions: prev.totalPredictions + data.length, // Just incrementing for demo
      avgVolume: avg,
      maxVolume: max
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-glow outfit-font">
            TrafficIQ Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Real-time Sensor Data & Analytics
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full glass-panel ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            <div className={`w-2.5 h-2.5 ${isConnected ? 'bg-emerald-500 dot-pulse-green' : 'bg-red-500 dot-pulse-red'}`}></div>
            <span className="text-xs font-bold tracking-wider uppercase outfit-font">{isConnected ? "Live Stream" : "Offline"}</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="📡" label="Active Sensors" value={stats.activeSensors} delay="0.1s" />
        <StatCard icon="📊" label="Live Avg Flow" value={stats.avgVolume} unit="veh/h" delay="0.2s" trendingUp={true} />
        <StatCard icon="⚡" label="Peak Volume" value={stats.maxVolume} unit="veh/h" delay="0.3s" trendingUp={stats.maxVolume > stats.avgVolume * 2} />
        <StatCard icon="🛡️" label="Network Health" value={stats.avgVolume > 200 ? "Congested" : "Optimal"} delay="0.4s" trendingUp={stats.avgVolume <= 200} />
      </div>

      {/* Map Section (Full Width) */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Live Sensor Network</h3>
          <span className="text-xs text-slate-500">Real-time geospatial updates</span>
        </div>
        <TrafficMap trafficData={liveTraffic} />
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real-time Chart */}
        <div className="glass-panel rounded-3xl p-8 hover-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Live Volume Trend</h3>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 ${isConnected ? 'bg-emerald-500 dot-pulse-green' : 'bg-slate-300'}`}></span>
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">{isConnected ? "Live Updating" : "Connecting..."}</span>
            </div>
          </div>
          {/* Pass live traffic to chart */}
          <TrafficChart liveData={liveTraffic} />
        </div>

        {/* Peak Hours Analysis */}
        <div className="glass-panel rounded-3xl p-8 hover-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Historical Peak Hours</h3>
          </div>
          <PeakHours />
        </div>
      </div>
    </div>
  );
}
