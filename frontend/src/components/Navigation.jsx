import { useState } from "react";
import {
  Menu,
  X,
  Sun,
  Moon,
  LayoutDashboard,
  BarChart,
  History,
  Activity,
  BookOpen,
  Code2,
  LifeBuoy,
} from "lucide-react";

export default function Navigation({
  currentPage,
  setCurrentPage,
  darkMode,
  toggleDarkMode,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "predict", label: "Predict", icon: Activity },
    { id: "history", label: "History", icon: History },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "documentation", label: "Docs", icon: BookOpen },
    { id: "api", label: "API", icon: Code2 },
    { id: "support", label: "Support", icon: LifeBuoy },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 nav-glass transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <div
              onClick={() => setCurrentPage("dashboard")}
              className="group flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Activity size={20} className="relative z-10" />
                <div className="absolute inset-0 rounded-xl bg-white opacity-20 group-hover:opacity-30 transition-opacity" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
                TrafficIQ
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = currentPage === id;
                return (
                  <button
                    key={id}
                    onClick={() => setCurrentPage(id)}
                    className={`
                      relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }
                    `}
                  >
                    {/* Icon - removed animate-pulse */}
                    <Icon size={18} />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">

              {/* Dark Mode Button */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <Sun size={20} className="text-amber-400" />
                ) : (
                  <Moon size={20} className="text-indigo-600" />
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <nav
            className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shadow-xl animate-in slide-in-from-top-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentPage(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl gap-2 text-sm font-semibold transition-all
                    ${currentPage === id
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800"
                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <Icon size={24} />
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}
