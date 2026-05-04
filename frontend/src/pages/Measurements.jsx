import { useEffect, useState } from "react";
import API from "../api/api";
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

    <div className="space-y-6 text-gray-900 dark:text-gray-100">

      <h1 className="text-3xl font-bold">
        Measurements
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <SensorChart title="Temperature" data={temperature} />
        <SensorChart title="Humidity" data={humidity} />
        <SensorChart title="Water Level" data={water} />
        <SensorChart title="Power" data={power} />

        <div className="md:col-span-2">
          <SensorChart title="Dust" data={dust} />
        </div>

      </div>

    </div>

  );

}

export default Measurements;