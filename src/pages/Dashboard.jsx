import Card from "../components/common/Card"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-500">
          Resumen general de tu actividad
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Card>
          <p className="text-gray-500 text-sm">Facturas emitidas</p>
          <h3 className="text-2xl font-bold mt-2">120</h3>
        </Card>

        <Card>
          <p className="text-gray-500 text-sm">Ingresos totales</p>
          <h3 className="text-2xl font-bold mt-2">€12,450</h3>
        </Card>

        <Card>
          <p className="text-gray-500 text-sm">Clientes</p>
          <h3 className="text-2xl font-bold mt-2">32</h3>
        </Card>

      </div>

      {/* ÚLTIMAS FACTURAS */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Últimas facturas</h3>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-t hover:bg-gray-50">
                <td className="p-3">Empresa X</td>
                <td className="p-3">01/03/2026</td>
                <td className="p-3">€250</td>
              </tr>

              <tr className="border-t hover:bg-gray-50">
                <td className="p-3">Cliente Y</td>
                <td className="p-3">28/02/2026</td>
                <td className="p-3">€120</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}