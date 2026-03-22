import axios from "axios";

const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: base,
});

// ========================
// Traffic Prediction
// ========================
export const predictTraffic = (data) => {
  return API.post("/predict", data);
};

// ========================
// Spark Analytics
// ========================
export const fetchPeakHours = async () => {
  const res = await API.get("/peak-hours");
  return res.data;
};
