# API Reference

This document describes the backend HTTP API endpoints exposed by the FastAPI service in `backend/`.

## Base URL

When running locally, the API base URL is typically `http://localhost:8000`.

## Endpoints

- `GET /health` - Service health check; returns status information.
- `POST /predict` - Request a traffic prediction. Expects JSON body with input features (timestamp, sensor_id, weather, etc.). Returns predicted traffic level and confidence.
- `GET /predictions` - List recent predictions (optional filters: date range, sensor).

Refer to the FastAPI app in `backend/main.py` and route modules in `backend/routes/` for implementation details and request/response schemas.
