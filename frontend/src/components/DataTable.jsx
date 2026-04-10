import { useState } from "react";

function DataTable({ title, description, columns, data, onEdit }) {

  return (
    <div className="w-full text-slate-700 bg-white dark:bg-[#111827] shadow-md rounded-xl">

      {/* HEADER */}
      <div className="flex items-center justify-between p-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <button className="bg-slate-800 text-white px-4 py-2 rounded text-xs">
          Add
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">

          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="p-4 text-gray-500">
                  {col}
                </th>
              ))}
              <th className="p-4"></th>
            </tr>
          </thead>

          <tbody>

            {data.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >

                {columns.map((col, i) => (
                  <td key={i} className="p-4">

                    {/* STATUS SPECIAL STYLE */}
                    {col === "status" ? (
                      <span className={`
                        px-2 py-1 text-xs font-bold rounded
                        ${row[col] === "active"
                          ? "bg-green-500/20 text-green-700"
                          : "bg-gray-200 text-gray-500"}
                      `}>
                        {row[col]}
                      </span>
                    ) : (
                      row[col]
                    )}

                  </td>
                ))}

                {/* ACTION */}
                <td className="p-4">
                  <button
                    onClick={() => onEdit(row)}
                    className="hover:bg-gray-200 p-2 rounded"
                  >
                    ✏️
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>
      </div>

    </div>
  );
}

export default DataTable;