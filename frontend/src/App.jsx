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
        return <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-8">
          <Dashboard />
        </div>;
      case "predict":
        return (
          <div className="space-y-8 pb-12">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Traffic Prediction</h1>
            </div>
            <PredictForm setTrafficLevel={setTrafficLevel} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass rounded-2xl p-8 shadow-lg animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
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
      case "api":
        return <ApiReference />;
      case "support":
        return <Support />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 transition-colors`}>
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full">
        {renderPage()}
      </main>

      <footer className="mt-auto bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* About Section */}
            <div className="animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">TrafficIQ</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                AI-powered traffic analysis and prediction system for intelligent urban mobility.
              </p>
            </div>

            {/* Links Section */}
            <div className="animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Resources</h3>
              <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
                <li><button onClick={() => setCurrentPage("documentation")} className="hover:text-gray-900 dark:hover:text-white transition-colors">Documentation</button></li>
                <li><button onClick={() => setCurrentPage("api")} className="hover:text-gray-900 dark:hover:text-white transition-colors">API Reference</button></li>
                <li><button onClick={() => setCurrentPage("support")} className="hover:text-gray-900 dark:hover:text-white transition-colors">Support</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-center md:text-left text-gray-600 dark:text-gray-400 text-sm">
                © 2026 TrafficIQ. AI Powered traffic analysis and Prediction By Raj Joshi
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
                  Privacy
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
                  Terms
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
