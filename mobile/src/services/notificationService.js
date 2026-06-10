import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// =============================================
// REQUEST PERMISSION
// =============================================

export async function requestNotificationPermission() {
  if (!Device.isDevice) {
    console.log("Notifications only work on physical devices");
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission denied");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("alerts", {
      name:       "NEXO Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#ef4444",
      sound:      true,
    });
  }

  return true;
}

// =============================================
// SEND LOCAL NOTIFICATION
// =============================================

export async function sendAlertNotification(alert) {
  const levelEmoji = {
    critical: "🔴",
    warning:  "🟡",
    info:     "🔵",
  };

  const emoji = levelEmoji[alert.level] || "⚠️";
  const title = `${emoji} NEXO Alert — ${(alert.type || "sensor").toUpperCase()}`;
  const body  = alert.message || "A new alert was triggered";

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data:  { alertId: alert.id, level: alert.level },
      ...(Platform.OS === "android" && { channelId: "alerts" }),
    },
    trigger: null, // fire immediately
  });
}
