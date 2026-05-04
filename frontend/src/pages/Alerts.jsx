import { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Alerts() {

  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  /* LOAD ALERTS */
  const loadAlerts = async () => {
    try {
      const res = await API.get("/alerts");
      setAlerts(res.data || []);
    } catch {
      toast.error("Failed to load alerts");
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  /* ACTIONS */
  const resolveAlert = async (id) => {
    try {
      await API.put(`/alerts/${id}/resolve`);
      toast.success("Alert resolved");
      loadAlerts();
    } catch {
      toast.error("Failed to resolve");
    }
  };

  const cancelAlert = async (id) => {
    try {
      await API.put(`/alerts/${id}/cancel`);
      toast.success("Alert muted");
      loadAlerts();
    } catch {
      toast.error("Failed to mute");
    }
  };

  const reopenAlert = async (id) => {
    try {
      await API.put(`/alerts/${id}/reopen`);
      toast.success("Alert reopened");
      loadAlerts();
    } catch {
      toast.error("Failed to reopen");
    }
  };

  /* FORMAT CLEAN ALERT MESSAGE */
  const formatAlert = (a) => {
    const type = a.type || "value";
    const location = a.location || "unknown location";

    const valueMatch = a.message?.match(/\d+/);
    const value = valueMatch ? valueMatch[0] : "";

    return `${type} above ${value} in ${location}`;
  };

  /* FILTER */
  const filtered = alerts.filter((a) => {
    const matchSearch =
      (a.message || "").toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" || a.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 text-gray-900 dark:text-gray-100">

      {/* HEADER */}
      <h2 className="text-3xl font-bold">Alerts</h2>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        className="p-3 rounded-lg border w-80 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
      />

      {/* FILTER */}
      <div className="flex gap-3">
        {["all","active","resolved","cancelled"].map((f)=>(
          <button
            key={f}
            onClick={()=>setStatusFilter(f)}
            className={`px-4 py-2 rounded ${
              statusFilter===f
                ? "bg-gray-900 text-white"
                : "border border-gray-300 dark:border-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="p-4 text-left">Alert</th>
              <th>Status</th>
              <th>Sensor</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((a)=>(
              <tr
                key={a.id}
                className="border-t hover:bg-gray-100 dark:hover:bg-gray-800"
              >

                {/* ALERT MESSAGE */}
                <td
                  className={`p-4 font-medium ${
                    a.level === "critical"
                      ? "text-red-600 dark:text-red-400"
                      : ""
                  }`}
                >
                  {formatAlert(a)}
                </td>

                {/* STATUS */}
                <td>
                  <span className={statusStyles[a.status]}>
                    {a.status}
                  </span>
                </td>

                {/* CLICKABLE SENSOR */}
                <td
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => navigate('/sensors')}
                >
                  {a.sensor_name}
                </td>

                {/* DATE */}
                <td>
                  {new Date(a.created_at).toLocaleString()}
                </td>

                {/* ACTIONS */}
                <td className="flex gap-2 p-4">

                  {/* ACTIVE */}
                  {a.status === "active" && (
                    <>
                      <button onClick={()=>resolveAlert(a.id)}>resolve </button>
                      <button onClick={()=>cancelAlert(a.id)}>mute </button>
                    </>
                  )}

                  {/* REOPEN */}
                  {(a.status === "resolved" || a.status === "cancelled") && (
                    <button onClick={()=>reopenAlert(a.id)}>🔄</button>
                  )}

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}

/* STATUS STYLE */
const statusStyles = {
  active: "px-2 py-1 rounded-full text-xs bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
  resolved: "px-2 py-1 rounded-full text-xs bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  cancelled: "px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700 dark:bg-gray-600/30 dark:text-gray-300"
};

export default Alerts;