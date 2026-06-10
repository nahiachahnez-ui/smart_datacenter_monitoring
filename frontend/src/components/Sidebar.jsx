import { Link, useLocation } from "react-router-dom";

function Sidebar() {

  const location = useLocation();

  const role = localStorage.getItem("role");

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Alerts", path: "/alerts" },
    { name: "Measurements", path: "/measurements" },
    { name: "Sensors", path: "/sensors" },
    ...(role === "admin" ? [{ name: "Technicians", path: "/technicians" }] : []),
  ];

  return (
    <div className="w-64 bg-gray-900 text-white p-6">

      <div className="mb-10">

        <h1 className="text-2xl font-bold tracking-wider text-blue-400">
          NEXO
        </h1>
      </div>

     

      <nav className="flex flex-col gap-2">

        {menu.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`px-4 py-2 rounded transition ${
              location.pathname === item.path
                ? "bg-green-600"
                : "hover:bg-gray-800"
            }`}
          >
            {item.name}
          </Link>
        ))}

      </nav>

    </div>
  );
}

export default Sidebar;