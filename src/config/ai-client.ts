// src/config/ai-client.ts
import axios from "axios";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

const aiClient = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 120000, // Standar timeout 2 menit untuk proses ML yang lama
});

export default aiClient;
