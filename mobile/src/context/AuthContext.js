import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(null);
  const [role, setRole]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // restore session on app launch
    const restore = async () => {
      const t = await AsyncStorage.getItem("token");
      const r = await AsyncStorage.getItem("role");
      if (t) { setToken(t); setRole(r); }
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (token, role) => {
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("role", role);
    setToken(token);
    setRole(role);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
