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

  // ================= LOADERS =================

  const loadChartHistory = async () => {
    try {
      const res = await API.get("/sensor-data/history");
      const formatted = res.data.map((row) => ({
        ...row,
        time: new Date(row.created_at).toLocaleTimeString()
      }));
      setChartData(formatted);
    } catch (err) {
      console.error("Chart history error:", err);
    }
  };

  const loadAiPrediction = async () => {
    try {
      const res = await API.get("/ai-predictions/latest");
      setAiPrediction(res.data);
    } catch (err) {
      console.error("AI prediction error:", err);
    }
  };

  useEffect(() => {
    loadChartHistory();
    loadAiPrediction();

    const interval = setInterval(() => {
      loadAiPrediction();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ================= REAL-TIME SOCKET =================

  useEffect(() => {
    socket.on("new-sensor-data", (row) => {
      setLastUpdate(new Date(row.created_at));
      setChartData(prev => [
        ...prev,
        { ...row, time: new Date(row.created_at).toLocaleTimeString() }
      ].slice(-50));
    });

    socket.on("new-alert", (alert) => {
      toast.error(alert.message);
      loadAiPrediction();
    });

    return () => {
      socket.off("new-sensor-data");
      socket.off("new-alert");
    };
  }, []);

  // ================= UI =================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-green-500">LIVE</span>
          {lastUpdate && (
            <span className="text-xs text-gray-400 ml-1">
              · {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* AI PREDICTION — top */}
      <AIPredictionPanel prediction={aiPrediction} />

      {/* SENSOR HISTORY CHART */}
      <MultiSensorChart data={chartData} />

    </div>
  );
}

export default Dashboard;
