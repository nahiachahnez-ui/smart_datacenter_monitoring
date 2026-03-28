import { useEffect, useState } from "react";

function ThemeToggle() {

  const [darkMode, setDarkMode] = useState(
    localStorage.theme === "dark"
  );

  useEffect(() => {

    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }

  }, [darkMode]);

  return (

    <button
      onClick={() => setDarkMode(!darkMode)}
      className="
      px-3 py-1
      rounded
      bg-gray-200
      dark:bg-gray-700
      text-black
      dark:text-white
      "
    >

      {darkMode ? " Dark" : " light"}

    </button>

  );

}

export default ThemeToggle;