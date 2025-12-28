import axios from "axios";
import { store } from "../store";

// Base URL
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000/api/admin/ads-videos";

// Create Axios client
const client = axios.create({
  baseURL: BASE_URL,
});

client.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.adminAuth?.admin?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handler (no redirect)
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("Unauthorized! Token invalid or expired.");
    }
    return Promise.reject(err);
  }
);

// ---------------- API FUNCTIONS ----------------


export const fetchVideos = (params = "") => client.get(`/${params}`);
export const addVideo = (formData) => client.post("/add", formData);
export const editVideo = (id, formData) => client.put(`/edit/${id}`, formData);
export const deleteVideo = (id) => client.delete(`/delete/${id}`);
export const toggleVideo = (id) => client.put(`/toggle/${id}`);

export default client;
