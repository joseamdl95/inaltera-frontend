import { NavLink, Outlet } from "react-router-dom"

export default function Perfil() {

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
        <h1 className="text-3xl font-bold">Perfil</h1>
      </div>

      {/* 🔥 NAV TABS */}
      <div className="bg-white border rounded-xl p-2 flex gap-2 w-fit shadow-sm">
        <NavLink to="usuario" className={linkClass}>
          Usuario
        </NavLink>
        <NavLink to="empresa" className={linkClass}>
          Empresa
        </NavLink>
        <NavLink to="clientes" className={linkClass}>
          Clientes
        </NavLink>
      </div>

      {/* 📄 CONTENIDO */}
      <div>
        <Outlet />
      </div>

    </div>
  )
}