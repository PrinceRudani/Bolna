import axios from "axios";

const api = axios.create({
  baseURL: "https://api.bolna.ai/v2",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_BOLNA_TOKEN}`,
    "Content-Type": "application/json"
  }
});

export default api;

