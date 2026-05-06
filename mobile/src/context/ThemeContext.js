import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext(null);

const THEME_KEY = "app_theme";

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true); // default dark

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved !== null) setDark(saved === "dark");
    });
  }, []);

  const toggleTheme = async () => {
    const next = !dark;
    setDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Central color tokens — use these everywhere instead of hardcoded hex
export const colors = (dark) => ({
  bg:          dark ? "#111827" : "#f1f5f9",
  card:        dark ? "#1f2937" : "#ffffff",
  border:      dark ? "#374151" : "#e2e8f0",
  header:      dark ? "#1f2937" : "#ffffff",
  text:        dark ? "#f9fafb" : "#0f172a",
  textSub:     dark ? "#9ca3af" : "#64748b",
  textMuted:   dark ? "#6b7280" : "#94a3b8",
  input:       dark ? "#111827" : "#f8fafc",
  inputBorder: dark ? "#374151" : "#cbd5e1",
  accent:      "#3b82f6",
  danger:      "#dc2626",
  success:     "#22c55e",
});
