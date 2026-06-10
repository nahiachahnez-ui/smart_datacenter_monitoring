import { useNavigate } from "react-router-dom";

function StatCard({ title, value, link }) {

  const navigate = useNavigate();

  return (

    <div
      onClick={() => link && navigate(link)}
      className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-700 p-6 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition cursor-pointer"
    >

      <h4 className="text-slate-500 dark:text-gray-400 text-sm mb-2 font-medium">
        {title}
      </h4>

      <p className="text-3xl font-bold text-indigo-600 dark:text-blue-400">
        {value}
      </p>

    </div>

  );

}

export default StatCard;