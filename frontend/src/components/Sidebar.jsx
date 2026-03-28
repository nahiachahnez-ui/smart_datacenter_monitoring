import { NavLink } from "react-router-dom";

function Sidebar() {

  const role = localStorage.getItem("role");

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded transition ${
      isActive
        ? "bg-green-600 text-white"
        : "text-gray-300 hover:bg-gray-700"
    }`;

  return (

    <div className="w-64 bg-gray-900 text-white min-h-screen">

      <div className="p-6 text-xl font-bold border-b border-gray-700">
        Datacenter
      </div>

      <nav className="p-4 space-y-2">

        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/alerts" className={linkClass}>
          Alerts
        </NavLink>

        <NavLink to="/measurements" className={linkClass}>
          Measurements
        </NavLink>

        <NavLink to="/sensors" className={linkClass}>
          Sensors
        </NavLink>

        {/* ADMIN ONLY */}

        {role === "admin" && (
          <NavLink to="/technicians" className={linkClass}>
            Technicians
          </NavLink>
        )}

      </nav>

    </div>

  );

}

export default Sidebar;