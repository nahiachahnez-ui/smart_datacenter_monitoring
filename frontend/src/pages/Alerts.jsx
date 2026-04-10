import { useEffect, useState } from "react";
import API from "../api/api";
import MainLayout from "../layouts/MainLayout";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Alerts() {

  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    sort: "latest"
  });

  const navigate = useNavigate();

  /* ================= LOAD ================= */
  const loadAlerts = async () => {
    try {
      const res = await API.get("/alerts");
      setAlerts(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load alerts");
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  /* ================= ACTIONS ================= */
  const resolveAlert = async (id) => {
    try {
      await API.put(`/alerts/${id}/resolve`);
      toast.success("Resolved");
      setSelectedAlert(null);
      loadAlerts();
    } catch {
      toast.error("Error");
    }
  };

  const cancelAlert = async (id) => {
    try {
      await API.put(`/alerts/${id}/cancel`);
      toast.success("Cancelled");
      setSelectedAlert(null);
      loadAlerts();
    } catch {
      toast.error("Error");
    }
  };

  /* ================= FILTER ================= */
  const filteredAlerts = alerts
    .filter((a) => {
      return (
        ((a.message || "").toLowerCase().includes(filters.search.toLowerCase()) ||
         (a.sensor_name || "").toLowerCase().includes(filters.search.toLowerCase())) &&
        (filters.type ? a.type === filters.type : true) &&
        (filters.status ? a.status === filters.status : true)
      );
    })
    .sort((a, b) => {
      return filters.sort === "latest"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at);
    });

  return (
    <MainLayout>

      <div className="space-y-6 text-gray-900 dark:text-gray-100">

        <h2 className="text-3xl font-bold">Alerts</h2>

        {/* FILTERS */}
        <div className="grid grid-cols-4 gap-4">

          <input
            placeholder="Search..."
            value={filters.search}
            onChange={(e)=>setFilters({...filters, search:e.target.value})}
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />

          <select
            value={filters.type}
            onChange={(e)=>setFilters({...filters, type:e.target.value})}
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="">All Types</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="power">Power</option>
            <option value="dust">Dust</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
          </select>

          <select
            value={filters.status}
            onChange={(e)=>setFilters({...filters, status:e.target.value})}
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e)=>setFilters({...filters, sort:e.target.value})}
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>

        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredAlerts.length} alerts
        </p>

        {/* TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="p-4 text-left text-gray-700 dark:text-gray-200">Alert</th>
                <th className="text-gray-700 dark:text-gray-200">Type</th>
                <th className="text-gray-700 dark:text-gray-200">Status</th>
                <th className="text-gray-700 dark:text-gray-200">Date</th>
                <th className="text-gray-700 dark:text-gray-200">Sensor</th>
              </tr>
            </thead>

            <tbody>
              {filteredAlerts.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => setSelectedAlert(a)}
                >
                  <td className="p-4 text-gray-800 dark:text-gray-100">
                     {a.message}
                  </td>

                  <td className="text-gray-800 dark:text-gray-100">
                    {a.type}
                  </td>

                  <td>
                    <span
                      className={
                        a.status === "active"
                          ? "text-red-500 font-semibold"
                          : a.status === "resolved"
                          ? "text-green-500 font-semibold"
                          : "text-gray-400 font-semibold"
                      }
                    >
                      {a.status}
                    </span>
                  </td>

                  <td className="text-gray-800 dark:text-gray-100">
                    {new Date(a.created_at).toLocaleString()}
                  </td>

                  <td
                    className="text-blue-500 underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/sensors");
                    }}
                  >
                    {a.sensor_name}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">

          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[500px] text-gray-900 dark:text-gray-100">

            <h3 className="text-xl font-bold mb-4">
              Alert Details
            </h3>

            <div className="space-y-2 text-sm">
              <p><b>Message:</b> {selectedAlert.message}</p>
              <p><b>Sensor:</b> {selectedAlert.sensor_name}</p>
              <p><b>Type:</b> {selectedAlert.type}</p>
              <p><b>Status:</b> {selectedAlert.status}</p>
              <p><b>Location:</b> {selectedAlert.location}</p>
              <p><b>Date:</b> {new Date(selectedAlert.created_at).toLocaleString()}</p>
            </div>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => resolveAlert(selectedAlert.id)}
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                Resolve
              </button>

              <button
                onClick={() => cancelAlert(selectedAlert.id)}
                className="w-full bg-red-600 text-white py-2 rounded"
              >
                Cancel
              </button>

            </div>

            <button
              onClick={() => setSelectedAlert(null)}
              className="mt-4 text-gray-500"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </MainLayout>
  );
}

export default Alerts;