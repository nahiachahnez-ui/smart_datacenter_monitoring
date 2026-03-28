import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/api";
import MainLayout from "../layouts/MainLayout";

function Sensors() {

  const location = useLocation();
  const statusFilter = new URLSearchParams(location.search).get("status");

  const [sensors, setSensors] = useState([]);

  const [form, setForm] = useState({
    sensor_uid: "",
    type: "",
    location: ""
  });

  const loadSensors = async () => {
    const res = await API.get("/sensors");
    setSensors(res.data);
  };

  useEffect(() => {
    loadSensors();
  }, []);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const addSensor = async (e) => {

    e.preventDefault();

    await API.post("/sensors", form);

    setForm({
      sensor_uid:"",
      type:"",
      location:""
    });

    loadSensors();

  };

  const filteredSensors = sensors.filter(sensor =>
    !statusFilter || sensor.status === statusFilter
  );

  return (

    <MainLayout>

      <div className="space-y-8">

        <h2 className="text-3xl font-bold">
          Sensors Management
        </h2>

        {/* ADD SENSOR */}

        <div className="bg-white dark:bg-gray-800 border p-6 rounded-xl">

          <form onSubmit={addSensor} className="grid grid-cols-4 gap-4">

            <input
              name="sensor_uid"
              placeholder="Sensor UID"
              value={form.sensor_uid}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <input
              name="type"
              placeholder="Type"
              value={form.type}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <button className="bg-green-600 text-white rounded">
              Add
            </button>

          </form>

        </div>

        {/* TABLE */}

        <div className="bg-white dark:bg-gray-800 border p-6 rounded-xl">

          <table className="w-full">

            <thead className="border-b">
              <tr>
                <th>ID</th>
                <th>UID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredSensors.map(sensor => (

                <tr key={sensor.id} className="border-b">

                  <td>{sensor.id}</td>
                  <td>{sensor.sensor_uid}</td>
                  <td>{sensor.type}</td>
                  <td>{sensor.location}</td>

                  <td>

                    <span className={`px-2 py-1 rounded text-xs ${
                      sensor.status === "online"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}>

                      {sensor.status}

                    </span>

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