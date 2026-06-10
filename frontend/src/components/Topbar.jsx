import SystemStatus from "../components/SystemStatus";
import { useNavigate } from "react-router-dom";

function Topbar({ darkMode, toggleTheme }) {

  const navigate = useNavigate();

  // ✅ MUST BE OUTSIDE RETURN
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <div className="
      flex justify-between items-center
      px-6 py-4
      bg-white dark:bg-gray-900
      border-b border-slate-200 dark:border-gray-800
    ">

      {/* LEFT */}
      <SystemStatus />

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        <button
          onClick={toggleTheme}
          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200 rounded transition text-sm"
        >
          {darkMode ? "Light" : "Dark"}
        </button>

        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Topbar;