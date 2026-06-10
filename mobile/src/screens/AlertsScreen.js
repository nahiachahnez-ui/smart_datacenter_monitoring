import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert
} from "react-native";
import API from "../services/api";
import socket from "../services/socket";

const STATUS_STYLES = {
  active:    { bg: "#fee2e2", text: "#b91c1c" },
  resolved:  { bg: "#dcfce7", text: "#15803d" },
  cancelled: { bg: "#f3f4f6", text: "#6b7280" },
};

export default function AlertsScreen() {
  const [alerts, setAlerts]       = useState([]);
  const [filter, setFilter]       = useState("all");
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await API.get("/alerts");
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Alerts load error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    socket.on("new-alert", () => load());
    return () => socket.off("new-alert");
  }, [load]);

  const resolveAlert = async (id) => {
    try {
      await API.put(`/alerts/${id}/resolve`);
      load();
    } catch { Alert.alert("Error", "Failed to resolve alert"); }
  };

  const muteAlert = async (id) => {
    try {
      await API.put(`/alerts/${id}/cancel`);
      load();
    } catch { Alert.alert("Error", "Failed to mute alert"); }
  };

  const reopenAlert = async (id) => {
    try {
      await API.put(`/alerts/${id}/reopen`);
      load();
    } catch { Alert.alert("Error", "Failed to reopen alert"); }
  };

  const filtered = filter === "all"
    ? alerts
    : alerts.filter(a => a.status === filter);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* FILTER TABS */}
      <View style={styles.filterRow}>
        {["all", "active", "resolved", "cancelled"].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No alerts found</Text>
        }
        renderItem={({ item }) => {
          const s = STATUS_STYLES[item.status] || STATUS_STYLES.cancelled;
          return (
            <View style={styles.card}>

              <View style={styles.cardHeader}>
                <Text style={styles.alertType}>{item.type || "Alert"}</Text>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.alertMessage} numberOfLines={2}>
                {item.message}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.meta}>
                  {item.sensor_name} · {item.location}
                </Text>
                <Text style={styles.meta}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>

              {/* ACTIONS */}
              <View style={styles.actions}>
                {item.status === "active" && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.resolveBtn]}
                      onPress={() => resolveAlert(item.id)}
                    >
                      <Text style={styles.actionText}>Resolve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.muteBtn]}
                      onPress={() => muteAlert(item.id)}
                    >
                      <Text style={styles.actionText}>Mute</Text>
                    </TouchableOpacity>
                  </>
                )}
                {(item.status === "resolved" || item.status === "cancelled") && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.reopenBtn]}
                    onPress={() => reopenAlert(item.id)}
                  >
                    <Text style={styles.actionText}>Reopen</Text>
                  </TouchableOpacity>
                )}
              </View>

            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  center:    { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111827" },
  list:      { padding: 16, paddingBottom: 40 },
  empty:     { color: "#6b7280", textAlign: "center", marginTop: 60, fontSize: 15 },

  filterRow:       { flexDirection: "row", padding: 12, gap: 8, backgroundColor: "#1f2937" },
  filterBtn:       { flex: 1, paddingVertical: 7, borderRadius: 8, backgroundColor: "#111827", alignItems: "center" },
  filterBtnActive: { backgroundColor: "#3b82f6" },
  filterText:      { color: "#9ca3af", fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  filterTextActive:{ color: "#fff" },

  card:       { backgroundColor: "#1f2937", borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  alertType:  { color: "#f9fafb", fontWeight: "bold", fontSize: 15, textTransform: "capitalize" },
  statusBadge:{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "bold", textTransform: "capitalize" },
  alertMessage:{ color: "#d1d5db", fontSize: 13, marginBottom: 10, lineHeight: 18 },
  cardFooter: { marginBottom: 12 },
  meta:       { color: "#6b7280", fontSize: 11, marginBottom: 2 },

  actions:    { flexDirection: "row", gap: 8 },
  actionBtn:  { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  resolveBtn: { backgroundColor: "#166534" },
  muteBtn:    { backgroundColor: "#374151" },
  reopenBtn:  { backgroundColor: "#1d4ed8" },
  actionText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
