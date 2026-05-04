function AIPredictionPanel({ prediction }) {

  if (!prediction) {
    return (
      <div className="p-2">
        <h3 className="text-lg font-semibold mb-2">AI Prediction</h3>
        <p className="text-sm text-gray-400">No prediction data yet. Waiting for Raspberry Pi...</p>
      </div>
    );
  }

  const riskColors = {
    low:      "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    medium:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    high:     "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
    critical: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  };

  const boolColors = {
    yes:    "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    no:     "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    normal: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  };

  const getBadge = (value, colorMap) => {
    const key = (value || "").toLowerCase();
    const style = colorMap[key] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
        {value || "—"}
      </span>
    );
  };

  return (
    <div className="p-2">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">AI Prediction</h3>
        <span className="text-xs text-slate-400 dark:text-gray-400">
          {prediction.created_at ? new Date(prediction.created_at).toLocaleString() : "—"}
        </span>
      </div>

      {/* PREDICTION BADGES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Risk Level</span>
          {getBadge(prediction.risk_level, riskColors)}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Anomaly</span>
          {getBadge(prediction.anomaly_label, boolColors)}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Predicted Failure</span>
          {getBadge(prediction.predicted_faillure, boolColors)}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Maintenance</span>
          {getBadge(prediction.maintenance_required, boolColors)}
        </div>

      </div>

      {/* SENSOR READINGS */}
      <div>
        <h4 className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-3">
          Sensor Readings at Prediction Time
        </h4>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: "Temp",      key: "temperature",     unit: "°C"    },
            { label: "Humidity",  key: "humidity",        unit: "%"     },
            { label: "Air",       key: "air_quality",     unit: "ppm"   },
            { label: "Smoke",     key: "smoke_level",     unit: ""      },
            { label: "Water",     key: "water_level",     unit: "cm³"   },
            { label: "Dust",      key: "dust_level",      unit: "µg/m³" },
            { label: "Gas",       key: "gas_detected",    unit: ""      },
            { label: "Vibration", key: "vibration_level", unit: ""      },
            { label: "Heartbeat", key: "heartbeat",       unit: ""      },
          ].map(({ label, key, unit }) => (
            <div
              key={key}
              className="bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-3 text-center"
            >
              <p className="text-xs text-slate-500 dark:text-gray-400 mb-1 font-medium">{label}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {prediction[key] !== null && prediction[key] !== undefined
                  ? `${prediction[key]} ${unit}`
                  : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default AIPredictionPanel;
