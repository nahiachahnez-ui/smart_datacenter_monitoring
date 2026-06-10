# NEXO Mobile

React Native (Expo) app for the NEXO Smart Datacenter Monitoring system.

## Setup

```bash
cd mobile
npm install
```

## Configure IP

Before running, update your backend IP in two files:

- `src/services/api.js` → `BASE_URL`
- `src/services/socket.js` → socket URL

Replace `192.168.1.4` with your machine's local IP address.
Find it with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

## Run

```bash
# Start Expo dev server
npm start

# Then scan the QR code with Expo Go app on your phone
# OR press 'a' for Android emulator, 'i' for iOS simulator
```

## Screens

| Screen    | Description                                      |
|-----------|--------------------------------------------------|
| Login     | JWT auth — same credentials as the web app       |
| Dashboard | Latest AI prediction + sensor readings (live)    |
| Alerts    | Full alert list with resolve / mute / reopen     |
| Sensors   | Sensor registry (read-only)                      |

## Requirements

- Node.js 18+
- Expo Go app on your phone (iOS or Android)
- Backend running on the same local network
