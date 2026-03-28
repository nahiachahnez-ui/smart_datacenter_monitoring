import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

function SensorChart({ title, data, description }) {

  /* 🧠 FORMAT FUNCTION */
  const formatValue = (v) => {
    if (v === undefined || v === null) return v;
    return parseFloat(Number(v).toFixed(2));
  };

  /* 🧹 CLEAN DATA */
  const cleanData = data.map(d => ({
    ...d,
    value: formatValue(d.value)
  }));

  /* 🎯 CUSTOM TOOLTIP */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;

      return (
        <div className="bg-gray-900 text-white p-3 rounded shadow-lg text-sm">
          <p><strong>Value:</strong> {formatValue(d.value)}</p>
          <p><strong>Time:</strong> {d.time}</p>

          <p>
            <strong>Status:</strong>{" "}
            {d.isAnomaly ? " Anomaly" : " Normal"}
          </p>

          {d.isAnomaly && (
            <p className="text-red-400">
              Z-score: {formatValue(d.zScore)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="
      bg-white dark:bg-[#111827]
      border border-gray-200 dark:border-gray-700
      p-6
      rounded-xl
      shadow-sm
    ">

      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {description}
      </p>

      <ResponsiveContainer width="100%" height={300}>

        <LineChart data={cleanData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="time" />

          {/* 🔥 CLEAN Y AXIS */}
          <YAxis tickFormatter={(v) => formatValue(v)} />

          <Tooltip content={<CustomTooltip />} />

          {/* 🔥 MAIN LINE */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}

            /* 🔴 CUSTOM DOTS */
            dot={(props) => {
              const { cx, cy, payload } = props;

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={payload.isAnomaly ? "#ef4444" : "#6366f1"}
                />
              );
            }}

            /* 🔴 ACTIVE DOT */
            activeDot={(props) => {
              const { cx, cy, payload } = props;

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={8}
                  fill={payload.isAnomaly ? "#ef4444" : "#6366f1"}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            }}

          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default SensorChart;