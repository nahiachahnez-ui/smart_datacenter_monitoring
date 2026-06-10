import { useEffect, useState } from "react";
import API from "../api/api";

function SystemStatus() {

  const [status, setStatus] = useState("Healthy");
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  const [systems, setSystems] = useState({
    backend: "Checking...",
    database: "Checking...",
    mqtt: "Checking...",
    gateway: "Checking..."
  });

  const getColor = (value) => {
    if (value === "Running" || value === "Connected" || value === "Online") return "text-green-400";
    if (value === "Not Configured" || value === "Warning") return "text-yellow-400";
    if (value === "Disconnected" || value === "Offline" || value === "Error") return "text-red-400";
    return "text-gray-400";
  };

  const loadStatus = async () => {
    try {

      const alertRes = await API.get("/alerts");
      const active = alertRes.data.filter(a => a.status === "active");

      setCount(active.length);

      if (active.length === 0) setStatus("Healthy");
      else if (active.length < 5) setStatus("Warning");
      else setStatus("Critical");

      const systemRes = await API.get("/system/status");
      setSystems(systemRes.data);

    } catch (err) {
      console.error("Failed to load system status:", err);

      setSystems({
        backend: "Error",
        database: "Error",
        mqtt: "Error",
        gateway: "Error"
      });
    }
  };

  useEffect(() => {
    loadStatus();

    const interval = setInterval(loadStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">

      {/* STATUS BAR */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <span
          className={`h-3 w-3 rounded-full ${
            status === "Healthy"
              ? "bg-green-500"
              : status === "Warning"
              ? "bg-yellow-500 animate-pulse"
              : "bg-red-500 animate-pulse"
          }`}
        />

        <span className="text-sm font-semibold">{status}</span>

        {count > 0 && (
          <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
            {count}
          </span>
        )}

        <span className="text-xs">▼</span>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="
          absolute top-8 left-0
          bg-white dark:bg-gray-900
          border border-slate-200 dark:border-gray-700
          rounded-lg shadow-lg
          p-4 w-64 z-50
        ">

          <h4 className="font-semibold mb-3">System Details</h4>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">
              <span>Backend</span>
              <span className={getColor(systems.backend)}>
                {systems.backend}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Database</span>
              <span className={getColor(systems.database)}>
                {systems.database}
              </span>
            </div>

            <div className="flex justify-between">
              <span>MQTT</span>
              <span className={getColor(systems.mqtt)}>
                {systems.mqtt}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Gateway</span>
              <span className={getColor(systems.gateway)}>
                {systems.gateway}
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default SystemStatus;