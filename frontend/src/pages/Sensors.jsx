import { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Sensors() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const [sensors, setSensors] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    sensor_uid: "",
    type: "",
    location: "",
    esp_id: "",
    gpio_pin: ""
  });

  const [editingSensor, setEditingSensor] = useState(null);
  const [editForm, setEditForm] = useState({});

  /* LOAD */
  const loadSensors = async () => {
    try {
      const res = await API.get("/sensors");
      setSensors(res.data || []);
    } catch {
      toast.error("Failed to load sensors");
    }
  };

  useEffect(() => {
    loadSensors();
  }, []);

  /* ADD */
  const addSensor = async (e) => {
    e.preventDefault();

    try {
      await API.post("/sensors", form);
      toast.success("Sensor added");

      setForm({
        sensor_uid: "",
        type: "",
        location: "",
        esp_id: "",
        gpio_pin: ""
      });

      setShowForm(false);
      loadSensors();

    } catch {
      toast.error("Failed to add sensor");
    }
  };

  /* DELETE */
  const deleteSensor = async (id) => {
    if (!window.confirm("Delete this sensor?")) return;

    try {
      await API.delete(`/sensors/${id}`);
      toast.success("Deleted");
      loadSensors();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* EDIT */
  const openEdit = (s) => {
    setEditingSensor(s);
    setEditForm({
      ...s
    });
  };

  const updateSensor = async () => {
    try {
      await API.put(`/sensors/${editingSensor.id}`, editForm);
      toast.success("Updated");
      setEditingSensor(null);
      loadSensors();
    } catch {
      toast.error("Update failed");
    }
  };

  /* FILTER */
  const filtered = sensors.filter((s) => {
    return (
      (s.sensor_uid || "").toLowerCase().includes(search.toLowerCase()) &&
      (typeFilter ? s.type === typeFilter : true)
    );
  });

  return (
    <div className="space-y-8 text-gray-900 dark:text-gray-100">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Sensors</h2>

        {role === "admin" && (
          <button
            onClick={() => setShowForm(prev => !prev)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg"
          >
            {showForm ? "Close" : "+ Add Sensor"}
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="flex gap-4">

        <input
          placeholder="Search UID..."
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="p-3 rounded-lg border w-64 bg-white dark:bg-gray-800"
        />

        <select
          value={typeFilter}
          onChange={(e)=>setTypeFilter(e.target.value)}
          className="p-3 rounded-lg border bg-white dark:bg-gray-800"
        >
          <option value="">All Types</option>
          <option value="temperature">Temperature</option>
          <option value="humidity">Humidity</option>
          <option value="power">Power</option>
          <option value="dust">Dust</option>
          <option value="water">Water</option>
        </select>

      </div>

      {/* ADD FORM */}
      {showForm && role === "admin" && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border shadow">

          <h3 className="text-lg font-semibold mb-4">Add Sensor</h3>

          <form onSubmit={addSensor} className="grid grid-cols-2 gap-4">

            <Input label="UID"
              value={form.sensor_uid}
              onChange={(v)=>setForm({...form, sensor_uid:v})}
            />

            <Input label="Location"
              value={form.location}
              onChange={(v)=>setForm({...form, location:v})}
            />

            <Input label="ESP ID"
              value={form.esp_id}
              onChange={(v)=>setForm({...form, esp_id:v})}
            />

            <Input label="GPIO"
              value={form.gpio_pin}
              onChange={(v)=>setForm({...form, gpio_pin:v})}
            />

            <select
              value={form.type}
              onChange={(e)=>setForm({...form, type:e.target.value})}
              className="col-span-2 p-3 border rounded bg-white dark:bg-gray-800"
            >
              <option value="">Select Type</option>
              <option value="temperature">Temperature</option>
              <option value="humidity">Humidity</option>
              <option value="power">Power</option>
              <option value="dust">Dust</option>
              <option value="water">Water</option>
            </select>

            <button className="col-span-2 bg-gray-900 text-white py-2 rounded">
              Create
            </button>

          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border shadow overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-4 text-left">UID</th>
              <th>Type</th>
              <th>Location</th>
              <th>ESP</th>
              <th>GPIO</th>
              {role === "admin" && <th className="text-center">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-100 dark:hover:bg-gray-800">

                <td 
                  className="p-4 text-blue-600 cursor-pointer hover:underline"
                  onClick={() => navigate('/sensors')}
                >
                  {s.sensor_uid}
                </td>
                <td>{s.type}</td>
                <td>{s.location}</td>
                <td>{s.esp_id}</td>
                <td>{s.gpio_pin}</td>

                {role === "admin" && (
                  <td className="flex justify-center gap-2 p-4">
                    <button onClick={()=>openEdit(s)}>✏️</button>
                    <button onClick={()=>deleteSensor(s.id)}>🗑</button>
                  </td>
                )}

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* EDIT MODAL */}
      {editingSensor && (
        <Modal title="Edit Sensor" onClose={()=>setEditingSensor(null)}>

          <Input value={editForm.sensor_uid}
            onChange={(v)=>setEditForm({...editForm, sensor_uid:v})}
          />

          <Input value={editForm.location}
            onChange={(v)=>setEditForm({...editForm, location:v})}
          />

          <div className="flex gap-2 mt-4">
            <button onClick={()=>setEditingSensor(null)} className="flex-1 border py-2 rounded">
              Cancel
            </button>

            <button onClick={updateSensor} className="flex-1 bg-gray-900 text-white py-2 rounded">
              Save
            </button>
          </div>

        </Modal>
      )}

    </div>
  );
}

/* INPUT */
function Input({ label, value, onChange }) {
  return (
    <div>
      {label && <label className="text-sm">{label}</label>}
      <input
        value={value || ""}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full p-3 border rounded bg-white dark:bg-gray-800"
      />
    </div>
  );
}

/* MODAL */
function Modal({ children, title, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded w-[400px]">
        <h3 className="mb-4 font-semibold">{title}</h3>
        {children}
        <button onClick={onClose} className="mt-4 w-full border py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
}

export default Sensors;