import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventEmitter } from "eventemitter3";

// shared event bus — api.js fires "unauthorized", AuthContext listens
export const authEvents = new EventEmitter();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(null);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // restore session on app launch
  useEffect(() => {
    const restore = async () => {
      const t = await AsyncStorage.getItem("token");
      const u = await AsyncStorage.getItem("user");
      if (t) {
        setToken(t);
        setUser(u ? JSON.parse(u) : null);
      }
      setLoading(false);
    };
    restore();
  }, []);

  // listen for 401 from API interceptor → auto logout
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    authEvents.on("unauthorized", handleUnauthorized);
    return () => authEvents.off("unauthorized", handleUnauthorized);
  }, []);

  const login = async (token, userData) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
