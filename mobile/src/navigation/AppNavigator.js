import { useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, Animated, Image
} from "react-native";
import PagerView from "react-native-pager-view";

import { useAuth } from "../context/AuthContext";
import { useTheme, colors } from "../context/ThemeContext";
import LoginScreen     from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AlertsScreen    from "../screens/AlertsScreen";
import SensorsScreen   from "../screens/SensorsScreen";
import ProfileScreen   from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

const TABS = [
  { name: "Dashboard", icon: "grid",          iconOff: "grid-outline"          },
  { name: "Alerts",    icon: "notifications",  iconOff: "notifications-outline"  },
  { name: "Sensors",   icon: "hardware-chip",  iconOff: "hardware-chip-outline"  },
  { name: "Profile",   icon: "person",         iconOff: "person-outline"         },
];

const SCREENS = [DashboardScreen, AlertsScreen, SensorsScreen, ProfileScreen];

function SwipeableTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef(null);
  const { dark } = useTheme();
  const c = colors(dark);

  const goTo = (index) => {
    pagerRef.current?.setPage(index);
    setActiveIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bg }]}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: c.header, borderBottomColor: c.border }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/nexo.jpg")}
            style={styles.headerLogo}
            resizeMode="cover"
          />
          <View>
            <Text style={[styles.headerTitle, { color: c.text }]}>{TABS[activeIndex].name}</Text>
            <Text style={[styles.headerSub, { color: c.textMuted }]}>NEXO Monitoring</Text>
          </View>
        </View>
        <View style={styles.liveDot} />
      </View>

      {/* SWIPEABLE PAGES */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        overdrag
      >
        {SCREENS.map((Screen, i) => (
          <View key={i} style={styles.page}>
            <Screen />
          </View>
        ))}
      </PagerView>

      {/* BOTTOM TAB BAR */}
      <View style={[styles.tabBar, { backgroundColor: c.header, borderTopColor: c.border }]}>
        {TABS.map((tab, i) => {
          const focused = activeIndex === i;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => goTo(i)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
                <Ionicons
                  name={focused ? tab.icon : tab.iconOff}
                  size={24}
                  color={focused ? "#3b82f6" : c.textMuted}
                />
              </Animated.View>
              <Text style={[styles.tabLabel, { color: focused ? "#3b82f6" : c.textMuted }]}>
                {tab.name}
              </Text>
              {focused && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

    </View>
  );
}

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
          animationDuration: 280,
          contentStyle: { backgroundColor: "#111827" },
        }}
      >
        {token ? (
          <Stack.Screen name="Main"  component={SwipeableTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#111827" },
  loadingContainer:{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111827" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  headerLeft:  { flexDirection: "row", alignItems: "center", gap: 10 },
  headerLogo:  { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: "#3b82f6" },
  headerTitle: { color: "#f9fafb", fontSize: 17, fontWeight: "bold" },
  headerSub:   { color: "#6b7280", fontSize: 10 },
  liveDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },

  pager: { flex: 1 },
  page:  { flex: 1 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    position: "relative",
  },
  tabLabel:       { color: "#4b5563", fontSize: 10, fontWeight: "600" },
  tabLabelActive: { color: "#3b82f6" },
  tabIndicator: {
    position: "absolute",
    top: -10,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#3b82f6",
  },
});
