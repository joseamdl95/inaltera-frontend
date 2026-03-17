export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          Facturas emitidas
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          Ingresos
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          Clientes
        </div>
      </div>
    </div>
  )
}