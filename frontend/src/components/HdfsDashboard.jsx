import { useState, useEffect } from "react";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

const API = "http://localhost:8000/api/hdfs";

// ─── colour helpers ──────────────────────────────────────────────────────────
const HOUR_COLOR  = (val, max) => {
  const pct = val / max;
  if (pct > 0.85) return "#ef4444";
  if (pct > 0.65) return "#f97316";
  if (pct > 0.40) return "#eab308";
  return "#22c55e";
};

const WEATHER_COLORS = {
  Clear:"#22c55e", Rainy:"#3b82f6", Cloudy:"#94a3b8",
  Foggy:"#a78bfa", Snowy:"#67e8f9",
};

// ─── tiny reusable components ────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = "indigo" }) {
  const colors = {
    indigo: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-400 to-teal-600",
    orange:  "from-orange-400 to-red-500",
    sky:     "from-sky-400 to-blue-600",
    rose:    "from-rose-400 to-pink-600",
  };
  return (
    <div className="glass-panel p-6 animate-fadeInUp hover-card">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[accent]} flex items-center justify-center text-white text-2xl mb-4 shadow-lg`}>
        {icon}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-extrabold outfit-font text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children, badge }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-2xl font-bold outfit-font text-slate-900 dark:text-white">{children}</h2>
      {badge && (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
          {badge}
        </span>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse">
        Loading 1B-row analytics…
      </p>
    </div>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div className="glass-panel border border-red-300/50 dark:border-red-700/40 bg-red-50/60 dark:bg-red-900/20 p-6 rounded-2xl text-center">
      <p className="text-red-500 dark:text-red-400 font-semibold text-lg mb-1">⚠️ API Unavailable</p>
      <p className="text-red-400 text-sm">{msg}</p>
      <p className="text-slate-500 dark:text-slate-400 text-xs mt-3">
        Make sure the FastAPI backend is running on <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">localhost:8000</code>
      </p>
    </div>
  );
}

// ─── custom chart tooltip ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-4 py-3 text-xs shadow-xl border border-indigo-200/30 dark:border-indigo-700/30">
      <p className="font-bold text-slate-800 dark:text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function HdfsDashboard() {
  const [summary,   setSummary]   = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [hourlyTrend, setHourlyTrend] = useState([]);
  const [weather,   setWeather]   = useState([]);
  const [weekend,   setWeekend]   = useState({ weekday: [], weekend: [] });
  const [sensors,   setSensors]   = useState([]);
  const [stats,     setStats]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [sumR, pkR, htR, wR, wkR, snR, stR] = await Promise.all([
          fetch(`${API}/summary`),
          fetch(`${API}/peak-hours`),
          fetch(`${API}/hourly-trend`),
          fetch(`${API}/weather-impact`),
          fetch(`${API}/weekend`),
          fetch(`${API}/top-sensors`),
          fetch(`${API}/statistics`),
        ]);

        if (!sumR.ok) throw new Error(`Backend returned ${sumR.status}`);

        const [sumD, pkD, htD, wD, wkD, snD, stD] = await Promise.all([
          sumR.json(), pkR.json(), htR.json(),
          wR.json(), wkR.json(), snR.json(), stR.json(),
        ]);

        setSummary(sumD);
        // Sort peak hours by hour number for chronological display
        const sorted = [...(pkD.data || [])].sort((a, b) => a.hour - b.hour);
        setPeakHours(sorted);
        setHourlyTrend(htD.data || []);
        setWeather(wD.data || []);
        setWeekend(wkD);
        setSensors(snD.data || []);
        setStats(stD.data || []);
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tabs = [
    { id: "overview",  label: "Overview",       icon: "📊" },
    { id: "traffic",   label: "Traffic Trends",  icon: "🚦" },
    { id: "weather",   label: "Weather Impact",  icon: "🌤️" },
    { id: "sensors",   label: "Top Sensors",     icon: "📡" },
    { id: "weekend",   label: "Weekend vs Day",  icon: "📅" },
  ];

  const maxPeakVolume = Math.max(...peakHours.map(d => d.avg_volume || 0), 1);

  return (
    <div className="space-y-8 pb-16">
      {/* ── HEADER ── */}
      <div className="animate-fadeInUp">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white shadow-lg text-lg">
            🏙️
          </div>
          <div>
            <h1 className="text-4xl font-extrabold outfit-font text-glow bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
              Big Data Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Distributed HDFS · Apache Spark · 1 Billion Rows · 20 GB Dataset
            </p>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && error && <ErrorBanner msg={error} />}

      {!loading && !error && (
        <>
          {/* ── SUMMARY CARDS ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon="🔢" label="Total Records" accent="indigo"
              value={summary?.total_records_formatted || "—"}
              sub="1 billion rows processed" />
            <StatCard icon="💾" label="Dataset Size" accent="sky"
              value={`${summary?.dataset_size_gb ?? "—"} GB`}
              sub="Stored in HDFS as Parquet" />
            <StatCard icon="🚗" label="Avg Traffic Volume" accent="emerald"
              value={summary?.avg_traffic_volume?.toLocaleString() ?? "—"}
              sub="vehicles per reading" />
            <StatCard icon="⚡" label="Avg Speed" accent="orange"
              value={`${summary?.avg_speed_kmh ?? "—"} km/h`}
              sub="across all sensors" />
            <StatCard icon="⏰" label="Busiest Hour" accent="rose"
              value={summary?.busiest_hour != null ? `${summary.busiest_hour}:00` : "—"}
              sub={`~${summary?.busiest_hour_avg_volume?.toLocaleString() ?? "—"} vol`} />
          </div>

          {/* ── TABS ── */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
                  ${activeTab === t.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 scale-105"
                    : "glass-panel text-slate-600 dark:text-slate-300 hover:scale-105"}`}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>

          {/* ─────── OVERVIEW TAB ─────── */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fadeInUp">
              {/* Traffic volume by hour - full bar chart */}
              <div className="glass-panel p-6">
                <SectionTitle badge="24h">Hourly Traffic Volume</SectionTitle>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Average vehicle count per hour — colour coded by congestion intensity
                </p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={peakHours} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="hour" tickFormatter={h => `${h}:00`}
                      tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avg_volume" name="Avg Volume" radius={[4, 4, 0, 0]}>
                      {peakHours.map((d, i) => (
                        <Cell key={i} fill={HOUR_COLOR(d.avg_volume, maxPeakVolume)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-6 mt-4 justify-center text-xs font-medium">
                  {[["#22c55e","Low"], ["#eab308","Moderate"], ["#f97316","High"], ["#ef4444","Peak"]].map(([c, l]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: c }} />{l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics cards */}
              <div className="glass-panel p-6">
                <SectionTitle badge="1B rows">Statistical Summary</SectionTitle>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/50 dark:border-slate-700/30">
                        {["Metric", "Count", "Mean", "Std Dev", "Min", "Max"].map(h => (
                          <th key={h} className="text-left py-3 px-3 text-slate-500 dark:text-slate-400 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100/40 dark:border-slate-700/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                          <td className="py-3 px-3 font-bold outfit-font text-slate-800 dark:text-slate-100 capitalize">{row.summary}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{Number(row.traffic_volume)?.toLocaleString()}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{Number(row.average_speed)?.toFixed(2)}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{Number(row.adjusted_traffic)?.toLocaleString()}</td>
                          <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">{Number(row.weather_impact)?.toFixed(2)}</td>
                          <td className="py-3 px-3 text-red-500 dark:text-red-400 font-semibold">{row.summary === "max" ? "↑ Peak" : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────── TRAFFIC TRENDS TAB ─────── */}
          {activeTab === "traffic" && (
            <div className="space-y-8 animate-fadeInUp">
              <div className="glass-panel p-6">
                <SectionTitle badge="24h">Speed & Congestion by Hour</SectionTitle>
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={hourlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="congGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="hour" tickFormatter={h => `${h}:00`}
                      tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis yAxisId="left"  tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    <Area yAxisId="left"  type="monotone" dataKey="avg_speed"
                      name="Avg Speed (km/h)" stroke="#6366f1" fill="url(#speedGrad)" strokeWidth={2.5} />
                    <Area yAxisId="right" type="monotone" dataKey="congestion_percentage"
                      name="Congestion %" stroke="#ef4444" fill="url(#congGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-panel p-6">
                <SectionTitle badge="trend">Avg Traffic Volume Over 24 Hours</SectionTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={hourlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="hour" tickFormatter={h => `${h}:00`}
                      tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="avg_volume" name="Avg Volume"
                      stroke="#22c55e" strokeWidth={3} dot={false}
                      activeDot={{ r: 6, fill: "#22c55e" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ─────── WEATHER TAB ─────── */}
          {activeTab === "weather" && (
            <div className="space-y-8 animate-fadeInUp">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pie chart */}
                <div className="glass-panel p-6">
                  <SectionTitle>Traffic Mix by Weather</SectionTitle>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={weather} dataKey="avg_volume" nameKey="weather_condition"
                        cx="50%" cy="50%" outerRadius={100} padAngle={4}
                        label={({ weather_condition, percent }) =>
                          `${weather_condition} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {weather.map((d, i) => (
                          <Cell key={i} fill={WEATHER_COLORS[d.weather_condition] || "#6366f1"} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar chart */}
                <div className="glass-panel p-6">
                  <SectionTitle>Avg Volume per Condition</SectionTitle>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={weather} layout="vertical"
                      margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="weather_condition"
                        tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avg_volume" name="Avg Volume" radius={[0, 6, 6, 0]}>
                        {weather.map((d, i) => (
                          <Cell key={i} fill={WEATHER_COLORS[d.weather_condition] || "#6366f1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weather detail table */}
              <div className="glass-panel p-6">
                <SectionTitle>Detailed Weather Impact</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weather.map((w, i) => (
                    <div key={i} className="rounded-2xl p-5 border border-slate-200/40 dark:border-slate-700/30 bg-white/30 dark:bg-slate-800/30 hover:scale-105 transition-transform">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow"
                          style={{ background: WEATHER_COLORS[w.weather_condition] + "33" }}>
                          { {Clear:"☀️",Rainy:"🌧️",Cloudy:"☁️",Foggy:"🌫️",Snowy:"❄️"}[w.weather_condition] || "🌥️" }
                        </div>
                        <span className="font-bold outfit-font text-slate-800 dark:text-white">{w.weather_condition}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Avg Volume</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{w.avg_volume?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Avg Speed</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{w.avg_speed?.toFixed(1)} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Impact Multiplier</span>
                          <span className="font-bold" style={{ color: WEATHER_COLORS[w.weather_condition] }}>
                            ×{w.avg_weather_multiplier?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Adjusted Volume</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{w.adjusted_volume?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────── SENSORS TAB ─────── */}
          {activeTab === "sensors" && (
            <div className="space-y-8 animate-fadeInUp">
              <div className="glass-panel p-6">
                <SectionTitle badge="Top 20">Most Congested Sensors</SectionTitle>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={sensors.slice(0, 10)}
                    margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="sensor_id" angle={-35} textAnchor="end"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      label={{ value: "Sensor ID", position: "insideBottom", offset: -30, fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`}
                      tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avg_volume" name="Avg Volume" radius={[6, 6, 0, 0]}>
                      {sensors.slice(0, 10).map((_, i) => (
                        <Cell key={i} fill={`hsl(${240 + i * 8}, 85%, ${60 - i * 2}%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-panel p-6">
                <SectionTitle>Sensor Details</SectionTitle>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/50 dark:border-slate-700/30">
                        {["Rank", "Sensor ID", "Location ID", "Avg Volume", "Max Volume", "Avg Speed", "Readings"].map(h => (
                          <th key={h} className="text-left py-3 px-3 text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sensors.map((s, i) => (
                        <tr key={i} className="border-b border-slate-100/40 dark:border-slate-700/20 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                          <td className="py-3 px-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white
                              ${i===0?"bg-yellow-500":i===1?"bg-slate-400":i===2?"bg-orange-600":"bg-indigo-500"}`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.sensor_id}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{s.location_id}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800 dark:text-white">{s.avg_volume?.toLocaleString()}</td>
                          <td className="py-3 px-3 text-red-500 font-semibold">{s.max_volume?.toLocaleString()}</td>
                          <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">{s.avg_speed?.toFixed(1)} km/h</td>
                          <td className="py-3 px-3 text-slate-500">{s.measurements?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────── WEEKEND TAB ─────── */}
          {activeTab === "weekend" && (
            <div className="space-y-8 animate-fadeInUp">
              <div className="glass-panel p-6">
                <SectionTitle badge="48 data points">Weekday vs Weekend Traffic</SectionTitle>
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="hour" type="number" domain={[0, 23]}
                      tickFormatter={h => `${h}:00`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line data={weekend.weekday} type="monotone" dataKey="avg_volume"
                      name="Weekday Volume" stroke="#6366f1" strokeWidth={3} dot={false}
                      activeDot={{ r: 5 }} />
                    <Line data={weekend.weekend} type="monotone" dataKey="avg_volume"
                      name="Weekend Volume" stroke="#f97316" strokeWidth={3} dot={false}
                      activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-panel p-6">
                <SectionTitle>Avg Speed: Weekday vs Weekend</SectionTitle>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="wkdGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="wkendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f97316" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="hour" type="number" domain={[0, 23]}
                      tickFormatter={h => `${h}:00`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area data={weekend.weekday} type="monotone" dataKey="avg_speed"
                      name="Weekday Speed" stroke="#6366f1" fill="url(#wkdGrad)" strokeWidth={2.5} />
                    <Area data={weekend.weekend} type="monotone" dataKey="avg_speed"
                      name="Weekend Speed" stroke="#f97316" fill="url(#wkendGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Summary comparison cards */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Weekday", data: weekend.weekday, color: "#6366f1", icon: "💼" },
                  { label: "Weekend", data: weekend.weekend, color: "#f97316", icon: "🏖️" },
                ].map(({ label, data, color, icon }) => {
                  const avgVol = data?.length
                    ? (data.reduce((s, d) => s + (d.avg_volume || 0), 0) / data.length).toFixed(0)
                    : "—";
                  const avgSpd = data?.length
                    ? (data.reduce((s, d) => s + (d.avg_speed || 0), 0) / data.length).toFixed(1)
                    : "—";
                  return (
                    <div key={label} className="glass-panel p-6 hover-card">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{icon}</span>
                        <h3 className="text-xl font-bold outfit-font" style={{ color }}>{label}</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-sm">Avg Volume</span>
                          <span className="text-2xl font-extrabold outfit-font text-slate-800 dark:text-white">
                            {Number(avgVol).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-sm">Avg Speed</span>
                          <span className="text-lg font-bold text-emerald-500">{avgSpd} km/h</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── FOOTER BADGE ── */}
          <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-3 animate-fadeInUp">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Data generated:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {summary?.generated_at?.slice(0, 10) || "—"}
              </span>
            </div>
            <div className="flex gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">Apache Spark 3.5</span>
              <span className="px-2 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">HDFS 3.4</span>
              <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">Parquet + Snappy</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
