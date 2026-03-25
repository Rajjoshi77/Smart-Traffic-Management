import React from "react";
import { Server, Database, Brain, Zap, Layers, ShieldCheck, Globe, Code2 } from "lucide-react";

export default function Documentation() {
  const architectures = [
    {
      icon: <Layers size={24} className="text-indigo-500" />,
      title: "Frontend Stack",
      desc: "Built with React and Vite for lightning-fast performance. Features a custom Glassmorphism UI using Tailwind CSS v4, Recharts for analytics, and Leaflet for geospatial routing."
    },
    {
      icon: <Server size={24} className="text-emerald-500" />,
      title: "Backend API",
      desc: "Powered by Python and FastAPI. Designed for high availability and async processing. Handles machine learning inference and exposes RESTful endpoints for the client."
    },
    {
      icon: <Zap size={24} className="text-amber-500" />,
      title: "Live Data Streaming",
      desc: "A custom high-throughput event producer simulates IoT traffic sensors across the city. Data is pushed to the client locally via seamless WebSockets for true real-time dashboard updates."
    },
    {
      icon: <Brain size={24} className="text-pink-500" />,
      title: "AI Prediction Engine",
      desc: "Utilizes a trained RandomForestRegressor model. It predicts traffic congestion levels based on multiple complex variables: Hour of day, live weather APIs, geolocation, and historical capacity."
    },
    {
      icon: <Database size={24} className="text-sky-500" />,
      title: "Cloud Database",
      desc: "MongoDB Atlas cluster stores all IoT sensor metrics, user prediction history, and configuration states to ensure persistent network resilience."
    },
    {
      icon: <Globe size={24} className="text-violet-500" />,
      title: "Cloud Deployment",
      desc: "Containerized with Docker and continuously deployed on Render cloud infrastructure."
    }
  ];

  return (
    <div className="space-y-12 pb-16 animate-fadeInUp">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-glow outfit-font">
          Project Architecture
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          TrafficIQ is an advanced, AI-powered Smart Traffic Management system designed to ingest, process, and predict city-wide mobility patterns in real-time.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {architectures.map((item, idx) => (
          <div key={idx} className="glass-panel p-8 flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 shadow-inner border border-slate-200 dark:border-slate-700">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 outfit-font">{item.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Core Systems Overview */}
      <div className="glass-panel p-8 md:p-12">
        <div className="flex items-center gap-4 mb-6">
          <ShieldCheck size={32} className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold outfit-font text-slate-900 dark:text-white">Core System Workflow</h2>
        </div>
        
        <div className="space-y-6 text-slate-700 dark:text-slate-300">
          <p>
            The fundamental goal of <strong>Smart Traffic Management</strong> is to transition from reactive monitoring to proactive optimization. This project achieves this by linking a mock network of IoT sensors directly to an iterative Machine Learning model.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/20 border border-slate-200 dark:border-white/10">
              <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-900 dark:text-white"><Code2 size={18} /> Processing Pipeline</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Sensor data is aggregated per minute.</li>
                <li>FastAPI lifespan events maintain persistent background publisher threads.</li>
                <li>Live metrics are broadcasted to all connected web clients concurrently.</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/20 border border-slate-200 dark:border-white/10">
              <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-900 dark:text-white"><Brain size={18} /> Intelligence Layer</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Historical traffic CSVs were used to train a scikit-learn regressor.</li>
                <li>The model pipeline handles encoding for categorical weather strings.</li>
                <li>Confidence scores are generated for long-term route planning.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
