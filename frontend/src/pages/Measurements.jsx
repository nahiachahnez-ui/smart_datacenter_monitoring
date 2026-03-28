import { useEffect, useState } from "react";
import API from "../api/api";
import MainLayout from "../layouts/MainLayout";
import SensorChart from "../components/SensorChart";

function Measurements() {

  const [temperature,setTemperature]=useState([]);
  const [humidity,setHumidity]=useState([]);
  const [water,setWater]=useState([]);
  const [power,setPower]=useState([]);
  const [dust,setDust]=useState([]);

  useEffect(()=>{

    const fetchMeasurements = async()=>{

      const res = await API.get("/measurements");

      const temp=[],hum=[],wat=[],pow=[],dus=[];

      res.data.forEach(m=>{

        const point={
          time:new Date(m.created_at).toLocaleTimeString(),
          value:m.value
        };

        if(m.type==="temperature") temp.push(point);
        if(m.type==="humidity") hum.push(point);
        if(m.type==="water") wat.push(point);
        if(m.type==="power") pow.push(point);
        if(m.type==="dust") dus.push(point);

      });

      setTemperature(temp);
      setHumidity(hum);
      setWater(wat);
      setPower(pow);
      setDust(dus);

    };

    fetchMeasurements();

  },[]);

  return(

    <MainLayout>

      <h1 className="text-3xl font-bold mb-8">
        Measurements
      </h1>

      <div className="grid grid-cols-2 gap-8">

        <SensorChart title="Temperature" data={temperature}/>
        <SensorChart title="Humidity" data={humidity}/>
        <SensorChart title="Water Level" data={water}/>
        <SensorChart title="Power" data={power}/>
        <SensorChart title="Dust" data={dust}/>

      </div>

    </MainLayout>

  );

}

export default Measurements;