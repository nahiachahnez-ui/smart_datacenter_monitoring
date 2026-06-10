import { useEffect, useState } from "react";
import API from "../api/api";
import SensorChart from "../components/SensorChart";
import { toast } from "react-toastify";

function Measurements() {
  const [temperature, setTemperature] = useState([]);
  const [humidity,    setHumidity]    = useState([]);
  const [water,       setWater]       = useState([]);
  const [air,         setAir]         = useState([]);
  const [dust,        setDust]        = useState([]);
  const [gas,         setGas]         = useState([]);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        // Read from sensor_data — the real IoT data source
        const res = await API.get("/sensor-data/history");

        const temp = [], hum = [], wat = [], airQ = [], dus = [], gasD = [];

        res.data.forEach((row) => {
          if (!row.created_at) return;
          const time = new Date(row.created_at).toLocaleTimeString();

          if (row.temperature  != null) temp.push({ time, value: row.temperature });
          if (row.humidity     != null) hum.push({  time, value: row.humidity });
          if (row.water_level  != null) wat.push({  time, value: row.water_level });
          if (row.air_quality  != null) airQ.push({ time, value: row.air_quality });
          if (row.dust_level   != null) dus.push({  time, value: row.dust_level });
          if (row.gas_detected != null) gasD.push({ time, value: row.gas_detected });
        });

        setTemperature(temp);
        setHumidity(hum);
        setWater(wat);
        setAir(airQ);
        setDust(dus);
        setGas(gasD);

      } catch (error) {
        console.error(error);
        toast.error("Failed to load measurements");
      }
    };

    fetchMeasurements();
  }, []);

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">

      <h1 className="text-3xl font-bold">Measurements</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SensorChart title="Temperature (°C)"  data={temperature} />
        <SensorChart title="Humidity (%)"      data={humidity} />
        <SensorChart title="Air Quality (ppm)" data={air} />
        <SensorChart title="Gas"               data={gas} />
        <SensorChart title="Water Level (%)"   data={water} />
        <div className="md:col-span-2">
          <SensorChart title="Dust (µg/m³)"   data={dust} />
        </div>
      </div>

    </div>
  );
}

export default Measurements;
