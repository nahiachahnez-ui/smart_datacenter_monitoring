import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, ActivityIndicator, TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "../services/api";
import socket from "../services/socket";

const RISK_COLORS = {
  low:      { bg: "#dcfce7", text: "#15803d" },
  medium:   { bg: "#fef9c3", text: "#a16207" },
  high:     { bg: "#ffedd5", text: "#c2410c" },
  critical: { bg: "#fee2e2", text: "#b91c1c" },
};

const BOOL_COLORS = {
  yes:    { bg: "#fee2e2", text: "#b91c1c" },
  no:     { bg: "#dcfce7", text: "#15803d" },
  normal: { bg: "#dcfce7", text: "#15803d" },
};

function Badge({ value, colorMap }) {
  const key   = (value || "").toLowerCase();
  const color = colorMap[key] || { bg: "#f3f4f6", text: "#374151" };
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.badgeText, { color: color.text }]}>{value || "—"}</Text>
    </View>
  );
}

function SensorTile({ label, value, unit }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>
        {value !== null && value !== undefined ? `${value}` : "—"}
        {value !== null && value !== undefined && unit
          ? <Text style={styles.tileUnit}> {unit}</Text>
          : null}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);
  const [devices, setDevices]       = useState([]);
  const [selectedEsp, setSelectedEsp] = useState("all");
  const [showPicker, setShowPicker]   = useState(false);

  const loadDevices = useCallback(async () => {
    try {
      const res = await API.get("/sensor-data/devices");
      setDevices(res.data || []);
    } catch {}
  }, []);

  const load = useCallback(async (espId) => {
    try {
      setError(null);
      const params = espId && espId !== "all" ? `?esp_id=${espId}` : "";
      const res = await API.get(`/ai-predictions/latest${params}`);
      setPrediction(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || err.message;
      console.error("Dashboard load error:", status, msg);
      setError(`${status ? `[${status}] ` : ""}${msg}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
    load(selectedEsp);

    const interval = setInterval(() => {
      load(selectedEsp);
      loadDevices();
    }, 30000);

    socket.on("new-alert", () => load(selectedEsp));

    return () => {
      clearInterval(interval);
      socket.off("new-alert");
    };
  }, [selectedEsp, load, loadDevices]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(selectedEsp); }}
          tintColor="#3b82f6"
        />
      }
    >
      {/* ESP SELECTOR */}
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={styles.selectorBtn}
          onPress={() => setShowPicker(!showPicker)}
        >
          <Ionicons name="hardware-chip-outline" size={16} color="#9ca3af" />
          <Text style={styles.selectorText}>
            {selectedEsp === "all" ? "All Devices" : selectedEsp}
          </Text>
          <Ionicons name={showPicker ? "chevron-up" : "chevron-down"} size={14} color="#9ca3af" />
        </TouchableOpacity>

        {selectedEsp !== "all" && (
          <TouchableOpacity onPress={() => setSelectedEsp("all")} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* DEVICE PICKER DROPDOWN */}
      {showPicker && (
        <View style={styles.picker}>
          <TouchableOpacity
            style={[styles.pickerItem, selectedEsp === "all" && styles.pickerItemActive]}
            onPress={() => { setSelectedEsp("all"); setShowPicker(false); }}
          >
            <Text style={styles.pickerText}>All Devices</Text>
          </TouchableOpacity>
          {devices.map((d) => (
            <TouchableOpacity
              key={d.esp_id}
              style={[styles.pickerItem, selectedEsp === d.esp_id && styles.pickerItemActive]}
              onPress={() => { setSelectedEsp(d.esp_id); setShowPicker(false); }}
            >
              <Text style={styles.pickerText}>{d.esp_id}</Text>
              <Text style={styles.pickerSub}>
                Last seen: {new Date(d.last_seen).toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* TIMESTAMP */}
      {prediction && (
        <Text style={styles.timestamp}>
          Last update: {new Date(prediction.created_at).toLocaleString()}
        </Text>
      )}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load(selectedEsp)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !prediction ? (
        <Text style={styles.empty}>Waiting for Raspberry Pi data...</Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>AI Prediction</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeLabel}>Risk Level</Text>
              <Badge value={prediction.risk_level} colorMap={RISK_COLORS} />
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeLabel}>Anomaly</Text>
              <Badge value={prediction.anomaly_label} colorMap={BOOL_COLORS} />
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeLabel}>Failure</Text>
              <Badge value={prediction.predicted_faillure} colorMap={BOOL_COLORS} />
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeLabel}>Maintenance</Text>
              <Badge value={prediction.maintenance_required} colorMap={BOOL_COLORS} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Sensor Readings</Text>
          <View style={styles.tileGrid}>
            <SensorTile label="Temp"      value={prediction.temperature}     unit="°C"    />
            <SensorTile label="Humidity"  value={prediction.humidity}        unit="%"     />
            <SensorTile label="Air"       value={prediction.air_quality}     unit="ppm"   />
            <SensorTile label="Water"     value={prediction.water_level}     unit="%"     />
            <SensorTile label="Dust"      value={prediction.dust_level}      unit="µg/m³" />
            <SensorTile label="Gas"       value={prediction.gas_detected}    unit=""      />
            <SensorTile label="Vibration" value={prediction.vibration_level} unit=""      />
            <SensorTile label="Heartbeat" value={prediction.heartbeat}       unit=""      />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  content:   { padding: 20, paddingBottom: 40 },
  center:    { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111827" },

  selectorRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  selectorBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#1f2937", borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: "#374151",
  },
  selectorText: { flex: 1, color: "#f9fafb", fontSize: 13 },
  clearBtn:     { backgroundColor: "#374151", borderRadius: 8, padding: 8 },
  clearText:    { color: "#9ca3af", fontSize: 13 },

  picker:         { backgroundColor: "#1f2937", borderRadius: 10, marginBottom: 12, overflow: "hidden", borderWidth: 1, borderColor: "#374151" },
  pickerItem:     { padding: 12, borderBottomWidth: 1, borderBottomColor: "#374151" },
  pickerItemActive:{ backgroundColor: "#1d4ed8" },
  pickerText:     { color: "#f9fafb", fontSize: 13, fontWeight: "600" },
  pickerSub:      { color: "#6b7280", fontSize: 11, marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#f9fafb", marginBottom: 6, marginTop: 16 },
  timestamp:    { fontSize: 12, color: "#6b7280", marginBottom: 16, marginTop: 4 },
  empty:        { color: "#6b7280", textAlign: "center", marginTop: 60, fontSize: 15 },

  errorBox:   { backgroundColor: "#1f2937", borderRadius: 12, padding: 16, marginTop: 20 },
  errorTitle: { color: "#f87171", fontWeight: "bold", marginBottom: 6 },
  errorMsg:   { color: "#9ca3af", fontSize: 13, marginBottom: 12 },
  retryBtn:   { backgroundColor: "#3b82f6", borderRadius: 8, padding: 10, alignItems: "center" },
  retryText:  { color: "#fff", fontWeight: "600" },

  badgeRow:  { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  badgeItem: { flex: 1, minWidth: "40%", backgroundColor: "#1f2937", borderRadius: 12, padding: 12 },
  badgeLabel:{ fontSize: 11, color: "#9ca3af", marginBottom: 6 },
  badge:     { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "bold" },

  tileGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile:      { width: "30%", backgroundColor: "#1f2937", borderRadius: 12, padding: 12, alignItems: "center" },
  tileLabel: { fontSize: 11, color: "#9ca3af", marginBottom: 4 },
  tileValue: { fontSize: 18, fontWeight: "bold", color: "#f9fafb" },
  tileUnit:  { fontSize: 11, color: "#9ca3af", fontWeight: "normal" },
});
