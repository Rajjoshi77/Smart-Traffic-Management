import React from "react";
import { Github, Linkedin, Mail, MessageSquare, Bug, Lightbulb } from "lucide-react";

export default function Support() {
  return (
    <div className="space-y-12 pb-16 animate-fadeInUp">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-glow outfit-font text-slate-900 dark:text-white">
          Support & Contact
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Have questions, found a bug, or want to connect? Here's how you can reach out.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 max-w-5xl mx-auto">
        
        {/* Contact Links */}
        <div className="glass-panel p-8 md:p-10 space-y-8 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full mb-2 border border-indigo-200 dark:border-indigo-800 shadow-inner">
            <MessageSquare size={36} />
          </div>
          <h2 className="text-2xl font-bold outfit-font text-slate-900 dark:text-white">Let's Connect</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            I'm always open to discussing new opportunities, collaborations, or answering questions regarding this project's architecture.
          </p>
          
          <div className="flex flex-col gap-4 w-full mt-6">
            <a href="https://github.com/Rajjoshi77" target="_blank" rel="noreferrer" className="flex items-center gap-4 w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-black dark:hover:border-white transition-all group shadow-sm hover:shadow-md">
              <Github className="text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors" />
              <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors">GitHub Profile</span>
            </a>
            <a href="https://linkedin.com/in/" target="_blank" rel="noreferrer" className="flex items-center gap-4 w-full p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all group shadow-sm hover:shadow-md">
              <Linkedin className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
              <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">LinkedIn Profile</span>
            </a>
            <a href="mailto:contact@example.com" className="flex items-center gap-4 w-full p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all group shadow-sm hover:shadow-md">
              <Mail className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">Send an Email</span>
            </a>
          </div>
        </div>

        {/* FAQ / Issue Tracking */}
        <div className="space-y-6 flex flex-col">
          <div className="glass-panel p-8 flex flex-col justify-center flex-1 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-4 outfit-font text-slate-900 dark:text-white">
              <Bug className="text-rose-500" />
              Report a Bug
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              If you discover an issue with the AI predictions, live websocket streams, or UI responsiveness, please open an issue on the repository. Steps to reproduce are highly appreciated!
            </p>
            <a href="https://github.com/Rajjoshi77/Smart-Traffic-Management/issues" target="_blank" rel="noreferrer" className="w-full text-center py-3.5 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all shadow-md hover:shadow-lg">
              Open GitHub Issue
            </a>
          </div>

          <div className="glass-panel p-8 flex flex-col justify-center flex-1 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-4 outfit-font text-slate-900 dark:text-white">
              <Lightbulb className="text-amber-500" />
              Feature Requests
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Have an idea for extending the IoT simulator or improving the Machine Learning model? Feel free to fork the repository and submit a Pull Request.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
