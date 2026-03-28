import axios from "axios";

const API_URL = "http://localhost:5000/api/measurements";

const sensors = [
  { sensor_id: 1, type: "temperature", min: 20, max: 30 },
  { sensor_id: 2, type: "humidity", min: 40, max: 70 },
  { sensor_id: 3, type: "power", min: 200, max: 300 },
  { sensor_id: 4, type: "dust", min: 10, max: 50 }
];

const sendData = async () => {
  for (let s of sensors) {

   let value = (Math.random() * (s.max - s.min) + s.min).toFixed(2);
    value = parseFloat(value);

    // simulate anomaly
    if (Math.random() < 0.1) {
      value *= 2;
      console.log("🚨 ANOMALY:", s.type, value);
    }

    try {
      await axios.post(API_URL, {
        sensor_id: s.sensor_id,
        type: s.type,
        value
      });

      console.log("Sent:", s.type, value);

    } catch (err) {
      console.log("Error:", err.message);
    }
  }

  console.log("------");
};

setInterval(sendData, 3000);