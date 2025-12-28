// src/api/horoscopeApi.js
import axios from "axios";
import { store } from "../store";

const BASE = "http://localhost:4000/api/admin/horoscope"; // backend URL

const client = axios.create({
  baseURL: BASE,
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


export const fetchHoroscopes = async (params) => {
  const res = await client.get("", { params });
  return res.data;
};

export const createHoroscope = async (payload) => {
  const res = await client.post("", payload);
  return res.data;
};

export const updateHoroscope = async (id, payload) => {
  const res = await client.put(`/${id}`, payload);
  return res.data;
};

export const deleteHoroscope = async (id) => {
  const res = await client.delete(`/${id}`);
  return res.data;
};
