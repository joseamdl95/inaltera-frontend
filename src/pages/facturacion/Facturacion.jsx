import { NavLink, Outlet } from "react-router-dom"

export default function Facturacion() {
   const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition
    ${
      isActive
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`

  return (
    <div className="space-y-6">

      {/* 🧠 HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Facturación</h1>
      </div>

      {/* 🔥 NAV TABS */}
      <div className="bg-white border rounded-xl p-2 flex gap-2 w-fit shadow-sm">
        <NavLink to="emitir" className={linkClass}>
          Emitir
        </NavLink>

        <NavLink to="pdf" className={linkClass}>
          Cargar PDF
        </NavLink>

        <NavLink to="verificador" className={linkClass}>
          Verificador
        </NavLink>
      </div>

      {/* 📄 CONTENIDO */}
      <div>
        <Outlet />
      </div>

    </div>
  )
}