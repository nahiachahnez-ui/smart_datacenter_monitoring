import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

function MultiSensorChart({ data }) {
  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-700 p-6 rounded-xl shadow-sm">

      <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Sensor History</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line type="monotone" dataKey="temperature" stroke="#ef4444" dot={false} name="Temperature (°C)" />
          <Line type="monotone" dataKey="humidity"    stroke="#3b82f6" dot={false} name="Humidity (%)" />
          <Line type="monotone" dataKey="air_quality" stroke="#10b981" dot={false} name="Air Quality (ppm)" />
          <Line type="monotone" dataKey="dust_level"  stroke="#6b7280" dot={false} name="Dust (µg/m³)" />
          <Line type="monotone" dataKey="water_level" stroke="#06b6d4" dot={false} name="Water Level" />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

export default MultiSensorChart;
