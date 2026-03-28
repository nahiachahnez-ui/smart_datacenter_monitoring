import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function MainLayout({ children }) {

  return (

    <div className="flex min-h-screen">

      <Sidebar />

      <div className="
        flex-1
        bg-gray-100
        dark:bg-gray-900
        text-gray-900
        dark:text-gray-100
      ">

        <Topbar />

        <div className="p-10">
          {children}
        </div>

      </div>

    </div>

  );

}

export default MainLayout;