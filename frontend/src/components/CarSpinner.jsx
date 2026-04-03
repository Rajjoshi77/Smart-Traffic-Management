import { Car } from "lucide-react";

export default function CarSpinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-12 flex items-center justify-center overflow-hidden">
        {/* Car Icon with Bounce Animation */}
        <div className="z-10 animate-bounce transition-all transform mt-2">
          <Car 
            size={36} 
            className="text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-900/50" 
            strokeWidth={1.5} 
          />
        </div>
        
        {/* Moving Road Lines to simulate movement */}
        <div className="absolute bottom-0 left-0 w-full flex items-center gap-1.5 animate-road-move opacity-60">
          <div className="h-[2px] w-4 bg-slate-400 dark:bg-slate-500 rounded"></div>
          <div className="h-[2px] w-8 bg-slate-400 dark:bg-slate-500 rounded"></div>
          <div className="h-[2px] w-3 bg-slate-400 dark:bg-slate-500 rounded"></div>
          <div className="h-[2px] w-6 bg-slate-400 dark:bg-slate-500 rounded"></div>
          <div className="h-[2px] w-10 bg-slate-400 dark:bg-slate-500 rounded"></div>
          <div className="h-[2px] w-5 bg-slate-400 dark:bg-slate-500 rounded"></div>
          <div className="h-[2px] w-8 bg-slate-400 dark:bg-slate-500 rounded"></div>
        </div>
      </div>
      
      <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
        {text}
      </p>

      <style>{`
        @keyframes road-move {
          0% { transform: translateX(0); }
          100% { transform: translateX(-30px); }
        }
        .animate-road-move {
          animation: road-move 0.4s linear infinite;
        }
      `}</style>
    </div>
  );
}
