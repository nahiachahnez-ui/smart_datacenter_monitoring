function SensorCard({ title, value, unit, color }) {

  return (

    <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm">

      <h4 className="text-gray-500 dark:text-gray-400 text-sm mb-2">
        {title}
      </h4>

      <p className={`text-3xl font-bold ${color}`}>
        {value} {unit}
      </p>

    </div>

  );

}

export default SensorCard;