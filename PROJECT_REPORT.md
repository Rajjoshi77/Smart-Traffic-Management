# 🚦 TrafficIQ: Real-Time Smart Traffic Management System

## 1. Project Overview
**TrafficIQ** is an advanced, production-ready traffic management solution designed to monitor, analyze, and visualize traffic flow in real-time. Unlike traditional static systems, TrafficIQ utilizes an **Event-Driven Architecture** to process continuous streams of vehicle data, enabling instant congestion detection and predictive analytics.

### ❓ What does it actually do?
1.  **Simulates IoT Sensors**: It generates realistic vehicle data (speed, count, location) for multiple city zones.
2.  **Processes Live Streams**: It ingests this data instantly using Apache Kafka and processes it with Apache Spark.
3.  **Detects Traffic Jams**: It calculates average speeds and congestion levels in dynamic time windows.
4.  **Visualizes Live Data**: It pushes updates to a React Dashboard via WebSockets, showing moving traffic markers on a live map.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph "Data Generation Layer"
        A[IoT Sensors / producer.py] -->|JSON Stream| B(Apache Kafka)
    end

    subgraph "Big Data Processing Layer"
        B -->|Subscribe Topic| C{Apache Spark / Processor}
        C -->|Aggregate Windows| D[(MongoDB Atlas)]
    end

    subgraph "Backend API Layer"
        D -->|Async Read| E[FastAPI Server]
        C -->|Live Fallback| E
        E -->|WebSocket Broadcast| F((Client Browser))
    end

    subgraph "Frontend Visualization"
        F --> G[React Dashboard]
        G --> H[Live Map (Leaflet)]
        G --> I[Real-Time Charts]
    end
```

---

## 3. Key Concepts Covered
This project demonstrates mastery of several advanced software engineering concepts:

*   **Event-Driven Architecture (EDA)**: The system reacts to "events" (vehicle passage) rather than waiting for user requests.
*   **Real-Time Streaming**: Processing data as it arrives (using Spark Structured Streaming) rather than in nightly batches.
*   **Microservices**: Decoupling the Producer (Sensor), Processor (Spark), and API (FastAPI) into separate, independent services.
*   **WebSocket Communication**: Establishing a two-way persistent connection between Server and Client for sub-second updates (replacing inefficient polling).
*   **Geospatial Visualization**: Rendering dynamic data points on an interactive map using Leaflet.js.
*   **Asynchronous I/O**: Using Python's `asyncio` and `motor` to handle database operations without blocking the server.

---

## 4. Frameworks and Tools Used

### 🖥️ Frontend (The Dashboard)
*   **React.js**: Component-based UI library.
*   **Vite**: Next-generation build tool for lightning-fast development.
*   **Tailwind CSS**: Utility-first CSS framework for professional, responsive styling.
*   **Recharts**: Composable charting library for React.
*   **React-Leaflet**: OpenStreetMap integration for the live traffic map.
*   **Lucide React**: Modern, consistent icon set.

### ⚙️ Backend (The Core)
*   **Python**: Primary programming language.
*   **FastAPI**: Modern, high-performance web framework.
*   **WebSockets**: For real-time data broadcasting.
*   **Motor**: Asynchronous MongoDB driver for Python.
*   **Pydantic**: Data validation and hygiene.

### 📡 Big Data & Streaming (The Engine)
*   **Apache Kafka**: Distributed event streaming platform (simulated/local).
*   **Apache Spark (PySpark)**: Unified analytics engine for large-scale data processing.
*   **MongoDB Atlas**: Cloud-native NoSQL database for flexible data storage.

---

## 5. Detailed Working Breakdown

### Phase 1: Data Ingestion (`producer.py`)
The system starts with the **Producer**. In a real-world scenario, these would be physical IoT cameras or sensors using LoRaWAN or 5G.
*   **Action**: It generates a JSON payload every 3 seconds containing: `sensor_id`, `timestamp`, `location` (Lat/Lon), `vehicle_count`, and `avg_speed`.
*   **Output**: Pushes this message to the Kafka topic `traffic_sensor_data`.

### Phase 2: Stream Processing (`spark_processor.py`)
The **Spark Processor** acts as the brain.
*   **Action**: It subscribes to the Kafka topic and reads the continuous stream of JSON data.
*   **Logic**:
    *   **Windowing**: It groups data into 1-minute time windows.
    *   **Aggregation**: It calculates the *average speed* and *total vehicle count* for each sensor within that window.
*   **Output**: Writes the aggregated "insights" (e.g., "Main St is Congested") to the MongoDB `analytics` collection.

### Phase 3: API & Broadcasting (`main.py`)
The **FastAPI Backend** acts as the bridge.
*   **Action**: It exposes a WebSocket endpoint `/ws/traffic`.
*   **Logic**: It watches MongoDB or receives direct signals from the processor. When new data arrives, it broadcasts the JSON payload to all connected frontend clients immediately.
*   **REST API**: It also provides standard endpoints like `GET /predict` for the AI model to predict future traffic.

### Phase 4: Visualization (`Dashboard.jsx`)
The **React Frontend** brings it all together.
*   **Action**: On load, it opens a WebSocket connection to the backend.
*   **Logic**:
    *   **Live Updates**: When a message is received, it updates the "Active Sensors" count and "Live Flow" stats instantly.
    *   **Map Update**: It moves the markers on the map to reflect the latest sensor locations and changes their color (Green/Orange/Red) based on the `congestion_level`.
    *   **Chart**: It appends the new data point to the trend graph, creating a smooth, moving visualization.

---

## 6. How to Run It

1.  **Start Backend**: `uvicorn backend.main:app --reload`
2.  **Start Frontend**: `npm run dev` (in frontend dir)
3.  **Start Simulation**: `python backend/producer.py`
4.  **Start Processor**: `python backend/spark_processor.py`
