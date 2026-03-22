export default function StatCard({ icon, label, value, unit, square }) {
  // Determine gradient based on label/icon type usually, but here we use a generic sleek one
  // or cycle through them. For now, let's make them all uniform but sleek OR distinct.
  // Let's use a subtle glass + border style instead of heavy solid backgrounds for a more "pro" look,
  // or a very light gradient.

  return (
    <div
      className={`
        relative overflow-hidden
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        rounded-xl p-6
        flex flex-col items-center justify-center
        transition-all duration-200
        hover:border-indigo-500/50 dark:hover:border-indigo-400/50
        hover:shadow-md
        group
        ${square ? "aspect-square w-full max-w-[200px]" : "w-full"}
      `}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
          <span className="text-2xl">{icon}</span>
        </div>

        <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase mb-1">
          {label}
        </p>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 self-end mb-1">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
