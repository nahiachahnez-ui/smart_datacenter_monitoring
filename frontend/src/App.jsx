import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Sensors from "./pages/Sensors";
import Alerts from "./pages/Alerts";
import Measurements from "./pages/Measurements";
import Technicians from "./pages/Technicians";

import ProtectedRoute from "./components/ProtectedRoute";
import VerifySuccess from "./pages/VerifySuccess";
import VerifyFailed from "./pages/VerifyFailed";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sensors"
          element={
            <ProtectedRoute>
              <Sensors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/measurements"
          element={
            <ProtectedRoute>
              <Measurements />
            </ProtectedRoute>
          }
        />

       

        <Route
          path="/technicians"
          element={
            <ProtectedRoute roleRequired="admin">
              <Technicians />
            </ProtectedRoute>
          }
        />
        <Route path="/verify-success" element={<VerifySuccess/>}/>
        <Route path="/verify-failed" element={<VerifyFailed/>}/>

      </Routes>

    </BrowserRouter>

  );

}

export default App;