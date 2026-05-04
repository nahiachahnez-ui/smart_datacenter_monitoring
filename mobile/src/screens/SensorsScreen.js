import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet,
  RefreshControl, ActivityIndicator, TextInput
} from "react-native";
import API from "../services/api";

const TYPE_COLORS = {
  temperature: "#ef4444",
  humidity:    "#3b82f6",
  dust:        "#6b7280",
  water:       "#06b6d4",
  power:       "#facc15",
  gas:         "#f97316",
};

export default function SensorsScreen() {
  const [sensors, setSensors]     = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await API.get("/sensors");
      setSensors(res.data || []);
    } catch (err) {
      console.error("Sensors load error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = sensors.filter(s =>
    (s.sensor_uid || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.type || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.location || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <TextInput
        style={styles.search}
        placeholder="Search sensors..."
        placeholderTextColor="#6b7280"
        value={search}
        onChangeText={setSearch}
      />

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
          <Text style={styles.empty}>No sensors found</Text>
        }
        renderItem={({ item }) => {
          const color = TYPE_COLORS[item.type] || "#9ca3af";
          return (
            <View style={styles.card}>

              <View style={styles.cardHeader}>
                <Text style={styles.uid}>{item.sensor_uid}</Text>
                <View style={[styles.typeBadge, { backgroundColor: color + "22" }]}>
                  <Text style={[styles.typeText, { color }]}>{item.type}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={styles.metaValue}>{item.location || "—"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.metaLabel}>ESP ID</Text>
                <Text style={styles.metaValue}>{item.esp_id || "—"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.metaLabel}>GPIO</Text>
                <Text style={styles.metaValue}>{item.gpio_pin || "—"}</Text>
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

  search: {
    margin: 16,
    marginBottom: 4,
    backgroundColor: "#1f2937",
    borderRadius: 10,
    padding: 12,
    color: "#f9fafb",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#374151",
  },

  card:       { backgroundColor: "#1f2937", borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  uid:        { color: "#f9fafb", fontWeight: "bold", fontSize: 15 },
  typeBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  typeText:   { fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },

  row:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  metaLabel: { color: "#6b7280", fontSize: 13 },
  metaValue: { color: "#d1d5db", fontSize: 13, fontWeight: "500" },
});
