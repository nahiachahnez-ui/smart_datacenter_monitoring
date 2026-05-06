import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Image
} from "react-native";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", { username, password });
      await login(res.data.token, res.data.user);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      console.error("Login error:", err.response?.data || err.message);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>

        {/* LOGO */}
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../assets/nexo.jpg")}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.appName}>NEXO</Text>
        <Text style={styles.subtitle}>Smart Datacenter Monitoring</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#6b7280"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Login</Text>
          }
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 28,
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#60a5fa",
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    padding: 14,
    color: "#f9fafb",
    marginBottom: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "#f87171",
    marginBottom: 14,
    textAlign: "center",
    fontSize: 13,
  },
});
