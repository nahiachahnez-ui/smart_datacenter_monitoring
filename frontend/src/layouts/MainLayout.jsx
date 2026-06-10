import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState } from "react";

function MainLayout({ children }) {

  const [dark, setDark] = useState(true);

  return (
    <div className={dark ? "dark" : ""}>

      <div className="flex min-h-screen">

        <Sidebar />

        <div className="
          flex-1
          bg-slate-50 dark:bg-gray-900
          text-gray-900 dark:text-gray-100
        ">

          <Topbar
            darkMode={dark}
            toggleTheme={() => setDark(!dark)}
          />

          <div className="p-8">
            {children}
          </div>

        </div>

      </div>

    </div>
  );
}

export default MainLayout;