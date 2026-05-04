import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Change this to your machine's local IP when testing on a physical device
// e.g. "http://192.168.1.x:5000/api"
export const BASE_URL = "http://192.168.1.2:5000/api";

const API = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every request
API.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
