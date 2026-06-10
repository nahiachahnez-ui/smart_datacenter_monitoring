function SensorCard({ title, value, unit, color, onClick }) {

  return (

    <div
      className={`bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-700 p-5 rounded-xl shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-gray-500 transition' : ''}`}
      onClick={onClick}
    >

      <h4 className="text-slate-500 dark:text-gray-400 text-sm mb-2 font-medium">
        {title}
      </h4>

      <p className={`text-3xl font-bold text-slate-800 dark:text-white ${color}`}>
        {value} {unit}
      </p>

    </div>

  );

}

export default SensorCard;