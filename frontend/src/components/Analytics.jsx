import { useState, useEffect } from "react";

export default function Analytics() {
  const [stats, setStats] = useState({
    predictions: [],
    hourlyDistribution: {},
    weatherStats: {},
    trafficLevelCount: {},
  });

  useEffect(() => {
    analyzeHistory();
  }, []);

  const analyzeHistory = () => {
    const history = JSON.parse(localStorage.getItem("predictionHistory") || "[]");

    const hourly = {};
    const weather = {};
    const levels = { "Low Traffic": 0, "Medium Traffic": 0, "High Traffic": 0 };

    history.forEach((pred) => {
      const hour = pred.hour ?? 0;
      hourly[hour] = (hourly[hour] || 0) + 1;

      const w = pred.weather_main || "Unknown";
      weather[w] = (weather[w] || 0) + 1;

      if (levels[pred.traffic_level] !== undefined) {
        levels[pred.traffic_level]++;
      }
    });

    setStats({
      predictions: history,
      hourlyDistribution: hourly,
      weatherStats: weather,
      trafficLevelCount: levels,
    });
  };

  /* =====================
     REUSABLE COMPONENTS
  ===================== */

  const Card = ({ title, children }) => (
    <div className="card">
      <h3 className="text-lg font-semibold mb-5">{title}</h3>
      {children}
    </div>
  );

  const StatCard = ({ label, value, color }) => (
    <div className={`card border-l-4 ${color}`}>
      <p className="text-sm text-muted mb-1">{label}</p>
      <p className="text-3xl font-extrabold">{value}</p>
    </div>
  );

  const Bar = ({ label, value, max, color }) => {
    const width = Math.round((value / max) * 100);

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted">
          <span>{label}</span>
          <span className="font-medium">{value}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full ${color}`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    );
  };

  const maxHourly = Math.max(...Object.values(stats.hourlyDistribution), 1);
  const maxWeather = Math.max(...Object.values(stats.weatherStats), 1);

  /* =====================
     UI
  ===================== */

  return (
    <section className="space-y-10">
      {/* Header */}
      <header className="space-y-2">
        <h2 className="text-3xl font-bold">Analytics Overview</h2>
        <p className="text-muted max-w-2xl">
          Historical traffic predictions analyzed by time, weather conditions,
          and congestion level.
        </p>
      </header>

      {/* KPIs - Removed, only in Dashboard */}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Predictions by Hour">
          <div className="space-y-4">
            {Object.keys(stats.hourlyDistribution)
              .sort((a, b) => a - b)
              .map((hour) => (
                <Bar
                  key={hour}
                  label={`${hour}:00 – ${hour}:59`}
                  value={stats.hourlyDistribution[hour]}
                  max={maxHourly}
                  color="bg-blue-500"
                />
              ))}
          </div>
        </Card>

        <Card title="Weather Conditions">
          <div className="space-y-4">
            {Object.entries(stats.weatherStats).map(([weather, count]) => (
              <Bar
                key={weather}
                label={weather}
                value={count}
                max={maxWeather}
                color="bg-purple-500"
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Traffic Breakdown */}
      <Card title="Traffic Level Distribution">
        <div className="space-y-5">
          {Object.entries(stats.trafficLevelCount).map(([level, count]) => {
            const total = stats.predictions.length || 1;
            const percentage = Math.round((count / total) * 100);

            const colorMap = {
              "Low Traffic": "bg-green-500",
              "Medium Traffic": "bg-yellow-500",
              "High Traffic": "bg-red-500",
            };

            return (
              <div key={level} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{level}</span>
                  <span className="text-muted">{percentage}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                  <div
                    className={`h-full rounded-full ${colorMap[level]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Insights */}
      <Card title="Insights">
        {stats.predictions.length ? (
          <ul className="space-y-3 text-sm text-muted">
            <li>
              Peak prediction hour:{" "}
              <strong className="text-main">
                {Object.entries(stats.hourlyDistribution).sort((a, b) => b[1] - a[1])[0][0]}:00
              </strong>
            </li>
            <li>
              Most common weather condition:{" "}
              <strong className="text-main">
                {Object.entries(stats.weatherStats).sort((a, b) => b[1] - a[1])[0][0]}
              </strong>
            </li>
            <li>
              Traffic trend indicates{" "}
              <strong className="text-main">
                {stats.trafficLevelCount["High Traffic"] >
                stats.trafficLevelCount["Low Traffic"]
                  ? "increased congestion"
                  : "generally favorable conditions"}
              </strong>
            </li>
          </ul>
        ) : (
          <p className="text-muted">
            No analytics available yet. Start making predictions to populate
            this dashboard.
          </p>
        )}
      </Card>
    </section>
  );
}
