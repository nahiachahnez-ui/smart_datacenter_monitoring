import axios from "axios";

const API_URL = "http://localhost:5000/api/measurements";

const sensors = [
  { sensor_id: 1, min: 20, max: 30 },   // temperature
  { sensor_id: 2, min: 40, max: 70 },   // humidity
  { sensor_id: 3, min: 200, max: 300 }, // power
  { sensor_id: 4, min: 10, max: 50 }    // dust
];

const sendData = async () => {
  for (let s of sensors) {

    let value = (Math.random() * (s.max - s.min) + s.min).toFixed(2);
    value = parseFloat(value);

    // simulate anomaly
    if (Math.random() < 0.1) {
      value = parseFloat((value * 2).toFixed(2));
      console.log(" ANOMALY:", s.sensor_id, value);
    }

    try {
      await axios.post(API_URL, {
        sensor_id: s.sensor_id,
        value   // 🔥 NO TYPE ANYMORE
      });

      console.log("Sent:", { sensor_id: s.sensor_id, value });

    } catch (err) {
      console.log("Error:", err.message);
    }
  }

  console.log("------");
};

setInterval(sendData, 3000);