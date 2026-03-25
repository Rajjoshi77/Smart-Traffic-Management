export default function StatCard({ icon, label, value, unit, square, delay = "0s", trendingUp = null }) {
  return (
    <div
      className={`glass-panel p-6 flex flex-col justify-center relative overflow-hidden group animate-fadeInUp ${
        square ? "aspect-square w-full max-w-[200px]" : "w-full"
      }`}
      style={{ animationDelay: delay }}
    >
      {/* Decorative gradient orb behind the icon */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start text-left w-full h-full justify-between">
        
        <div className="flex justify-between w-full items-start mb-4">
          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-indigo-600 dark:text-indigo-400 shadow-inner border border-white/20 dark:border-white/5 group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl">{icon}</span>
          </div>
          {trendingUp !== null && (
            <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${trendingUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
              {trendingUp ? '▲ +12%' : '▼ -4%'}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1 font-['Outfit']">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-black dark:text-white tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 ml-1">
                {unit}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
