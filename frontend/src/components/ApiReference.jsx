import React from "react";

export default function ApiReference() {
  return (
    <div className="prose dark:prose-invert max-w-none p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md">
      <h1>API Reference</h1>
      <p>
        The backend provides REST endpoints for health checks, prediction
        requests, and retrieving historical predictions. When running locally,
        the base URL is <strong>http://localhost:8000</strong>.
      </p>
      <h2>Common Endpoints</h2>
      <ul>
        <li><strong>GET /health</strong> - health check</li>
        <li><strong>POST /predict</strong> - submit prediction request</li>
        <li><strong>GET /predictions</strong> - list recent predictions</li>
      </ul>
      <p>See `docs/API_REFERENCE.md` in the repository for more details.</p>
    </div>
  );
}
