import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_IP } from "@env";
import { authEvents } from "../context/AuthContext";

export const BASE_URL = `http://${API_IP}:5000/api`;

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach JWT token to every request
API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// On 401 → clear storage and signal AuthContext to redirect to login
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      authEvents.emit("unauthorized");
    }
    return Promise.reject(err);
  }
);

export default API;
