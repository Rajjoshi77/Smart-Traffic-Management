import { useState, useEffect } from "react";

export default function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [filterLevel, setFilterLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, sortBy, filterLevel, searchTerm]);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem("predictionHistory");
      const data = saved ? JSON.parse(saved) : [];
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Filter by traffic level
    if (filterLevel !== "all") {
      filtered = filtered.filter((item) => 
        item.traffic_level?.toLowerCase() === filterLevel.toLowerCase()
      );
    }

    // Search by weather
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.weather_main?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === "volume") {
      filtered.sort((a, b) => (b.traffic_volume || 0) - (a.traffic_volume || 0));
    } else if (sortBy === "temp") {
      filtered.sort((a, b) => (b.temp || 0) - (a.temp || 0));
    }

    setFilteredHistory(filtered);
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all prediction history?")) {
      localStorage.removeItem("predictionHistory");
      setHistory([]);
    }
  };

  const deleteItem = (index) => {
    const updated = history.filter((_, i) => i !== index);
    localStorage.setItem("predictionHistory", JSON.stringify(updated));
    setHistory(updated);
  };

  const getTrafficBadge = (level) => {
    const badges = {
      "Low Traffic": "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      "Medium Traffic": "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      "High Traffic": "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };
    return badges[level] || "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Prediction History</h2>
      </div>

      {/* Controls */}
      <div className="glass rounded-2xl p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Search by Weather
            </label>
            <input
              type="text"
              placeholder="e.g., Clear, Rain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Filter by Traffic Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Traffic Level
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Levels</option>
              <option value="low traffic">Low Traffic</option>
              <option value="medium traffic">Medium Traffic</option>
              <option value="high traffic">High Traffic</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-full"
            >
              <option value="date">Latest First</option>
              <option value="volume">Traffic Volume</option>
              <option value="temp">Temperature</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <button
              onClick={clearHistory}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              🗑️ Clear History
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length > 0 ? (
        <div className="glass rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">Date & Time</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Traffic Level</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Volume</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Weather</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Temp (K)</th>
                  <th className="px-6 py-4 text-left text-white font-semibold">Hour</th>
                  <th className="px-6 py-4 text-center text-white font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredHistory.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full font-semibold text-xs ${getTrafficBadge(item.traffic_level)}`}>
                        {item.traffic_level || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {item.traffic_volume || "N/A"} veh/h
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                      {item.weather_main || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                      {item.temp || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                      {item.hour || "N/A"}:00
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => deleteItem(history.indexOf(item))}
                        className="text-red-600 hover:text-red-800 dark:hover:text-red-400 font-semibold"
                        title="Delete this prediction"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center shadow-lg">
          <div className="text-5xl mb-4">📜</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Predictions Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start making predictions to see your history here!
          </p>
        </div>
      )}

      {/* Stats Summary removed, only in Dashboard */}
    </div>
  );
}
