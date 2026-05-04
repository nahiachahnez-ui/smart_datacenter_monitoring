import { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, ActivityIndicator
} from "react-native";
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
      <Text style={[styles.badgeText, { color: color.text }]}>
        {value || "—"}
      </Text>
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

  const load = useCallback(async () => {
    try {
      const res = await API.get("/ai-predictions/latest");
      setPrediction(res.data);
    } catch (err) {
      console.error("Dashboard load error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();

    const interval = setInterval(load, 10000);

    socket.on("new-alert", () => load());

    return () => {
      clearInterval(interval);
      socket.off("new-alert");
    };
  }, [load]);

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
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor="#3b82f6"
        />
      }
    >
      {/* TIMESTAMP */}
      {prediction && (
        <Text style={styles.timestamp}>
          Last update: {new Date(prediction.created_at).toLocaleString()}
        </Text>
      )}

      {!prediction ? (
        <Text style={styles.empty}>Waiting for Raspberry Pi data...</Text>
      ) : (
        <>
          {/* AI PREDICTION SECTION */}
          <Text style={styles.sectionTitle}>AI Prediction</Text>

          {/* BADGES */}
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

          {/* SENSOR READINGS */}
          <Text style={styles.sectionTitle}>Sensor Readings</Text>
          <View style={styles.tileGrid}>
            <SensorTile label="Temp"      value={prediction.temperature}     unit="°C"    />
            <SensorTile label="Humidity"  value={prediction.humidity}        unit="%"     />
            <SensorTile label="Air"       value={prediction.air_quality}     unit="ppm"   />
            <SensorTile label="Smoke"     value={prediction.smoke_level}     unit=""      />
            <SensorTile label="Water"     value={prediction.water_level}     unit="cm³"   />
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
  container:    { flex: 1, backgroundColor: "#111827" },
  content:      { padding: 20, paddingBottom: 40 },
  center:       { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111827" },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#f9fafb", marginBottom: 6, marginTop: 16 },
  timestamp:    { fontSize: 12, color: "#6b7280", marginBottom: 16, marginTop: 4 },
  empty:        { color: "#6b7280", textAlign: "center", marginTop: 60, fontSize: 15 },

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
