import { useEffect, useState } from "react";
import API from "../api/api";
import MainLayout from "../layouts/MainLayout";
import SensorChart from "../components/SensorChart";
import { toast } from "react-toastify";

function Measurements() {

  const [temperature, setTemperature] = useState([]);
  const [humidity, setHumidity] = useState([]);
  const [water, setWater] = useState([]);
  const [power, setPower] = useState([]);
  const [dust, setDust] = useState([]);

  useEffect(() => {

    const fetchMeasurements = async () => {
      try {

        const res = await API.get("/measurements?limit=200");

        const temp = [], hum = [], wat = [], pow = [], dus = [];

        res.data.forEach((m) => {

          // 🔥 SAFE CHECK
          if (!m.recorded_at || m.value == null) return;

          const date = new Date(m.recorded_at);

          if (isNaN(date.getTime())) return;

          const point = {
            time: date.toLocaleTimeString(),
            value: m.value
          };

          if (m.type === "temperature") temp.push(point);
          if (m.type === "humidity") hum.push(point);
          if (m.type === "water") wat.push(point);
          if (m.type === "power") pow.push(point);
          if (m.type === "dust") dus.push(point);

        });

        // 🔥 LIMIT DATA (NO CRASH)
        setTemperature(temp.slice(-50));
        setHumidity(hum.slice(-50));
        setWater(wat.slice(-50));
        setPower(pow.slice(-50));
        setDust(dus.slice(-50));

      } catch (error) {
        console.error(error);
        toast.error("Failed to load measurements");
      }
    };

    fetchMeasurements();

  }, []);

  return (
    <MainLayout>

      <div className="space-y-6 text-gray-900 dark:text-gray-100">

        <h1 className="text-3xl font-bold mb-6">
          Measurements
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-2 gap-6">

          {/* CARD */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
            <h3 className="mb-2 font-semibold">Temperature</h3>
            <SensorChart title="Temperature" data={temperature} />
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
            <h3 className="mb-2 font-semibold">Humidity</h3>
            <SensorChart title="Humidity" data={humidity} />
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
            <h3 className="mb-2 font-semibold">Water Level</h3>
            <SensorChart title="Water Level" data={water} />
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
            <h3 className="mb-2 font-semibold">Power</h3>
            <SensorChart title="Power" data={power} />
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow col-span-2">
            <h3 className="mb-2 font-semibold">Dust</h3>
            <SensorChart title="Dust" data={dust} />
          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default Measurements;