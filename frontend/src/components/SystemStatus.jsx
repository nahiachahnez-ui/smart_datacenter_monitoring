import { useEffect, useState } from "react";
import API from "../api/api";

function SystemStatus() {

  const [status, setStatus] = useState(null);

  const loadStatus = async () => {
    try {
      const res = await API.get("/system/status");
      setStatus(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  /* ✅ PREVENT CRASH */
  if (!status) {
    return (
      <div className="
        bg-white dark:bg-[#111827]
        border border-gray-200 dark:border-gray-700
        rounded-xl p-6
      ">
        <p className="text-gray-500">Loading system status...</p>
      </div>
    );
  }

  return (

    <div className="
      bg-white dark:bg-[#111827]
      border border-gray-200 dark:border-gray-700
      rounded-xl p-6
    ">

      <h3 className="text-lg font-semibold mb-4">
        System Status
      </h3>

      <div className="space-y-3 text-sm">

        <div className="flex justify-between">
          <span>Backend</span>
          <span className="text-green-500">
            {status.backend}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Database</span>
          <span className="text-green-500">
            {status.database}
          </span>
        </div>

        <div className="flex justify-between">
          <span>MQTT</span>
          <span className="text-yellow-500">
            {status.mqtt}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Gateway</span>
          <span className="text-red-500">
            {status.gateway}
          </span>
        </div>

      </div>

    </div>

  );

}

export default SystemStatus;