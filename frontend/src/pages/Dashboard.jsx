import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import API from "../api/api";

import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/StatCard";
import SensorChart from "../components/SensorChart";
import MultiSensorChart from "../components/MultiSensorChart";
import SensorCard from "../components/SensorCard";
import SystemStatus from "../components/SystemStatus";

function Dashboard() {

  const [stats, setStats] = useState(null);
  const [temperatureData, setTemperatureData] = useState([]);
  const [powerData, setPowerData] = useState([]);
  const [combinedData, setCombinedData] = useState([]);

  const [liveData, setLiveData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const [systemHealth, setSystemHealth] = useState({
    sensorsOnline: 5,
    sensorsOffline: 0,
    activeAlerts: 0,
    status: "Healthy"
  });

  /* ================= LOAD STATS ================= */
  const loadStats = async () => {
    try {
      const res = await API.get("/alerts/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  /* ================= LOAD ALERTS ================= */
  const loadAlerts = async () => {
    try {
      const res = await API.get("/alerts");

      const active = res.data.filter(a => a.status === "active");

      setAlerts(active.slice(0, 5));

      setSystemHealth({
        sensorsOnline: 5,
        sensorsOffline: 0,
        activeAlerts: active.length,
        status: active.length > 0 ? "Warning" : "Healthy"
      });

    } catch (err) {
      console.error("Alerts error:", err);
    }
  };

  /* ================= LOAD MEASUREMENTS ================= */
  const loadMeasurements = async () => {
    try {
      const res = await API.get("/measurements");

      const latest = {};
      const tempChart = [];
      const powerChart = [];
      const combinedMap = {};

      res.data.forEach((m) => {

        const time = new Date(m.recorded_at).toLocaleTimeString();

        const point = {
          time,
          value: m.value,
          isAnomaly: m.isAnomaly || false,
          zScore: m.zScore || 0
        };

        if (m.type === "temperature") {
          tempChart.push(point);
          latest.temperature = m.value;
        }

        if (m.type === "power") {
          powerChart.push(point);
          latest.power = m.value;
        }

        if (m.type === "humidity") latest.humidity = m.value;
        if (m.type === "water") latest.water = m.value;
        if (m.type === "dust") latest.dust = m.value;

        if (!combinedMap[time]) {
          combinedMap[time] = {
            time,
            temperature: null,
            power: null,
            humidity: null,
            dust: null
          };
        }

        combinedMap[time][m.type] = m.value;

      });

      setTemperatureData(tempChart.slice(-50));
      setPowerData(powerChart.slice(-50));
      setCombinedData(Object.values(combinedMap).slice(-50));
      setLiveData(latest);

    } catch (err) {
      console.error("Measurements error:", err);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadStats();
    loadMeasurements();
    loadAlerts();
  }, []);

  /* ================= WEBSOCKET (FIXED) ================= */
  useEffect(() => {

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket connected");
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
    });

    socket.on("new-measurement", (m) => {

      const time = new Date(m.recorded_at).toLocaleTimeString();

      const point = {
        time,
        value: m.value,
        isAnomaly: m.isAnomaly,
        zScore: m.zScore
      };

      if (m.type === "temperature") {
        setTemperatureData(prev => [...prev.slice(-49), point]);
        setLiveData(prev => ({ ...prev, temperature: m.value }));
      }

      if (m.type === "power") {
        setPowerData(prev => [...prev.slice(-49), point]);
        setLiveData(prev => ({ ...prev, power: m.value }));
      }

      if (m.type === "humidity") {
        setLiveData(prev => ({ ...prev, humidity: m.value }));
      }

      if (m.type === "water") {
        setLiveData(prev => ({ ...prev, water: m.value }));
      }

      if (m.type === "dust") {
        setLiveData(prev => ({ ...prev, dust: m.value }));
      }

      setCombinedData(prev => {
        const index = prev.findIndex(d => d.time === time);

        if (index !== -1) {
          const updatedItem = {
            ...prev[index],
            [m.type]: m.value
          };

          const newData = [...prev];
          newData[index] = updatedItem;

          return newData.slice(-50);
        }

        return [
          ...prev,
          {
            time,
            temperature: null,
            power: null,
            humidity: null,
            dust: null,
            [m.type]: m.value
          }
        ].slice(-50);
      });

      setLastUpdate(new Date());

    });

    socket.on("new-alert", (alert) => {
      toast.error(alert.message);
      loadAlerts();
      loadStats(); // 🔥 update stats live
    });

    return () => {
      socket.disconnect(); // ✅ IMPORTANT FIX
    };

  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Dashboard</h2>

          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-green-500">LIVE</span>
            </div>

            {lastUpdate && (
              <p className="text-xs text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* STATS */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Alerts" value={stats.total} />
            <StatCard title="Active Alerts" value={stats.active} />
            <StatCard title="Resolved Alerts" value={stats.resolved} />
          </div>
        )}

        {/* SENSOR CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <SensorCard title="Temperature" value={liveData.temperature || "--"} unit="°C" />
          <SensorCard title="Humidity" value={liveData.humidity || "--"} unit="%" />
          <SensorCard title="Water" value={liveData.water || "--"} unit="cm" />
          <SensorCard title="Power" value={liveData.power || "--"} unit="A" />
          <SensorCard title="Dust" value={liveData.dust || "--"} unit="µg/m³" />
        </div>

        {/* COMBINED CHART */}
        <MultiSensorChart data={combinedData} />

        {/* SYSTEM STATUS */}
        <SystemStatus />

      </div>
    </MainLayout>
  );
}

export default Dashboard;