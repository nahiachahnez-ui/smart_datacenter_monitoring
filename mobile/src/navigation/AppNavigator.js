import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import LoginScreen    from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AlertsScreen   from "../screens/AlertsScreen";
import SensorsScreen  from "../screens/SensorsScreen";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:      { backgroundColor: "#1f2937" },
        headerTintColor:  "#f9fafb",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarStyle:      { backgroundColor: "#1f2937", borderTopColor: "#374151" },
        tabBarActiveTintColor:   "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? "grid"           : "grid-outline",
            Alerts:    focused ? "notifications"  : "notifications-outline",
            Sensors:   focused ? "hardware-chip"  : "hardware-chip-outline",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Alerts"    component={AlertsScreen} />
      <Tab.Screen name="Sensors"   component={SensorsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#111827" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
