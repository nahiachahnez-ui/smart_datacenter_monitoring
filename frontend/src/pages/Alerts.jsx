import { useEffect, useState } from "react";
import API from "../api/api";
import MainLayout from "../layouts/MainLayout";

function Alerts(){

 const [alerts,setAlerts]=useState([]);

 const fetchAlerts=async()=>{
  const res=await API.get("/alerts");
  setAlerts(res.data);
 };

 useEffect(()=>{
  fetchAlerts();
 },[]);

 const resolveAlert=async(id)=>{
  await API.patch(`/alerts/${id}/resolve`);
  fetchAlerts();
 };

 return(

 <MainLayout>

  <h1 className="text-3xl font-bold mb-8">
   Alerts
  </h1>

  <div className="bg-white dark:bg-gray-800 border rounded-xl p-6">

   <table className="w-full">

    <thead className="border-b">

     <tr>
      <th>ID</th>
      <th>Sensor</th>
      <th>Level</th>
      <th>Message</th>
      <th>Status</th>
      <th>Action</th>
     </tr>

    </thead>

    <tbody>

    {alerts.map(alert=>(
     <tr key={alert.id} className="border-b">

      <td>{alert.id}</td>
      <td>{alert.type}</td>
      <td>{alert.level}</td>
      <td>{alert.message}</td>
      <td>{alert.status}</td>

      <td>

      {alert.status==="active"&&(
        <button
        onClick={()=>resolveAlert(alert.id)}
        className="bg-blue-500 text-white px-3 py-1 rounded">
        Resolve
        </button>
      )}

      </td>

     </tr>
    ))}

    </tbody>

   </table>

  </div>

 </MainLayout>

 );

}

export default Alerts;