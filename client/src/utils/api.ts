import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8081/api"
});

api.interceptors.response.use(
  (response) => response,
  (error) =>
  {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
