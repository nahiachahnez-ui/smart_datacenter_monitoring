import { useNavigate } from "react-router-dom";

function StatCard({ title, value, link }) {

  const navigate = useNavigate();

  return (

    <div
      onClick={() => link && navigate(link)}
      className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm hover:scale-105 transition cursor-pointer"
    >

      <h4 className="text-gray-500 dark:text-gray-400 text-sm mb-2">
        {title}
      </h4>

      <p className="text-3xl font-bold text-blue-600">
        {value}
      </p>

    </div>

  );

}

export default StatCard;