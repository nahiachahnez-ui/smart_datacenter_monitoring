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
    <div className="bg-white dark:bg-[#111827] p-6 rounded-xl shadow">

      <h3 className="text-lg font-semibold mb-4">
        Multi-Sensor Overview
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="time" />
          <YAxis />

          <Tooltip />
          <Legend />

          {/* 🌡 Temperature */}
          <Line type="monotone" dataKey="temperature" stroke="#ef4444" />

          {/* ⚡ Power */}
          <Line type="monotone" dataKey="power" stroke="#facc15" />

          {/* 💧 Humidity */}
          <Line type="monotone" dataKey="humidity" stroke="#3b82f6" />

          {/* 🌫 Dust */}
          <Line type="monotone" dataKey="dust" stroke="#6b7280" />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

export default MultiSensorChart;