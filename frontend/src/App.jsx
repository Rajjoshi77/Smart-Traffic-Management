import { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import PredictForm from "./components/PredictForm";
import Dashboard from "./components/Dashboard";
import PredictionHistory from "./components/PredictionHistory";
import Analytics from "./components/Analytics";
import TrafficMap from "./components/TrafficMap";
import TrafficChart from "./components/TrafficChart";
import PeakHours from "./components/PeakHours";
import Documentation from "./components/Documentation";
import ApiReference from "./components/ApiReference";
import Support from "./components/Support";

export default function App() {
  const [trafficLevel, setTrafficLevel] = useState("Low Traffic");
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    return localStorage.getItem("darkMode") === "true";
  });
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Apply dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <div className="min-h-screen p-4 md:p-8">
          <Dashboard />
        </div>;
      case "predict":
        return (
          <div className="space-y-8 pb-12 p-4 md:p-8">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-glow outfit-font">Traffic Prediction</h1>
            </div>
            <PredictForm setTrafficLevel={setTrafficLevel} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-panel p-8 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
                <TrafficMap trafficLevel={trafficLevel} />
              </div>
            </div>
          </div>
        );
      case "history":
        return <PredictionHistory />;
      case "analytics":
        return <Analytics />;
      case "documentation":
        return <Documentation />;
      case "support":
        return <Support />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""} transition-colors duration-500`}>
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full">
        {renderPage()}
      </main>

      <footer className="mt-auto border-t border-slate-200/50 dark:border-slate-700/30 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-4">
            {/* About Section */}
            <div className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <span className="font-bold text-sm">IQ</span>
                </div>
                <h3 className="text-2xl font-bold text-glow outfit-font text-slate-900 dark:text-white">TrafficIQ</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                Advanced AI-powered smart traffic management system utilizing real-time IoT simulated metrics and machine learning prediction.
              </p>
            </div>

            {/* Links Section */}
            <div className="animate-fadeInUp flex md:justify-end" style={{ animationDelay: "0.2s" }}>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 outfit-font">Resources</h3>
                <ul className="text-slate-600 dark:text-slate-400 text-sm space-y-3 font-medium">
                  <li><button onClick={() => setCurrentPage("documentation")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Project Architecture</button></li>
                  <li><button onClick={() => setCurrentPage("support")} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Support & Contact</button></li>
                  <li><a href="https://github.com/Rajjoshi77/Smart-Traffic-Management" target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub Repository</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300/50 dark:border-slate-700/50 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-center md:text-left text-slate-600 dark:text-slate-400 text-sm font-medium tracking-wide">
                © {new Date().getFullYear()} TrafficIQ. Designed & Engineered by Raj Joshi.
              </p>
              <div className="flex gap-6">
                <button onClick={() => setCurrentPage("support")} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-semibold">
                  Contact Developer
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
