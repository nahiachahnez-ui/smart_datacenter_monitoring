import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, Alert, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

const ROLE_COLORS = {
  admin:      { bg: "#1e3a5f", text: "#60a5fa" },
  technician: { bg: "#1a3a2a", text: "#4ade80" },
};

const AVATAR_KEY = "profile_picture";

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color="#6b7280" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user: cachedUser, logout } = useAuth();
  const [profile, setProfile]        = useState(null);
  const [loading, setLoading]        = useState(true);
  const [photo, setPhoto]            = useState(null);

  // load profile + saved photo
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/users/me");
        setProfile(res.data);
      } catch {
        setProfile(cachedUser);
      } finally {
        setLoading(false);
      }
    };

    const loadPhoto = async () => {
      const saved = await AsyncStorage.getItem(AVATAR_KEY);
      if (saved) setPhoto(saved);
    };

    load();
    loadPhoto();
  }, []);

  const pickPhoto = async () => {
    // request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to your photos to set a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      await AsyncStorage.setItem(AVATAR_KEY, uri);
    }
  };

  const removePhoto = () => {
    Alert.alert("Remove photo", "Remove your profile picture?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setPhoto(null);
          await AsyncStorage.removeItem(AVATAR_KEY);
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const roleStyle = ROLE_COLORS[profile?.role] || { bg: "#1f2937", text: "#9ca3af" };
  const initials  = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join("") || (profile?.username?.[0] || "?").toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* AVATAR */}
      <View style={styles.avatarSection}>

        <TouchableOpacity onPress={pickPhoto} onLongPress={photo ? removePhoto : undefined} activeOpacity={0.85}>
          <View style={styles.avatarWrapper}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            {/* camera icon overlay */}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.photoHint}>
          {photo ? "Tap to change · Hold to remove" : "Tap to add photo"}
        </Text>

        <Text style={styles.name}>
          {profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.username}
        </Text>

        <Text style={styles.username}>@{profile?.username}</Text>

        <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
          <Text style={[styles.roleText, { color: roleStyle.text }]}>
            {profile?.role}
          </Text>
        </View>

      </View>

      {/* ACCOUNT INFO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Info</Text>
        <InfoRow icon="mail-outline"             label="Email"         value={profile?.email} />
        <InfoRow icon="call-outline"             label="Phone"         value={profile?.phone} />
        <InfoRow icon="shield-outline"           label="Role"          value={profile?.role} />
        <InfoRow icon="checkmark-circle-outline" label="Email Verified"
          value={profile?.email_verified ? "Verified ✓" : "Not verified"} />
        <InfoRow icon="calendar-outline"         label="Member since"
          value={profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString()
            : "—"} />
      </View>

      {/* SYSTEM INFO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>System</Text>
        <InfoRow icon="server-outline"        label="Backend"  value="192.168.1.2:5000" />
        <InfoRow icon="wifi-outline"          label="Protocol" value="REST + Socket.IO" />
        <InfoRow icon="hardware-chip-outline" label="AI Engine" value="Raspberry Pi" />
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  content:   { padding: 20, paddingBottom: 50 },
  center:    { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111827" },

  avatarSection: { alignItems: "center", marginBottom: 28, marginTop: 8 },

  avatarWrapper: { position: "relative", marginBottom: 8 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "#3b82f6",
    justifyContent: "center", alignItems: "center",
  },
  avatarImage: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: "#3b82f6",
  },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  cameraOverlay: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#1d4ed8",
    borderRadius: 12, width: 24, height: 24,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#111827",
  },

  photoHint: { color: "#4b5563", fontSize: 11, marginBottom: 12 },
  name:      { color: "#f9fafb", fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  username:  { color: "#6b7280", fontSize: 14, marginBottom: 10 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleText:  { fontSize: 13, fontWeight: "bold", textTransform: "capitalize" },

  card:      { backgroundColor: "#1f2937", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { color: "#9ca3af", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 },

  infoRow:     { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#374151" },
  infoIcon:    { width: 36, alignItems: "center" },
  infoContent: { flex: 1 },
  infoLabel:   { color: "#6b7280", fontSize: 12, marginBottom: 2 },
  infoValue:   { color: "#f9fafb", fontSize: 15 },

  logoutBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#dc2626", borderRadius: 14, padding: 16, marginTop: 8 },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
