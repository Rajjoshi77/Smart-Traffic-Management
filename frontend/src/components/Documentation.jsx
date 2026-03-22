import React from "react";

export default function Documentation() {
  return (
    <div className="prose dark:prose-invert max-w-none p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
      <h1>Documentation</h1>
      <p>
        Welcome to TrafficIQ documentation. For full setup and repository
        details, see the documentation files in the project root (`docs/`).
      </p>
      <h2>Getting Started</h2>
      <ol>
        <li>Install backend Python dependencies: `backend/requirements.txt`.</li>
        <li>Install frontend packages in `frontend/` and run the dev server.</li>
        <li>Start backend with `start_project.ps1` or run Uvicorn.</li>
      </ol>
    </div>
  );
}
