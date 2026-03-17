export default function Table({ columns, data }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        
        {/* HEADER */}
        <thead className="bg-gray-100 text-left">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="p-3 font-medium text-gray-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-4 text-center text-gray-500"
              >
                No hay datos
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="border-t hover:bg-gray-50 transition"
              >
                {columns.map((col, j) => (
                  <td key={j} className="p-3">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  )
}