import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Sensors from "./pages/Sensors";
import Measurements from "./pages/Measurements";
import Technicians from "./pages/Technicians";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ALERTS */}
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Alerts />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* SENSORS */}
        <Route
          path="/sensors"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Sensors />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* MEASUREMENTS */}
        <Route
          path="/measurements"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Measurements />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* TECHNICIANS */}
        <Route
          path="/technicians"
          element={
            <ProtectedRoute roleRequired="admin">
              <MainLayout>
                <Technicians />
              </MainLayout>
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;