import { useEffect, useState } from "react";
import socket from "../services/socketService";
import { toast } from "react-toastify";
import API from "../api/api";

import MultiSensorChart from "../components/MultiSensorChart";
import AIPredictionPanel from "../components/AIPredictionPanel";

function Dashboard() {
  const [chartData, setChartData]       = useState([]);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [lastUpdate, setLastUpdate]     = useState(null);
  const [devices, setDevices]           = useState([]);
  const [selectedEsp, setSelectedEsp]   = useState("all");

  // ================= LOADERS =================

  const loadDevices = async () => {
    try {
      const res = await API.get("/sensor-data/devices");
      setDevices(res.data || []);
    } catch (err) {
      console.error("Devices error:", err);
    }
  };

  const loadChartHistory = async (espId) => {
    try {
      const params = espId && espId !== "all" ? `?esp_id=${espId}` : "";
      const res = await API.get(`/sensor-data/history${params}`);
      const formatted = res.data.map((row) => ({
        ...row,
        time: new Date(row.created_at).toLocaleTimeString()
      }));
      setChartData(formatted);
    } catch (err) {
      console.error("Chart history error:", err);
    }
  };

  const loadAiPrediction = async (espId) => {
    try {
      const params = espId && espId !== "all" ? `?esp_id=${espId}` : "";
      const res = await API.get(`/ai-predictions/latest${params}`);
      setAiPrediction(res.data);
    } catch (err) {
      console.error("AI prediction error:", err);
    }
  };

  useEffect(() => {
    loadDevices();
    loadChartHistory(selectedEsp);
    loadAiPrediction(selectedEsp);

    const interval = setInterval(() => {
      loadAiPrediction(selectedEsp);
      loadDevices();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedEsp]);

  // ================= REAL-TIME SOCKET =================

  useEffect(() => {
    socket.on("new-sensor-data", (row) => {
      // only update chart if this ESP is selected or showing all
      if (selectedEsp === "all" || row.esp_id === selectedEsp) {
        setLastUpdate(new Date(row.created_at));
        setChartData(prev => [
          ...prev,
          { ...row, time: new Date(row.created_at).toLocaleTimeString() }
        ].slice(-50));
      }
      // refresh device list when new ESP appears
      loadDevices();
    });

    socket.on("new-alert", (alert) => {
      toast.error(alert.message);
      loadAiPrediction(selectedEsp);
    });

    return () => {
      socket.off("new-sensor-data");
      socket.off("new-alert");
    };
  }, [selectedEsp]);

  // ================= UI =================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold">Dashboard</h2>

        <div className="flex items-center gap-4">

          {/* ESP SELECTOR */}
          <select
            value={selectedEsp}
            onChange={(e) => setSelectedEsp(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-slate-800 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Devices</option>
            {devices.map((d) => (
              <option key={d.esp_id} value={d.esp_id}>
                {d.esp_id}
              </option>
            ))}
          </select>

          {/* LIVE INDICATOR */}
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-green-500">LIVE</span>
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                · {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* SELECTED ESP BADGE */}
      {selectedEsp !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-gray-400">Showing data for</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold
                           bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            {selectedEsp}
          </span>
          <button
            onClick={() => setSelectedEsp("all")}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-gray-200"
          >
            ✕ clear
          </button>
        </div>
      )}

      {/* AI PREDICTION */}
      <AIPredictionPanel prediction={aiPrediction} />

      {/* SENSOR HISTORY CHART */}
      <MultiSensorChart data={chartData} />

    </div>
  );
}

export default Dashboard;
