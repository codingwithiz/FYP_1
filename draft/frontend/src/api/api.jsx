// src/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3001", // your Express backend
});

export default api;
