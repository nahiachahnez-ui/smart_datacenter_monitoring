import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";
import socket from "./src/services/socket";
import {
  requestNotificationPermission,
  sendAlertNotification,
} from "./src/services/notificationService";

export default function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Request notification permission on launch
    requestNotificationPermission();

    // Listen for new alerts from backend via Socket.IO
    // Fire a local push notification for every new alert
    const handleNewAlert = (alert) => {
      sendAlertNotification(alert);
    };

    socket.on("new-alert", handleNewAlert);

    // Handle notification tap — app was in background
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log("Notification tapped:", data);
      // Could navigate to Alerts screen here if needed
    });

    return () => {
      socket.off("new-alert", handleNewAlert);
      sub.remove();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
