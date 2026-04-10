import { useEffect, useState } from "react";
import API from "../api/api";
import MainLayout from "../layouts/MainLayout";
import { toast } from "react-toastify";

function Sensors() {

  const [sensors, setSensors] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    esp: "",
    gpio: "",
    location: "",
    sort: "latest"
  });

  /* ================= LOAD ================= */
  const loadSensors = async () => {
    try {
      const res = await API.get("/sensors");
      setSensors(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sensors");
    }
  };

  useEffect(() => {
    loadSensors();
  }, []);

  /* ================= FILTER ================= */
  const filteredSensors = sensors
    .filter((s) => {
      return (
        (s.sensor_uid || "").toLowerCase().includes(filters.search.toLowerCase()) &&
        (filters.type ? s.type === filters.type : true) &&
        (s.esp_id || "").toLowerCase().includes(filters.esp.toLowerCase()) &&
        String(s.gpio_pin || "").includes(filters.gpio) &&
        (s.location || "").toLowerCase().includes(filters.location.toLowerCase())
      );
    })
    .sort((a, b) => {
      return filters.sort === "latest"
        ? b.id - a.id
        : a.id - b.id;
    });

  return (
    <MainLayout>

      <div className="space-y-6 text-gray-900 dark:text-gray-100">

        <h2 className="text-3xl font-bold">Sensors</h2>

        {/* FILTERS */}
        <div className="grid grid-cols-3 gap-4">

          <input
            placeholder="Search UID..."
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

          <input
            placeholder="ESP ID..."
            value={filters.esp}
            onChange={(e)=>setFilters({...filters, esp:e.target.value})}
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />

          <input
            placeholder="GPIO..."
            value={filters.gpio}
            onChange={(e)=>setFilters({...filters, gpio:e.target.value})}
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />

          <input
            placeholder="Location..."
            value={filters.location}
            onChange={(e)=>setFilters({...filters, location:e.target.value})}
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />

          <select
            value={filters.sort}
            onChange={(e)=>setFilters({...filters, sort:e.target.value})}
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>

        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="p-4 text-left text-gray-700 dark:text-gray-200">UID</th>
                <th className="text-gray-700 dark:text-gray-200">Type</th>
                <th className="text-gray-700 dark:text-gray-200">Location</th>
                <th className="text-gray-700 dark:text-gray-200">ESP</th>
                <th className="text-gray-700 dark:text-gray-200">GPIO</th>
              </tr>
            </thead>

            <tbody>
              {filteredSensors.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-100">
                    {s.sensor_uid}
                  </td>

                  {/* TYPE COLOR */}
                  <td
                    className={
                      s.type === "temperature"
                        ? "text-red-500"
                        : s.type === "water"
                        ? "text-blue-500"
                        : s.type === "power"
                        ? "text-yellow-500"
                        : s.type === "humidity"
                        ? "text-green-500"
                        : "text-gray-400"
                    }
                  >
                    {s.type}
                  </td>

                  <td className="text-gray-800 dark:text-gray-100">
                    {s.location || "-"}
                  </td>

                  <td className="text-gray-800 dark:text-gray-100">
                    {s.esp_id || "-"}
                  </td>

                  <td className="text-gray-800 dark:text-gray-100">
                    {s.gpio_pin ?? "-"}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </MainLayout>
  );
}

export default Sensors;