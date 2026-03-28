import ThemeToggle from "./ThemeToggle";

function Topbar() {

  const username = localStorage.getItem("username");

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    window.location.href = "/";

  };

  return (

    <div className="
      flex
      justify-end
      items-center
      gap-4
      p-4
      border-b
      border-gray-700
      bg-white
      dark:bg-gray-800
    ">

      {/* Username */}

      <span className="text-sm text-gray-600 dark:text-gray-300">
        {username}
      </span>

      {/* Theme Toggle */}

      <ThemeToggle />

      {/* Logout */}

      <button
        onClick={logout}
        className="
        bg-red-500
        hover:bg-red-600
        px-3
        py-1
        rounded
        text-white
        text-sm
        "
      >
        Logout
      </button>

    </div>

  );

}

export default Topbar;